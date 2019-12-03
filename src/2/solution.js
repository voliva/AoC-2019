const solve = (opcodes, a, b) => {
  let mem = [...opcodes];
  mem[1] = a;
  mem[2] = b;

  let pc = 0;
  while (mem[pc] !== 99) {
    const a = mem[mem[pc + 1]];
    const b = mem[mem[pc + 2]];
    const dest = mem[pc + 3];
    switch (mem[pc]) {
      case 1:
        mem[dest] = a + b;
        break;
      case 2:
        mem[dest] = a * b;
        break;
      default:
        return null;
    }
    pc += 4;
  }

  return mem[0];
};

const solution1 = inputLines => {
  const opcodes = inputLines[0].split(',').map(v => Number(v));

  return solve(opcodes, 12, 2);
};

const dest = 19690720;
const solution2 = inputLines => {
  const opcodes = inputLines[0].split(',').map(v => Number(v));

  /// I went down to a rabbit hole trying to analyze the code.
  /// I didn't realize noun and verb are both capped at 99... brute force would be better
  /// I did realize that noun and verb have a linear effect on solution, so I came up with this

  let noun = 12;
  let verb = 2;
  const initialValue = solve(opcodes, noun, verb);
  const nounSigma = solve(opcodes, noun + 1, verb) - initialValue;
  const verbSigma = solve(opcodes, noun, verb + 1) - initialValue;
  const diff = dest - initialValue;

  noun += Math.floor(diff / nounSigma);
  const newDiff = dest - solve(opcodes, noun, verb);
  verb += Math.floor(newDiff / verbSigma);

  /// This still might fail the condition of both noun and verb capped at 99, but it worked.
  /// I guess I was lucky

  return 100 * noun + verb;
};

export {solution1, solution2};
