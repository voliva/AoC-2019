// deal into new stack
// deal with increment 65
// cut -850
const parseLine = (line: string): [string, number] => {
  if (line.startsWith('deal into')) {
    return ['reverse', 0];
  }
  if (line.startsWith('deal with')) {
    const res = line.split(' ');
    return ['increment', Number(res[res.length - 1])];
  }
  const res = line.split(' ');
  return ['cut', Number(res[res.length - 1])];
};

const solution1 = (inputLines: string[]) => {
  const N = 10007;
  let stack = new Array(N).fill(0).map((_, i) => i);

  inputLines.forEach(line => {
    const [action, param] = parseLine(line);
    console.log(action, param);
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
    if (action === 'increment') {
      const newStack = new Array(stack.length);
      let k = 0;
      for (let i = 0; i < stack.length; i++) {
        newStack[k % newStack.length] = stack[i];
        k += param;
      }
      stack = newStack;
    }
  });

  // It's not 2307, 5702
  // return stack.join(' ');
  return stack.slice(2018, 2021);
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
