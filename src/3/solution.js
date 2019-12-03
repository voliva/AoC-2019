
const performMovement = (line, newPos) => {
  const directions = line.split(",");
  let position = [0,0];

  directions.forEach(dir => {
    const d = dir.substr(0, 1);
    const amount = Number(dir.substr(1));
    switch(d) {
      case 'R':
        for(let i=0; i<amount; i++) {
          position[0]++;
          newPos(position);
        }
        break;
      case 'U':
        for(let i=0; i<amount; i++) {
          position[1]--;
          newPos(position);
        }
        break;
      case 'L':
        for(let i=0; i<amount; i++) {
          position[0]--;
          newPos(position);
        }
        break;
      case 'D':
        for(let i=0; i<amount; i++) {
          position[1]++;
          newPos(position);
        }
        break;
    }
  });
}

const getField = line => {
  const field = {};
  
  performMovement(line, position => {
    field[position[0]] = field[position[0]] || {};
    field[position[0]][position[1]] = true;
  });

  return field;
}

const getIntersections = (line, field) => {
  const intersections = [];

  performMovement(line, position => {
    if(field[position[0]] && field[position[0]][position[1]]) {
      intersections.push([position[0], position[1]])
    }
  });

  return intersections;
}

const solution1 = inputLines => {
  const field = getField(inputLines[0]);
  const intersections = getIntersections(inputLines[1], field);
  
  return intersections
    .map(([x,y]) => Math.abs(x) + Math.abs(y))
    .reduce((a,b) => Math.min(a,b));
};

const getLengths = (line, field) => {
  let length = 0;
  const intersections = [];

  performMovement(line, position => {
    length++;
    if(field[position[0]] && field[position[0]][position[1]]) {
      intersections.push(({
        x: position[0],
        y: position[1],
        length
      }));
    }
  });

  return intersections;
}

const solution2 = inputLines => {
  const field = getField(inputLines[0]);
  const intersections = getIntersections(inputLines[1], field);

  const intersectionField = {};
  intersections.forEach(point => {
    intersectionField[point[0]] = intersectionField[point[0]] || {};
    intersectionField[point[0]][point[1]] = true;
  });
  const wireALengths = getLengths(inputLines[0], intersectionField);
  const wireBLengths = getLengths(inputLines[1], intersectionField);
  
  const mergedLengths = wireALengths
    .map(({x,y,length}) => length + wireBLengths.find(pB => pB.x === x && pB.y === y).length);

  return mergedLengths.reduce((a,b) => Math.min(a,b));
};

module.exports = [solution1, solution2];
