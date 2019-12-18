const readInput = (inputLines: string[]) => {
  // [row][col]
  return inputLines.map(line => {
    return line.split('');
  });
};

const solution1 = (inputLines: string[]) => {
  const map = readInput(inputLines);
  const startRow = map.findIndex(line => line.includes('@'));
  const startCol = map[startRow].indexOf('@');

  const doorsOpen = new Set<string>();
  let totalSteps = 0;
  while (true) {
    const [pos, steps] = findClosestKey(map, [startRow, startCol], doorsOpen);

    console.log(pos, steps);

    if (!pos.length) {
      return totalSteps;
    }
    totalSteps += steps;

    const key = map[pos[0]][pos[1]];
    console.log(key);
    doorsOpen.add(key.toUpperCase());
  }

  // It's not 6398
};

const keyRegex = /^[a-z]$/;
const doorRegex = /^[A-Z]$/;
const findClosestKey = (
  map: string[][],
  pos: number[],
  doorsOpen: Set<string>
): [number[], number] => {
  if (keyRegex.test(map[pos[0]][pos[1]])) {
    return [pos, 0];
  }

  const positionsVisited = new Set();
  positionsVisited.add(pos.join(','));
  let positionsToVisit = [
    [1, pos[0] + 1, pos[1]],
    [1, pos[0] - 1, pos[1]],
    [1, pos[0], pos[1] + 1],
    [1, pos[0], pos[1] - 1],
  ];

  while (positionsToVisit.length) {
    const [steps, ...pos] = positionsToVisit.splice(0, 1)[0];
    if (positionsVisited.has(pos.join(','))) {
      continue;
    }

    const char = map[pos[0]][pos[1]];
    if (keyRegex.test(char) && !doorsOpen.has(char.toUpperCase())) {
      return [pos, steps];
    }
    positionsVisited.add(pos.join(','));

    const isWall =
      char === '#' || (doorRegex.test(char) && !doorsOpen.has(char));

    if (!isWall) {
      positionsToVisit = [
        ...positionsToVisit,
        [steps + 1, pos[0] + 1, pos[1]],
        [steps + 1, pos[0] - 1, pos[1]],
        [steps + 1, pos[0], pos[1] + 1],
        [steps + 1, pos[0], pos[1] - 1],
      ];
    }
  }
  return [[], 0];
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
