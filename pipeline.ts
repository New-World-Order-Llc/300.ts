import { createCase } from "./300";
import type { CaseInput, Program300Result } from "./300";

const REQUIRED_STRING_FIELDS = [
  "caseId",
  "citizenId",
  "submittedAt",
  "category",
] as const;

function assertCaseInputShape(input: unknown): asserts input is CaseInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError("Program 300 input must be a non-null object");
  }
  const record = input as Record<string, unknown>;
  for (const key of REQUIRED_STRING_FIELDS) {
    if (typeof record[key] !== "string") {
      throw new TypeError(`Program 300 input field "${key}" must be a string`);
    }
  }
  const payload = record["payload"];
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new TypeError(
      'Program 300 input field "payload" must be a non-null, non-array object',
    );
  }
}

export function runProgram300(input: CaseInput): Program300Result {
  assertCaseInputShape(input);
  return createCase(input);
}
