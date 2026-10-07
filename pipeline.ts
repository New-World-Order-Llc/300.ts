import { createCase, CaseInput, Program300Result } from "./300";

export function runProgram300(input: CaseInput): Program300Result {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("input must be a non-null, non-array object");
  }

  const { caseId, citizenId, submittedAt, category, payload } = input as CaseInput;

  if (typeof caseId !== "string") throw new TypeError("caseId must be a string");
  if (typeof citizenId !== "string") throw new TypeError("citizenId must be a string");
  if (typeof submittedAt !== "string") throw new TypeError("submittedAt must be a string");
  if (typeof category !== "string") throw new TypeError("category must be a string");
  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new TypeError("payload must be a non-null, non-array object");
  }

  return createCase(input);
}
