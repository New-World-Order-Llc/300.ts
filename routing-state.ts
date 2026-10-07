function baseTarget(category: string): string {
  switch (category) {
    case "DISABILITY":
      return "STATE-DISABILITY-AGENCY";
    case "HOUSING":
      return "STATE-HOUSING-DEPARTMENT";
    case "HEALTH":
      return "STATE-HEALTH-AGENCY";
    default:
      return "STATE-GENERAL-SERVICES";
  }
}

export function resolveStateTarget(record: {
  category: string;
  citizenId: string;
}): string {
  const suffix = record.citizenId.startsWith("IN-")
    ? "-INDIANA-PRIMARY"
    : "-OUT-OF-STATE";
  return baseTarget(record.category) + suffix;
}
