const solution1 = (inputLines: string[]) => {
  const minmax = inputLines[0].split('-').map(Number);
  const min = minmax[0];
  const max = minmax[1];

  let count = 0;
  for (let psw = min; psw <= max; psw++) {
    const chars = String(psw)
      .split('')
      .map(Number);
    const hasAdjacent =
      chars.findIndex(
        (char, index, arr) => index > 0 && arr[index - 1] === char
      ) >= 0;
    const neverDecreases =
      chars.findIndex(
        (char, index, arr) => index > 0 && arr[index - 1] > char
      ) < 0;
    if (hasAdjacent && neverDecreases) {
      count++;
    }
  }

  return count;
};

const solution2 = (inputLines: string[]) => {
  const minmax = inputLines[0].split('-').map(Number);
  const min = minmax[0];
  const max = minmax[1];

  let count = 0;
  for (let psw = min; psw <= max; psw++) {
    const chars = String(psw)
      .split('')
      .map(Number);
    const has2Adjacent =
      chars.reduce(
        (acc, char) => {
          if (acc.group === char) {
            return {
              group: acc.group,
              count: acc.count + 1,
            };
          }
          if (acc.count === 2) {
            return {
              group: null,
              count: 2,
            };
          }
          return {
            group: char,
            count: 1,
          };
        },
        {
          group: null as null | number,
          count: 0,
        }
      ).count === 2;
    const neverDecreases =
      chars.findIndex(
        (char, index, arr) => index > 0 && arr[index - 1] > char
      ) < 0;
    if (has2Adjacent && neverDecreases) {
      count++;
    }
  }

  return count;
};

export {solution1, solution2};
