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
  program: number[],
  debugMode?: boolean
): Generator<IntcodeInAction | IntcodeOutAction, IntcodeDoneAction, number> {
  let mem = [...program];

  const pad = (value: number, n: number) => {
    let res = value.toString();
    while(res.length < n) {
      res = ' ' + res;
    }
    return res;
  }
  const debug = (operation: string, ...pointers: any[]) => {
    if(!debugMode) return;
    const dest = pointers.pop();
    let logParams = [pad(ip, 4), operation];
    if(dest) {
      logParams.push(`${dest} <-`);
    }
    logParams = logParams.concat(pointers.map(pointer => `${pointer}(${mem[pointer]})`));

    console.log(...logParams);
  }

  let ip = 0;
  let instruction: ReturnType<typeof readInstruction>;
  let relativeBase = 0;
  while ((instruction = readInstruction(mem, relativeBase, ip)).operation !== 99) {
    const { operation, pointers, values } = instruction;

    switch (operation) {
      case 1:
        debug('add', ...pointers);
        mem[pointers[2]] = values[0] + values[1];
        ip += 4;
        break;
      case 2:
        debug('mul', ...pointers);
        mem[pointers[2]] = values[0] * values[1];
        ip += 4;
        break;
      case 3:
        const next = yield {
          type: 'input',
        };
        debug(`in ${next}`, pointers[0]);
        mem[pointers[0]] = next;
        ip += 2;
        break;
      case 4:
        debug(`out`, pointers[0], null);
        yield {
          type: 'output',
          value: values[0],
        };
        ip += 2;
        break;
      case 5:
        debug(`jnz`, ...pointers.slice(0, 2), null);
        if (values[0] !== 0) {
          ip = values[1];
        } else {
          ip += 3;
        }
        break;
      case 6:
        debug(`jez`, ...pointers.slice(0, 2), null);
        if (values[0] === 0) {
          ip = values[1];
        } else {
          ip += 3;
        }
        break;
      case 7:
        debug('clt', ...pointers);
        mem[pointers[2]] = values[0] < values[1] ? 1 : 0;
        ip += 4;
        break;
      case 8:
        debug('ceq', ...pointers);
        mem[pointers[2]] = values[0] === values[1] ? 1 : 0;
        ip += 4;
        break;
      case 9:
        debug('rel', pointers[0], 'relativeBase');
        relativeBase += values[0];
        ip += 2;
        break;
      default:
        throw new Error('unknown opcode ' + JSON.stringify(operation));
    }
  }

  debug('halt', null);

  return {
    type: 'done' as const,
  };
}

export function* runIntcodeFromCallback(
  program: number[],
  getNextInput: () => number,
  debugMode?: boolean
) {
  const process = runIntcode(program, debugMode);
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
  input: Iterator<number>,
  debugMode?: boolean
) {
  return runIntcodeFromCallback(program, () => {
    const inputResult = input.next();
    if (inputResult.done) {
      throw new Error('Intcode wants to read, but input iterator has finished');
    }
    return inputResult.value;
  }, debugMode);
}

export function runIntcodeFromArray(program: number[], input: number[], debugMode?: boolean) {
  const result = runIntcodeFromIterator(program, input[Symbol.iterator](), debugMode);
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

const readInstruction = (program: number[], relativeBase: number, ip: number) => {
  const {operation, modeA, modeB, modeC} = readOpcode(program[ip]);
  const getPointer = (mode: number, position: number) => {
    switch(mode) {
      case 0:
        return program[position];
      case 1:
        return position;
      case 2:
        return program[position] + relativeBase;
    }
    return 0;
  }
  const pointers = [
    getPointer(modeA, ip+1),
    getPointer(modeB, ip+2),
    getPointer(modeC, ip+3),
  ];
  const values = pointers.map(p => program[p]);
  return {
    operation,
    pointers,
    values
  }
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
