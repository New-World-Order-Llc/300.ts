export const PROGRAM_METADATA = {
  programFamily: "GOVERNMENT_300",
  programId: "300",
  name: "Government Benefits Automation",
} as const;

type Category = "DISABILITY" | "HOUSING" | "HEALTH" | "GENERAL";
type ProgramCode = "300-DISABILITY" | "300-HOUSING" | "300-HEALTH" | "300-GENERAL";
type Status = "NEW" | "VALIDATED" | "REJECTED" | "ROUTED";

export interface CaseInput {
  caseId: string;
  citizenId: string;
  submittedAt: string;
  category: Category;
  payload: Record<string, unknown>;
  programHint?: ProgramCode;
}

interface CaseRecord extends CaseInput {
  status: Status;
  resolvedProgram: ProgramCode;
  validationErrors: string[];
  routingTarget?: string;
}

type EventType = "CASE_CREATED" | "CASE_VALIDATED" | "CASE_REJECTED" | "CASE_ROUTED";

interface AuditEvent {
  type: EventType;
  at: string;
  caseId: string;
  details: Record<string, unknown>;
}

export interface Program300Result {
  record: CaseRecord;
  events: AuditEvent[];
}

function makeClock() {
  let t = Date.parse("2000-01-01T00:00:00.000Z");
  return () => new Date(t += 1).toISOString();
}

function classifyProgram(input: CaseInput): ProgramCode {
  if (input.programHint) return input.programHint;
  switch (input.category) {
    case "DISABILITY": return "300-DISABILITY";
    case "HOUSING": return "300-HOUSING";
    case "HEALTH": return "300-HEALTH";
    default: return "300-GENERAL";
  }
}

function inferRoutingTarget(): string {
  return "MUNICIPAL-HUB-PRIMARY";
}

function isIsoTimestamp(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function validateCase(input: CaseInput): string[] {
  const errors: string[] = [];
  if (!input.caseId) errors.push("caseId must be non-empty");
  if (!input.citizenId) errors.push("citizenId must be non-empty");
  if (!input.submittedAt) errors.push("submittedAt must be non-empty");
  else if (!isIsoTimestamp(input.submittedAt)) errors.push("submittedAt must be ISO timestamp");
  if (!input.category) errors.push("category must be provided");
  if (!input.payload || Object.keys(input.payload).length === 0) {
    errors.push("payload must contain at least one key");
  }
  return errors;
}

export function createCase(input: CaseInput): Program300Result {
  const nowIso = makeClock();
  const events: AuditEvent[] = [];

  const record: CaseRecord = {
    ...input,
    status: "NEW",
    resolvedProgram: classifyProgram(input),
    validationErrors: [],
    routingTarget: undefined,
  };

  events.push({
    type: "CASE_CREATED",
    at: nowIso(),
    caseId: input.caseId,
    details: {
      programFamily: PROGRAM_METADATA.programFamily,
      programId: PROGRAM_METADATA.programId,
      resolvedProgram: record.resolvedProgram,
    },
  });

  const validationErrors = validateCase(input);
  record.validationErrors = validationErrors;

  if (validationErrors.length > 0) {
    record.status = "REJECTED";
    events.push({
      type: "CASE_REJECTED",
      at: nowIso(),
      caseId: input.caseId,
      details: { errors: validationErrors },
    });
    return { record, events };
  }

  record.status = "VALIDATED";
  events.push({
    type: "CASE_VALIDATED",
    at: nowIso(),
    caseId: input.caseId,
    details: { resolvedProgram: record.resolvedProgram },
  });

  const routingTarget = inferRoutingTarget();
  record.routingTarget = routingTarget;
  record.status = "ROUTED";

  events.push({
    type: "CASE_ROUTED",
    at: nowIso(),
    caseId: input.caseId,
    details: {
      routingTarget,
      resolvedProgram: record.resolvedProgram,
      programHint: input.programHint ?? null,
    },
  });

  return { record, events };
}
