const durations: number[] = [
  // Number of milliseconds in
  24 * 60 * 60 * 1000, // a day
  60 * 60 * 1000, // a hour
  60 * 1000, // a minute
  1000, // a second
];

export function duration(input?: number | number[]): Duration {
  let output: number[];
  if (Array.isArray(input)) {
    output = input;
  } else {
    output = [];
    if (input === undefined) {
      return new Duration();
    }
    let remainder: number = input;

    durations.forEach((divisor: number, index: number) => {
      const quotient: number = Math.abs(parseFloat(`${remainder / divisor}`));
      remainder = Math.abs(remainder % divisor);
      output.push(Math.floor(quotient));
      if (index === durations.length - 1) {
        output.push(Math.floor(remainder));
      }
    });
    output.reverse();
  }
  return new Duration(output);
}

// const next = Tomorrow | Thrusday | Friday | Saturday | Sunday | Next Monday | Next Week | Week after next | in 2 weeks | in 3 weeks | next months | in 2 months |

export class Duration {
  private _milliseconds: number = 0;
  private _seconds: number = 0;
  private _minutes: number = 0;
  private _hours: number = 0;
  private _days: number = 0;

  constructor(args?: number[] | DurationObject) {
    if (Array.isArray(args)) {
      this._milliseconds = args[0] || this._milliseconds;
      this._seconds = args[1] || this._seconds;
      this._minutes = args[2] || this._minutes;
      this._hours = args[3] || this._hours;
      this._days = args[4] || this._days;
    } else if (typeof args === "object") {
      this._milliseconds = args.milliseconds || this._milliseconds;
      this._seconds = args.seconds || this._seconds;
      this._minutes = args.minutes || this._minutes;
      this._hours = args.hours || this._hours;
      this._days = args.days || this._days;
    }
  }

  toMs(): number {
    return this.toArray().reduce(
      (prev: number, curr: number, index: number) => {
        const multiplier = durations[durations.length - index] || 1;
        return prev + multiplier * curr;
      },
      0
    );
  }

  milliseconds(inputInMilliseconds: number): Duration {
    this._milliseconds = inputInMilliseconds;
    return this;
  }

  seconds(inputInSeconds: number): Duration {
    this._seconds = inputInSeconds;
    return this;
  }

  minutes(inputInMinutes: number): Duration {
    this._minutes = inputInMinutes;
    return this;
  }

  hours(inputInHours: number): Duration {
    this._hours = inputInHours;
    return this;
  }

  days(inputInDays: number): Duration {
    this._days = inputInDays;
    return this;
  }

  toArray(): number[] {
    return [
      this._milliseconds,
      this._seconds,
      this._minutes,
      this._hours,
      this._days,
    ];
  }

  toObject(): DurationObject {
    return {
      days: this._days,
      hours: this._hours,
      minutes: this._minutes,
      seconds: this._seconds,
      milliseconds: this._milliseconds,
    };
  }

  get(str: SingleFormat): number {
    const caseInsensitive = str.toLowerCase();
    switch (caseInsensitive) {
      case "d":
        return this._days;
      case "h":
        return this._hours;
      case "m":
        return this._minutes;
      case "s":
        return this._seconds;
      case "i":
        return this._milliseconds;
      default:
        throw new Error("Invalid format");
    }
  }

  private _sentence(str: string[]): string {
    const options: FormatOptions = {
      ignoreZero: true,
    };
    let parts: string[] = str
      .filter((f: string): boolean => {
        if (options.ignoreZero) {
          return parseInt(this.format(f), 10) !== 0;
        }
        return true;
      })
      .map((f: string): string => this.format(f));

    const last: string | undefined = parts.pop();
    let output = [parts.join(", ")];
    if (last) {
      if (parts.length === 0) {
        return last;
      } else {
        output.push(last);
      }
    }
    return output.join(" and ");
  }

  private _format(str: string): string {
    const locale: { [key: string]: string[] } = {
      D: ["d"],
      DD: ["day", "days"],
      H: ["h"],
      HH: ["hour", "hours"],
      M: ["m"],
      MM: ["minute", "minutes"],
      S: ["s"],
      SS: ["second", "seconds"],
      I: ["ms"],
      II: ["millisecond", "milliseconds"],
    };
    const matches: FormatMatches = {
      d: String(this._days),
      dd: pad(this._days),
      D: locale.D[0],
      DD: pluralize.apply(null, [this._days, ...locale.DD]),
      h: String(this._hours),
      hh: pad(this._hours),
      H: locale.H[0],
      HH: pluralize.apply(null, [this._hours, ...locale.HH]),
      m: String(this._minutes),
      mm: pad(this._minutes),
      M: locale.M[0],
      MM: pluralize.apply(null, [this._minutes, ...locale.MM]),
      s: String(this._seconds),
      ss: pad(this._seconds),
      S: locale.S[0],
      SS: pluralize.apply(null, [this._seconds, ...locale.SS]),
      i: String(this._milliseconds),
      iii: pad(this._milliseconds, 3),
      I: locale.S[0],
      II: pluralize.apply(null, [this._milliseconds, ...locale.II]),
    };

    return str.replace(REGEX_FORMAT, (match, $1): string => {
      return $1 || matches[match];
    });
  }

  format(str: string | string[]): string {
    if (Array.isArray(str)) {
      return this._sentence(str);
    } else {
      return this._format(str);
    }
  }
}

// detect [anything] and then all matches possible
const REGEX_FORMAT =
  /\[([^\[]*)\]|D{1,2}|d{1,2}|H{1,2}|h{1,2}|M{1,2}|m{1,2}|S{1,2}|s{1,2}|I{1,2}|i{1,3}/g;

interface FormatOptions {
  ignoreZero: boolean;
}

interface DurationObject {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

enum SingleFormat {
  d = "d",
  h = "h",
  m = "m",
  s = "s",
  i = "ms",
}

interface FormatMatches {
  [key: string]: string;
}

function pad(value: number, limit: number = 2): string {
  let s = String(value);
  while (s.length < limit) {
    s = "0" + s;
  }
  return s;
}

function pluralize(count: number, singular: string, plural: string): string {
  if (count === 1) {
    return singular;
  }
  return plural;
}
