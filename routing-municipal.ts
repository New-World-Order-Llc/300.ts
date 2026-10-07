function baseTarget(category: string): string {
  switch (category) {
    case "DISABILITY":
      return "MUNICIPAL-DISABILITY-OFFICE";
    case "HOUSING":
      return "MUNICIPAL-HOUSING-AUTHORITY";
    case "HEALTH":
      return "MUNICIPAL-HEALTH-DEPARTMENT";
    default:
      return "MUNICIPAL-GENERAL-SERVICES";
  }
}

// Returns "" when citizenId does not end with a digit (no zone refinement).
function zoneSuffix(citizenId: string): string {
  const last = citizenId.charAt(citizenId.length - 1);
  if (last < "0" || last > "9") return "";
  return Number(last) % 2 === 0 ? "-ZONE-A" : "-ZONE-B";
}

export function resolveMunicipalTarget(record: {
  category: string;
  citizenId: string;
}): string {
  return baseTarget(record.category) + zoneSuffix(record.citizenId);
}
