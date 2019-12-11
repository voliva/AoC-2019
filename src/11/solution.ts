const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  const field = new Map<string, number>();
  const position = [0, 0]; // x y
  let direction = 0; // Up - right - down - left

  const getCurrentValue = () => field.get(position.join(',')) || 0;
  const setCurrentValue = (value: number) =>
    field.set(position.join(','), value);
  const input = createInputIterator();

  const robot = solve(0, program, input);

  while (true) {
    input.push({
      value: getCurrentValue(),
    });

    const action = robot.next();
    if (action.done) {
      break;
    }
    setCurrentValue(action.value);
    const directionAction = robot.next();
    if (directionAction.done) {
      throw new Error('expecting direction, but ended');
    }
    direction += directionAction.value === 1 ? 1 : -1;
    if (direction >= 4) {
      direction -= 4;
    }
    if (direction < 0) {
      direction += 4;
    }
    switch (direction) {
      case 0:
        position[1]--;
        break;
      case 1:
        position[0]++;
        break;
      case 2:
        position[1]++;
        break;
      case 3:
        position[0]--;
        break;
    }
  }

  return field.size; // Solved in 11 minutes
};

function* solve(id: number, program: number[], input: Iterator<number, null>) {
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
        const next = input.next();
        if (next.done) {
          throw new Error(id + ' trying to read but input is empty');
        }
        setValue(opcode.modeA, aParam, next.value);
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

// 21:58
const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  const field = new Map<string, number>();
  const minPosition = [0, 0];
  const maxPosition = [0, 0];
  const position = [0, 0]; // x y
  let direction = 0; // Up - right - down - left

  const getValue = (pos: number[] = position) => field.get(pos.join(',')) || 0;
  const setCurrentValue = (value: number) =>
    field.set(position.join(','), value);
  setCurrentValue(1);

  const input = createInputIterator();

  const robot = solve(0, program, input);

  while (true) {
    input.push({
      value: getValue(),
    });

    const action = robot.next();
    if (action.done) {
      break;
    }
    setCurrentValue(action.value);
    const directionAction = robot.next();
    if (directionAction.done) {
      throw new Error('expecting direction, but ended');
    }
    direction += directionAction.value === 1 ? 1 : -1;
    if (direction >= 4) {
      direction -= 4;
    }
    if (direction < 0) {
      direction += 4;
    }
    switch (direction) {
      case 0:
        position[1]--;
        break;
      case 1:
        position[0]++;
        break;
      case 2:
        position[1]++;
        break;
      case 3:
        position[0]--;
        break;
    }
    minPosition[0] = Math.min(minPosition[0], position[0]);
    minPosition[1] = Math.min(minPosition[1], position[1]);
    maxPosition[0] = Math.max(maxPosition[0], position[0]);
    maxPosition[1] = Math.max(maxPosition[1], position[1]);
  }

  for (let y = minPosition[1]; y <= maxPosition[1]; y++) {
    let line = '';
    for (let x = minPosition[0]; x <= maxPosition[0]; x++) {
      line += getValue([x, y]) === 0 ? ' ' : '#';
    }
    console.log(line);
  }
  // 22:03
};

export {solution1, solution2};
