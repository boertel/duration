import "mocha";
import { assert } from "chai";
import { duration } from "../src/duration";

const tests = [
  { seconds: 0, expected: [0, 0, 0, 0] },
  { seconds: 59, expected: [59, 0, 0, 0] },
  { seconds: 60, expected: [0, 1, 0, 0] },
  { seconds: 65, expected: [5, 1, 0, 0] },
  { seconds: 120, expected: [0, 2, 0, 0] },
  { seconds: 60 * 60, expected: [0, 0, 1, 0], message: "1 hour" },
  { seconds: 24 * 60 * 60, expected: [0, 0, 0, 1], message: "1 day" },
  { seconds: 5 * 24 * 60 * 60, expected: [0, 0, 0, 5], message: "5 days" },
  {
    seconds: 24 * 60 * 60 + 60 * 60 * 14 + 60 * 3 + 12,
    expected: [12, 3, 14, 1],
    message: "1 day, 14 hours, 3 minutes and 12 seconds",
  },
  {
    seconds: 370 * 24 * 60 * 60,
    expected: [0, 0, 0, 370],
    message: "370 days",
  },
];

describe("duration function", () => {
  tests.forEach(({ seconds, expected, message }) => {
    it(`${seconds} seconds ${message ? `= ${message}` : ""}`, () => {
      assert.sameOrderedMembers(duration(seconds).toArray(), expected, message);
    });
  });
});

describe("create duration with chaining", () => {
  it("create seconds", () => {
    assert.sameOrderedMembers(duration().seconds(20).toArray(), [20, 0, 0, 0]);
  });

  it("create seconds, minutes and hours", () => {
    assert.sameOrderedMembers(
      duration().seconds(20).minutes(23).hours(40).toArray(),
      [20, 23, 40, 0]
    );
  });
});

describe("duration format", () => {
  it("seconds", () => {
    assert.equal(duration(1).format("s"), "1", "single digit");
    assert.equal(duration(1).format("ss"), "01", "double digits");
    assert.equal(
      duration(1).format("s SS"),
      "1 second",
      "single digit with long label"
    );
    assert.equal(
      duration(1).format("ss SS"),
      "01 second",
      "double digits with long label"
    );
    assert.equal(
      duration(1).format("sS"),
      "1s",
      "single digit with short label"
    );
  });

  it("seconds and minutes", () => {
    const d = duration().seconds(43).minutes(12);
    assert.equal(d.format("mm:ss"), "12:43", "double digits");
    assert.equal(
      d.format("mm MM and ss SS"),
      "12 minutes [and] 43 seconds",
      "double digits with long labels"
    );
  });

  it("with an array to generate a sentence", () => {
    const d = duration().seconds(23).minutes(21).hours(2);
    assert.equal(
      d.format(["d DD", "h HH", "m MM", "s SS"]),
      "2 hours, 21 minutes and 23 seconds"
    );
  });

  it("with an array to generate a sentence with none 0 values", () => {
    const d = duration().seconds(23).minutes(21).hours(2).days(18);
    assert.equal(
      d.format(["d DD", "h HH", "m MM", "s SS"]),
      "18 days, 2 hours, 21 minutes and 23 seconds"
    );
  });

  it("with an array to generate a sentence with a bunch of 0 values", () => {
    const d = duration().seconds(23).minutes(0).hours(0).days(18);
    assert.equal(
      d.format(["d DD", "h HH", "m MM", "s SS"]),
      "18 days and 23 seconds"
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
