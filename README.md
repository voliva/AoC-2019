# AoC-2019
Advent of code 2019

## Usage

```
  yarn
```

### Download

```
  yarn download [day]
```

* Day parameter is optional - By default it grabs today's day number.
* It needs env `AOC_SESSION` to download your specific input - Grab it from the cookie when requesting the page for AoC.
* This will copy the template to a new folder, and download the input for you.

### Run

```
  yarn 1 [day]
```

or

```
  yarn 2 [day]
```

* Day parameter is optional - By default it grabs today's day number.
* Runs the first or the second part of the problem for the specific day.

## Solution format

Each solution needs to be in `src/[day]/solution.js`. That file needs to export a tuple with two functions, the first one will resolve the first part, the second one will resolve the second part.

Those functions receive as a parameter the input file already split by lines (so, an array of strings)
