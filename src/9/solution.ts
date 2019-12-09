const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  return simpleSolve(program, [1]);
};

function simpleSolve(program: number[], input: Array<number>) {
  const result = solve(0, program, input[Symbol.iterator]());
  return [...result];
}

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

    // console.log(ip, opcode, {a, b});

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

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  return simpleSolve(program, [2]);
};

export {solution1, solution2};
