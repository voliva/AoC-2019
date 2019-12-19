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

  // Now I'm thinking that I don't need to calculate the permutations...
  // Use the same distancesCache: At first it will be all pairs of 2.
  // Then loop through all the keys and calculate length=3 for every pair in distancesCache that doesn't use that key
  // and so on
  const distancesCache = new Map<string, number>();
  for(let n = 3; n<allKeys.length; n++) {
    const groups = getAllStartingGroups(allKeys, n);
    groups.forEach((group, i) => {
      console.log(n, `${i}/${groups.length}`);
      const [start, ...missingKeys] = group;
      const minimum = iterativeSolution(missingKeys, keyDistances.get(start)!, keyDistances, distancesCache);
      distancesCache.set(group.join(','), minimum);
    });
    console.log(distancesCache.size, n);
  }
  // return recursiveSolution(6292, allKeys, [], originDistances, keyDistances, 4);
  // return iterativeSolution(allKeys, originDistances, keyDistances, null as any);
  // It's less than 6292
};

const getAllGroups = <T>(array: Array<T>, n: number): Array<Array<T>> => {
  if(n >= array.length) {
    return [array];
  }

  const incrementKey = (keyArr: Array<number>, arrayLength = keyArr.length) => {
    keyArr[arrayLength-1]++;
    if(keyArr[arrayLength-1] >= array.length) {
      if(arrayLength === 1) {
        return false;
      }
      while(incrementKey(keyArr, arrayLength - 1) && keyArr[arrayLength-2] + 1 >= array.length);
      keyArr[arrayLength-1] = keyArr[arrayLength-2] + 1;
      if(keyArr[arrayLength-1] >= array.length) {
        return false;
      }
    }
    return true;
  }

  const result = new Array<Array<T>>();
  const keys = new Array(n).fill(0).map((_, i) => i);
  do {
    result.push(keys.map(k => array[k]));
  }while(incrementKey(keys));

  return result;
}

const getAllStartingGroups = <T>(array: Array<T>, n: number): Array<Array<T>> => {
  let result: Array<Array<T>> = [];
  array.forEach(value => result = result.concat(
    getAllGroups(
      array.filter(v => v !== value),
      n-1
    ).map(group => ([
      value,
      ...group
    ]))
  ));

  return result
}

// Priority queue where I'm always proceeding on the one with the less steps
const iterativeSolution = (
  missingKeys: string[],
  originDistances: Map<string, Distance>,
  allDistances: Map<string, Map<string, Distance>>,
  distancesCache: Map<string, number>
) => {
  const reachableKeys = missingKeys.filter(key => {
    const {doors} = originDistances.get(key)!;
    return doors.filter(door => missingKeys.includes(door.toLowerCase())).length === 0;
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

    const stepMissingKeys = missingKeys.filter(key => !keysUnlocked.includes(key));
    const distanceCacheKey = [
      currentKey,
      ...stepMissingKeys
        .sort()
    ].join(',');

    if (distancesCache.has(distanceCacheKey)) {
      const totalSteps = steps + distancesCache.get(distanceCacheKey)!;
      if (totalSteps < minSteps) {
        // console.log(minSteps);
        minSteps = steps;
      }
      continue;
    }

    const distances = allDistances.get(currentKey)!;

    if (keysUnlocked.length === missingKeys.length) {
      if (steps < minSteps) {
        // console.log(steps);
        minSteps = steps;
      }
      continue;
    }

    const reachableKeys = missingKeys.filter(key => {
      if (keysUnlocked.includes(key)) {
        return false;
      }
      const {doors} = distances.get(key)!;
      return doors
        .filter(door => missingKeys.includes(door.toLowerCase()))
        .every(door => keysUnlocked.includes(door.toLowerCase()));
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
