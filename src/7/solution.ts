declare const process: any;

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const signals = [0, 1, 2, 3, 4];
  let max = 0;

  loopParameters(signals, 5, parameters => {
    const output = parameters.reduce((previousOut, param) => {
      const inputIterator = [param, previousOut][Symbol.iterator]();
      const solution = solve(0, program, inputIterator).next();

      if (solution.done) {
        throw new Error('Program did not yield an output');
      }
      return solution.value;
    }, 0);

    max = Math.max(output, max);
  });

  return max;
};

const loopParameters = (
  values: number[],
  n: number,
  fn: (parameters: number[]) => void
) => {
  const totalPerm = Math.pow(n, values.length);
  for (let i = 0; i < totalPerm; i++) {
    const parameters = new Array(n).fill(0).map((_, idx) => {
      const shift = Math.floor(i / Math.pow(values.length, idx));
      return values[shift % values.length];
    });

    const paramSet = new Set(parameters);
    if (paramSet.size < parameters.length) {
      continue;
    }

    fn(parameters);
  }
};

function* solve(id: number, program: number[], input: Iterator<number, null>) {
  let mem = [...program];

  let ip = 0;
  let opcode: ReturnType<typeof readOpcode>;
  while ((opcode = readOpcode(mem[ip])).operation !== 99) {
    const a = opcode.modeA === 0 ? mem[mem[ip + 1]] : mem[ip + 1];
    const b = opcode.modeB === 0 ? mem[mem[ip + 2]] : mem[ip + 2];
    const dest = mem[ip + 3];

    switch (opcode.operation) {
      case 1:
        mem[dest] = a + b;
        ip += 4;
        break;
      case 2:
        mem[dest] = a * b;
        ip += 4;
        break;
      case 3:
        const next = input.next();
        if (next.done) {
          throw new Error(id + ' trying to read but input is empty');
        }
        mem[mem[ip + 1]] = next.value;
        ip += 2;
        break;
      case 4:
        yield a;
        ip += 2;
        break;
      case 5:
        if (a !== 0) {
          ip = b;
        } else {
          ip += 3;
        }
        break;
      case 6:
        if (a === 0) {
          ip = b;
        } else {
          ip += 3;
        }
        break;
      case 7:
        mem[dest] = a < b ? 1 : 0;
        ip += 4;
        break;
      case 8:
        mem[dest] = a === b ? 1 : 0;
        ip += 4;
        break;
      default:
        throw new Error('unknown opcode ' + JSON.stringify(opcode));
    }
  }

  return null;
}

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

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const signals = [5, 6, 7, 8, 9];
  let max = 0;

  loopParameters(signals, 5, parameters => {
    const inputIterator = createInputIterator();
    inputIterator.push({
      value: 0,
    });

    const amplifiers: IterableIterator<number>[] = [];
    for (let i = 0; i < parameters.length; i++) {
      const input = prependIterator(
        i === 0 ? inputIterator : amplifiers[i - 1],
        parameters[i]
      );
      const amplifier = solve(i, program, input);
      amplifiers.push(amplifier);
    }

    const lastAmplifier = amplifiers[amplifiers.length - 1];

    let lastValue: number = 0;
    for (let result of lastAmplifier) {
      inputIterator.push({
        value: result,
      });
      lastValue = result;
    }

    max = Math.max(lastValue, max);
  });

  return max;
};

const createInputIterator = () => {
  let values: IteratorResult<number, null>[] = [];
  let i = 0;

  return {
    next: () => {
      const value = values[i];
      i++;
      if (!value) {
        throw new Error("InputIterator - Trying to read but it's empty");
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

export {solution1, solution2};
