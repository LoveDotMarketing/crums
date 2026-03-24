import { TrailerProfileTemplate, TrailerProfileData } from "@/components/TrailerProfileTemplate";
import {
  Calendar,
  Truck,
  Hash,
  Ruler,
  Weight,
  CheckCircle,
  Gauge,
  Layers,
} from "lucide-react";

const flatbedImage1 = "/images/trailers/2027-great-dane-flatbed-01.jpg";
const flatbedImage2 = "/images/trailers/2027-great-dane-flatbed-02.jpg";
const flatbedImage3 = "/images/trailers/2027-great-dane-flatbed-03.jpg";

const trailerData: TrailerProfileData = {
  unitNumber: "901015",
  year: "2027",
  make: "Great Dane",
  type: "Flatbed",
  slug: "2027-great-dane-flatbed-trailer-for-lease",

  seoTitle: "2027 Great Dane 53' Flatbed Trailer for Lease",
  seoDescription: "Lease a brand-new 2027 Great Dane 53-foot flatbed trailer. Steel construction, air-ride suspension, 12 winches & tie straps. Available now from CRUMS Leasing.",
  canonicalUrl: "https://crumsleasing.com/2027-great-dane-flatbed-trailer-for-lease",
  ogImage: flatbedImage1,

  heroTitle: "2027 Great Dane 53' Flatbed Trailer",
  heroSubtitle: "Brand-new 53-foot heavy-duty flatbed — available now for lease",
  availabilityBadge: "Available Now",

  mainImage: flatbedImage1,
  mainImageAlt: "2027 Great Dane Flatbed Trailer - CRUMS Leasing",
  schemaImages: [
    "https://crumsleasing.com/images/trailers/2027-great-dane-flatbed-01.jpg",
    "https://crumsleasing.com/images/trailers/2027-great-dane-flatbed-02.jpg",
    "https://crumsleasing.com/images/trailers/2027-great-dane-flatbed-03.jpg",
  ],
  galleryImages: [
    { src: flatbedImage1, alt: "2027 Great Dane Flatbed - Front angle view" },
    { src: flatbedImage2, alt: "2027 Great Dane Flatbed - Side view" },
    { src: flatbedImage3, alt: "2027 Great Dane Flatbed - Rear view" },
  ],

  badges: [
    { text: "2027 Model Year", variant: "outline", className: "border-secondary text-secondary" },
    { text: "Brand New", variant: "default", className: "bg-green-600 text-white" },
    { text: "Flatbed", variant: "outline", className: "border-primary text-primary" },
  ],

  specs: [
    { label: "Year", value: "2027", icon: Calendar },
    { label: "Make / Model", value: "Great Dane FLP-0024-00053", icon: Truck },
    { label: "Type", value: "Flatbed (Kingpin)", icon: Layers },
    { label: "Length", value: "53'", icon: Ruler },
    { label: "Unit Number", value: "901015", icon: Hash },
    { label: "Axles", value: "2", icon: Hash },
    { label: "Color", value: "Black", icon: CheckCircle },
    { label: "Construction", value: "Steel Main Beams", icon: CheckCircle },
    { label: "Suspension", value: "Air Ride", icon: Gauge },
    { label: "Capacity", value: "~48,000 lbs", icon: Weight },
    { label: "Deck", value: "Aluminum / Steel Platform", icon: Ruler },
    { label: "Tie-Downs", value: "12 Winches & Tie Straps", icon: CheckCircle },
    { label: "License Plate", value: "560-5676", icon: Hash },
  ],
  features: [
    "Brand-new 2027 model year",
    "Great Dane heavy-duty flatbed construction",
    "Air-ride suspension for smooth hauling",
    "Multiple D-ring and rub rail tie-downs",
    "Stake pockets throughout for versatile securement",
    "Headache rack / bulkhead included",
    "DOT compliant and road-ready",
    "LED exterior lighting package",
    "Anti-lock braking system (ABS)",
    "Ideal for construction, lumber, steel, and oversized loads",
    "GPS tracking ready",
    "Registered in Maine — CRUMS Leasing LLC",
  ],
  testimonial: {
    quote: "CRUMS Leasing made the whole process easy. The trailer was exactly as described - clean, well-maintained, and ready to work. Their team genuinely cares about their customers.",
    author: "Michael R.",
    role: "Owner Operator",
    rating: 5,
  },
};

const TrailerProfile2027GreatDaneFlatbed = () => {
  return <TrailerProfileTemplate data={trailerData} />;
};

export default TrailerProfile2027GreatDaneFlatbed;
