const solution1 = (inputLines: string[]) => {
  const numbers = inputLines[0].split('').map(Number);

  return FFT(numbers)
    .slice(0, 8)
    .join('');
};

const FFT = (numbers: number[]) => {
  for (let n = 0; n < 100; n++) {
    const accumulated = numbers.reduce((arr, num, i) => {
      if (i === 0) {
        arr[0] = num;
      } else {
        arr[i] = arr[i - 1] + num;
      }
      return arr;
    }, new Array(numbers.length));

    numbers = numbers.map((_, idx) => {
      // Assuming pattern 0, 1, 0, -1
      // ...a...b.......c...d => (b-a)+(c-d)

      let sign = 1;
      let start = idx - 1;
      let acc = 0;
      while (start < accumulated.length - 1) {
        const next = Math.min(start + idx + 1, accumulated.length - 1);
        const a = start < 0 ? 0 : accumulated[start];
        const b = accumulated[next];
        acc += sign * (b - a);

        sign *= -1;
        start += (idx + 1) * 2;
      }

      return Math.abs(acc) % 10;
    });
  }
  return numbers;
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
