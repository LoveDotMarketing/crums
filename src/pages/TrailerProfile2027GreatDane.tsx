import { TrailerProfileTemplate, TrailerProfileData } from "@/components/TrailerProfileTemplate";
import {
  Calendar,
  Truck,
  Hash,
  Ruler,
  Weight,
  Star,
  CheckCircle,
  Gauge,
  Layers,
} from "lucide-react";

const dryVanImage = "/images/dry-van-trailer.webp";

const trailerData: TrailerProfileData = {
  // Basic Info
  unitNumber: "2027-Fleet",
  year: "2027",
  make: "Great Dane",
  type: "53' Dry Van",
  slug: "2027-great-dane-dry-van-trailer-for-lease",

  // SEO
  seoTitle: "2027 Great Dane Dry Van Trailers for Lease",
  seoDescription: "Lease a brand-new 2027 Great Dane Champion 53' composite plate dry van trailer. Hendrickson ULTRAAK air-ride, composite swing doors, FleetPulseGo telematics. 20 units available.",
  canonicalUrl: "https://crumsleasing.com/2027-great-dane-dry-van-trailer-for-lease",
  ogImage: "/images/dry-van-trailer.webp",

  // Display
  heroTitle: "2027 Great Dane Champion Dry Van",
  heroSubtitle: "Brand-new composite plate vans — 20 units available and ready for lease",
  availabilityBadge: "New 2027 Fleet",

  // Images
  mainImage: dryVanImage,
  mainImageAlt: "2027 Great Dane Champion Composite Plate 53' Dry Van Trailer - CRUMS Leasing",
  schemaImages: [
    "https://crumsleasing.com/images/dry-van-trailer.webp",
  ],
  galleryImages: [],

  // Badges
  badges: [
    { text: "2027 Model Year", variant: "outline", className: "border-secondary text-secondary" },
    { text: "20 Units Available", variant: "outline", className: "border-primary text-primary" },
    { text: "Brand New", variant: "default", className: "bg-green-600 text-white" },
  ],

  // Content
  specs: [
    { label: "Year", value: "2027", icon: Calendar },
    { label: "Make / Model", value: "Great Dane Champion CCC-3314-21053", icon: Truck },
    { label: "Type", value: "Composite Plate Van", icon: Layers },
    { label: "Length", value: "53'", icon: Ruler },
    { label: "Width (Inside)", value: "102.36\"", icon: Ruler },
    { label: "Height", value: "13'6\"", icon: Ruler },
    { label: "Axles", value: "Tandem, Slide Air-Ride", icon: Gauge },
    { label: "Suspension", value: "Hendrickson ULTRAAK 40K", icon: Gauge },
    { label: "Tires", value: "295/75R 22.5 Bridgestone Ecopia", icon: CheckCircle },
    { label: "Brakes", value: "16.50\" x 7.00\" with Wabco 2S/1M iABS", icon: CheckCircle },
    { label: "Floor", value: "1.38\" Hardwood Laminated", icon: CheckCircle },
    { label: "Doors", value: "Composite Swing Doors", icon: CheckCircle },
    { label: "Side Skirts", value: "Energy Guard", icon: CheckCircle },
    { label: "Units Available", value: "20", icon: Hash },
  ],
  features: [
    "Brand-new 2027 model year",
    "Great Dane Champion composite plate construction",
    "Hendrickson ULTRAAK 40K air-ride suspension",
    "Composite swing doors with rubber bumpers",
    "1.38\" hardwood laminated floor",
    "Energy Guard aerodynamic side skirts",
    "FleetPulseGo telematics tracking system",
    "DOT compliant and road-ready",
    "LED exterior lighting package",
    "Logistic posts for load securement",
    "Anti-lock braking system (ABS)",
    "Aluminum roof with interior liner",
  ],
  testimonial: {
    quote: "CRUMS Leasing made the whole process easy. The trailer was exactly as described - clean, well-maintained, and ready to work. Their team genuinely cares about their customers.",
    author: "Michael R.",
    role: "Owner Operator",
    rating: 5,
  },
};

const TrailerProfile2027GreatDane = () => {
  return <TrailerProfileTemplate data={trailerData} />;
};

export default TrailerProfile2027GreatDane;
