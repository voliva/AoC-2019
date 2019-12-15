import {createInputIterator, runIntcodeFromCallback} from '../13/intcode';
declare const process: any;

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  const field = new Map<string, string>();
  const fieldBounds = {
    min: [0, 0],
    max: [0, 0],
  };
  const position = [0, 0];
  let direction = 0;

  const repairDroid = runIntcodeFromCallback(program, () => direction + 1);

  const move = (position: Array<number>) => {
    switch (direction) {
      case 0:
        position[1]--;
        break;
      case 1:
        position[1]++;
        break;
      case 2:
        position[0]--;
        break;
      case 3:
        position[0]++;
        break;
    }
    return position;
  };
  const setFieldPosition = (
    position: Array<number>,
    value: 'O' | '#' | '.'
  ) => {
    fieldBounds.min[0] = Math.min(position[0], fieldBounds.min[0]);
    fieldBounds.min[1] = Math.min(position[1], fieldBounds.min[1]);
    fieldBounds.max[0] = Math.max(position[0], fieldBounds.max[0]);
    fieldBounds.max[1] = Math.max(position[1], fieldBounds.max[1]);
    field.set(position.join(','), value);
  };
  const findClosest = (startPosition: number[], target: string) => {
    const positionsToCheck = [
      ([[], ...startPosition] as any) as [number[], number, number],
    ];
    const positionsVisited = new Set<string>();
    while (positionsToCheck.length > 0) {
      const [steps, ...pos] = positionsToCheck.shift()!;
      const posKey = pos.join(',');
      if (positionsVisited.has(posKey)) {
        continue;
      }
      positionsVisited.add(posKey);

      let fieldValue = field.get(posKey) || ' ';
      if (fieldValue === target) {
        return steps;
      }
      if (fieldValue === '.') {
        positionsToCheck.push(
          [[...steps, 3], pos[0] + 1, pos[1]],
          [[...steps, 2], pos[0] - 1, pos[1]],
          [[...steps, 1], pos[0], pos[1] + 1],
          [[...steps, 0], pos[0], pos[1] - 1]
        );
      }
    }
    return null;
  };

  const printField = () => {
    for (let y = fieldBounds.min[1]; y <= fieldBounds.max[1]; y++) {
      let line = '';
      for (let x = fieldBounds.min[0]; x <= fieldBounds.max[0]; x++) {
        const pos = `${x},${y}`;
        const isDroid = position.join(',') === pos;
        line += isDroid ? 'D' : field.get(`${x},${y}`) || ' ';
      }
      console.log(line);
    }
    console.log('------');
  };

  setFieldPosition(position, '.');
  for (let status of repairDroid) {
    if (status === 2) {
      move(position);
      setFieldPosition(position, 'O');
      break;
    }
    if (status === 1) {
      move(position);
      setFieldPosition(position, '.');
    }
    if (status === 0) {
      setFieldPosition(move([...position]), '#');
    }
    const closestEmpty = findClosest(position, ' ');
    if (!closestEmpty) {
      printField();
      throw new Error('cant find empty position');
    }
    direction = closestEmpty[0];
  }

  printField();

  return findClosest([0, 0], 'O')!.length;
};

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  const field = new Map<string, string>();
  const fieldBounds = {
    min: [0, 0],
    max: [0, 0],
  };
  const position = [0, 0];
  let direction = 0;

  const repairDroid = runIntcodeFromCallback(program, () => direction + 1);

  const move = (position: Array<number>) => {
    switch (direction) {
      case 0:
        position[1]--;
        break;
      case 1:
        position[1]++;
        break;
      case 2:
        position[0]--;
        break;
      case 3:
        position[0]++;
        break;
    }
    return position;
  };
  const setFieldPosition = (
    position: Array<number>,
    value: 'O' | '#' | '.'
  ) => {
    fieldBounds.min[0] = Math.min(position[0], fieldBounds.min[0]);
    fieldBounds.min[1] = Math.min(position[1], fieldBounds.min[1]);
    fieldBounds.max[0] = Math.max(position[0], fieldBounds.max[0]);
    fieldBounds.max[1] = Math.max(position[1], fieldBounds.max[1]);
    field.set(position.join(','), value);
  };
  const findClosest = (startPosition: number[], target: string) => {
    const positionsToCheck = [
      ([[], ...startPosition] as any) as [number[], number, number],
    ];
    const positionsVisited = new Set<string>();
    while (positionsToCheck.length > 0) {
      const [steps, ...pos] = positionsToCheck.shift()!;
      const posKey = pos.join(',');
      if (positionsVisited.has(posKey)) {
        continue;
      }
      positionsVisited.add(posKey);

      let fieldValue = field.get(posKey) || ' ';
      if (fieldValue === target) {
        return steps;
      }
      if (fieldValue === '.' || fieldValue === 'O') {
        positionsToCheck.push(
          [[...steps, 3], pos[0] + 1, pos[1]],
          [[...steps, 2], pos[0] - 1, pos[1]],
          [[...steps, 1], pos[0], pos[1] + 1],
          [[...steps, 0], pos[0], pos[1] - 1]
        );
      }
    }
    return null;
  };

  const printField = () => {
    for (let y = fieldBounds.min[1]; y <= fieldBounds.max[1]; y++) {
      let line = '';
      for (let x = fieldBounds.min[0]; x <= fieldBounds.max[0]; x++) {
        const pos = `${x},${y}`;
        const isDroid = position.join(',') === pos;
        const isOrigin = pos === '0,0';
        line += isDroid ? 'D' : isOrigin ? '@' : field.get(`${x},${y}`) || ' ';
      }
      console.log(line);
    }
    console.log('------');
  };

  setFieldPosition(position, '.');
  let oxigenPosition: number[];
  for (let status of repairDroid) {
    if (status === 2) {
      move(position);
      setFieldPosition(position, 'O');
      oxigenPosition = [...position];
    }
    if (status === 1) {
      move(position);
      setFieldPosition(position, '.');
    }
    if (status === 0) {
      setFieldPosition(move([...position]), '#');
    }
    const closestEmpty = findClosest(position, ' ');
    if (!closestEmpty) {
      break;
    }
    direction = closestEmpty[0];
  }

  printField();

  const positionsToCheck = [
    ([[], ...oxigenPosition!] as any) as [number[], number, number],
  ];
  const positionsVisited = new Set<string>();
  let maximumSteps = 0;
  while (positionsToCheck.length > 0) {
    const [steps, ...pos] = positionsToCheck.shift()!;
    const posKey = pos.join(',');
    if (positionsVisited.has(posKey)) {
      continue;
    }
    positionsVisited.add(posKey);

    let fieldValue = field.get(posKey) || ' ';
    if (fieldValue === '.' || fieldValue === 'O') {
      maximumSteps = Math.max(maximumSteps, steps.length);
      positionsToCheck.push(
        [[...steps, 3], pos[0] + 1, pos[1]],
        [[...steps, 2], pos[0] - 1, pos[1]],
        [[...steps, 1], pos[0], pos[1] + 1],
        [[...steps, 0], pos[0], pos[1] - 1]
      );
    }
  }
  return maximumSteps;
};

export {solution1, solution2};
