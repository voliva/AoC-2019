const inRegex = /<x=([-0-9]+), y=([-0-9]+), z=([-0-9]+)>/;
const parseInput = (inputLines: string[]) => {
  return inputLines.map(line => {
    const result = inRegex.exec(line);
    if (!result) {
      throw new Error('unknown line ' + line);
    }
    return {
      position: [Number(result[1]), Number(result[2]), Number(result[3])],
      velocity: [0, 0, 0],
    };
  });
};

const solution1 = (inputLines: string[]) => {
  const moons = parseInput(inputLines);
  simulate(moons, 1000);

  return moons
    .map(moon => {
      const potential = moon.position.reduce((acc, p) => acc + Math.abs(p), 0);
      const kinetic = moon.velocity.reduce((acc, p) => acc + Math.abs(p), 0);
      return potential * kinetic;
    })
    .reduce((a, b) => a + b);
};

const simulate = (moons: ReturnType<typeof parseInput>, steps: number) => {
  for (let i = 0; i < steps; i++) {
    step(moons);
  }
};

const step = (moons: ReturnType<typeof parseInput>) => {
  // Gravity
  moons.forEach(moon => {
    moons.forEach(moon2 => {
      if (moon === moon2) {
        return;
      }
      for (let i = 0; i < 3; i++) {
        const diff = moon2.position[i] - moon.position[i];
        moon.velocity[i] += Math.sign(diff);
      }
    });
  });

  // Velocity
  moons.forEach(moon => {
    for (let i = 0; i < 3; i++) {
      moon.position[i] += moon.velocity[i];
    }
  });
};

const solution2 = (inputLines: string[]) => {
  const moons = parseInput(inputLines);
  const periods = [0, 1, 2].map(d => getPeriodForDimension(moons, d));

  return `lcm(${periods.join(', ')})`;

  // const d = 0; // 268296
  // const d = 1; // 161428
  // const d = 2; // 102356

  // So, it will repeat in the lcm of 268296, 161428 and 102356 = 277068010964808
};

const getPeriodForDimension = (
  moons: ReturnType<typeof parseInput>,
  d: number
) => {
  const serializeMoons = (moons: ReturnType<typeof parseInput>) =>
    moons.map(moon => `<${moon.position[d]}, ${moon.velocity[d]}>`).join(',');

  let states = new Set<string>();
  let steps = 0;
  while (!states.has(serializeMoons(moons))) {
    states.add(serializeMoons(moons));
    step(moons);
    steps++;
  }
  return steps;
};

export {solution1, solution2};
