import { CaseInput } from "./300";
import { runProgram300 } from "./pipeline";
import {
  toMunicipalCap,
  toStateCap,
  toFederalCap,
  CapPacket,
} from "./cap-packet";

export interface BeastIntegrationResult {
  programResult: ReturnType<typeof runProgram300>;
  municipalPacket: CapPacket;
  statePacket: CapPacket;
  federalPacket: CapPacket;
}

export function executeProgram300ForBeast(
  input: CaseInput
): BeastIntegrationResult {
  const programResult = runProgram300(input);
  const municipalPacket = toMunicipalCap(programResult);
  const statePacket = toStateCap(programResult);
  const federalPacket = toFederalCap(programResult);

  return {
    programResult,
    municipalPacket,
    statePacket,
    federalPacket,
  };
}
