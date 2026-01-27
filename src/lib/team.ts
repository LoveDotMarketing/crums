import { LucideIcon, Users, Crown, Heart, Calculator } from "lucide-react";

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  title: string;
  icon: LucideIcon;
  headshot?: string;
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
    headshot: "/images/team/mama-crums.webp",
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
    role: "CEO / Principal",
    title: "Chief Executive Officer & Principal",
    icon: Users,
    headshot: "/images/team/eric.webp",
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
    slug: "ambrosia",
    name: "Ambrosia",
    role: "BOM",
    title: "Business Operations Manager",
    icon: Heart,
    headshot: "/images/team/ambrosia.webp",
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
];

export const getTeamMemberBySlug = (slug: string): TeamMember | undefined =>
  teamMembers.find(m => m.slug === slug);

export const getTeamMemberUrl = (slug: string): string =>
  `/about/${slug}`;
