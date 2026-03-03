export interface VinDecodedResult {
  make: string | null;
  model: string | null;
  year: number | null;
  type: string | null;
}

function mapBodyClassToType(bodyClass: string): string | null {
  if (!bodyClass) return null;
  const lower = bodyClass.toLowerCase();
  if (lower.includes("van") || lower.includes("enclosed")) return "Dry Van";
  if (lower.includes("flatbed") || lower.includes("platform")) return "Flatbed";
  if (lower.includes("refrigerated") || lower.includes("reefer")) return "Refrigerated";
  return null;
}

export async function decodeVin(vin: string): Promise<VinDecodedResult> {
  const trimmed = vin.trim();
  if (trimmed.length !== 17) {
    throw new Error("VIN must be exactly 17 characters");
  }

  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${trimmed}?format=json`
  );

  if (!response.ok) {
    throw new Error("Failed to reach NHTSA API");
  }

  const data = await response.json();
  const result = data.Results?.[0];

  if (!result || result.ErrorCode?.split(",").map((c: string) => c.trim()).includes("0") === false) {
    // ErrorCode "0" means no errors; anything else may indicate issues
  }

  const make = result.Make || null;
  const model = result.Model || null;
  const yearStr = result.ModelYear;
  const year = yearStr ? parseInt(yearStr, 10) : null;
  const type = mapBodyClassToType(result.BodyClass || "");

  return {
    make: make || null,
    model: model || null,
    year: year && !isNaN(year) ? year : null,
    type,
  };
}
