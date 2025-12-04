import { LucideIcon, Users, Crown, Truck, Heart, Calculator, Megaphone } from "lucide-react";

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  title: string;
  icon: LucideIcon;
  bio: string[];
  email?: string;
  phone?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  specialties?: string[];
  funFacts?: string[];
}

export const teamMembers: TeamMember[] = [
  {
    slug: "mama-crums",
    name: "Mama CRUMS",
    role: "Founder",
    title: "The Heart Behind CRUMS",
    icon: Crown,
    bio: [
      "Mama CRUMS is the inspiration behind everything we do at CRUMS Leasing. Her values of hard work, integrity, and dedication to family are the foundation upon which this company was built.",
      "She taught us that success isn't just about business — it's about the lives you touch and the people you help along the way. Every decision we make is guided by her wisdom.",
      "Her belief that every hardworking carrier deserves the freedom and stability to build a better life for their family continues to drive our mission today."
    ],
    specialties: ["Family Values", "Company Vision", "Core Principles"],
    funFacts: [
      "The CRUMS name honors her legacy",
      "Believes in always doing right by people",
      "Her kitchen table is where CRUMS Leasing began"
    ]
  },
  {
    slug: "eric",
    name: "Eric",
    role: "CEO",
    title: "Chief Executive Officer",
    icon: Users,
    bio: [
      "As CEO of CRUMS Leasing, Eric leads the company with the same values instilled by Mama CRUMS — integrity, hard work, and a genuine commitment to helping carriers succeed.",
      "With a deep understanding of the trucking industry and a passion for serving owner-operators, Eric has grown CRUMS Leasing from a family vision into a nationwide enterprise.",
      "He believes that treating every customer like family isn't just good business — it's the only way to do business."
    ],
    specialties: ["Strategic Leadership", "Business Development", "Industry Partnerships"],
    funFacts: [
      "Started in the trucking industry from the ground up",
      "Knows most long-time customers by name",
      "Always available to talk with carriers directly"
    ]
  },
  {
    slug: "hector",
    name: "Hector",
    role: "Fleet Management",
    title: "Fleet Management Director",
    icon: Truck,
    bio: [
      "Hector oversees all fleet operations at CRUMS Leasing, ensuring every trailer meets our high standards of quality and reliability before it hits the road.",
      "With years of hands-on experience in equipment maintenance and fleet logistics, Hector knows trailers inside and out. His expertise keeps our fleet running smoothly and our customers moving forward.",
      "He takes pride in the CRUMS commitment to well-maintained equipment — because he knows that for carriers, downtime means lost income."
    ],
    specialties: ["Fleet Operations", "Equipment Maintenance", "Quality Assurance", "Logistics"],
    funFacts: [
      "Can diagnose most trailer issues by sound alone",
      "Personally inspects every trailer before lease",
      "Passionate about keeping carriers safe on the road"
    ]
  },
  {
    slug: "ambrosia",
    name: "Ambrosia",
    role: "Customer Relations",
    title: "Customer Relations Manager",
    icon: Heart,
    bio: [
      "Ambrosia is the friendly voice of CRUMS Leasing, dedicated to making every customer interaction positive and productive.",
      "She believes that great customer service means listening first and solving problems with empathy. Whether you're a new carrier or a long-time partner, Ambrosia treats everyone like family.",
      "Her goal is simple: make sure every carrier who works with CRUMS feels valued, supported, and set up for success."
    ],
    specialties: ["Customer Support", "Account Management", "Problem Resolution", "Onboarding"],
    funFacts: [
      "Remembers details about customers' families",
      "Goes above and beyond to solve problems",
      "Believes every call is an opportunity to help"
    ]
  },
  {
    slug: "jr",
    name: "Jr",
    role: "Accounting",
    title: "Accounting Manager",
    icon: Calculator,
    bio: [
      "Jr manages all financial operations at CRUMS Leasing with precision and integrity, ensuring smooth billing, payments, and financial processes.",
      "He understands that cash flow is critical for owner-operators and small carriers, so he works to make our payment and billing processes as transparent and hassle-free as possible.",
      "Jr's attention to detail keeps the financial side of CRUMS running smoothly, so our team can focus on what matters most — serving our customers."
    ],
    specialties: ["Financial Management", "Billing & Invoicing", "Payment Processing", "Budgeting"],
    funFacts: [
      "Passionate about clear, transparent billing",
      "Always happy to explain invoices in detail",
      "Believes in making finances stress-free for carriers"
    ]
  },
  {
    slug: "john",
    name: "John",
    role: "Marketing",
    title: "Marketing Director",
    icon: Megaphone,
    bio: [
      "John leads marketing efforts at CRUMS Leasing, spreading the word about our people-first approach to trailer leasing.",
      "He's passionate about telling the CRUMS story — not just what we do, but why we do it. From our website to our industry guides, John ensures our message reaches carriers who can benefit from partnering with us.",
      "His focus is on authentic communication that reflects CRUMS' true values, helping carriers understand that we're not just a leasing company — we're a partner on the road to success."
    ],
    specialties: ["Brand Strategy", "Content Marketing", "Digital Presence", "Industry Outreach"],
    funFacts: [
      "Created the CRUMS Industry Guides series",
      "Loves hearing success stories from carriers",
      "Believes the best marketing is happy customers"
    ]
  }
];

export const getTeamMemberBySlug = (slug: string): TeamMember | undefined =>
  teamMembers.find(m => m.slug === slug);

export const getTeamMemberUrl = (slug: string): string =>
  `/about/${slug}`;
