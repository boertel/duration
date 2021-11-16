export function duration(inputInSeconds?: number): Duration {
  let output: number[] = [];
  if (inputInSeconds === undefined) {
    return new Duration();
  }
  let remainder: number = inputInSeconds;
  const durations: number[] = [
    // Number of seconds in
    24 * 60 * 60, // a day
    60 * 60, // a hour
    1 * 60, // a minute
  ];
  durations.forEach((divisor: number, index: number) => {
    const quotient: number = Math.abs(parseInt(`${remainder / divisor}`, 10));
    remainder = Math.abs(remainder % divisor);
    output.push(Math.floor(quotient));
    if (index === durations.length - 1) {
      output.push(Math.floor(remainder));
    }
  });
  return new Duration(output);
}

export class Duration {
  private _seconds: number = 0;
  private _minutes: number = 0;
  private _hours: number = 0;
  private _days: number = 0;

  constructor(args?: number[] | DurationObject) {
    if (Array.isArray(args)) {
      this._seconds = args[3];
      this._minutes = args[2];
      this._hours = args[1];
      this._days = args[0];
    } else if (typeof args === "object") {
      this._seconds = args.seconds || this._seconds;
      this._minutes = args.minutes || this._minutes;
      this._hours = args.hours || this._hours;
      this._days = args.days || this._days;
    }
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
    return [this._seconds, this._minutes, this._hours, this._days];
  }

  toObject(): DurationObject {
    return {
      days: this._days,
      hours: this._hours,
      minutes: this._minutes,
      seconds: this._seconds,
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
    const matches: FormatMatches = {
      d: String(this._days),
      dd: pad(this._days),
      D: "d",
      DD: pluralize(this._days, "day", "days"),
      h: String(this._hours),
      hh: pad(this._hours),
      H: "h",
      HH: pluralize(this._hours, "hour", "hours"),
      m: String(this._minutes),
      mm: pad(this._minutes),
      M: "m",
      MM: pluralize(this._minutes, "minute", "minutes"),
      s: String(this._seconds),
      ss: pad(this._seconds),
      S: "s",
      SS: pluralize(this._seconds, "second", "seconds"),
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
  /\[([^\[]*)\]|D{1,2}|d{1,2}|H{1,2}|h{1,2}|M{1,2}|m{1,2}|S{1,2}|s{1,2}/g;

interface FormatOptions {
  ignoreZero: boolean;
}

interface DurationObject {
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
}

interface FormatMatches {
  [key: string]: string;
}

function pad(value: number): string {
  let s = String(value);
  while (s.length < 2) {
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
