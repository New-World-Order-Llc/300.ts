/**
 * Program 300 – Government Benefits Automation
 * Program Family: GOVERNMENT_300
 * New World Order DAO – Government Program Family
 *
 * Pure, deterministic, dependency-free, JSON-serializable.
 */

export const PROGRAM_METADATA = {
  programFamily: "GOVERNMENT_300",
  programId: "300",
  name: "Government Benefits Automation",
} as const;

export type Category = "DISABILITY" | "HOUSING" | "HEALTH" | "GENERAL";
export type ProgramCode =
  | "300-DISABILITY"
  | "300-HOUSING"
  | "300-HEALTH"
  | "300-GENERAL";

export interface CaseInput {
  caseId: string;
  citizenId: string;
  submittedAt: string; // ISO timestamp
  category: Category;
  payload: Record<string, unknown>;
  programHint?: string;
}

export type EventType =
  | "CASE_CREATED"
  | "CASE_VALIDATED"
  | "CASE_REJECTED"
  | "CASE_ROUTED";

export interface AuditEvent {
  type: EventType;
  timestamp: string;
  caseId: string;
  details: Record<string, unknown>;
}

export type CaseStatus = "ROUTED" | "REJECTED";

export interface CaseRecord {
  programFamily: string;
  programId: string;
  caseId: string;
  citizenId: string;
  submittedAt: string;
  category: string;
  payload: Record<string, unknown>;
  programHint?: string;
  valid: boolean;
  errors: string[];
  program: ProgramCode | null;
  routingTarget: string | null;
  status: CaseStatus;
}

export interface Program300Result {
  record: CaseRecord;
  events: AuditEvent[];
}

export const DEFAULT_ROUTING_TARGET = "MUNICIPAL-HUB-PRIMARY";

const CATEGORY_TO_PROGRAM: Readonly<Record<Category, ProgramCode>> = {
  DISABILITY: "300-DISABILITY",
  HOUSING: "300-HOUSING",
  HEALTH: "300-HEALTH",
  GENERAL: "300-GENERAL",
};

const ISO_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidCategory(v: unknown): v is Category {
  return (
    typeof v === "string" &&
    Object.prototype.hasOwnProperty.call(CATEGORY_TO_PROGRAM, v)
  );
}

function isValidIso(v: string): boolean {
  return ISO_REGEX.test(v) && !Number.isNaN(Date.parse(v));
}

/** Returns a deterministic, ordered list of validation errors. */
export function validateCase(input: CaseInput): string[] {
  const errors: string[] = [];
  const i = (input ?? {}) as Partial<CaseInput>;

  if (!isNonEmptyString(i.caseId)) errors.push("caseId must be a non-empty string");
  if (!isNonEmptyString(i.citizenId)) errors.push("citizenId must be a non-empty string");

  if (!isNonEmptyString(i.submittedAt)) {
    errors.push("submittedAt must be a non-empty string");
  } else if (!isValidIso(i.submittedAt)) {
    errors.push("submittedAt must be a valid ISO timestamp");
  }

  if (!isNonEmptyString(i.category)) {
    errors.push("category must be a non-empty string");
  } else if (!isValidCategory(i.category)) {
    errors.push("category must be one of DISABILITY, HOUSING, HEALTH, GENERAL");
  }

  const p = i.payload as unknown;
  if (typeof p !== "object" || p === null || Array.isArray(p)) {
    errors.push("payload must be an object");
  } else if (Object.keys(p).length === 0) {
    errors.push("payload must contain at least one key");
  }

  if (i.programHint !== undefined && typeof i.programHint !== "string") {
    errors.push("programHint must be a string when provided");
  }

  return errors;
}

/** Maps category to program code. Returns null for invalid categories. */
export function classifyCase(category: unknown): ProgramCode | null {
  return isValidCategory(category) ? CATEGORY_TO_PROGRAM[category] : null;
}

/** Deterministic routing target. */
export function routeCase(_program: ProgramCode): string {
  return DEFAULT_ROUTING_TARGET;
}

function event(
  type: EventType,
  timestamp: string,
  caseId: string,
  details: Record<string, unknown>,
): AuditEvent {
  return { type, timestamp, caseId, details };
}

export function createCase(input: CaseInput): Program300Result {
  const i = (input ?? {}) as Partial<CaseInput>;
  const caseId = typeof i.caseId === "string" ? i.caseId : "";
  // Events use the submission timestamp so output is fully deterministic.
  const timestamp = typeof i.submittedAt === "string" ? i.submittedAt : "";

  const errors = validateCase(input);
  const valid = errors.length === 0;
  const program = valid ? classifyCase(i.category) : null;
  const routingTarget = program ? routeCase(program) : null;

  const record: CaseRecord = {
    programFamily: PROGRAM_METADATA.programFamily,
    programId: PROGRAM_METADATA.programId,
    caseId,
    citizenId: typeof i.citizenId === "string" ? i.citizenId : "",
    submittedAt: timestamp,
    category: typeof i.category === "string" ? i.category : "",
    payload:
      typeof i.payload === "object" && i.payload !== null && !Array.isArray(i.payload)
        ? JSON.parse(JSON.stringify(i.payload))
        : {},
    ...(typeof i.programHint === "string" ? { programHint: i.programHint } : {}),
    valid,
    errors,
    program,
    routingTarget,
    status: valid ? "ROUTED" : "REJECTED",
  };

  const events: AuditEvent[] = [
    event("CASE_CREATED", timestamp, caseId, {
      programFamily: record.programFamily,
      programId: record.programId,
      citizenId: record.citizenId,
      category: record.category,
    }),
  ];

  if (valid) {
    events.push(
      event("CASE_VALIDATED", timestamp, caseId, { errorCount: 0 }),
      event("CASE_ROUTED", timestamp, caseId, {
        program,
        routingTarget,
        programHint: record.programHint ?? null,
      }),
    );
  } else {
    events.push(
      event("CASE_REJECTED", timestamp, caseId, {
        errorCount: errors.length,
        errors,
      }),
    );
  }

  return { record, events };
}
