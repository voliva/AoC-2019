const fs = require('fs');
const https = require('https');
const path = require('path');
const {copySync} = require('fs-extra');

const YEAR = 2019;
const session = process.env.AOC_SESSION;
const defaultDay = new Date().getUTCDate();
const day = process.argv[2] || '' + defaultDay;
const dayDir = path.join(__dirname, day);

const getFile = () =>
  new Promise((resolve, reject) =>
    https
      .get(
        {
          hostname: 'adventofcode.com',
          path: `/${YEAR}/day/${day}/input`,
          method: 'GET',
          headers: {
            Cookie: `session=${session}`,
          },
        },
        resolve
      )
      .on('error', reject)
  );

const writeFile = stream =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(dayDir)) {
      copySync(path.join(__dirname, 'template'), dayDir);
    }
    const fileStream = fs.createWriteStream(path.join(dayDir, 'input'), {
      flags: 'w',
    });
    stream.pipe(fileStream);
    fileStream.on('finish', fileStream.close.bind(fileStream, resolve));
    fileStream.on('error', reject);
  });

getFile()
  .then(writeFile)
  .catch(e => {
    console.log('Error downloading the file');
    console.log(e);
  });
