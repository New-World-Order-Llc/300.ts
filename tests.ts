import { runProgram300 } from "./pipeline";
import { resolveMunicipalTarget } from "./routing-municipal";
import { resolveStateTarget } from "./routing-state";
import { resolveFederalTarget } from "./routing-federal";

function check(cond: boolean, msg: string): void {
  if (!cond) throw new Error("FAIL: " + msg);
}

const base = {
  caseId: "c1",
  citizenId: "IN-124",
  submittedAt: "2026-01-01T00:00:00Z",
  category: "HOUSING" as const,
  payload: { a: 1 },
};

const ok = runProgram300(base);
check(ok.events.map((e) => e.type).join() === "CASE_CREATED,CASE_VALIDATED,CASE_ROUTED", "valid events");
check(ok.record.routingTarget === "MUNICIPAL-HOUSING-AUTHORITY-ZONE-A", "municipal target");
check(ok.record.stateTarget === "STATE-HOUSING-DEPARTMENT-INDIANA-PRIMARY", "state target");
check(ok.record.federalTarget === "FEDERAL-HOUSING-AGENCY", "federal target");
check(ok.record.program === "300-HOUSING", "program");
check(JSON.stringify(runProgram300(base)) === JSON.stringify(ok), "deterministic");

const bad = runProgram300({ ...base, payload: {} });
check(bad.events.map((e) => e.type).join() === "CASE_CREATED,CASE_REJECTED", "rejected events");
check(bad.record.routingTarget === null, "rejected has no route");

const badTs = runProgram300({ ...base, submittedAt: "yesterday" });
check(badTs.record.status === "REJECTED", "bad timestamp rejected");

let threw = false;
try {
  runProgram300({ ...base, caseId: 5 as unknown as string });
} catch (e) {
  threw = e instanceof TypeError;
}
check(threw, "structural TypeError");

check(resolveMunicipalTarget({ category: "HEALTH", citizenId: "A7" }) === "MUNICIPAL-HEALTH-DEPARTMENT-ZONE-B", "municipal odd");
check(resolveMunicipalTarget({ category: "X", citizenId: "A" }) === "MUNICIPAL-GENERAL-SERVICES", "municipal no digit");
check(resolveStateTarget({ category: "HEALTH", citizenId: "TX-1" }) === "STATE-HEALTH-AGENCY-OUT-OF-STATE", "state out");
check(resolveFederalTarget({ category: "DISABILITY", citizenId: "1" }) === "FEDERAL-DISABILITY-ADMINISTRATION", "federal");
