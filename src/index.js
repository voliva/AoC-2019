const {compose: c, init, split, tap} = require('ramda');
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');

const defaultDay = new Date().getUTCDate();
const isSecond = process.argv[2] === 'second';
const day = process.argv[3] || '' + defaultDay;
const dayDir = path.join(__dirname, day);

let start;
const log = v => {
  let end = Date.now();
  console.log(v);
  console.log(`Solved in ${end - start}ms`);
};
const readFile = promisify(fs.readFile);
const getLines = c(init, split('\n'));

const fn = require(path.join(dayDir, 'solution'))[isSecond ? 1 : 0];

readFile(path.join(dayDir, 'input'), 'utf-8').then(
  c(log, fn, tap(() => (start = Date.now())), getLines)
);
