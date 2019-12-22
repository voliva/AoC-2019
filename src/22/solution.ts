import extgcd from 'extgcd';

const parseLine = (line: string): [string, number] => {
  if (line.startsWith('deal into')) {
    return ['reverse', null as any];
  }
  if (line.startsWith('deal with')) {
    const res = line.split(' ');
    return ['deal', Number(res[res.length - 1])];
  }
  const res = line.split(' ');
  return ['cut', Number(res[res.length - 1])];
};

const solution1 = (inputLines: string[]) => {
  const N = 10007;
  let stack = new Array(N).fill(0).map((_, i) => i);

  inputLines.forEach(line => {
    const [action, param] = parseLine(line);
    if (action === 'reverse') {
      stack = stack.reverse();
    }
    if (action === 'cut') {
      if (param > 0) {
        const cut = stack.splice(0, param);
        stack = stack.concat(cut);
      } else {
        const cut = stack.splice(param);
        stack = cut.concat(stack);
      }
    }
    if (action === 'deal') {
      const newStack = new Array(stack.length).fill(null);
      let k = 0;
      for (let i = 0; i < stack.length; i++) {
        newStack[k % newStack.length] = stack[i];
        k += param;
      }
      stack = newStack;
    }
  });

  return stack.indexOf(0);
};

