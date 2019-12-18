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

  const keys = findKeys(map);

  return getShortestPath(
    map,
    new Set<string>(),
    keys,
    [startRow, startCol],
    true
  );
  // It's not 6398
};

const keyRegex = /^[a-z]$/;
const findKeys = (map: string[][]) => {
  const result: number[][] = [];
  map.forEach((row, r) => {
    row.forEach((col, c) => {
      if (keyRegex.test(map[r][c])) {
        result.push([r, c]);
      }
    });
  });
  return result;
};

const doorRegex = /^[A-Z]$/;
const countSteps = (
  map: string[][],
  doorsOpen: Set<string>,
  from: number[],
  to: number[]
) => {
  if (from.join(',') === to.join(',')) {
    return 0;
  }

  const positionsVisited = new Set();
  positionsVisited.add(from.join(','));
  let positionsToVisit = [
    [1, from[0] + 1, from[1]],
    [1, from[0] - 1, from[1]],
    [1, from[0], from[1] + 1],
    [1, from[0], from[1] - 1],
  ];

  while (positionsToVisit.length) {
    const [steps, ...pos] = positionsToVisit.splice(0, 1)[0];
    if (positionsVisited.has(pos.join(','))) {
      continue;
    }
    if (pos.join(',') === to.join(',')) {
      return steps;
    }

    const char = map[pos[0]][pos[1]];
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
  return -1;
};

const getShortestPath = (
  map: string[][],
  doorsOpen: Set<string>,
  keys: number[][],
  pos: number[],
  isTopLevel = false
) => {
  if (keys.length === 0) {
    return 0;
  }

  return keys
    .map(key => {
      const steps = countSteps(map, doorsOpen, pos, key);
      if (steps < 0) {
        return -1;
      }
      const char = map[key[0]][key[1]];
      const newDoorsOpen = new Set(doorsOpen);
      newDoorsOpen.add(char.toUpperCase());
      const newKeys = keys.filter(k => k !== key);
      console.log(key, keys.length, newKeys.length, 'rec');
      return steps + getShortestPath(map, newDoorsOpen, newKeys, key);
    })
    .filter(v => v >= 0)
    .reduce((a, b) => Math.min(a, b));
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
