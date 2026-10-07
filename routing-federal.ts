function baseTarget(category: string): string {
  switch (category) {
    case "DISABILITY":
      return "FEDERAL-DISABILITY-ADMINISTRATION";
    case "HOUSING":
      return "FEDERAL-HOUSING-AGENCY";
    case "HEALTH":
      return "FEDERAL-HEALTH-AGENCY";
    default:
      return "FEDERAL-GENERAL-SERVICES";
  }
}

export function resolveFederalTarget(record: {
  category: string;
  citizenId: string;
}): string {
  return baseTarget(record.category);
}
