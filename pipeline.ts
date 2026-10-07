import { createCase } from "./300";
import type { CaseInput, Program300Result } from "./300";

function assertCaseInputShape(input: unknown): asserts input is CaseInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError("Program 300 input must be a non-null object");
  }
}

export function runProgram300(input: CaseInput): Program300Result {
  assertCaseInputShape(input);
  return createCase(input);
}
