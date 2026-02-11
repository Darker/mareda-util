
/**
 * Calculates a multiplier for this value and returns
 * a value in the range of 0–999.999 along with its SI suffix.
 *
 * Uses Unicode SI symbols (e.g. µ).
 *
 * @param {number} rawValue
 * @returns {{orig: number, mult: number, value: number, suffix: string}}
 */
export default function stringSISuffix(rawValue) {
  const orig = rawValue;

  // Handle zero cleanly
  if (rawValue === 0) {
    return { orig, mult: 1, value: 0, suffix: "" };
  }

  // SI prefixes we support
  const prefixes = [
    { limit: 1e-12, mult: 1e12, suffix: "p" },
    { limit: 1e-9, mult: 1e9, suffix: "n" },
    { limit: 1e-6, mult: 1e6, suffix: "µ", suffixASCI: "u" }, // micro
    { limit: 1e-3, mult: 1e3, suffix: "m" }, // milli
    { limit: 1,    mult: 1,   suffix: ""  }, // base
    { limit: 1e3,  mult: 1e-3, suffix: "k" },
    { limit: 1e6,  mult: 1e-6, suffix: "M" },
    { limit: 1e9,  mult: 1e-9, suffix: "G" },
    { limit: 1e12,  mult: 1e-12, suffix: "T" },
  ];

  // Find the first prefix where abs(rawValue) < limit * 1000
  const absVal = Math.abs(rawValue);
  let chosen = prefixes[2]; // default: base

  for (const p of prefixes) {
    if (absVal < p.limit * 1000) {
      chosen = p;
      break;
    }
  }

  const value = rawValue * chosen.mult;

  return {
    orig,
    mult: chosen.mult,
    value,
    suffix: chosen.suffix
  };
}
