export function resolveFederalTarget(
  record: { category: string; citizenId: string }
): string {
  let base: string;
  switch (record.category) {
    case "DISABILITY":
      base = "FEDERAL-SOCIAL-SECURITY-ADMIN";
      break;
    case "HOUSING":
      base = "FEDERAL-HUD";
      break;
    case "HEALTH":
      base = "FEDERAL-HHS";
      break;
    default:
      base = "FEDERAL-GENERAL-SERVICES";
  }

  const scope = record.citizenId.startsWith("US-")
    ? "DOMESTIC"
    : "INTERNATIONAL";

  return `${base}-${scope}`;
}
