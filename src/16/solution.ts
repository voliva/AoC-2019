const solution1 = (inputLines: string[]) => {
  const numbers = inputLines[0].split('').map(Number);

  return FFT(numbers)
    .slice(0, 8)
    .join('');
};

const FFT = (numbers: number[], repeat: number = 1) => {
  for (let n = 0; n < 100; n++) {
    console.log(n);
    const accumulated = numbers.reduce((arr, num, i) => {
      if (i === 0) {
        arr[0] = num;
      } else {
        arr[i] = arr[i - 1] + num;
      }
      return arr;
    }, new Array(numbers.length));

    const size = accumulated.length * repeat;
    const getValue = (idx: number) => {
      const looped = Math.floor(idx / accumulated.length);
      const loopValue = accumulated[accumulated.length - 1];
      return loopValue * looped + accumulated[idx % accumulated.length];
    };

    numbers = numbers.map((_, idx) => {
      // Assuming pattern 0, 1, 0, -1
      // ...a...b.......c...d => (b-a)+(c-d)

      let sign = 1;
      let start = idx - 1;
      let acc = 0;
      while (start < size - 1) {
        const next = Math.min(start + idx + 1, size - 1);
        const a = start < 0 ? 0 : getValue(start);
        const b = getValue(next);
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
  let input = '';
  for (let i = 0; i < 10000; i++) {
    input += inputLines[0];
  }
  const numbers = input.split('').map(Number);

  const result = FFT(numbers);
  const offset = Number(numbers.slice(0, 7).join(''));

  return result.slice(offset, offset + 8).join('');
};

export {solution1, solution2};
