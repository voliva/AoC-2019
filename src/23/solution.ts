import {createInputIterator, runIntcodeFromIterator} from '../13/intcode';
import {createIntcodeProcessor} from './intcode';
import TinyQueue from 'tinyqueue';

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  const N = 50;

  const computers = new Array(N).fill(0).map(() => ({
    input: new TinyQueue<[number, number]>([]),
    processor: createIntcodeProcessor(program),
  }));
  computers.forEach((computer, i) => {
    while (computer.processor(i) !== 'read');
  });
  console.log('all computers read');

  while (true) {
    for (let computer of computers) {
      const nextPacket = computer.input.peek();
      const input = nextPacket ? nextPacket[0] : -1;
      const result = computer.processor(input);
      if (result === 'halt') {
        continue;
      }
      if (result === 'read' && nextPacket) {
        const packet = computer.input.pop()!;
        while (computer.processor(packet[1]) !== 'read');
        continue;
      }
      if (typeof result === 'number') {
        const address = result;
        let res;
        while (typeof (res = computer.processor(-1)) !== 'number');
        const X = res;
        while (typeof (res = computer.processor(-1)) !== 'number');
        const Y = res;
        if (address === 255) {
          return Y;
        }
        if (address >= N) {
          throw new Error('address out of bounds');
        }
        console.log(address, X, Y);
        computers[address].input.push([X, Y]);
      }
    }
  }
};

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  const N = 50;

  const computers = new Array(N).fill(0).map(() => ({
    input: new TinyQueue<[number, number]>([]),
    processor: createIntcodeProcessor(program),
  }));
  computers.forEach((computer, i) => {
    while (computer.processor(i) !== 'read');
  });

  let NATMem: [number, number] | null = null;
  let lastPush: number | null = null;
  const idleComputers = new Set<number>();
  let hasStarted = false;

  while (true) {
    for (let computer of computers) {
      const idx = computers.indexOf(computer);

      const nextPacket = computer.input.peek();
      const input = nextPacket ? nextPacket[0] : -1;
      const result = computer.processor(input);
      if (result === 'halt') {
        continue;
      }
      if (result === 'read') {
        if (nextPacket) {
          const packet = computer.input.pop()!;
          while (computer.processor(packet[1]) !== 'read');
        } else if (hasStarted) {
          idleComputers.add(idx);
        }
        continue;
      }
      if (typeof result === 'number') {
        hasStarted = true;

        const address = result;
        let res;
        while (typeof (res = computer.processor(-1)) !== 'number');
        const X = res;
        while (typeof (res = computer.processor(-1)) !== 'number');
        const Y = res;
        // console.log(address, X, Y);
        if (address === 255) {
          NATMem = [X, Y];
          continue;
        }
        if (address >= N) {
          throw new Error('address out of bounds');
        }
        idleComputers.delete(address);
        computers[address].input.push([X, Y]);
      }

      // NAT
      if (idleComputers.size === N) {
        if (!NATMem) {
          throw new Error('mem empty');
        }
        if (lastPush === NATMem[1]) {
          return lastPush;
        }
        idleComputers.clear();
        lastPush = NATMem[1];
        computers[0].input.push(NATMem);
      }
    }
  }
};

export {solution1, solution2};
