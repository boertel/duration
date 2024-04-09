import { describe, it, assert } from "vitest";
import { duration } from "../src/duration";

const fromNumber = [
  { seconds: 0, expected: [0, 0, 0, 0, 0] },
  { seconds: 59, expected: [0, 59, 0, 0, 0] },
  { seconds: 60, expected: [0, 0, 1, 0, 0] },
  { seconds: 65, expected: [0, 5, 1, 0, 0] },
  { seconds: 120, expected: [0, 0, 2, 0, 0] },
  { seconds: 60 * 60, expected: [0, 0, 0, 1, 0], message: "1 hour" },
  { seconds: 24 * 60 * 60, expected: [0, 0, 0, 0, 1], message: "1 day" },
  { seconds: 5 * 24 * 60 * 60, expected: [0, 0, 0, 0, 5], message: "5 days" },
  {
    seconds: 24 * 60 * 60 + 60 * 60 * 14 + 60 * 3 + 12,
    expected: [0, 12, 3, 14, 1],
    message: "1 day, 14 hours, 3 minutes and 12 seconds",
  },
  {
    seconds: 370 * 24 * 60 * 60,
    expected: [0, 0, 0, 0, 370],
    message: "370 days",
  },
];

describe("test mostly for developing/debugging", () => {
  it.only("only", () => {
    console.log(
      duration(0 * 60 * 1000 + 0 * 1000 + 450 * 1).format("m?:ss.iii"),
    );
  });
});

describe("duration function", () => {
  fromNumber.forEach(({ seconds, expected, message }) => {
    it(`${seconds} seconds ${message ? `= ${message}` : ""}`, () => {
      assert.sameOrderedMembers(
        duration(seconds * 1000).toArray(),
        expected,
        message,
      );
    });
  });
});

const fromString = [
  {
    str: "1:29.659",
    format: "m:ss.iii",
    expected: 1 * 60 * 1000 + 29 * 1000 + 659,
  },
  {
    str: "05:29.310",
    format: "mm:ss.iii",
    expected: 5 * 60 * 1000 + 29 * 1000 + 310,
  },
  {
    str: "12:45.010",
    format: "m:ss.iii",
    expected: 12 * 60 * 1000 + 45 * 1000 + 10,
  },
  {
    str: "–",
    format: "m:ss.iii",
    thrown: "Invalid format: – does not match m:ss.iii",
  },
];

describe("duration.parse function", () => {
  fromString.forEach(({ str, format, expected, thrown }) => {
    it(`${str} with ${format} = ${expected || `throw exception: "${thrown}"`}`, () => {
      if (thrown) {
        assert.throws(() => {
          duration.parse(str, format);
        }, thrown);
      } else {
        assert.equal(duration.parse(str, format).toMs(), expected);
      }
    });
  });
});

describe("create duration with chaining", () => {
  it("create seconds", () => {
    assert.sameOrderedMembers(
      duration().seconds(20).toArray(),
      [0, 20, 0, 0, 0],
    );
  });

  it("create seconds, minutes and hours", () => {
    assert.sameOrderedMembers(
      duration().seconds(20).minutes(23).hours(40).toArray(),
      [0, 20, 23, 40, 0],
    );
  });
});

describe("duration format", () => {
  it("milliseconds", () => {
    assert.equal(duration(4).format("i"), "4", "single digit");
    assert.equal(duration(4).format("iii"), "004", "triple digits");
    assert.equal(
      duration(91814).format("mm:ss.iii"),
      "01:31.814",
      "triple digits",
    );
    assert.equal(
      duration(90030).format("m:ss.iii"),
      "1:30.030",
      "triple digits",
    );
  });

  it("seconds", () => {
    assert.equal(duration(1000).format("s"), "1", "single digit");
    assert.equal(duration(1000).format("ss"), "01", "double digits");
    assert.equal(
      duration(1000).format("s SS"),
      "1 second",
      "single digit with long label",
    );
    assert.equal(
      duration(1000).format("ss SS"),
      "01 second",
      "double digits with long label",
    );
    assert.equal(
      duration(1000).format("sS"),
      "1s",
      "single digit with short label",
    );
  });

  it("with everything", () => {
    const d = duration().days(1).hours(2).minutes(3).seconds(4);
    assert.equal(
      d.format("dd DD hh HH mm MM ss SS"),
      "01 day 02 hours 03 minutes 04 seconds",
    );
  });

  it("seconds and minutes with escape strings", () => {
    const d = duration().seconds(43).minutes(12);
    assert.equal(d.format("mm:ss"), "12:43", "double digits");
    assert.equal(
      d.format("mm MM [and] ss SS"),
      "12 minutes and 43 seconds",
      "double digits with long labels",
    );
  });

  it("escape strings that are formats", () => {
    const d = duration().seconds(43).minutes(12);
    assert.equal(
      d.format("mm MM [MM] ss SS [DD]"),
      "12 minutes MM 43 seconds DD",
      "double digits with long labels",
    );
  });

  it("with an array to generate a sentence", () => {
    const d = duration().seconds(23).minutes(21).hours(2);
    assert.equal(
      d.format(["d DD", "h HH", "m MM", "s SS"]),
      "2 hours, 21 minutes and 23 seconds",
    );
  });

  it("with an array to generate a sentence with none 0 values", () => {
    const d = duration().seconds(23).minutes(21).hours(2).days(18);
    assert.equal(
      d.format(["d DD", "h HH", "m MM", "s SS"]),
      "18 days, 2 hours, 21 minutes and 23 seconds",
    );
  });

  it("with an array to generate a sentence with a bunch of 0 values", () => {
    const d = duration().seconds(23).minutes(0).hours(0).days(18);
    assert.equal(
      d.format(["d DD", "h HH", "m MM", "s SS"]),
      "18 days and 23 seconds",
    );
  });

  it("with an array to generate a sentence with one value", () => {
    const d = duration().minutes(12);
    assert.equal(d.format(["d DD", "h HH", "m MM", "s SS"]), "12 minutes");
  });

  it("with an array to generate a sentence with format", () => {
    const d = duration().minutes(12).hours(20);
    assert.equal(d.format(["h HH"]), "20 hours");
  });
});

describe("get other values", () => {
  it("toMs", () => {
    assert.equal(duration(45).toMs(), 45);
    assert.equal(duration([45, 2]).toMs(), 45 + 1000 * 2);
  });

  it("toArray", () => {
    assert.sameOrderedMembers(duration(0).toArray(), [0, 0, 0, 0, 0]);
    assert.sameOrderedMembers(
      duration(838838 * 1000).toArray(),
      [0, 38, 0, 17, 9],
    );
  });

  it("toObject", () => {
    assert.deepEqual(duration(0).toObject(), {
      milliseconds: 0,
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
    });
    assert.deepEqual(duration(838838 * 1000).toObject(), {
      milliseconds: 0,
      seconds: 38,
      minutes: 0,
      hours: 17,
      days: 9,
    });
  });
});
