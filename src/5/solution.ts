const solve = (program, inputs) => {
  let mem = [...program];

  const readOpcode = opcode => {
    const operation = opcode % 100;
    opcode = Math.floor(opcode / 100);
    const modeA = opcode % 10;
    opcode = Math.floor(opcode / 10);
    const modeB = opcode % 10;
    opcode = Math.floor(opcode / 10);
    const modeC = opcode % 10;
    return {
      operation,
      modeA,
      modeB,
      modeC,
    };
  };

  let inputPointer = 0;
  let pc = 0;
  let opcode: ReturnType<typeof readOpcode>;
  const outputs: number[] = [];
  while ((opcode = readOpcode(mem[pc])).operation !== 99) {
    const a = opcode.modeA === 0 ? mem[mem[pc + 1]] : mem[pc + 1];
    const b = opcode.modeB === 0 ? mem[mem[pc + 2]] : mem[pc + 2];
    const dest = mem[pc + 3];
    switch (opcode.operation) {
      case 1:
        mem[dest] = a + b;
        pc += 4;
        break;
      case 2:
        mem[dest] = a * b;
        pc += 4;
        break;
      case 3:
        mem[mem[pc + 1]] = inputs[inputPointer];
        inputPointer++;
        pc += 2;
        break;
      case 4:
        outputs.push(a);
        pc += 2;
        break;
      case 5:
        if (a !== 0) {
          pc = b;
        } else {
          pc += 3;
        }
        break;
      case 6:
        if (a === 0) {
          pc = b;
        } else {
          pc += 3;
        }
        break;
      case 7:
        mem[dest] = a < b ? 1 : 0;
        pc += 4;
        break;
      case 8:
        mem[dest] = a === b ? 1 : 0;
        pc += 4;
        break;
      default:
        return null;
    }
  }

  return outputs;
};

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  return solve(program, [1]);
};

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  return solve(program, [5]);
};

export {solution1, solution2};
