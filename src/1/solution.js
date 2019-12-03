const getFuel = v => {
  const value = Math.floor(v / 3) - 2;
  if (value < 0) {
    return 0;
  }
  return value + getFuel(value);
};

const solution1 = inputLines => {
  return inputLines
    .map(v => Number(v))
    .map(v => Math.floor(v / 3) - 2)
    .reduce((a, b) => a + b);
};

const solution2 = inputLines => {
  return inputLines
    .map(v => Number(v))
    .map(v => getFuel(v))
    .reduce((a, b) => a + b);
};

export {solution1, solution2};
