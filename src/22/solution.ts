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

const solution1_prev = (inputLines: string[]) => {
  const N = 10007;
  let idx = 2019;

  inputLines.forEach(line => {
    const [action, param] = parseLine(line);

    if (action === 'reverse') {
      idx = N - idx - 1;
    }
    if (action === 'cut') {
      const normalizedParam = param > 0 ? param : N + param;
      idx = idx - normalizedParam;
      if (idx < 0) {
        idx += N;
      }
    }
    if (action === 'deal') {
      idx = (idx * param) % N;
    }
  });

  return idx;
};

const solution2 = (inputLines: string[]) => {
  const inverseInput = [...inputLines].reverse();

  // const N = 119315717514047;
  const N = 10007;

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

  // const result2 = new Array(100).fill(0).map((_, i) => forwardMap(i));
  // for (let i = 1; i < 100; i++) {
  //   console.log(result2[i] - result2[i - 1]);
  // }
  // return 0;
  // I see that results increment by a constant N - If that increment is 4:
  // 0 => 6
  // 1 => 10
  // 2 => 14

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
  const forwardIdx = findLinearFn(forwardMap);
  const inverseIdx = findLinearFn(inverseMap);

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
  // I can't find any patterns on either inverse/forward, out of memory... let's find more patterns...

  // const results: number[] = [];
  // let tmp = 0;
  // for (let i = 0; i < 10; i++) {
  //   results.push(tmp);
  //   tmp = inverseIdx(tmp);
  // }
  // return results;
  // Nothing, but I think with math I can do it

  const {base, delta} = inverseIdx;
  // I think the result (card ending in 2020) at step n will be:
  // inverseIdx(2020) + (base + 2020 * (delta - 1)) * Sum(delta^i) (from i=1 to n-1)
  // The Sum(delta^i) is a geometric series. The formula for that is:
  // Sum(delta^i) = (delta^(n+1)-1)/(delta-1) if i=0..n
  // So, normalizing => (delta^n-delta)/(delta-1)

  const exponent = (a: number, b: number) => {
    if (b === 1) {
      return a;
    }
    if (b === 0) {
      return 1;
    }

    const easierResult = exponent(a, Math.floor(b / 2));
    const result = multiply(easierResult, easierResult);
    if (b % 2 === 1) {
      return multiply(b, result);
    }
    return result;
  };

  // Test exponent function
  // for (let i = 0; i < N; i++) {
  //   const exp = exponent(i, 2);
  //   const inv = invert(i);
  //   console.log(i, multiply(exponent(i, 2), inv) === i);
  // }
  // return;

  const resultFn = (n: number) => {
    const y1 = inverseIdx(2020);
    const factor = add(base, multiply(2020, delta - 1));
    const sum = multiply(exponent(delta, n + 1) - 1, invert(delta - 1));
    return add(y1, multiply(factor, sum));
  };

  const y1 = inverseIdx(2020);
  const y2 = inverseIdx(y1);
  const y3 = inverseIdx(y2);
  const y4 = inverseIdx(y3);

  // const predy2y1 = multiply(delta, add(sub(base, 2020), multiply(delta, 2020)));
  const predy2y1 = multiply(delta, add(base, multiply(delta - 1, 2020)));
  const predy2 = add(y1, predy2y1);
  const predy3y2 = multiply(delta, predy2y1);
  const predy3 = add(y2, predy3y2);
  const predy4y3 = multiply(exponent(delta, 2), predy2y1);
  const predy4 = add(y3, predy4y3);

  console.log({y1, y2, y3, y4, predy2, predy3, predy4});
  // console.log([y1, y2, y3, y4]);
  // console.log([1, 2, 3, 4].map(resultFn));

  // let tmp = 114037348233487;
  // for (let i = 0; i < 3; i++) tmp = forwardIdx(tmp);
  // console.log(tmp);

  // const predy2y1 = multiply(delta, add(sub(base, 2020), multiply(delta, 2020)));
  // const predy3y2 = multiply(delta, predy2y1);
  // console.log(predy3y2);

  // console.log({y1, y2, y3, y2y1: sub(y2, y1), y3y2: sub(y3, y2)});

  // let tmp = 2020;
  // for (let r = 0; r < 10; r++) {
  //   tmp = inverseIdx(tmp);
  //   console.log(tmp);
  // }

  // const result: number[] = [];
  // for (let r = 1; r < 10; r++) {
  //   // (delta^n-delta)/(delta-1)
  //   const exp = exponent(delta, r);
  //   const sum = multiply(sub(exp, delta), invert(delta - 1));
  //   const inc = add(
  //     // (base + 2020 * (delta - 1))
  //     base,
  //     multiply(2020, delta - 1)
  //   );
  //   // inverseIdx(2020) + inc * sum
  //   result.push(add(inverseIdx(2020), multiply(inc, sum)));
  // }
  // return result;

  // More than 23420286820545
  // Less than 116864512047171
  // N =       119315717514047
};

export {solution1, solution2};