const parseLine = (line: string) => {
  const [partsString, result] = line.split(' => ');
  const parts = partsString.split(', ');

  const resultValues = result.split(' ');
  const partValues = parts.map(part => part.split(' '));

  return {
    chemical: resultValues[1],
    quantity: Number(resultValues[0]),
    needs: partValues.map(part => ({
      chemical: part[1],
      quantity: Number(part[0]),
    })),
    uses: 0,
  };
};
type Reaction = ReturnType<typeof parseLine>;

const solution1 = (inputLines: string[]) => {
  const reactions = inputLines.map(parseLine);
  const reactionMap = reactions.reduce((map, reaction) => {
    map.set(reaction.chemical, reaction);
    return map;
  }, new Map<string, Reaction>());

  const getOreNeeded = (
    chemical: string,
    quantity: number,
    leftOvers: Map<string, number> = new Map()
  ) => {
    if (chemical === 'ORE') {
      return quantity;
    }

    const reaction = reactionMap.get(chemical)!;
    const leftOverQty = leftOvers.get(chemical) || 0;
    const produceQty = Math.max(0, quantity - leftOverQty);
    const timesNeeded = Math.ceil(produceQty / reaction.quantity);
    const leftOver = timesNeeded * reaction.quantity - produceQty;
    const result = reaction.needs.reduce(
      (total, part) =>
        total +
        getOreNeeded(part.chemical, timesNeeded * part.quantity, leftOvers),
      0
    );

    if (leftOverQty < quantity) {
      leftOvers.set(chemical, leftOver);
    } else {
      leftOvers.set(chemical, leftOver + leftOverQty - quantity);
    }
    return result;
  };

  return getOreNeeded('FUEL', 1);
};

const solution2 = (inputLines: string[]) => {
  const reactions = inputLines.map(parseLine);
  const reactionMap = reactions.reduce((map, reaction) => {
    map.set(reaction.chemical, reaction);
    return map;
  }, new Map<string, Reaction>());

  const getOreNeeded = (
    chemical: string,
    quantity: number,
    leftOvers: Map<string, number> = new Map()
  ) => {
    if (chemical === 'ORE') {
      return quantity;
    }

    const reaction = reactionMap.get(chemical)!;
    const leftOverQty = leftOvers.get(chemical) || 0;
    const produceQty = Math.max(0, quantity - leftOverQty);
    const timesNeeded = Math.ceil(produceQty / reaction.quantity);
    const leftOver = timesNeeded * reaction.quantity - produceQty;
    const result = reaction.needs.reduce(
      (total, part) =>
        total +
        getOreNeeded(part.chemical, timesNeeded * part.quantity, leftOvers),
      0
    );

    if (leftOverQty < quantity) {
      leftOvers.set(chemical, leftOver);
    } else {
      leftOvers.set(chemical, leftOver + leftOverQty - quantity);
    }
    return result;
  };

  const target = 1000000000000;
  const costForOne = getOreNeeded('FUEL', 1);
  let minimum = costForOne;
  let maximum = Number.POSITIVE_INFINITY;

  while (minimum < maximum - 1) {
    const test = Number.isFinite(maximum)
      ? Math.ceil((minimum + maximum) / 2)
      : minimum * 2;
    const result = getOreNeeded('FUEL', test);
    if (result <= target) {
      minimum = test;
    } else {
      maximum = test;
    }
  }

  return minimum;
};

export {solution1, solution2};
