import TinyQueue from 'tinyqueue';

const solution1 = (inputLines: string[]) => {
  const inputMaze = inputLines.map(line => line.split(''));

  const {entrance, exit, portalMap} = readPortals(inputMaze);

  const positionsToVisit = new TinyQueue<[number, number[]]>(
    [[0, entrance]],
    (a, b) => a[0] - b[0]
  );
  const positionsVisited = new Set<string>();
  while (positionsToVisit.length > 0) {
    const [step, pos] = positionsToVisit.pop()!;

    if (pos.join(',') === exit.join(',')) {
      return step;
    }

    const considerPosition = (position: number[]) => {
      if (inputMaze[position[0]][position[1]] !== '.') {
        return false;
      }
      let cost = 1;
      if (portalMap.has(position.join(','))) {
        position = portalMap.get(position.join(','))!;
        cost++;
      }
      if (positionsVisited.has(position.join(','))) {
        return false;
      }
      positionsToVisit.push([step + cost, position]);
      positionsVisited.add(position.join(','));
    };
    considerPosition([pos[0] - 1, pos[1]]);
    considerPosition([pos[0] + 1, pos[1]]);
    considerPosition([pos[0], pos[1] - 1]);
    considerPosition([pos[0], pos[1] + 1]);
  }

  return -1;
};

const readPortals = (inputMaze: string[][]) => {
  const readVerticalPortals = (
    row: number,
    offset: number,
    isOuter: boolean,
    portals: Map<string, Set<[boolean, number[]]>>,
    range?: number[]
  ) => {
    const mazeChars = [' ', '.', '#'];
    const rowArr = inputMaze[row];
    range = range || [0, rowArr.length];
    for (let i = range[0]; i < range[1]; i++) {
      if (
        !mazeChars.includes(rowArr[i]) &&
        !mazeChars.includes(inputMaze[row + 1][i])
      ) {
        const name = `${rowArr[i]}${inputMaze[row + 1][i]}`;
        if (!portals.has(name)) {
          portals.set(name, new Set());
        }
        portals.get(name)!.add([isOuter, [row + offset, i]]);
      }
    }
  };
  const readHorizontalPortals = (
    col: number,
    offset: number,
    isOuter: boolean,
    portals: Map<string, Set<[boolean, number[]]>>,
    range?: number[]
  ) => {
    const mazeChars = [' ', '.', '#'];
    range = range || [0, inputMaze.length];
    for (let i = range[0]; i < range[1]; i++) {
      if (!mazeChars.includes(inputMaze[i][col])) {
        const name = `${inputMaze[i][col]}${inputMaze[i][col + 1]}`;
        if (!portals.has(name)) {
          portals.set(name, new Set());
        }
        portals.get(name)!.add([isOuter, [i, col + offset]]);
      }
    }
  };
  const findDonutEdges = () => {
    const height = Math.floor(inputMaze.length / 2) * 2;
    const width = Math.floor(inputMaze[0].length / 2) * 2;
    const charsToFind = ['.', '#'];

    let left = width / 2,
      right = width / 2,
      top = height / 2,
      bottom = height / 2;

    while (!charsToFind.includes(inputMaze[height / 2][left])) {
      left--;
    }
    while (!charsToFind.includes(inputMaze[height / 2][right])) {
      right++;
    }
    while (!charsToFind.includes(inputMaze[top][width / 2])) {
      top--;
    }
    while (!charsToFind.includes(inputMaze[bottom][width / 2])) {
      bottom++;
    }

    return {
      left,
      right,
      top,
      bottom,
    };
  };

  const portals = new Map<string, Set<[boolean, number[]]>>();
  readVerticalPortals(0, 2, true, portals);
  readVerticalPortals(inputMaze.length - 2, -1, true, portals);
  readHorizontalPortals(0, 2, true, portals);
  readHorizontalPortals(inputMaze[0].length - 2, -1, true, portals);
  const donutEdges = findDonutEdges();
  readVerticalPortals(donutEdges.top + 1, -1, false, portals, [
    donutEdges.left,
    donutEdges.right,
  ]);
  readVerticalPortals(donutEdges.bottom - 2, 2, false, portals, [
    donutEdges.left,
    donutEdges.right,
  ]);
  readHorizontalPortals(donutEdges.left + 1, -1, false, portals, [
    donutEdges.top,
    donutEdges.bottom,
  ]);
  readHorizontalPortals(donutEdges.right - 2, 2, false, portals, [
    donutEdges.top,
    donutEdges.bottom,
  ]);

  const portalMap = new Map<string, number[]>();
  const innerPortals = new Map<string, number[]>();
  const outerPortals = new Map<string, number[]>();
  let entrance: number[];
  let exit: number[];
  for (let portal of portals.entries()) {
    const [name, edges] = portal;
    const edgeArr = [...edges];
    if (name === 'AA') {
      entrance = edgeArr[0][1];
      continue;
    }
    if (name === 'ZZ') {
      exit = edgeArr[0][1];
      continue;
    }
    if (edgeArr.length != 2) {
      throw new Error('edge array ' + name + ' ' + edgeArr.length);
    }
    const innerEdge = edgeArr[0][0] ? edgeArr[1][1] : edgeArr[0][1];
    const outerEdge = edgeArr[0][0] ? edgeArr[0][1] : edgeArr[1][1];
    portalMap.set(innerEdge.join(','), outerEdge);
    portalMap.set(outerEdge.join(','), innerEdge);
    innerPortals.set(innerEdge.join(','), outerEdge);
    outerPortals.set(outerEdge.join(','), innerEdge);
  }

  return {
    portalMap,
    innerPortals,
    outerPortals,
    entrance: entrance!,
    exit: exit!,
  };
};

const solution2 = (inputLines: string[]) => {
  const inputMaze = inputLines.map(line => line.split(''));

  const {entrance, exit, innerPortals, outerPortals} = readPortals(inputMaze);

  const positionsToVisit = new TinyQueue<[number, number, number[]]>(
    [[0, 0, entrance]],
    (a, b) => a[0] - b[0]
  );
  const positionsVisited = new Set<string>();
  while (positionsToVisit.length > 0) {
    const [step, level, pos] = positionsToVisit.pop()!;

    if (level === 0 && pos.join(',') === exit.join(',')) {
      return step;
    }

    const considerPosition = (position: number[]) => {
      if (inputMaze[position[0]][position[1]] !== '.') {
        return false;
      }
      let cost = 1;
      let levelChange = 0;
      if (level !== 0 && outerPortals.has(position.join(','))) {
        position = outerPortals.get(position.join(','))!;
        cost++;
        levelChange--;
      } else if (innerPortals.has(position.join(','))) {
        position = innerPortals.get(position.join(','))!;
        cost++;
        levelChange++;
      }
      if (positionsVisited.has(level + ',' + position.join(','))) {
        return false;
      }
      positionsToVisit.push([step + cost, level + levelChange, position]);
      positionsVisited.add(level + ',' + position.join(','));
    };
    considerPosition([pos[0] - 1, pos[1]]);
    considerPosition([pos[0] + 1, pos[1]]);
    considerPosition([pos[0], pos[1] - 1]);
    considerPosition([pos[0], pos[1] + 1]);
  }

  return -1;
};

export {solution1, solution2};
