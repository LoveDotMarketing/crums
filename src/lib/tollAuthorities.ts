// Toll authority contact information for common US toll agencies
export interface TollAuthority {
  name: string;
  phone: string;
  website: string;
  paymentUrl?: string;
}

export const tollAuthorities: Record<string, TollAuthority> = {
  // Texas
  "NTTA": {
    name: "North Texas Tollway Authority",
    phone: "972-818-6882",
    website: "https://www.ntta.org",
    paymentUrl: "https://www.ntta.org/custinfo/Pages/default.aspx"
  },
  "TxTag": {
    name: "TxTag (TxDOT)",
    phone: "888-468-9824",
    website: "https://www.txtag.org",
    paymentUrl: "https://www.txtag.org/en/home/index.shtml"
  },
  "HCTRA": {
    name: "Harris County Toll Road Authority",
    phone: "281-875-3279",
    website: "https://www.hctra.org",
    paymentUrl: "https://www.hctra.org/PayMyBill"
  },
  // Florida
  "SunPass": {
    name: "Florida SunPass",
    phone: "888-865-5352",
    website: "https://www.sunpass.com",
    paymentUrl: "https://www.sunpass.com/en/payments/payTolls.shtml"
  },
  "CFX": {
    name: "Central Florida Expressway Authority",
    phone: "407-690-5000",
    website: "https://www.cfxway.com",
    paymentUrl: "https://www.cfxway.com/tolls-account/pay-your-toll/"
  },
  // Northeast
  "E-ZPass": {
    name: "E-ZPass",
    phone: "800-333-8655",
    website: "https://www.e-zpassiag.com",
    paymentUrl: "https://www.e-zpassiag.com"
  },
  "NJTA": {
    name: "New Jersey Turnpike Authority",
    phone: "732-750-5300",
    website: "https://www.njta.com",
    paymentUrl: "https://www.njta.com/tolls"
  },
  "PANYNJ": {
    name: "Port Authority of NY & NJ",
    phone: "800-333-8655",
    website: "https://www.panynj.gov",
    paymentUrl: "https://www.panynj.gov/bridges-tunnels/en/tolls.html"
  },
  // Mid-Atlantic
  "Delaware": {
    name: "Delaware Toll Authority",
    phone: "888-397-1555",
    website: "https://www.ezpassde.com",
    paymentUrl: "https://www.ezpassde.com"
  },
  "MdTA": {
    name: "Maryland Transportation Authority",
    phone: "888-321-6824",
    website: "https://www.mdta.maryland.gov",
    paymentUrl: "https://www.driveezmd.com"
  },
  // Illinois
  "ISTHA": {
    name: "Illinois Tollway",
    phone: "800-824-7277",
    website: "https://www.illinoistollway.com",
    paymentUrl: "https://www.illinoistollway.com/tolling-information/unpaid-tolls"
  },
  // Indiana
  "ITR": {
    name: "Indiana Toll Road",
    phone: "574-675-4010",
    website: "https://www.indianatollroad.org",
    paymentUrl: "https://www.indianatollroad.org"
  },
  // Ohio
  "OTIC": {
    name: "Ohio Turnpike",
    phone: "440-971-2222",
    website: "https://www.ohioturnpike.org",
    paymentUrl: "https://www.ohioturnpike.org"
  },
  // Pennsylvania
  "PTC": {
    name: "Pennsylvania Turnpike Commission",
    phone: "877-736-6727",
    website: "https://www.paturnpike.com",
    paymentUrl: "https://www.paturnpike.com/toll-by-plate"
  },
  // California
  "FasTrak": {
    name: "California FasTrak",
    phone: "877-229-8655",
    website: "https://www.bayareafastrak.org",
    paymentUrl: "https://www.bayareafastrak.org"
  },
  // Georgia
  "Peach Pass": {
    name: "Georgia Peach Pass",
    phone: "855-724-7277",
    website: "https://www.peachpass.com",
    paymentUrl: "https://www.peachpass.com"
  },
  // Oklahoma
  "Pikepass": {
    name: "Oklahoma Turnpike Authority",
    phone: "800-745-3727",
    website: "https://www.pikepass.com",
    paymentUrl: "https://www.pikepass.com"
  },
  // Colorado
  "ExpressToll": {
    name: "Colorado E-470 / ExpressToll",
    phone: "303-537-3470",
    website: "https://www.expresstoll.com",
    paymentUrl: "https://www.expresstoll.com"
  },
  // Kansas
  "KTA": {
    name: "Kansas Turnpike Authority",
    phone: "800-873-8757",
    website: "https://www.ksturnpike.com",
    paymentUrl: "https://www.ksturnpike.com"
  }
};

// Helper function to find toll authority info (fuzzy match)
export function findTollAuthority(authorityName: string | null | undefined): TollAuthority | null {
  if (!authorityName) return null;
  
  const normalized = authorityName.trim().toLowerCase();
  
  // Direct match
  for (const [key, value] of Object.entries(tollAuthorities)) {
    if (key.toLowerCase() === normalized || value.name.toLowerCase() === normalized) {
      return value;
    }
  }
  
  // Partial match
  for (const [key, value] of Object.entries(tollAuthorities)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized) ||
        normalized.includes(value.name.toLowerCase()) || value.name.toLowerCase().includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

// Get all authority names for dropdown
export function getTollAuthorityOptions(): { value: string; label: string }[] {
  return Object.entries(tollAuthorities).map(([key, value]) => ({
    value: key,
    label: value.name
  }));
}
