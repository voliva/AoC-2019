declare const process: any;

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

const solve = (program, inputs) => {
  let mem = [...program];

  let inputPointer = 0;
  let pc = 0;
  let opcode: ReturnType<typeof readOpcode>;
  const outputs: number[] = [];
  while ((opcode = readOpcode(mem[pc])).operation !== 99) {
    const a = opcode.modeA === 0 ? mem[mem[pc + 1]] : mem[pc + 1];
    const b = opcode.modeB === 0 ? mem[mem[pc + 2]] : mem[pc + 2];
    const dest = mem[pc + 3];
    console.log(opcode, a, b, dest);
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
        console.log(mem[pc + 1], mem[mem[pc + 1]]);
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

  process.exit(1);

  return outputs;
};

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const signals = [0, 1, 2, 3, 4];
  const amplifiers = ['A', 'B', 'C', 'D', 'E'];
  const totalPerm = Math.pow(amplifiers.length, signals.length);
  let max = 0;
  for (let i = 0; i < totalPerm; i++) {
    const parameters = amplifiers.map((_, idx) => {
      const shift = Math.floor(i / Math.pow(signals.length, idx));
      return signals[shift % signals.length];
    });

    const paramSet = new Set(parameters);
    if (paramSet.size < parameters.length) {
      continue;
    }

    const output = parameters.reduce((acc, param) => {
      const solution = solve(program, [param, acc]);
      if (!solution || solution.length > 1) {
        throw new Error('unexpected output ' + (solution && solution.length));
      }
      return solution[0];
    }, 0);
    console.log(`${i}/${totalPerm}`, parameters, output);
    max = Math.max(output, max);
  }

  return max;
};

function* amplifier(
  id: number,
  program: number[],
  inputs: Iterator<number, null>
) {
  let mem = [...program];

  const logIO = (...args: any) => {};

  let pc = 0;
  let opcode: ReturnType<typeof readOpcode>;
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
        logIO(id, 'read');
        const next = inputs.next();
        logIO(id, 'read', next);
        if (!next.done) {
          mem[mem[pc + 1]] = next.value;
        } else {
          throw new Error('trying to read but no more inputs');
        }
        pc += 2;
        break;
      case 4:
        logIO(id, 'yield', a);
        yield a;
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
        throw new Error('unknown opcode ' + JSON.stringify(opcode));
    }
  }

  logIO(id, 'halt');
  return null;
}

const createInputIterator = () => {
  let values: IteratorResult<number, null>[] = [];
  let i = 0;

  return {
    next: () => {
      // console.log(values);
      const value = values[i];
      i++;
      if (!value) {
        throw new Error('read out of bounds');
      }
      return value;
    },
    push: (value: IteratorResult<number, null>) => values.push(value),
  };
};

const prependIterator = <T>(iterator: Iterator<T, null>, value: T) => {
  let valueReturned = false;
  return {
    next: () => {
      if (valueReturned) {
        return iterator.next();
      }
      valueReturned = true;
      return {
        value,
      };
    },
  };
};

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const signals = [5, 6, 7, 8, 9];

  const totalAmplifiers = 5;
  const totalPerm = Math.pow(totalAmplifiers, signals.length);
  let max = 0;
  for (let i = 0; i < totalPerm; i++) {
    const parameters = new Array(totalAmplifiers).fill(0).map((_, idx) => {
      const shift = Math.floor(i / Math.pow(signals.length, idx));
      return signals[shift % signals.length];
    });

    const paramSet = new Set(parameters);
    if (paramSet.size < parameters.length) {
      continue;
    }

    const inputIterator = createInputIterator();
    inputIterator.push({
      value: 0,
    });

    const amplifiers: IterableIterator<number>[] = [];
    for (let i = 0; i < totalAmplifiers; i++) {
      const input = prependIterator(
        i === 0 ? inputIterator : amplifiers[i - 1],
        parameters[i]
      );
      amplifiers.push(amplifier(i, program, input));
    }

    const outputAmplifier = amplifiers[amplifiers.length - 1];

    let lastValue: number = 0;
    for (let result of outputAmplifier) {
      inputIterator.push({
        value: result,
      });
      lastValue = result;
    }

    max = Math.max(lastValue, max);
    console.log(`${i}/${totalPerm}`, parameters, max, lastValue);
  }

  return max;
};

export {solution1, solution2};
