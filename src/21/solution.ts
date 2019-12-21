import {
  createInputIterator,
  runIntcodeFromArray,
  runIntcodeFromIterator,
} from '../13/intcode';

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const springscript = [
    'NOT C J',
    'AND D J',
    'NOT A T',
    'OR T J',
    'WALK',
    '',
    /* */
    /* */
  ];

  const result = runIntcodeFromArray(
    program,
    springscript
      .join('\n')
      .split('')
      .map(c => c.charCodeAt(0))
  );

  if (result.length < 60) {
    return result[result.length - 1];
  }

  return String.fromCharCode(...result);
};

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const springscript = [
    'NOT C J',
    'NOT B T',
    'OR T J',
    'AND D J',
    'NOT A T',
    'OR T J',
    'NOT E T',
    'NOT T T',
    'OR H T',
    'AND T J',
    'RUN',
    '',
  ];

  const result = runIntcodeFromArray(
    program,
    springscript
      .join('\n')
      .split('')
      .map(c => c.charCodeAt(0))
  );

  if (result.length < 60) {
    return result[result.length - 1];
  }

  return String.fromCharCode(...result);
};

export {solution1, solution2};
