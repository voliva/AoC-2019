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
  const changeDirection = (direction: number) => {
    switch (direction) {
      case 0:
      case 1:
        const hasWest = field.has(`${position[0] - 1},${position[1]}`);
        const hasEast = field.has(`${position[0] + 1},${position[1]}`);
        if (hasWest && !hasEast) {
          return 3;
        }
        if (!hasWest && hasEast) {
          return 2;
        }
        return Math.random() < 0.5 ? 2 : 3;
      case 2:
      case 3:
        const hasNorth = field.has(`${position[0]},${position[1] - 1}`);
        const hasSouth = field.has(`${position[0]},${position[1] + 1}`);
        if (hasNorth && !hasSouth) {
          return 1;
        }
        if (!hasNorth && hasSouth) {
          return 0;
        }
        return Math.random() < 0.5 ? 0 : 1;
    }
    return 0;
  };
  const considerChangeDirection = (direction: number) => {
    const hasWest = field.has(`${position[0] - 1},${position[1]}`);
    const hasEast = field.has(`${position[0] + 1},${position[1]}`);
    const hasNorth = field.has(`${position[0]},${position[1] - 1}`);
    const hasSouth = field.has(`${position[0]},${position[1] + 1}`);
    if (direction === 0 && hasNorth && (!hasWest || !hasEast)) {
      return changeDirection(direction);
    }
    if (direction === 1 && hasSouth && (!hasWest || !hasEast)) {
      return changeDirection(direction);
    }
    if (direction === 2 && hasWest && (!hasNorth || !hasSouth)) {
      return changeDirection(direction);
    }
    if (direction === 3 && hasEast && (!hasNorth || !hasSouth)) {
      return changeDirection(direction);
    }
    return direction;
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

  let steps = 0;
  for (let status of repairDroid) {
    if (status === 2) {
      move(position);
      setFieldPosition(position, 'O');
      break;
    }
    if (status === 1) {
      move(position);
      setFieldPosition(position, '.');
      direction = considerChangeDirection(direction);
    }
    if (status === 0) {
      setFieldPosition(move([...position]), '#');
      direction = changeDirection(direction);
    }

    steps++;
    if (steps > 5000) {
      process.exit(1);
    }
  }

  printField();

  const positionsToCheck = [[0, 0, 0]];
  const positionsVisited = new Set<string>();
  while (positionsToCheck.length > 0) {
    const [steps, ...pos] = positionsToCheck.shift()!;
    const posKey = pos.join(',');
    if (positionsVisited.has(posKey)) {
      continue;
    }
    positionsVisited.add(posKey);

    let fieldValue = field.get(posKey);
    if (fieldValue === 'O') {
      return steps;
    }
    if (fieldValue === '.') {
      positionsToCheck.push(
        [steps + 1, pos[0] + 1, pos[1]],
        [steps + 1, pos[0] - 1, pos[1]],
        [steps + 1, pos[0], pos[1] + 1],
        [steps + 1, pos[0], pos[1] - 1]
      );
    }
  }

  return 'unknown';
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
