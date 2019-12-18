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

  // return recursiveSolution(6292, allKeys, [], originDistances, keyDistances, 4);
  return iterativeSolution(allKeys, originDistances, keyDistances);
  // It's less than 6292
};

// Priority queue where I'm always proceeding on the one with the less steps
const iterativeSolution = (
  allKeys: string[],
  originDistances: Map<string, Distance>,
  allDistances: Map<string, Map<string, Distance>>
) => {
  const reachableKeys = allKeys.filter(key => {
    const {doors} = originDistances.get(key)!;
    return doors.length === 0;
  });

  if (!reachableKeys.length) {
    return Number.POSITIVE_INFINITY;
  }

  // [steps, [keys]]
  const positionsToVisit = new TinyQueue<[number, string, string[]]>(
    reachableKeys.map(key => {
      const {steps} = originDistances.get(key)!;
      return [steps, key, [key]];
    }),
    (a, b) => b[0] - a[0]
  );

  let minSteps = Number.POSITIVE_INFINITY;
  while (positionsToVisit.length) {
    const [steps, currentKey, keysUnlocked] = positionsToVisit.pop()!;
    if (steps > minSteps) {
      continue;
    }

    const distances = allDistances.get(currentKey)!;

    if (keysUnlocked.length === allKeys.length) {
      if (steps < minSteps) {
        console.log(steps);
        minSteps = steps;
      }
      continue;
    }

    const reachableKeys = allKeys.filter(key => {
      if (keysUnlocked.includes(key)) {
        return false;
      }
      const {doors} = distances.get(key)!;
      return doors.every(door => keysUnlocked.includes(door.toLowerCase()));
    });

    reachableKeys.forEach(key => {
      const distance = distances.get(key)!;
      positionsToVisit.push([
        steps + distance.steps,
        key,
        [...keysUnlocked, key],
      ]);
    });
  }

  return minSteps;
};

const recursiveSolution = (
  maximumSteps: number,
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
    .slice(0, Math.ceil((6 * sortedRK.length) / 12))
    .map((key, i) => {
      if (log > 0) {
        console.log(log, key, i, reachableKeys.length);
      }
      const {steps} = distances.get(key)!;
      if (steps > maximumSteps) {
        return Number.POSITIVE_INFINITY;
      }

      return (
        steps +
        recursiveSolution(
          maximumSteps - steps,
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
