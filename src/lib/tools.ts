import { 
  Calculator, 
  Scale, 
  TrendingUp, 
  MapPin, 
  Fuel,
  Receipt,
  Calendar,
  LucideIcon
} from "lucide-react";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  lastModified: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

export const tools: Tool[] = [
  {
    slug: "cost-per-mile",
    title: "Trucking Cost Per Mile Calculator",
    description: "Free trucking CPM calculator for owner-operators. Calculate your true operating cost per mile including fuel, maintenance, insurance, and more.",
    icon: Calculator,
    available: true,
    lastModified: "2025-12-26",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "lease-vs-buy",
    title: "Lease vs Buy Calculator",
    description: "Compare the total cost of leasing versus buying a trailer over time.",
    icon: Scale,
    available: true,
    lastModified: "2025-12-04",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "profit-calculator",
    title: "Trucking Profit Calculator",
    description: "Free owner-operator profit calculator. Estimate your profit margin on each load after all expenses including deadhead miles.",
    icon: TrendingUp,
    available: true,
    lastModified: "2025-12-26",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "ifta-calculator",
    title: "IFTA Tax Estimator",
    description: "Calculate your quarterly IFTA fuel tax obligations by state.",
    icon: MapPin,
    available: true,
    lastModified: "2025-12-04",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "fuel-calculator",
    title: "Fuel Cost Calculator",
    description: "Plan trip fuel costs based on distance, MPG, and current fuel prices.",
    icon: Fuel,
    available: true,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "tax-deductions",
    title: "Owner-Operator Tax Deduction Guide",
    description: "Comprehensive guide to tax deductions for owner-operators and carriers including per diem rates and depreciation.",
    icon: Receipt,
    available: true,
    lastModified: "2025-12-26",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "per-diem-calculator",
    title: "Truck Driver Per Diem Calculator",
    description: "Free per diem calculator for truck drivers. Calculate your annual per diem tax deduction at $69/day based on days away from home.",
    icon: Calendar,
    available: true,
    lastModified: "2025-12-27",
    priority: 0.9,
    changefreq: "monthly"
  }
];

export const BASE_URL = "https://crumsleasing.com";

export const getToolUrl = (slug: string): string => 
  `${BASE_URL}/resources/tools/${slug}`;

export const getToolHref = (slug: string): string => 
  `/resources/tools/${slug}`;

export const getAvailableTools = (): Tool[] => 
  tools.filter(t => t.available);

export const getToolBySlug = (slug: string): Tool | undefined => 
  tools.find(t => t.slug === slug);
