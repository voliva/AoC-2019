const solution1 = (inputLines: string[]) => {
  const asteroids = inputLines.reduce((acc, line, row) => {
    line.split('').forEach((value, col) => {
      if (value !== '#') {
        return;
      }
      acc.push([col, row]);
    });
    return acc;
  }, [] as [number, number][]);

  return asteroids
    .map(([x, y]) => {
      const directions = asteroids
        .map(([x2, y2]) => [x2 - x, y2 - y])
        .reduce((acc, [xd, yd]) => {
          if (xd === 0 && yd === 0) {
            return acc;
          }
          const base = (xd === 0 ? Math.sign(yd) : Math.sign(xd)) > 0 ? 4 : 0;
          if (Math.abs(xd) > Math.abs(yd)) {
            acc.add(base + yd / xd);
          } else {
            acc.add(base + 2 + xd / yd);
          }
          return acc;
        }, new Set<number>());
      return [directions.size, x, y];
    })
    .reduce((acc, ast) => (acc[0] > ast[0] ? acc : ast));
};

const sortByValueFn = <T>(arr: Array<T>, valueFn: (value: T) => number) =>
  arr.sort((a, b) => valueFn(a) - valueFn(b));

const solution2 = (inputLines: string[]) => {
  const asteroids = inputLines.reduce((acc, line, row) => {
    line.split('').forEach((value, col) => {
      if (value !== '#') {
        return;
      }
      acc.push([col, row]);
    });
    return acc;
  }, [] as [number, number][]);

  const base = asteroids
    .map(([x, y]) => {
      const directions = asteroids
        .map(([x2, y2]) => [x2 - x, y2 - y])
        .reduce((acc, [xd, yd]) => {
          if (xd === 0 && yd === 0) {
            return acc;
          }
          const key = Math.atan2(xd, -yd);

          if (acc.has(key)) {
            acc.get(key)?.push([xd, yd]);
          } else {
            acc.set(key, [[xd, yd]]);
          }
          return acc;
        }, new Map<number, number[][]>());
      return [directions, x, y] as [typeof directions, number, number];
    })
    .reduce((acc, ast) => (acc[0].size > ast[0].size ? acc : ast));

  const [visibility] = base;
  [...visibility.values()].forEach(arr =>
    sortByValueFn(arr, ([x, y]) => Math.abs(x) + Math.abs(y))
  );
  const directions = sortByValueFn([...visibility.keys()], v =>
    v < 0 ? 2 * Math.PI + v : v
  );
  let removed = 0;
  let lastRemoved: any;
  while (removed < 200) {
    for (let i = 0; i < directions.length && removed < 200; i++) {
      const line = visibility.get(directions[i])!;
      if (line.length) {
        removed++;
        lastRemoved = line.shift();
      }
    }
  }

  return (base[1] + lastRemoved[0]) * 100 + (base[2] + lastRemoved[1]);
};

export {solution1, solution2};
