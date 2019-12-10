const solution1 = (inputLines: string[]) => {
  const asteroids = readAsteroids(inputLines);
  const base = selectBase(asteroids);
  return base.directions.size;
};

const readAsteroids = (inputLines: string[]) =>
  inputLines.reduce((acc, line, row) => {
    line.split('').forEach((value, col) => {
      if (value !== '#') {
        return;
      }
      acc.push([col, row]);
    });
    return acc;
  }, [] as [number, number][]);

const selectBase = (asteroids: [number, number][]) =>
  asteroids
    .map(([x, y]) => {
      const directions = asteroids
        .map(([x2, y2]) => [x2 - x, y2 - y])
        .reduce((acc, [xd, yd]) => {
          if (xd === 0 && yd === 0) {
            return acc;
          }
          const angle = Math.atan2(xd, -yd);

          if (acc.has(angle)) {
            acc.get(angle)!.push([xd, yd]);
          } else {
            acc.set(angle, [[xd, yd]]);
          }
          return acc;
        }, new Map<number, number[][]>());
      return {directions, x, y};
    })
    .reduce((acc, ast) =>
      acc.directions.size > ast.directions.size ? acc : ast
    );

const solution2 = (inputLines: string[]) => {
  const asteroids = readAsteroids(inputLines);
  const base = selectBase(asteroids);

  const {directions} = base;
  [...directions.values()].forEach(asteroids =>
    sortByValueFn(asteroids, ([x, y]) => Math.abs(x) + Math.abs(y))
  );
  const angles = sortByValueFn([...directions.keys()], v =>
    v < 0 ? 2 * Math.PI + v : v
  );
  let removed = 0;
  let lastRemoved: number[];
  while (removed < 200) {
    for (let i = 0; i < angles.length && removed < 200; i++) {
      const line = directions.get(angles[i])!;
      if (line.length) {
        removed++;
        lastRemoved = line.shift()!;
      }
    }
  }

  return (base.x + lastRemoved![0]) * 100 + (base.y + lastRemoved![1]);
};

const sortByValueFn = <T>(arr: Array<T>, valueFn: (value: T) => number) =>
  arr.sort((a, b) => valueFn(a) - valueFn(b));

export {solution1, solution2};
