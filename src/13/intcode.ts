interface IntcodeInAction {
  type: 'input' | 'done';
}
interface IntcodeOutAction {
  type: 'output';
  value: number;
}
interface IntcodeDoneAction {
  type: 'done';
}

export function* runIntcode(
  program: number[]
): Generator<IntcodeInAction | IntcodeOutAction, IntcodeDoneAction, number> {
  let mem = [...program];

  let ip = 0;
  let opcode: ReturnType<typeof readOpcode>;
  let relativeBase = 0;
  while ((opcode = readOpcode(mem[ip])).operation !== 99) {
    const getValue = (mode: number, param: number) => {
      if (mode === 0) {
        return mem[param] || 0;
      }
      if (mode === 1) {
        return param;
      }
      return mem[relativeBase + param] || 0;
    };
    const setValue = (mode: number, param: number, value: number) => {
      if (mode === 0) {
        mem[param] = value;
      }
      if (mode === 1) {
        throw new Error('mode 1 doesnt work for writes');
      }
      mem[relativeBase + param] = value;
    };
    const aParam = mem[ip + 1];
    const bParam = mem[ip + 2];
    const a = getValue(opcode.modeA, aParam);
    const b = getValue(opcode.modeB, bParam);
    const dest = mem[ip + 3];

    switch (opcode.operation) {
      case 1:
        setValue(opcode.modeC, dest, a + b);
        ip += 4;
        break;
      case 2:
        setValue(opcode.modeC, dest, a * b);
        ip += 4;
        break;
      case 3:
        const next = yield {
          type: 'input',
        };
        setValue(opcode.modeA, aParam, next);
        ip += 2;
        break;
      case 4:
        yield {
          type: 'output',
          value: a,
        };
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
        setValue(opcode.modeC, dest, a < b ? 1 : 0);
        ip += 4;
        break;
      case 8:
        setValue(opcode.modeC, dest, a === b ? 1 : 0);
        ip += 4;
        break;
      case 9:
        relativeBase += a;
        ip += 2;
        break;
      default:
        throw new Error('unknown opcode ' + JSON.stringify(opcode));
    }
  }

  return {
    type: 'done' as const,
  };
}

export function* runIntcodeFromCallback(
  program: number[],
  getNextInput: () => number
) {
  const process = runIntcode(program);
  let lastReadValue = 0;
  let result: IteratorResult<IntcodeInAction | IntcodeOutAction>;
  while ((result = process.next(lastReadValue))) {
    if (result.done) {
      return null;
    }
    const action = result.value;
    if (action.type === 'input') {
      lastReadValue = getNextInput();
    }
    if (action.type === 'output') {
      yield action.value;
    }
  }

  return null;
}

export function runIntcodeFromIterator(
  program: number[],
  input: Iterator<number>
) {
  return runIntcodeFromCallback(program, () => {
    const inputResult = input.next();
    if (inputResult.done) {
      throw new Error('Intcode wants to read, but input iterator has finished');
    }
    return inputResult.value;
  });
}

export function runIntcodeFromArray(program: number[], input: number[]) {
  const result = runIntcodeFromIterator(program, input[Symbol.iterator]());
  return [...result];
}

export const createInputIterator = (defaultValue?: number) => {
  let values: IteratorResult<number, null>[] = [];
  let i = 0;

  const iterator: Iterator<number> = {
    next: () => {
      const value = values[i];
      if (!value) {
        if (defaultValue !== undefined) {
          return {
            value: defaultValue,
          };
        }
        throw new Error("InputIterator - Trying to read but it's empty");
      }
      i++;
      return value;
    },
  };

  return {
    ...iterator,
    push: (value: number) => values.push({value}),
    done: () =>
      values.push({
        done: true,
        value: null,
      }),
  };
};

export const bufferIterator = <T>(
  done: (newValue: T, buffer: T[]) => boolean,
  iterator: Iterator<T>
): IterableIterator<Array<T>> => {
  const ret = {
    next: () => {
      let values: T[] = [];
      do {
        const result = iterator.next();
        if (result.done) {
          return {
            done: true,
            value: values,
          };
        }
        values.push(result.value);
      } while (!done(values[values.length - 1], values));

      return {
        value: values,
      };
    },
    [Symbol.iterator]: () => ret,
  };
  return ret;
};

export const bufferCountIterator = <T>(count: number, iterator: Iterator<T>) =>
  bufferIterator((_, buffer) => buffer.length === count, iterator);

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
