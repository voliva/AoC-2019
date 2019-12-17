import {
  createInputIterator,
  runIntcodeFromArray,
  runIntcodeFromIterator,
} from '../13/intcode';

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  const scaffoldProgram = runIntcodeFromArray(program, []);

  const scaffold = new Set<string>();
  let drone;
  let x = 0;
  let y = 0;
  for (let value of scaffoldProgram) {
    const char = String.fromCharCode(value);
    if (char === '#') {
      scaffold.add(`${x},${y}`);
    }
    if ('^,v,<,>'.split(',').includes(char)) {
      scaffold.add(`${x},${y}`);
      drone = {
        x,
        y,
        char,
      };
    }
    x++;
    if (value === 10) {
      x = 0;
      y++;
    }
  }

  const intersections = [...scaffold].filter(s => {
    const [x, y] = s.split(',').map(Number);
    return (
      scaffold.has(`${x + 1},${y}`) &&
      scaffold.has(`${x - 1},${y}`) &&
      scaffold.has(`${x},${y + 1}`) &&
      scaffold.has(`${x},${y - 1}`)
    );
  });

  return intersections.reduce((total, s) => {
    const [x, y] = s.split(',').map(Number);
    return total + x * y;
  }, 0);
};

const createASCIIInputIterator = () => {
  const inputIterator = createInputIterator();

  return {
    ...inputIterator,
    push: (value: string) => {
      value.split('').forEach(v => inputIterator.push(v.charCodeAt(0)));
      inputIterator.push(10);
    },
  };
};

const readField = (
  scaffoldProgram: Iterator<number, null>,
  print: boolean = false
) => {
  const scaffold = new Set<string>();
  let drone: {
    x: number;
    y: number;
    char: string;
  } = null as any;
  let maxX = 0;
  let maxY = 0;
  let x = 0;
  let y = 0;
  let line = '';
  let result: IteratorResult<number, null>;
  while (!(result = scaffoldProgram.next()).done) {
    const value = result.value!;
    const char = String.fromCharCode(value);
    line += char;
    if (char === '#') {
      scaffold.add(`${x},${y}`);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    if ('^,v,<,>'.split(',').includes(char)) {
      // scaffold.add(`${x},${y}`);
      drone = {
        x,
        y,
        char,
      };
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    x++;
    if (value === 10) {
      x = 0;
      y++;
      if (line === '\n') {
        break;
      }
      if (print) {
        console.log(line.slice(0, -1));
      }
      line = '';
    }
  }

  return {
    scaffold,
    drone,
    width: maxX,
    height: maxY,
  };
};
type Field = ReturnType<typeof readField>;

const readPrompt = (
  scaffoldProgram: Iterator<number, null>,
  onPrompt: (prompt: string) => void
) => {
  let line = '';
  let result: IteratorResult<number, null>;
  while (!(result = scaffoldProgram.next()).done) {
    const value = result.value!;
    // console.log(value);
    const char = String.fromCharCode(value);
    line += char;

    if (value === 10) {
      if (line === '\n') {
        break;
      }
      const prompt = line.slice(0, -2);
      onPrompt(prompt);
      line = '';
    }
  }
};

const findNextDirection = (field: Field): [string, string] => {
  const {scaffold, drone} = field;
  const {x, y} = drone;
  switch (drone.char) {
    case '^':
      return scaffold.has(`${x - 1},${y}`) ? ['L', '<'] : ['R', '>'];
    case 'v':
      return scaffold.has(`${x + 1},${y}`) ? ['L', '>'] : ['R', '<'];
    case '<':
      return scaffold.has(`${x},${y + 1}`) ? ['L', 'v'] : ['R', '^'];
    case '>':
      return scaffold.has(`${x},${y - 1}`) ? ['L', '^'] : ['R', 'v'];
  }
  return null as any;
};
const moveForward = (field: Field): number => {
  const {scaffold, drone} = field;
  const {x, y} = drone;

  const countSteps = (incr: [number, number]) => {
    let steps = 0;
    let [x2, y2] = [x, y];
    x2 += incr[0];
    y2 += incr[1];

    while (scaffold.has(`${x2},${y2}`)) {
      drone.x = x2;
      drone.y = y2;
      x2 += incr[0];
      y2 += incr[1];
      steps++;
    }

    return steps;
  };

  switch (drone.char) {
    case '^':
      return countSteps([0, -1]);
    case 'v':
      return countSteps([0, 1]);
    case '<':
      return countSteps([-1, 0]);
    case '>':
      return countSteps([1, 0]);
  }
  return 0;
};

const findRepetition = (sequences: string[][]) => {
  const [baseSequence, ...rest] = sequences;
  const restSuffix = rest.map(s => s.join(';')).join('-');

  for (let i = baseSequence.length; i >= 1; i--) {
    const prefix = baseSequence.slice(0, i).join(';');
    const suffix = baseSequence.slice(i).join(';');

    if (suffix.includes(prefix) || restSuffix.includes(prefix)) {
      let otherSequences: string[][] = suffix
        .split(`${prefix}`)
        .map(s => s.split(';').filter(s => s.length > 0));

      rest.forEach(s => {
        const tmp = s.join(';');
        otherSequences = otherSequences.concat(
          tmp
            .split(`${prefix}`)
            .map(s => s.split(';').filter(s => s.length > 0))
        );
      });

      return {
        repeting: prefix.split(';'),
        otherSequences: otherSequences.filter(s => s.length > 0),
      };
    }
  }

  return {
    repeting: baseSequence,
    otherSequences: rest,
  };
};

declare const process;
const solution2 = async (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  program[0] = 2;
  const input = createASCIIInputIterator();
  const scaffoldProgram = runIntcodeFromIterator(program, input);

  const field = readField(scaffoldProgram);
  const {scaffold, drone} = field;

  const sequence: string[] = [];
  while (true) {
    const [turn, direction] = findNextDirection(field);
    drone.char = direction;
    const movement = moveForward(field);
    if (movement === 0) {
      break;
    }
    sequence.push(`${turn},${movement}`);
  }

  let sequences = [sequence];
  const repetitions: string[][] = [];
  while (sequences.length) {
    const {repeting, otherSequences} = findRepetition(sequences);
    (sequences = otherSequences), repetitions.push(repeting);
  }

  const functions = repetitions.map(r => r.join(','));
  let mainRoutine = sequence.join(',');
  functions.forEach((fn, i) => {
    mainRoutine = mainRoutine.replace(
      new RegExp(fn, 'g'),
      String.fromCharCode('A'.charCodeAt(0) + i)
    );
  });
  console.log(
    mainRoutine,
    functions,
    mainRoutine.length,
    functions.map(fn => fn.length)
  );

  readPrompt(scaffoldProgram, prompt => {
    console.log('prompt', prompt);
    switch (prompt) {
      case 'Main':
        input.push(mainRoutine);
        break;
      case 'Function A':
        input.push(functions[0]);
        break;
      case 'Function B':
        input.push(functions[1]);
        break;
      case 'Function C':
        input.push(functions[2]);
        break;
      case 'Continuous video feed':
        input.push('y');
        break;
    }
  });

  let line = '';
  let result: IteratorResult<number, null>;
  let fieldStr = '';
  while (!(result = scaffoldProgram.next()).done) {
    const value = result.value!;

    const char = String.fromCharCode(value);
    line += char;

    if (value === 10) {
      if (line === '\n') {
        console.log(fieldStr);
        await new Promise(resolve => setTimeout(resolve, 100));
        fieldStr = '';
      } else {
        fieldStr += line;
      }
      line = '';
    }
  }
};

export {solution1, solution2};
