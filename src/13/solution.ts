import {
  createInputIterator,
  runIntcodeFromArray,
  runIntcodeFromIterator,
  bufferCountIterator,
} from './intcode';

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const result = runIntcodeFromArray(program, [], true);
  const blocks = [] as any[];
  for (let i = 0; i < result.length; i += 3) {
    blocks.push({
      x: result[i],
      y: result[i + 1],
      tile: result[i + 2],
    });
  }
  return blocks.filter(({tile}) => tile === 2).length;
};

const solution2 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);
  program[0] = 2;

  const input = createInputIterator(0);
  const result = runIntcodeFromIterator(program, input);
  const blocks = bufferCountIterator(3, result);
  const field: string[][] = [];
  let paddlePosition: number | undefined = undefined;

  for (let block of blocks) {
    const [x, y, tile] = block;
    if (x === -1) {
      console.log(`score ` + tile);
      continue;
    }
    if (tile === 3) {
      paddlePosition = x;
    }
    if (tile === 4 && paddlePosition !== undefined) {
      if (x < paddlePosition) {
        input.push(-1);
      }
      if (x > paddlePosition) {
        input.push(1);
      }
    }

    field[y] = field[y] || [];
    field[y][x] = drawTile(tile);

    // for (let r = 0; r < field.length; r++) {
    //   let line = '';
    //   if (field[r]) {
    //     for (let c = 0; c < field[r].length; c++) {
    //       line += field[r][c] || '?';
    //     }
    //   } else {
    //     line = '???';
    //   }
    //   console.log(line);
    // }
    // console.log('---------------');
  }
};

const drawTile = (tile: number) => {
  switch (tile) {
    case 0:
      return ' ';
    case 1:
      return '#';
    case 2:
      return '%';
    case 3:
      return '-';
    case 4:
      return 'O';
  }
  return '?';
};

export {solution1, solution2};
