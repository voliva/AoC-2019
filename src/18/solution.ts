import TinyQueue from 'tinyqueue';

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
  const keyDistances = keys.reduce((distances, [key, pos]) => {
    const keyDistances = countSteps(map, pos, allKeys);
    distances.set(key, keyDistances);
    return distances;
  }, new Map<string, Map<string, Distance>>());

  const originDistances = countSteps(map, [startRow, startCol], allKeys);
  keyDistances.set('@', originDistances);

  return recursiveSolution(allKeys, ['@'], keyDistances, {});
};

const recursiveSolution = (
  keysMissing: string[],
  origins: string[],
  allDistances: Map<string, Map<string, Distance>>,
  cache: Record<string, Record<string, number>>
): number => {
  if (keysMissing.length === 0) {
    return 0;
  }

  const cacheKey = keysMissing.join(',');
  const originKey = origins.join(',');
  cache[cacheKey] = cache[cacheKey] || {};
  if (originKey in cache[cacheKey]) {
    return cache[cacheKey][originKey];
  }

  let minimum: number = Number.POSITIVE_INFINITY;
  origins.forEach((origin, i) => {
    const reachableKeys = getReachableKeys(
      keysMissing,
      allDistances.get(origin)!
    );
    const newOrigins = [...origins];

    reachableKeys.forEach(({key, steps}) => {
      newOrigins[i] = key;
      const subTreeSteps = recursiveSolution(
        keysMissing.filter(k => k !== key),
        newOrigins,
        allDistances,
        cache
      );

      minimum = Math.min(minimum, steps + subTreeSteps);
    });
  });

  cache[cacheKey][originKey] = minimum;

  return minimum;
};

const getReachableKeys = (
  keysMissing: string[],
  distances: Map<string, Distance>
) =>
  keysMissing
    .map(key => ({
      key,
      ...distances.get(key)!,
    }))
    .filter(
      ({doors}) =>
        doors &&
        (doors.length === 0 || !doors.some(door => keysMissing.includes(door)))
    );

const readInput = (inputLines: string[]) => {
  // [row][col]
  return inputLines.map(line => {
    return line.split('');
  });
};

const keyRegex = /^[a-z]$/;
const findKeys = (map: string[][]) => {
  const result: [string, number[]][] = [];
  map.forEach((row, r) => {
    row.forEach((col, c) => {
      if (keyRegex.test(col)) {
        result.push([col, [r, c]]);
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
    (a, b) => a[0] - b[0]
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
      doors = [...doors, char.toLowerCase()];
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
  const map = readInput(inputLines);
  const centerRow = map.findIndex(line => line.includes('@'));
  const centerCol = map[centerRow].indexOf('@');
  map[centerRow][centerCol] = '#';
  map[centerRow - 1][centerCol] = '#';
  map[centerRow + 1][centerCol] = '#';
  map[centerRow][centerCol - 1] = '#';
  map[centerRow][centerCol + 1] = '#';

  const robots = [
    [centerRow - 1, centerCol - 1],
    [centerRow + 1, centerCol - 1],
    [centerRow - 1, centerCol + 1],
    [centerRow + 1, centerCol + 1],
  ];

  const keys = findKeys(map);

  const allKeys = keys.map(([key]) => key);
  const keyDistances = keys.reduce((distances, [key, pos]) => {
    const keyDistances = countSteps(map, pos, allKeys);
    distances.set(key, keyDistances);
    return distances;
  }, new Map<string, Map<string, Distance>>());

  const botDistances = robots.map(bot => countSteps(map, bot, allKeys));
  botDistances.forEach((distances, i) => keyDistances.set(`${i}`, distances));

  return recursiveSolution(
    allKeys,
    robots.map((_, i) => `${i}`),
    keyDistances,
    {}
  );
};

export {solution1, solution2};
