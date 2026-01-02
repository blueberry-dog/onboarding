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

function detectType(unit) {
  const distanceUnits = ["km", "mi", "m"];
  const temperatureUnits = ["C", "F", "K"];
  const weightUnits = ["g", "oz", "lb"];

  if (distanceUnits.includes(unit)) return "distance";
  if (temperatureUnits.includes(unit)) return "temperature";
  if (weightUnits.includes(unit)) return "weight";
  throw new Error(`Unknown unit: ${unit}`);
}

function getBaseUnit(type) {
  switch (type) {
    case "distance":
      return "m";
    case "temperature":
      return "C";
    case "weight":
      return "g";
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export function compare(value1, unit1, value2, unit2) {
  // Validate input values are numeric
  if (value1 === "" || value1 === null || value1 === undefined ||
      value2 === "" || value2 === null || value2 === undefined) {
    throw new Error("Invalid input: values must be valid numbers");
  }

  const numValue1 = Number(value1);
  const numValue2 = Number(value2);
  
  if (isNaN(numValue1) || !isFinite(numValue1) ||
      isNaN(numValue2) || !isFinite(numValue2)) {
    throw new Error("Invalid input: values must be valid numbers");
  }

  // Detect type from units
  const type1 = detectType(unit1);
  const type2 = detectType(unit2);

  if (type1 !== type2) {
    throw new Error(`Cannot compare ${unit1} (${type1}) with ${unit2} (${type2})`);
  }

  const type = type1;
  const baseUnit = getBaseUnit(type);

  // Convert both values to base unit for comparison
  let convertedValue1, convertedValue2;
  
  if (type === "distance") {
    convertedValue1 = unit1 === baseUnit ? numValue1 : distance.convertDistance(numValue1, unit1, baseUnit);
    convertedValue2 = unit2 === baseUnit ? numValue2 : distance.convertDistance(numValue2, unit2, baseUnit);
  } else if (type === "temperature") {
    convertedValue1 = unit1 === baseUnit ? numValue1 : temperature.convertTemperature(numValue1, unit1, baseUnit);
    convertedValue2 = unit2 === baseUnit ? numValue2 : temperature.convertTemperature(numValue2, unit2, baseUnit);
  } else if (type === "weight") {
    convertedValue1 = unit1 === baseUnit ? numValue1 : weight.convertWeight(numValue1, unit1, baseUnit);
    convertedValue2 = unit2 === baseUnit ? numValue2 : weight.convertWeight(numValue2, unit2, baseUnit);
  }

  const diff = Math.abs(convertedValue1 - convertedValue2);
  const larger = convertedValue1 > convertedValue2 ? 1 : 2;
  const smaller = larger === 1 ? 2 : 1;
  const largerValue = larger === 1 ? numValue1 : numValue2;
  const largerUnit = larger === 1 ? unit1 : unit2;
  const smallerValue = smaller === 1 ? numValue1 : numValue2;
  const smallerUnit = smaller === 1 ? unit1 : unit2;

  return {
    larger: `${largerValue} ${largerUnit}`,
    smaller: `${smallerValue} ${smallerUnit}`,
    difference: applyPrecision(diff, defaults.precision),
    differenceUnit: baseUnit,
    equal: diff < Math.pow(10, -defaults.precision)
  };
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
