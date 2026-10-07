export function resolveMunicipalTarget(
  record: { category: string; citizenId: string }
): string {
  let base: string;
  switch (record.category) {
    case "DISABILITY":
      base = "MUNICIPAL-DISABILITY-OFFICE";
      break;
    case "HOUSING":
      base = "MUNICIPAL-HOUSING-AUTHORITY";
      break;
    case "HEALTH":
      base = "MUNICIPAL-HEALTH-DEPARTMENT";
      break;
    default:
      base = "MUNICIPAL-GENERAL-SERVICES";
  }

  const lastChar = record.citizenId.slice(-1);
  if (!/^[0-9]$/.test(lastChar)) return base;

  const digit = Number(lastChar);
  const zone = digit % 2 === 0 ? "ZONE-A" : "ZONE-B";
  return `${base}-${zone}`;
}
