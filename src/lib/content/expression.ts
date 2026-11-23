export type ParamSpec = number | { readonly randInt: readonly [number, number] };

export type ParamMap = Record<string, ParamSpec>;

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expression.length) {
    const ch = expression[i]!;

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch >= "0" && ch <= "9") {
      let end = i;
      let hasDot = false;
      while (end < expression.length) {
        const current = expression[end]!;
        if (current >= "0" && current <= "9") {
          end += 1;
        } else if (current === "." && !hasDot) {
          hasDot = true;
          end += 1;
        } else {
          break;
        }
      }
      const raw = expression.slice(i, end);
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid numeric literal "${raw}" in expression "${expression}"`);
      }
      tokens.push({ type: "number", value });
      i = end;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let end = i + 1;
      while (end < expression.length && /[a-zA-Z0-9_]/.test(expression[end]!)) {
        end += 1;
      }
      tokens.push({ type: "ident", value: expression.slice(i, end) });
      i = end;
      continue;
    }

    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i += 1;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i += 1;
      continue;
    }

    throw new Error(`Unexpected character "${ch}" in expression "${expression}"`);
  }

  if (tokens.length === 0) {
    throw new Error("Expression cannot be empty");
  }

  return tokens;
}

class ExpressionParser {
  private readonly tokens: Token[];
  private readonly variables: Record<string, number>;
  private position = 0;

  constructor(tokens: Token[], variables: Record<string, number>) {
    this.tokens = tokens;
    this.variables = variables;
  }

  parse(): number {
    const value = this.parseAddSub();
    if (this.position < this.tokens.length) {
      throw new Error("Unexpected trailing tokens in expression");
    }
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private consume(): Token {
    const token = this.tokens[this.position];
    if (!token) {
      throw new Error("Unexpected end of expression");
    }
    this.position += 1;
    return token;
  }

  private parseAddSub(): number {
    let left = this.parseMulDiv();

    while (true) {
      const next = this.peek();
      if (next?.type === "op" && (next.value === "+" || next.value === "-")) {
        this.consume();
        const right = this.parseMulDiv();
        left = next.value === "+" ? left + right : left - right;
      } else {
        break;
      }
    }

    return left;
  }

  private parseMulDiv(): number {
    let left = this.parseUnary();

    while (true) {
      const next = this.peek();
      if (next?.type === "op" && (next.value === "*" || next.value === "/")) {
        this.consume();
        const right = this.parseUnary();
        if (next.value === "/") {
          if (right === 0) {
            throw new Error("Division by zero in expression");
          }
          left = left / right;
        } else {
          left = left * right;
        }
      } else {
        break;
      }
    }

    return left;
  }

  private parseUnary(): number {
    const next = this.peek();
    if (next?.type === "op" && (next.value === "+" || next.value === "-")) {
      this.consume();
      const operand = this.parseUnary();
      return next.value === "-" ? -operand : operand;
    }

    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.consume();

    if (token.type === "number") {
      return token.value;
    }

    if (token.type === "ident") {
      const value = this.variables[token.value];
      if (value === undefined) {
        throw new Error(`Unknown variable "${token.value}" in expression`);
      }
      return value;
    }

    if (token.type === "lparen") {
      const inner = this.parseAddSub();
      const closing = this.peek();
      if (closing?.type !== "rparen") {
        throw new Error("Missing closing parenthesis in expression");
      }
      this.consume();
      return inner;
    }

    throw new Error("Expected number, variable, or parenthesized expression");
  }
}

export function extractVariables(expression: string): string[] {
  const tokens = tokenize(expression);
  const names = new Set<string>();
  for (const token of tokens) {
    if (token.type === "ident") {
      names.add(token.value);
    }
  }
  return Array.from(names);
}

export function evaluateExpression(expression: string, variables: Record<string, number>): number {
  const tokens = tokenize(expression);
  const parser = new ExpressionParser(tokens, variables);
  const result = parser.parse();

  if (!Number.isFinite(result)) {
    throw new Error(`Expression "${expression}" evaluated to non-finite value`);
  }

  return Object.is(result, -0) ? 0 : result;
}

export interface DomainValidationOptions {
  integerOnly?: boolean;
  minValue?: number;
  maxValue?: number;
  maxCombinations?: number;
}

export interface DomainValidationResult {
  valid: boolean;
  error?: string;
}

function getParamSampleValues(spec: ParamSpec, maxValuesPerParam: number): number[] {
  if (typeof spec === "number") {
    return [spec];
  }

  const [min, max] = spec.randInt;
  const count = max - min + 1;
  if (count <= maxValuesPerParam) {
    const values: number[] = [];
    for (let v = min; v <= max; v += 1) {
      values.push(v);
    }
    return values;
  }

  const mid = Math.floor((min + max) / 2);
  return Array.from(new Set([min, min + 1, mid, max - 1, max]));
}

export function enumerateParamCombinations(
  params: ParamMap,
  maxCombinations = 512,
): Array<Record<string, number>> {
  const entries = Object.entries(params);
  if (entries.length === 0) {
    return [{}];
  }

  const maxPerParam = Math.max(
    5,
    Math.floor(Math.pow(maxCombinations, 1 / Math.max(entries.length, 1))),
  );

  let combinations: Array<Record<string, number>> = [{}];

  for (const [key, spec] of entries) {
    const values = getParamSampleValues(spec, maxPerParam);
    const next: Array<Record<string, number>> = [];

    for (const combo of combinations) {
      for (const val of values) {
        next.push({ ...combo, [key]: val });
        if (next.length >= maxCombinations) {
          break;
        }
      }
      if (next.length >= maxCombinations) {
        break;
      }
    }

    combinations = next;
  }

  return combinations;
}

export function validateExpressionDomain(
  expression: string,
  params: ParamMap,
  options: DomainValidationOptions = {},
): DomainValidationResult {
  const { integerOnly = true, minValue, maxValue, maxCombinations = 512 } = options;

  let vars: string[];
  try {
    vars = extractVariables(expression);
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : String(err) };
  }

  for (const variable of vars) {
    if (!(variable in params)) {
      return {
        valid: false,
        error: `Expression "${expression}" references undeclared parameter "${variable}"`,
      };
    }
  }

  const combinations = enumerateParamCombinations(params, maxCombinations);

  for (const assignment of combinations) {
    let value: number;
    try {
      value = evaluateExpression(expression, assignment);
    } catch (err) {
      return {
        valid: false,
        error: `${err instanceof Error ? err.message : String(err)} for params ${JSON.stringify(assignment)}`,
      };
    }

    if (integerOnly && !Number.isInteger(value)) {
      return {
        valid: false,
        error: `Expression "${expression}" produced non-integer ${value} for params ${JSON.stringify(assignment)}`,
      };
    }

    if (minValue !== undefined && value < minValue) {
      return {
        valid: false,
        error: `Expression "${expression}" produced ${value} (< ${minValue}) for params ${JSON.stringify(assignment)}`,
      };
    }

    if (maxValue !== undefined && value > maxValue) {
      return {
        valid: false,
        error: `Expression "${expression}" produced ${value} (> ${maxValue}) for params ${JSON.stringify(assignment)}`,
      };
    }
  }

  return { valid: true };
}
