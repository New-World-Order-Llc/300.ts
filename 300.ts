/**
 * Program 300 – Government Benefits Automation
 * New World Order DAO – First Government Repo Family
 *
 * Deterministic, auditable, pure-function module. Zero dependencies.
 */

export type GovernmentCategory = "DISABILITY" | "HOUSING" | "HEALTH" | "GENERAL";

export type GovernmentProgramId =
  | "300-DISABILITY"
  | "300-HOUSING"
  | "300-HEALTH"
  | "300-GENERAL";

export type CaseStatus = "NEW" | "VALIDATED" | "REJECTED" | "ROUTED";

export interface CaseInput {
  caseId: string;
  citizenId: string;
  submittedAt: string;
  category: GovernmentCategory;
  payload: Record<string, unknown>;
  programHint?: GovernmentProgramId;
}

export interface CaseRecord extends CaseInput {
  status: CaseStatus;
  resolvedProgram: GovernmentProgramId;
  validationErrors: string[];
  routingTarget?: string;
}

export interface Program300Event {
  type: "CASE_CREATED" | "CASE_VALIDATED" | "CASE_REJECTED" | "CASE_ROUTED";
  timestamp: string;
  caseId: string;
  details: Record<string, unknown>;
}

export interface Program300Result {
  record: CaseRecord;
  events: Program300Event[];
}

export const PROGRAM_FAMILY = "GOVERNMENT_300";
export const PROGRAM_ID = "300";

const CATEGORIES: readonly GovernmentCategory[] = [
  "DISABILITY",
  "HOUSING",
  "HEALTH",
  "GENERAL",
];

const PROGRAM_IDS: readonly GovernmentProgramId[] = [
  "300-DISABILITY",
  "300-HOUSING",
  "300-HEALTH",
  "300-GENERAL",
];

export const DEFAULT_ROUTING_TARGET = "MUNICIPAL-HUB-PRIMARY";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function nonEmptyError(field: string, value: unknown): string | null {
  return isNonEmptyString(value) ? null : `Field "${field}" must be non-empty`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCase(input: CaseInput): string[] {
  const errors: string[] = [];
  const src: Partial<CaseInput> = isPlainObject(input) ? input : {};

  for (const field of ["caseId", "citizenId", "submittedAt"] as const) {
    const e = nonEmptyError(field, src[field]);
    if (e) errors.push(e);
  }

  if (
    isNonEmptyString(src.submittedAt) &&
    (Number.isNaN(Date.parse(src.submittedAt)) ||
      !/^\d{4}-\d{2}-\d{2}T/.test(src.submittedAt))
  ) {
    errors.push('Field "submittedAt" must be an ISO timestamp');
  }

  if (!isNonEmptyString(src.category)) {
    errors.push('Field "category" must be provided');
  } else if (!CATEGORIES.includes(src.category)) {
    errors.push(`Field "category" must be one of ${CATEGORIES.join(", ")}`);
  }

  if (!isPlainObject(src.payload) || Object.keys(src.payload).length === 0) {
    errors.push('Field "payload" must contain at least one key');
  }

  if (src.programHint !== undefined && !PROGRAM_IDS.includes(src.programHint)) {
    errors.push(`Field "programHint" must be one of ${PROGRAM_IDS.join(", ")}`);
  }

  return errors;
}

export function classifyProgram(input: CaseInput): GovernmentProgramId {
  if (input.programHint && PROGRAM_IDS.includes(input.programHint)) {
    return input.programHint;
  }
  switch (input.category) {
    case "DISABILITY":
      return "300-DISABILITY";
    case "HOUSING":
      return "300-HOUSING";
    case "HEALTH":
      return "300-HEALTH";
    default:
      return "300-GENERAL";
  }
}

/** Routing hook: municipal → state → federal expansion point. */
export function inferRoutingTarget(_record: CaseRecord): string {
  return DEFAULT_ROUTING_TARGET;
}

/**
 * Creates a case. Fully deterministic: event timestamps derive from the
 * input's submittedAt (falling back to the epoch when it is unusable).
 */
export function createCase(input: CaseInput): Program300Result {
  const safe: Partial<CaseInput> = isPlainObject(input) ? input : {};
  const caseId = typeof safe.caseId === "string" ? safe.caseId : "";
  const parsed =
    typeof safe.submittedAt === "string" ? Date.parse(safe.submittedAt) : NaN;
  const timestamp = new Date(Number.isNaN(parsed) ? 0 : parsed).toISOString();
  const events: Program300Event[] = [];

  const resolvedProgram = classifyProgram(safe as CaseInput);
  const base = { ...(safe as CaseInput), resolvedProgram };

  events.push({
    type: "CASE_CREATED",
    timestamp,
    caseId,
    details: { programFamily: PROGRAM_FAMILY, programId: PROGRAM_ID, resolvedProgram },
  });

  const validationErrors = validateCase(input);

  if (validationErrors.length > 0) {
    events.push({
      type: "CASE_REJECTED",
      timestamp,
      caseId,
      details: { errors: validationErrors },
    });
    return {
      record: { ...base, status: "REJECTED", validationErrors },
      events,
    };
  }

  events.push({
    type: "CASE_VALIDATED",
    timestamp,
    caseId,
    details: { resolvedProgram },
  });

  const validated: CaseRecord = { ...base, status: "VALIDATED", validationErrors: [] };
  const routingTarget = inferRoutingTarget(validated);

  events.push({
    type: "CASE_ROUTED",
    timestamp,
    caseId,
    details: { routingTarget, resolvedProgram },
  });

  return {
    record: { ...validated, status: "ROUTED", routingTarget },
    events,
  };
}
