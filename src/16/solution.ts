const solution1 = (inputLines: string[]) => {
  let numbers = inputLines[0].split('').map(Number);
  const pattern = [0, 1, 0, -1];

  for (let n = 0; n < 10000; n++) {
    numbers = numbers.map((_, idx) => {
      let phase = 0;
      let i = 1;
      if (i > idx) {
        phase = (phase + 1) % pattern.length;
        i = 0;
      }
      const raw = numbers.reduce((total, num) => {
        const base = pattern[phase];
        i++;
        if (i > idx) {
          phase = (phase + 1) % pattern.length;
          i = 0;
        }
        return total + base * num;
      }, 0);
      return Math.abs(raw) % 10;
    });
  }

  return numbers.slice(0, 8).join('');
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
