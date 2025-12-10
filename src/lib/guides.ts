import { 
  Truck, 
  ClipboardCheck, 
  Sofa, 
  Snowflake, 
  Wallet, 
  ChefHat, 
  Heart, 
  AlertTriangle, 
  FileCheck, 
  Fuel, 
  GraduationCap, 
  Brain,
  LucideIcon
} from "lucide-react";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  lastModified: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

export const guides: Guide[] = [
  {
    slug: "choosing-trailer",
    title: "How to Choose the Right Trailer for Your Haul",
    description: "Break down the difference between flatbeds, reefers, dry vans, and more — with examples of what jobs fit each type.",
    icon: Truck,
    available: true,
    lastModified: "2025-12-04",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "why-leasing-a-dry-van-trailer-is-a-smart-business-decision",
    title: "Why Leasing a Dry Van Trailer is a Smart Business Decision",
    description: "Discover the financial and operational advantages of leasing dry van trailers versus buying for your trucking business.",
    icon: Wallet,
    available: true,
    lastModified: "2025-12-10",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "pre-trip-inspection",
    title: "How to Check Your Trailer Before Every Trip",
    description: "Quick, visual pre-trip inspection checklist to avoid breakdowns and DOT violations.",
    icon: ClipboardCheck,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "road-comfort",
    title: "How to Stay Comfortable on the Road (Without Breaking the Bank)",
    description: "Cab organization hacks, sleeping tips, and small upgrades to make life easier in your rig.",
    icon: Sofa,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "winter-driving",
    title: "How to Handle Winter Roads Like a Pro",
    description: "Driving tips for snow, black ice awareness, and emergency prep — plus, how CRUMS Leasing maintains equipment for safety.",
    icon: Snowflake,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "budgeting",
    title: "How to Budget as a Truck Driver",
    description: "Simple financial strategies for saving on fuel, meals, and maintenance — linking to CRUMS' mission to help drivers build stability.",
    icon: Wallet,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "truck-cooking",
    title: "How to Cook a Hot Meal in Your Truck",
    description: "Showcase easy recipes using compact appliances (microwave, hot plate, etc.) — home-cooked comfort on the road.",
    icon: ChefHat,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.6,
    changefreq: "monthly"
  },
  {
    slug: "work-life-balance",
    title: "How to Balance Work and Family Time as a Trucker",
    description: "Staying connected with loved ones while on the road — reinforcing CRUMS' family first values.",
    icon: Heart,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "breakdown-safety",
    title: "How to Handle a Breakdown Safely",
    description: "Step-by-step on what to do when stranded — who to call, what to check, and how CRUMS Leasing supports carriers through it.",
    icon: AlertTriangle,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "maximize-lease",
    title: "How to Get the Most Out of Your Lease",
    description: "Tips on maintenance, payments, upgrades, and how to protect your investment — perfect for current and future clients.",
    icon: FileCheck,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.8,
    changefreq: "monthly"
  },
  {
    slug: "fuel-efficiency",
    title: "How to Boost Your Fuel Efficiency",
    description: "Tire pressure, weight distribution, and idle-time tips saving carriers money while promoting CRUMS' well-maintained fleet.",
    icon: Fuel,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "trucking-career",
    title: "How to Build a Career in Trucking",
    description: "Advice on networking, certification, and career progression — highlighting CRUMS as a company that believes in long-term success.",
    icon: GraduationCap,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    slug: "mental-health",
    title: "How to Keep Your Mind Sharp and Positive on the Road",
    description: "Focus on mental health, staying alert, reducing stress, and keeping a positive mindset during long hauls.",
    icon: Brain,
    available: false,
    lastModified: "2025-12-04",
    priority: 0.7,
    changefreq: "monthly"
  }
];

export const BASE_URL = "https://crumsleasing.com";

export const getGuideUrl = (slug: string): string => 
  `${BASE_URL}/resources/guides/${slug}`;

export const getGuideHref = (slug: string): string => 
  `/resources/guides/${slug}`;

export const getAvailableGuides = (): Guide[] => 
  guides.filter(g => g.available);

export const getGuideBySlug = (slug: string): Guide | undefined => 
  guides.find(g => g.slug === slug);
