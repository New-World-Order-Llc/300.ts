export function resolveStateTarget(
  record: { category: string; citizenId: string }
): string {
  let base: string;
  switch (record.category) {
    case "DISABILITY":
      base = "STATE-DISABILITY-AGENCY";
      break;
    case "HOUSING":
      base = "STATE-HOUSING-DEPARTMENT";
      break;
    case "HEALTH":
      base = "STATE-HEALTH-AGENCY";
      break;
    default:
      base = "STATE-GENERAL-SERVICES";
  }

  const suffix = record.citizenId.startsWith("IN-")
    ? "INDIANA-PRIMARY"
    : "OUT-OF-STATE";

  return `${base}-${suffix}`;
}
