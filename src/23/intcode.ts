import {readOpcode} from '../13/intcode';

export function createIntcodeProcessor(
  program: number[]
): (input: number) => number | null | 'read' | 'halt' {
  let mem = [...program];

  let ip = 0;
  let relativeBase = 0;
  let halted = false;

  return (input: number) => {
    if (halted) {
      return 'halt';
    }

    const opcode = readOpcode(mem[ip]);
    if (opcode.operation === 99) {
      halted = true;
      return 'halt';
    }

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
        setValue(opcode.modeA, aParam, input);
        ip += 2;
        return 'read';
      case 4:
        ip += 2;
        return a;
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
    return null;
  };
}
