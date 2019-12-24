const solution1 = (inputLines: string[]) => {
  let state = inputLines.map(line => line.split(''));
  const serializeState = state => state.map(line => line.join(',')).join(',');

  const statesFound = new Set<string>();
  let serializedState: string = serializeState(state);
  while (!statesFound.has(serializedState)) {
    statesFound.add(serializedState);

    const newState = new Array(state.length);
    for (let r = 0; r < state.length; r++) {
      newState[r] = new Array(state[r].length);
      for (let c = 0; c < state[r].length; c++) {
        let adjacentBugs = 0;
        if (state[r - 1] && state[r - 1][c] === '#') adjacentBugs++;
        if (state[r + 1] && state[r + 1][c] === '#') adjacentBugs++;
        if (state[r][c - 1] === '#') adjacentBugs++;
        if (state[r][c + 1] === '#') adjacentBugs++;

        if (state[r][c] === '#' && adjacentBugs !== 1) {
          newState[r][c] = '.';
        } else if (
          (state[r][c] === '.' && adjacentBugs === 1) ||
          adjacentBugs === 2
        ) {
          newState[r][c] = '#';
        } else {
          newState[r][c] = state[r][c];
        }
      }
    }
    state = newState;
    serializedState = serializeState(state);
  }

  const getBioDiversity = () => {
    let factor = 1;
    let result = 0;
    for (let r = 0; r < state.length; r++) {
      for (let c = 0; c < state[r].length; c++) {
        if (state[r][c] === '#') {
          result += factor;
        }
        factor = factor << 1;
      }
    }
    return result;
  };

  return getBioDiversity();
};

const solution2 = (inputLines: string[]) => {
  const state0 = inputLines.map(line => line.split(''));
  state0[2][2] = '?';
  let state: State = {
    depths: {
      0: state0,
    },
    minDepth: 0,
    maxDepth: 0,
  };

  for (let i = 0; i < 200; i++) {
    state = evolve(state);
  }

  let totalBugs = 0;
  for (let d = state.minDepth; d <= state.maxDepth; d++) {
    const depthState = state.depths[d];
    depthState.forEach(row => (totalBugs += row.filter(c => c === '#').length));
  }
  return totalBugs;
};

interface State {
  depths: Record<number, string[][]>;
  minDepth: number;
  maxDepth: number;
}
const evolve = ({depths, minDepth, maxDepth}: State) => {
  const needsLowerDepth = edgeCountMatches(depths[minDepth], [1, 2]);
  const needsHigherDepth =
    depths[maxDepth][1][2] === '#' ||
    depths[maxDepth][1][3] === '#' ||
    depths[maxDepth][2][1] === '#' ||
    depths[maxDepth][2][3] === '#';
  const startDepth = minDepth - (needsLowerDepth ? 1 : 0);
  const endDepth = maxDepth + (needsHigherDepth ? 1 : 0);

  const h = depths[0].length;
  const w = depths[0][0].length;

  const newDepthState: State = {
    depths: {},
    minDepth: startDepth,
    maxDepth: endDepth,
  };
  for (let d = startDepth; d <= endDepth; d++) {
    const state =
      depths[d] || new Array(h).fill(0).map(() => new Array(w).fill('.'));

    const countBugs = (
      r: number,
      c: number,
      side: keyof ReturnType<typeof getEdgeCount>
    ) => {
      const lowerLevel = depths[d - 1];
      const higherLevel = depths[d + 1];

      if (r === 2 && c === 2) {
        if (!higherLevel) return 0;
        return getEdgeCount(higherLevel)[side];
      }
      if (r < 0) {
        if (!lowerLevel) return 0;
        return lowerLevel[1][2] === '#' ? 1 : 0;
      }
      if (r >= h) {
        if (!lowerLevel) return 0;
        return lowerLevel[3][2] === '#' ? 1 : 0;
      }
      if (c < 0) {
        if (!lowerLevel) return 0;
        return lowerLevel[2][1] === '#' ? 1 : 0;
      }
      if (c >= w) {
        if (!lowerLevel) return 0;
        return lowerLevel[2][3] === '#' ? 1 : 0;
      }
      return state[r][c] === '#' ? 1 : 0;
    };

    const newState = new Array(state.length);
    for (let r = 0; r < state.length; r++) {
      newState[r] = new Array(state[r].length);
      for (let c = 0; c < state[r].length; c++) {
        if (r === 2 && c === 2) {
          newState[r][c] = '?';
          continue;
        }
        let adjacentBugs = 0;
        adjacentBugs += countBugs(r - 1, c, 'bottom');
        adjacentBugs += countBugs(r + 1, c, 'top');
        adjacentBugs += countBugs(r, c - 1, 'right');
        adjacentBugs += countBugs(r, c + 1, 'left');

        if (state[r][c] === '#' && adjacentBugs !== 1) {
          newState[r][c] = '.';
        } else if (
          state[r][c] === '.' &&
          (adjacentBugs === 1 || adjacentBugs === 2)
        ) {
          newState[r][c] = '#';
        } else {
          newState[r][c] = state[r][c];
        }
      }
    }
    newDepthState.depths[d] = newState;
  }
  return newDepthState;
};

const getEdgeCount = (state: string[][]) => {
  let h = state.length;
  let w = state[0].length;
  let left = 0;
  let right = 0;
  for (let r = 0; r < state.length; r++) {
    if (state[r][0] === '#') left++;
    if (state[r][w - 1] === '#') right++;
  }

  let bottom = 0;
  let top = 0;
  for (let c = 0; c < w; c++) {
    if (state[0][c] === '#') top++;
    if (state[h - 1][c] === '#') bottom++;
  }
  return {left, right, top, bottom};
};

const edgeCountMatches = (state: string[][], nums: number[]) => {
  let h = state.length;
  let w = state[0].length;
  let left = 0;
  let right = 0;
  for (let r = 0; r < state.length; r++) {
    if (state[r][0] === '#') left++;
    if (state[r][w - 1] === '#') right++;
  }

  let bottom = 0;
  let top = 0;
  for (let c = 0; c < w; c++) {
    if (state[0][c] === '#') top++;
    if (state[h - 1][c] === '#') bottom++;
  }
  return [left, right, top, bottom].some(v => nums.includes(v));
};

export {solution1, solution2};
