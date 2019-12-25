import {
  createInputIterator,
  runIntcodeFromIterator,
  bufferIterator,
} from '../13/intcode';
import { createASCIIInputIterator } from '../17/solution';
import readlineSync from 'readline-sync';

const solution1 = (inputLines: string[]) => {
  const program = inputLines[0].split(',').map(Number);

  const input = createASCIIInputIterator();
  const proc = runIntcodeFromIterator(program, input);
  const lines = lineIterator(proc);

  for(let line of lines) {
    if(line.endsWith('Command?')) {
      const answer = readlineSync.question(line + " ");
      input.push(answer);
    } else {
      console.log(line);
    }
  }

  return inputLines.length;
};

const lineIterator = (
  iterator: Iterator<number>
): IterableIterator<string> => {
  const bufferedIterator = bufferIterator(value => value === 10, iterator);

  const ret = {
    next: () => {
      const result = bufferedIterator.next();
      if(result.done) {
        return result;
      }
      return {
        value: String.fromCharCode(...result.value).slice(0, -1)
      }
    },
    [Symbol.iterator]: () => ret,
  };
  return ret;
}

/*
                                [Science lab T]
                                      |
        [Stables !]-[Storage !]-[Passages !]
             |      [Corridor]       |
             |      [HotChoc T]   [Holodeck]  [Navigation A] measurements
             |          |                           |
        [Kitchen !]-[Breach]-[Crew Quarters !]-[Observtry !]-[Engineer !]
             |                      |
       [Hallway T]  [Warp drive T]-[Arcade ?]-[Gift Wrapping]-[Sick Bay !]-[Sec Check]
                                                                             |
                                                                        [Pressure-Sensitive A] weight
west
take hologram
north
take space heater
east
take space law space brochure
east
take tambourine
west
west
south
east
east
take festive hat
east
take food ration
east
take spool of cat6
west
west
south
east
east
take fuel cell
east
drop hologram
drop space heater
drop space law space brochure
drop tambourine
drop festive hat
drop food ration
drop spool of cat6
drop fuel cell

take fuel cell => Too heavy

* then, by trial and error, I found my answer:
take space heater
take hologram
take space law space brochure
take spool of cat6
south

*/


export {solution1};
