import TinyQueue from 'tinyqueue';

const readInput = (inputLines: string[]) => {
  // [row][col]
  return inputLines.map(line => {
    return line.split('');
  });
};

interface Distance {
  steps: number;
  doors: string[];
}
const solution1 = (inputLines: string[]) => {
  const map = readInput(inputLines);
  const startRow = map.findIndex(line => line.includes('@'));
  const startCol = map[startRow].indexOf('@');

  const keys = findKeys(map);

  const allKeys = keys.map(([key]) => key);
  const originDistances = countSteps(map, [startRow, startCol], allKeys);
  const keyDistances = keys.reduce((distances, [key, pos]) => {
    const keyDistances = countSteps(map, pos, allKeys);
    distances.set(key, keyDistances);
    return distances;
  }, new Map<string, Map<string, Distance>>());

  return recursiveSolution(allKeys, [], originDistances, keyDistances, 4);
  // It's less than 6352
};

const recursiveSolution = (
  keysMissing: string[],
  keysCollected: string[],
  distances: Map<string, Distance>,
  allDistances: Map<string, Map<string, Distance>>,
  log: number = 0
): number => {
  if (keysMissing.length === 0) {
    return 0;
  }

  const reachableKeys = keysMissing.filter(key => {
    const {doors} = distances.get(key)!;
    return doors.every(door => keysCollected.includes(door.toLowerCase()));
  });

  if (!reachableKeys.length) {
    return Number.POSITIVE_INFINITY;
  }

  const sortedRK = reachableKeys.sort((a, b) => {
    return distances.get(a)!.steps - distances.get(b)!.steps;
  });

  const steps = sortedRK
    .slice(0, Math.ceil((7 * sortedRK.length) / 12))
    .map((key, i) => {
      if (log > 0) {
        console.log(log, key, i, reachableKeys.length);
      }
      const {steps} = distances.get(key)!;
      return (
        steps +
        recursiveSolution(
          keysMissing.filter(k => k !== key),
          keysCollected.concat(key),
          allDistances.get(key)!,
          allDistances,
          log - 1
        )
      );
    });

  return steps.reduce((a, b) => Math.min(a, b));
};

const keyRegex = /^[a-z]$/;
const findKeys = (map: string[][]) => {
  const result: [string, number[]][] = [];
  map.forEach((row, r) => {
    row.forEach((col, c) => {
      if (keyRegex.test(map[r][c])) {
        result.push([map[r][c], [r, c]]);
      }
    });
  });
  return result;
};

const doorRegex = /^[A-Z]$/;
const countSteps = (map: string[][], from: number[], keys: string[]) => {
  const getPVKey = (pos: number[]) => pos.join(',');

  const result = new Map<string, Distance>();

  const char = map[from[0]][from[1]];
  if (keys.includes(char)) {
    result.set(char, {
      steps: 0,
      doors: [],
    });
  }

  const positionsVisited = new Set();
  positionsVisited.add(getPVKey(from));
  const positionsToVisit = new TinyQueue<[number, string[], number[]]>(
    [
      [1, [], [from[0] + 1, from[1]]],
      [1, [], [from[0] - 1, from[1]]],
      [1, [], [from[0], from[1] + 1]],
      [1, [], [from[0], from[1] - 1]],
    ],
    () => 0
  );

  while (positionsToVisit.length && result.size < keys.length) {
    let [steps, doors, pos] = positionsToVisit.pop()!;

    const key = getPVKey(pos);
    if (positionsVisited.has(key)) {
      continue;
    }
    positionsVisited.add(key);

    const char = map[pos[0]][pos[1]];
    if (keys.includes(char)) {
      result.set(char, {
        steps,
        doors,
      });
    }

    if (doorRegex.test(char)) {
      doors = [...doors, char];
    }

    const isWall = char === '#';

    if (!isWall) {
      positionsToVisit.push([steps + 1, doors, [pos[0] + 1, pos[1]]]);
      positionsToVisit.push([steps + 1, doors, [pos[0] - 1, pos[1]]]);
      positionsToVisit.push([steps + 1, doors, [pos[0], pos[1] + 1]]);
      positionsToVisit.push([steps + 1, doors, [pos[0], pos[1] - 1]]);
    }
  }

  return result;
};

const solution2 = (inputLines: string[]) => {
  return inputLines.length;
};

export {solution1, solution2};