const solution2 = (inputLines: string[]) => {
  const inverseInput = [...inputLines].reverse();

  const N = 119315717514047;

  const add = (a: number, b: number) => (a + b) % N;
  const sub = (a: number, b: number) => {
    const res = a - b;
    if (res < 0) {
      return N + res;
    }
    return res % N;
  };
  const multiply = (a: number, b: number) => {
    let result = 0;
    while (b > 0) {
      if (b % 2 === 1) {
        result = (result + a) % N;
      }
      a = (a * 2) % N;
      b = Math.floor(b / 2);
    }
    return result;
  };
  const invert = (a: number) => {
    let {x} = extgcd(a, N);
    if (x < 0) {
      x += N;
    }
    return x;
  };

  // Function that given an idx it will figure out at what position does that card go after shuffle.
  const forwardMap = (idx: number) => {
    inputLines.forEach(line => {
      const [action, param] = parseLine(line);

      if (action === 'reverse') {
        idx = sub(N - 1, idx);
      }
      if (action === 'cut') {
        const normalizedParam = param > 0 ? param : N + param;
        idx = idx - normalizedParam;
        if (idx < 0) {
          idx += N;
        }
      }
      if (action === 'deal') {
        idx = multiply(idx, param);
      }
    });
    return idx;
  };
  // Function that given an idx it will figure out at what position it comes from before shuffling.
  const inverseMap = (idx: number) => {
    inverseInput.forEach(line => {
      const [action, param] = parseLine(line);

      const prev = idx;
      if (action === 'reverse') {
        idx = sub(N - 1, idx);
      }
      if (action === 'cut') {
        const normalizedParam = param > 0 ? param : N + param;
        idx = add(idx, normalizedParam);
      }
      if (action === 'deal') {
        let {x} = extgcd(param, N);
        if (x < 0) {
          x += N;
        }
        idx = multiply(idx, x);
      }
      if (idx > N) {
        console.log(prev, action, param, idx);
      }
    });
    return idx;
  };

  //// From this test
  // const result2 = new Array(100).fill(0).map((_, i) => forwardMap(i));
  // for (let i = 1; i < 100; i++) {
  //   console.log(result2[i] - result2[i - 1]);
  // }
  // return 0;
  //// I see that results increment by a constant N.

  const findLinearFn = (fn: (idx: number) => number) => {
    const base = fn(0);
    let delta = fn(1) - fn(0);
    if (delta < 0) {
      delta += N;
    }

    return Object.assign((idx: number) => add(base, multiply(delta, idx)), {
      base,
      delta,
    });
  };
  // Not needed => const forwardIdx = findLinearFn(forwardMap);
  const inverseIdx = findLinearFn(inverseMap);

  // Now what we want to do is call this function 101741582076661 times.

  //// First I tried looking for something repeating so we can skip...
  // let repeats = 0;
  // const found = new Set<number>();
  // let idx = 2020;
  // for (; !found.has(idx); repeats++) {
  //   if (repeats % 100000 === 0) {
  //     console.log(repeats);
  //   }
  //   found.add(idx);
  //   idx = inverseIdx(idx);
  // }
  // return repeats;
  //// But it gets OutOfMem. let's find patterns manually...
  // const results: number[] = [];
  // let tmp = 0;
  // for (let i = 0; i < 10; i++) {
  //   results.push(tmp);
  //   tmp = inverseIdx(tmp);
  // }
  // return results;
  //// Nothing at first sight, but I think with math I can do it.

  /**
   ** Given that inverseIdx is of the kind "y = a + b*x":
   * y(1) = a + b*x
   * y(2) = a + b*y(1) = a + ab + b^2x
   * y(3) = a + b*y(2) = a + ab + ab^2 + b^3x
   ** There's a pattern... If we now look at y(n)-y(n-1):
   * y(2)-y(1) = (a + ab + b^2x) - (a + bx)               = ab^1 - b^1x + b^2x = b^1(a - x + bx)
   * y(3)-y(2) = (a + ab + ab^2 + b^3x) - (a + ab + b^2x) = ab^2 - b^2x + b^3x = b^2(a - x + bx)
   * ...
   * y(n)-y(n-1) = b^(n-1)(a - x + bx)
   ** So, we can represent y(n) as:
   * y(1) = a + bx
   * y(2) = y(1) + b^1(a - x + bx)
   * y(3) = y(2) + b^2(a - x + bx) = y(1) + b^1(a - x + bx) + b^1(a - x + bx)
   * ...
   * y(n) = y(1) + Sum(i=1..n-1, b^i(a - x + bx))
   ** We can name k = (a - x + bx) = a + x * (b - 1), and represent y(1) in base of k, and it gets way easier:
   * y(1) = x + k*b^0
   * y(2) = x + k*b^0 + k*b^1
   * y(3) = x + k*b^0 + k*b^1 + k*b^2
   * ...
   * y(n) = x + k*Sum(i=0..n-1, b^i)
   ** Now, the sum is a geometric series, which we have a formula:
   * Sum(i=0..n, x^i) = (x^(n + 1) - 1) / (x - 1)
   ** To apply it we first need to prepare (as our sum is 0..n-1 and this formula needs 0..n)
   * y(n) = x + k*[Sum(i=0..n, b^i) - b^n]
   ** And now we apply the formula to get the resultFn
   * y(n) = x + k*[(b^(n + 1) - 1) / (b - 1) - b^n]
   ** "[b^(n+1) - 1] / (b - 1) - b^n" can be simplified:
   *   [b^(n+1) - 1] / (b - 1) - b^n
   * = [b^(n+1) - 1 - b^n * (b - 1)] / (b - 1)
   * = [b^(n+1) - 1 - b^(n+1) + b^n] / (b - 1)
   * = [b^n - 1] / (b - 1)
   ** Resulting in:
   * y(n) = x + k * (b^n - 1) / (b - 1)
   */

  const {base, delta} = inverseIdx;
  const exponent = (a: number, b: number) => {
    if (b === 1) {
      return a;
    }
    if (b === 0) {
      return 1;
    }

    const easierResult = exponent(a, Math.floor(b / 2));
    let result = multiply(easierResult, easierResult);
    if (b % 2 === 1) {
      result = multiply(a, result);
    }
    return result;
  };

  /**
   * k = a + x * (b - 1)
   * y(n) = x + k * (b^n - 1) / (b - 1)
   ** We renamed:
   * a => base
   * b => delta
   * x => 2020 (initial position)
   * n => 101741582076661 (number of times that it's shuffled)
   * k => factor = base + 2020 * (delta - 1)
   * y(n) => result = 2020 + factor * sum
   ** We describe the "sum" part as (b^n - 1) / (b - 1)
   * sum = [(delta^n) - 1] / (delta - 1)
   */
  const factor = add(base, multiply(2020, delta - 1));
  const resultFn = (n: number) => {
    const sum = multiply(exponent(delta, n) - 1, invert(delta - 1));
    return add(2020, multiply(factor, sum));
  };
  return resultFn(101741582076661);
};

export {solution1, solution2};
