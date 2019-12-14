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
    const result = (() => {
      let total = 0;
      for (let i = 0; i < timesNeeded; i++) {
        total += reaction.needs.reduce(
          (total, part) =>
            total + getOreNeeded(part.chemical, part.quantity, leftOvers),
          0
        );
      }
      return total;
    })();

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
    const result = (() => {
      let total = 0;
      for (let i = 0; i < timesNeeded; i++) {
        total += reaction.needs.reduce(
          (total, part) =>
            total + getOreNeeded(part.chemical, part.quantity, leftOvers),
          0
        );
      }
      return total;
    })();

    if (leftOverQty < quantity) {
      leftOvers.set(chemical, leftOver);
    } else {
      leftOvers.set(chemical, leftOver + leftOverQty - quantity);
    }
    return result;
  };

  let totalOreNeeded = 0;
  const target = 1000000000000;

  const leftOvers = new Map();
  let count = 0;
  while (totalOreNeeded < target) {
    const oreNeeded = getOreNeeded('FUEL', 1, leftOvers);
    totalOreNeeded += oreNeeded;
    count++;
    console.log(totalOreNeeded / count);
  }
  // By logging the average and waiting it to converge to 280199.3, I could guess that the number was 1000000000000 / 280199.3

  return count - 1;
};

export {solution1, solution2};
