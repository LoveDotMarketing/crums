export interface VinDecodedResult {
  make: string | null;
  model: string | null;
  year: number | null;
  type: string | null;
  axle_count: number | null;
  body_material: string | null;
  suspension_type: string | null;
}

function mapBodyClassToType(bodyClass: string): string | null {
  if (!bodyClass) return null;
  const lower = bodyClass.toLowerCase();
  if (lower.includes("van") || lower.includes("enclosed")) return "Dry Van";
  if (lower.includes("flatbed") || lower.includes("platform")) return "Flatbed";
  if (lower.includes("refrigerated") || lower.includes("reefer")) return "Refrigerated";
  return null;
}

function extractBodyMaterial(result: any): string | null {
  const fields = [
    result.OtherBodyInfo,
    result.BodyClass,
    result.Note,
  ].filter(Boolean);
  
  const combined = fields.join(" ").toLowerCase();
  const materials: string[] = [];
  
  if (combined.includes("aluminum")) materials.push("Aluminum");
  if (combined.includes("steel")) materials.push("Steel");
  if (combined.includes("fiberglass")) materials.push("Fiberglass");
  if (combined.includes("composite")) materials.push("Composite");
  
  return materials.length > 0 ? materials.join("/") : null;
}

function extractSuspensionType(result: any): string | null {
  const springType = (result.SpringType || "").toLowerCase();
  if (springType.includes("air")) return "air_ride";
  if (springType.includes("spring") || springType.includes("leaf")) return "spring";
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
  
  const axlesStr = result.Axles;
  const axle_count = axlesStr ? parseInt(axlesStr, 10) : null;
  
  const body_material = extractBodyMaterial(result);
  const suspension_type = extractSuspensionType(result);

  return {
    make: make || null,
    model: model || null,
    year: year && !isNaN(year) ? year : null,
    type,
    axle_count: axle_count && !isNaN(axle_count) ? axle_count : null,
    body_material,
    suspension_type,
  };
}
