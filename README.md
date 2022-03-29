# duration

TypeScript library to format durations (days, hours, minutes, seconds, and milliseconds)

## Install

```
npm install @boertel/duration
```

## Usage

```javascript
import { duration } from "@boertel/duration";

console.log(duration(2892992000).format("d DD, h HH [and] m MM"));
// 33 days, 11 hours and 36 minutes

// more readable way to create a duration:
const d = duration().days(2).hours(5).seconds(4);
// this will ignore 0 values and join with commas and "and"
console.log(d.format(["dD", "hH", "mM", "sS"]));
// 2d, 5h and 4s
```
