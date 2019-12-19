import {
  createInputIterator,
  runIntcodeFromArray,
  runIntcodeFromIterator,
} from '../13/intcode';

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  let total = 0;
  let field = '';
  for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
      const res = [...runIntcodeFromArray(program, [x, y])];
      field += res[0] ? '#' : '.';
      total += res.reduce((a, b) => a + b);
    }
    field += '\n';
  }
  console.log(field);

  return total;
};

const test = (program, x: number, y: number) =>
  [...runIntcodeFromArray(program, [x, y])][0];

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const target = 100;

  let x = target;
  let y = 0;
  while (!test(program, x, y)) {
    y++;
  }
  while (test(program, x + 1, y)) {
    x++;
  }

  while (!test(program, x - target + 1, y + target - 1)) {
    x++;
    while (!test(program, x, y)) {
      y++;
    }
    while (test(program, x + 1, y)) {
      x++;
    }
  }

  const xTarget = x - target + 1;
  const yTarget = y;

  // let field = '';
  // for (let y = yTarget - 5; y < yTarget + target + 5; y++) {
  //   for (let x = xTarget - 5; x < xTarget + target + 5; x++) {
  //     const isPlatform =
  //       y >= yTarget &&
  //       y < yTarget + target &&
  //       x >= xTarget &&
  //       x < xTarget + target;
  //     const isBeam = test(program, x, y);
  //     const char = isPlatform ? (isBeam ? 'O' : 'X') : isBeam ? '#' : '.';
  //     field += char;
  //   }
  //   field += '\n';
  // }
  // console.log(field);

  return xTarget * 10000 + yTarget;
};

export {solution1, solution2};
