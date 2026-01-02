import * as temperature from "./lib/temperature.js";
import * as distance from "./lib/distance.js";
import * as weight from "./lib/weight.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaults = JSON.parse(
  readFileSync(join(__dirname, "../config/defaults.json"), "utf-8")
);

function applyPrecision(value, precision) {
  return Number.parseFloat(value.toFixed(precision));
}

export function convert(type, value, from, to) {
  // Validate input value is numeric
  // Check for empty string, null, or undefined before converting
  if (value === "" || value === null || value === undefined) {
    throw new Error("Invalid input: value must be a valid number");
  }

  const numericValue = Number(value);
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    throw new Error("Invalid input: value must be a valid number");
  }

  switch (type) {
    case "temperature":
      return applyPrecision(
        temperature.convertTemperature(
          numericValue,
          from || defaults.temperature.defaultFrom,
          to || defaults.temperature.defaultTo
        ),
        defaults.precision
      );
    case "distance":
      return applyPrecision(
        distance.convertDistance(numericValue, from, to),
        defaults.precision
      );
    case "weight":
      return applyPrecision(
        weight.convertWeight(numericValue, from, to),
        defaults.precision
      );
    default:
      throw new Error("Unknown type " + type);
  }
}
