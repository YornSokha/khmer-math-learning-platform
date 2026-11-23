import { describe, expect, it } from "vitest";
import { evaluateExpression, extractVariables, validateExpressionDomain } from "./expression";

describe("Safe arithmetic expression parser and domain validator", () => {
  it("evaluates arithmetic expressions with precedence and parentheses", () => {
    expect(evaluateExpression("10 - given", { given: 7 })).toBe(3);
    expect(evaluateExpression("(a + b) * 2 - 4 / 2", { a: 3, b: 2 })).toBe(8);
    expect(evaluateExpression("-a + 10", { a: 4 })).toBe(6);
    expect(extractVariables("10 - given + a")).toEqual(["given", "a"]);
  });

  it("rejects unknown variables and division by zero", () => {
    expect(() => evaluateExpression("10 - missing", { given: 7 })).toThrow(/Unknown variable/);
    expect(() => evaluateExpression("10 / a", { a: 0 })).toThrow(/Division by zero/);
  });

  it("validates integer domain across parameter ranges", () => {
    expect(
      validateExpressionDomain(
        "10 - given",
        { given: { randInt: [1, 9] } },
        { integerOnly: true, minValue: 0 },
      ),
    ).toEqual({ valid: true });

    const nonInteger = validateExpressionDomain(
      "given / 2",
      { given: { randInt: [1, 5] } },
      { integerOnly: true, minValue: 0 },
    );
    expect(nonInteger.valid).toBe(false);
    expect(nonInteger.error).toMatch(/non-integer/);

    const negative = validateExpressionDomain(
      "5 - given",
      { given: { randInt: [3, 8] } },
      { integerOnly: true, minValue: 0 },
    );
    expect(negative.valid).toBe(false);
    expect(negative.error).toMatch(/< 0/);

    const unknownVar = validateExpressionDomain("10 - x", { given: { randInt: [1, 9] } });
    expect(unknownVar.valid).toBe(false);
    expect(unknownVar.error).toMatch(/undeclared parameter "x"/);
  });
});
