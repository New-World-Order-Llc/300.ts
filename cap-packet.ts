import { Program300Result } from "./300";

export interface CapPacket {
  id: string;
  source: string;
  sent: string;
  scope: "Municipal" | "State" | "Federal";
  category: string;
  payload: Record<string, unknown>;
}

export function toMunicipalCap(result: Program300Result): CapPacket {
  return {
    id: result.record.caseId,
    source: "PROGRAM-300-MUNICIPAL",
    sent: result.record.submittedAt,
    scope: "Municipal",
    category: result.record.category,
    payload: {
      routingTarget: result.record.routingTarget,
      resolvedProgram: result.record.resolvedProgram,
      status: result.record.status,
    },
  };
}

export function toStateCap(result: Program300Result): CapPacket {
  return {
    id: result.record.caseId,
    source: "PROGRAM-300-STATE",
    sent: result.record.submittedAt,
    scope: "State",
    category: result.record.category,
    payload: {
      resolvedProgram: result.record.resolvedProgram,
      validationErrors: result.record.validationErrors,
    },
  };
}

export function toFederalCap(result: Program300Result): CapPacket {
  return {
    id: result.record.caseId,
    source: "PROGRAM-300-FEDERAL",
    sent: result.record.submittedAt,
    scope: "Federal",
    category: result.record.category,
    payload: {
      resolvedProgram: result.record.resolvedProgram,
    },
  };
}
