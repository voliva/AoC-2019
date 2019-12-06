const solution1 = (inputLines: string[]) => {
  const orbitArray = inputLines
    .map(line => line.split(')'))
    .map(([center, id]) => ({
      id,
      center,
    }));
  const orbitMap = orbitArray.reduce(
    (acc, orbit) => ({
      ...acc,
      [orbit.id]: orbit.center,
    }),
    {} as {[key: string]: string}
  );

  const countOrbits = (id: string) =>
    orbitMap[id] ? 1 + countOrbits(orbitMap[id]) : 0;

  const totalOrbits = orbitArray
    .map(orbit => countOrbits(orbit.id))
    .reduce((a, b) => a + b);

  return totalOrbits;
};

const solution2 = (inputLines: string[]) => {
  const orbitArray = inputLines
    .map(line => line.split(')'))
    .map(([center, id]) => ({
      id,
      center,
    }));
  const orbitMap = orbitArray.reduce((acc, orbit) => {
    acc[orbit.id] = acc[orbit.id] || [];
    acc[orbit.center] = acc[orbit.center] || [];

    acc[orbit.id].push(orbit.center);
    acc[orbit.center].push(orbit.id);

    return acc;
  }, {} as {[key: string]: string[]});

  const findPath = (from: string, to: string) => {
    const initialOrbits = orbitMap[from];
    const nodesToVisit = initialOrbits.map(name => ({
      name,
      length: 1,
    }));
    const nodesVisited = new Set<string>();
    nodesVisited.add(from);
    let iNTV;

    for (iNTV = 0; iNTV < nodesToVisit.length; iNTV++) {
      let currentNode = nodesToVisit[iNTV];
      if (currentNode.name === to) {
        break;
      }
      if (nodesVisited.has(currentNode.name)) {
        continue;
      }
      nodesVisited.add(currentNode.name);

      const orbits = orbitMap[currentNode.name];
      orbits.forEach(name => {
        nodesToVisit.push({
          name,
          length: 1 + currentNode.length,
        });
      });
    }

    return nodesToVisit[iNTV] ? nodesToVisit[iNTV].length - 2 : 'Couldnt find';
  };

  return findPath('YOU', 'SAN');
};

export {solution1, solution2};
