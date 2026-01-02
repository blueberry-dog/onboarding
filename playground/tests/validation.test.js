import { test } from "node:test";
import { strictEqual, throws } from "node:assert";
import { convert } from "../src/convert.js";

// Tests for input validation
// These tests should FAIL initially and pass after implementing validation

test("rejects non-numeric value", () => {
  throws(
    () => convert("temperature", "abc", "C", "F"),
    /invalid.*number|numeric/i,
    "Should throw error for non-numeric input"
  );
});

test("rejects NaN value", () => {
  throws(
    () => convert("temperature", NaN, "C", "F"),
    /invalid.*number|numeric/i,
    "Should throw error for NaN"
  );
});

test("rejects unknown conversion type", () => {
  throws(
    () => convert("volume", 100, "L", "gal"),
    /unknown.*type/i,
    "Should throw error for unsupported conversion type"
  );
});

test("accepts valid numeric strings", () => {
  // Should convert string to number and process
  const result = convert("temperature", "100", "C", "F");
  strictEqual(result, 212);
});

test("accepts negative values", () => {
  const result = convert("temperature", -40, "C", "F");
  strictEqual(result, -40); // -40°C = -40°F (special case!)
});

test("accepts zero", () => {
  const result = convert("temperature", 0, "C", "F");
  strictEqual(result, 32);
});

// Tests for new unit conversions
test("converts Celsius to Kelvin", () => {
  const result = convert("temperature", 0, "C", "K");
  strictEqual(result, 273.15);
});

test("converts Kelvin to Celsius", () => {
  const result = convert("temperature", 273.15, "K", "C");
  strictEqual(result, 0);
});

test("converts Fahrenheit to Kelvin", () => {
  const result = convert("temperature", 32, "F", "K");
  strictEqual(result, 273.15);
});

test("converts Kelvin to Fahrenheit", () => {
  const result = convert("temperature", 273.15, "K", "F");
  strictEqual(result, 32);
});

test("converts kilometers to meters", () => {
  const result = convert("distance", 5, "km", "m");
  strictEqual(result, 5000);
});

test("converts meters to kilometers", () => {
  const result = convert("distance", 1000, "m", "km");
  strictEqual(result, 1);
});

test("converts miles to meters", () => {
  const result = convert("distance", 1, "mi", "m");
  strictEqual(result, 1609.344);
});

test("converts meters to miles", () => {
  const result = convert("distance", 1609.344, "m", "mi");
  strictEqual(result, 1);
});

test("converts grams to pounds", () => {
  const result = convert("weight", 453.592, "g", "lb");
  strictEqual(result, 1);
});

test("converts pounds to grams", () => {
  const result = convert("weight", 1, "lb", "g");
  strictEqual(result, 453.592);
});

test("converts ounces to pounds", () => {
  const result = convert("weight", 16, "oz", "lb");
  strictEqual(result, 1);
});

test("converts pounds to ounces", () => {
  const result = convert("weight", 2, "lb", "oz");
  strictEqual(result, 32);
});

test("rejects truly unknown unit codes", () => {
  throws(
    () => convert("distance", 100, "km", "ft"),
    /unsupported.*distance.*conversion/i,
    "Should throw error for unsupported distance unit combination"
  );
});

// Edge cases for non-numeric inputs
test("rejects Infinity", () => {
  throws(
    () => convert("temperature", Infinity, "C", "F"),
    /invalid.*number|numeric/i,
    "Should throw error for Infinity"
  );
});

test("rejects empty string", () => {
  throws(
    () => convert("temperature", "", "C", "F"),
    /invalid.*number|numeric/i,
    "Should throw error for empty string"
  );
});

test("rejects null value", () => {
  throws(
    () => convert("temperature", null, "C", "F"),
    /invalid.*number|numeric/i,
    "Should throw error for null"
  );
});

test("rejects undefined value", () => {
  throws(
    () => convert("temperature", undefined, "C", "F"),
    /invalid.*number|numeric/i,
    "Should throw error for undefined"
  );
});
