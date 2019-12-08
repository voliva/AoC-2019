const solution1 = (inputLines: string[]) => {
  const data = inputLines[0].split('').map(Number);
  const layers = readImage(data, 25, 6);

  const fewestZeros = layers
    .map(layer => ({
      layer,
      zeros: layer.filter(v => v === 0).length,
      ones: layer.filter(v => v === 1).length,
      twos: layer.filter(v => v === 2).length,
    }))
    .reduce((min, layer) => {
      if (layer.zeros < min.zeros) {
        return layer;
      }
      return min;
    });

  return fewestZeros.ones * fewestZeros.twos;
};

const readImage = (data: number[], width: number, height: number) => {
  const pxPerLayer = width * height;
  const nLayers = data.length / pxPerLayer;
  const layers = new Array(nLayers).fill(0).map(() => {
    return new Array(width * height);
  });

  let i = 0;
  for (let layer of layers) {
    for (let j = 0; j < width * height; j++) {
      layer[j] = data[i];
      i++;
    }
  }

  return layers as Array<Array<number>>;
};

const solution2 = (inputLines: string[]) => {
  const data = inputLines[0].split('').map(Number);
  const width = 25;
  const height = 6;
  const layers = readImage(data, width, height);

  const combined = layers
    .reduce((combi, layer) => {
      for (let i = 0; i < combi.length; i++) {
        combi[i] = combi[i] === 2 ? layer[i] : combi[i];
      }
      return combi;
    })
    .map(v => (v === 1 ? '#' : v === 0 ? ' ' : 'O'));

  for (let r = 0; r < height; r++) {
    let row = '';
    for (let c = 0; c < width; c++) {
      const i = r * width + c;
      row += combined[i];
    }
    console.log(row);
  }
};

export {solution1, solution2};
