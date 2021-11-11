export function duration(seconds) {
  let output = [];
  let remainder = seconds;
  const durations = [
    // Number of seconds in
    24 * 60 * 60, // a day
    60 * 60, // a hour
    1 * 60, // a minute
  ];
  durations.forEach((divisor, index) => {
    const quotient: number = Math.abs(parseInt(`${remainder / divisor}`, 10));
    remainder = Math.abs(remainder % divisor);
    output.push(Math.floor(quotient));
    if (index === durations.length - 1) {
      output.push(Math.floor(remainder));
    }
  });
  return output.reverse();
}

function pad(value) {
  let s = String(value);
  while (s.length < 2) {
    s = "0" + s;
  }
  return s;
}

const defaultFormat = (value, key) =>
  `${value} ${value === 1 ? key : `${key}s`}`;
const defaultSeparator = (index, length) => {
  if (index === 0) {
    return "";
  }
  if (index === length - 1) {
    return " and ";
  } else {
    return ", ";
  }
};

export function formatDuration(seconds, options = {}) {
  options = {
    ignoreZero: true,
    format: defaultFormat,
    separator: defaultSeparator,
    intervals: ["day", "hour", "minute", "second"],
    ...options,
  };

  const { format, ignoreZero, separator, intervals } = options;

  const parts = duration(seconds).reverse();

  const output = parts
    .map((part, index) => {
      return format(part, intervals[index]);
    })
    .filter((part, index) => {
      let isNotZero: boolean = ignoreZero && parts[index] !== 0;
      return isNotZero && part.length > 0;
    });

  return output
    .reduce(
      (previous, current, index) =>
        `${previous}${separator(index, output.length)}${current}`,
      ""
    )
    .trim();
}

export function formatDurationShort(seconds, options = {}) {
  options = {
    intervals: ["d", "h", "m", "s"],
    format: (value, key) =>
      `${["d", "h"].includes(key) ? value : pad(value)}${key}`,
    separator: () => " ",
    ...options,
  };
  return formatDuration(seconds, options);
}

export function pluralize(count, singular, plural, returnCount) {
  const prefix = returnCount ? count + " " : "";
  if (count === 1) {
    return prefix + singular;
  } else {
    if (plural) {
      return prefix + plural;
    } else {
      const lastCharacter = singular.length - 1;
      if (singular[lastCharacter] === "y") {
        return `${prefix}${singular.substr(0, lastCharacter)}ies`;
      } else {
        return `${prefix}${singular}s`;
      }
    }
  }
}

export function formatMinutes(minutes) {
  let duration = minutes;
  let singular = "minute";
  let plural = "minutes";

  if (duration > 60) {
    duration = duration / 60;
    singular = "hour";
    plural = "hours";
  }

  return pluralize(parseInt(duration, 10), singular, plural, true);
}
