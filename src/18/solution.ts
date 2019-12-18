import TinyQueue from 'tinyqueue';

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

  return countSteps(map, [startRow, startCol], keys);
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
const countSteps = (map: string[][], from: number[], keys: number[][]) => {
  const getPVKey = (pos: number[], possession: string[]) =>
    pos.join(',') + ',' + possession.join(',');

  const positionsVisited = new Set();
  positionsVisited.add(getPVKey(from, []));
  const positionsToVisit = new TinyQueue<[number, string[], number, number]>(
    [
      [1, [], from[0] + 1, from[1]],
      [1, [], from[0] - 1, from[1]],
      [1, [], from[0], from[1] + 1],
      [1, [], from[0], from[1] - 1],
    ],
    (a, b) => {
      const getValueForPosition = (pos: [number, string[], number, number]) =>
        keys
          .filter(key => {
            const char = map[key[0]][key[1]];
            return !pos[1].includes(char);
          })
          .map(key => Math.abs(key[0] - pos[2]) + Math.abs(key[1] - pos[3]))
          .reduce((a, b) => Math.min(a, b), 40 * 40) + pos[0];

      const aValue = getValueForPosition(a);
      const bValue = getValueForPosition(b);
      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }
      return 0;
    }
  );

  let maxPossession = 0;
  while (positionsToVisit.length) {
    const [steps, possession, ...pos] = positionsToVisit.pop()!;
    const key = getPVKey(pos, possession);
    if (positionsVisited.has(key)) {
      continue;
    }
    positionsVisited.add(key);
    if (possession.length > maxPossession) {
      console.log(possession.length, steps);
      maxPossession = possession.length;
    }

    const char = map[pos[0]][pos[1]];

    let newPossession =
      keyRegex.test(char) && !possession.includes(char)
        ? [...possession, char]
        : [...possession];

    if (newPossession.length === keys.length) {
      return steps;
    }

    const isWall =
      char === '#' ||
      (doorRegex.test(char) && !newPossession.includes(char.toLowerCase()));

    if (!isWall) {
      positionsToVisit.push([steps + 1, newPossession, pos[0] + 1, pos[1]]);
      positionsToVisit.push([steps + 1, newPossession, pos[0] - 1, pos[1]]);
      positionsToVisit.push([steps + 1, newPossession, pos[0], pos[1] + 1]);
      positionsToVisit.push([steps + 1, newPossession, pos[0], pos[1] - 1]);
    }
  }
  return -1;
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
