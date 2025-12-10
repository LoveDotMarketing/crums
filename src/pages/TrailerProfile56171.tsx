import { TrailerProfileTemplate, TrailerProfileData } from "@/components/TrailerProfileTemplate";
import {
  Calendar,
  Truck,
  Hash,
  Ruler,
  Weight,
  Star,
  CheckCircle,
} from "lucide-react";
const trailerImage = "/images/trailers/trailer-56171.webp";
// Inspection Gallery Images - served from public folder for stable sitemap URLs
const exteriorSide = "/images/trailers/56171/exterior-side.webp";
const exteriorFleet = "/images/trailers/56171/exterior-fleet.webp";
const rearDoorsClosed = "/images/trailers/56171/rear-doors-closed.webp";
const rearDoorOpenWheel = "/images/trailers/56171/rear-door-open-wheel.webp";
const doorHingeDetail = "/images/trailers/56171/door-hinge-detail.webp";
const doorVentDetail = "/images/trailers/56171/door-vent-detail.webp";
const interiorRoofWalls = "/images/trailers/56171/interior-roof-walls.webp";
const interiorDoorFrame = "/images/trailers/56171/interior-door-frame.webp";
const interiorFullView = "/images/trailers/56171/interior-full-view.webp";
const interiorLogisticPosts = "/images/trailers/56171/interior-logistic-posts.webp";
const interiorLengthView = "/images/trailers/56171/interior-length-view.webp";
const fmcsaInspectionLabel = "/images/trailers/56171/fmcsa-inspection-label.webp";
const undercarriageSuspension = "/images/trailers/56171/undercarriage-suspension.webp";
const tandemAxleTires = "/images/trailers/56171/tandem-axle-tires.webp";
const dualWheelsCloseup = "/images/trailers/56171/dual-wheels-closeup.webp";
const airRideSuspension = "/images/trailers/56171/air-ride-suspension.webp";
const greatDaneMudflap = "/images/trailers/56171/great-dane-mudflap.webp";
const rearTandemWheels = "/images/trailers/56171/rear-tandem-wheels.webp";
const axleBrakeAssembly = "/images/trailers/56171/axle-brake-assembly.webp";
const sidePanelReflectors = "/images/trailers/56171/side-panel-reflectors.webp";
const fullSideProfile = "/images/trailers/56171/full-side-profile.webp";
const landingGearClearance = "/images/trailers/56171/landing-gear-clearance.webp";

const trailerData: TrailerProfileData = {
  // Basic Info
  unitNumber: "56171",
  year: "2020",
  make: "Great Dane",
  type: "53' Dry Van",
  slug: "commercial-dry-van-trailer-for-lease-56171",
  
  // SEO
  seoTitle: "2020 Dry Van Trailer for Lease - Unit 56171",
  seoDescription: "Lease this well-maintained 2020 53' dry van trailer. Recently returned, fully inspected, and ready to roll. Contact CRUMS Leasing for flexible lease terms.",
  canonicalUrl: "https://crumsleasing.com/commercial-dry-van-trailer-for-lease-56171",
  ogImage: "/images/trailers/trailer-56171.webp",
  
  // Display
  heroTitle: "Dry Van Trailer For Lease",
  heroSubtitle: "Recently returned, inspected, and ready to roll",
  availabilityBadge: "Available Now",
  
  // Images
  mainImage: trailerImage,
  mainImageAlt: "2020 Dry Van Trailer 56171 - CRUMS Leasing",
  schemaImages: [
    "https://crumsleasing.com/images/trailers/trailer-56171.webp",
    "https://crumsleasing.com/images/trailers/56171/exterior-side.webp",
    "https://crumsleasing.com/images/trailers/56171/interior-full-view.webp",
    "https://crumsleasing.com/images/trailers/56171/full-side-profile.webp",
    "https://crumsleasing.com/images/trailers/56171/air-ride-suspension.webp",
  ],
  galleryImages: [
    { src: exteriorSide, alt: "2020 Dry Van Trailer 56171 exterior side view showing clean white panels and trailer number markings" },
    { src: exteriorFleet, alt: "CRUMS Leasing fleet yard with multiple dry van trailers including unit 56171" },
    { src: rearDoorsClosed, alt: "Trailer 56171 rear swing doors closed with safety reflective tape and DOT compliance stickers" },
    { src: rearDoorOpenWheel, alt: "Rear door fully open showing swing door hinges and dual rear wheels in good condition" },
    { src: doorHingeDetail, alt: "Close-up of trailer door hinges and aluminum side wall showing quality construction" },
    { src: doorVentDetail, alt: "Rear door with ventilation panel and door locking mechanism detail" },
    { src: interiorRoofWalls, alt: "Interior view showing aluminum roof crossmembers and corrugated side walls" },
    { src: interiorDoorFrame, alt: "Interior door frame showing aluminum construction and safety decals" },
    { src: interiorFullView, alt: "Full interior cargo area view showing clean wood floor, aluminum walls, and 53-foot length" },
    { src: interiorLogisticPosts, alt: "Interior logistic posts and E-track rails for secure load tie-down and cargo securement" },
    { src: interiorLengthView, alt: "Full-length interior view looking toward front bulkhead showing wood floor condition and cargo space" },
    { src: fmcsaInspectionLabel, alt: "FMCSA annual vehicle inspection label and manufacturer data plate showing DOT compliance" },
    { src: undercarriageSuspension, alt: "Undercarriage view showing air ride suspension system and brake components" },
    { src: tandemAxleTires, alt: "Tandem axle with commercial-grade tires and mud flaps in good condition" },
    { src: dualWheelsCloseup, alt: "Close-up of dual rear wheels showing tire tread depth and wheel condition" },
    { src: airRideSuspension, alt: "Great Dane air ride suspension system with airbags and shock absorbers" },
    { src: greatDaneMudflap, alt: "Great Dane branded mud flap showing manufacturer logo and undercarriage protection" },
    { src: rearTandemWheels, alt: "Rear tandem wheels and axle assembly showing proper tire inflation and alignment" },
    { src: axleBrakeAssembly, alt: "Axle brake assembly and suspension components showing ABS system and air lines" },
    { src: sidePanelReflectors, alt: "Side panel with DOT-required reflective markers and riveted aluminum construction" },
    { src: fullSideProfile, alt: "Full side profile view of 53-foot dry van trailer showing aluminum body, landing gear, and tandem axles" },
    { src: landingGearClearance, alt: "Landing gear clearance marker light and lower panel showing proper ground clearance and DOT reflectors" },
  ],
  
  // Content
  specs: [
    { label: "Year", value: "2020", icon: Calendar },
    { label: "Type", value: "53' Dry Van", icon: Truck },
    { label: "Trailer Number", value: "56171", icon: Hash },
    { label: "Length", value: "53 feet", icon: Ruler },
    { label: "Interior Width", value: "102 inches", icon: Ruler },
    { label: "Interior Height", value: "110 inches", icon: Ruler },
    { label: "Cargo Capacity", value: "45,000 lbs", icon: Weight },
    { label: "Floor Type", value: "Wood", icon: CheckCircle },
    { label: "Door Type", value: "Swing Doors", icon: CheckCircle },
    { label: "Condition", value: "Excellent", icon: Star },
  ],
  features: [
    "Recently returned and professionally inspected",
    "DOT compliant and road-ready",
    "LED exterior lighting",
    "Logistic posts for load securement",
    "Air ride suspension",
    "Anti-lock braking system (ABS)",
    "Aluminum roof",
    "Well-maintained floor and walls",
  ],
  testimonial: {
    quote: "CRUMS Leasing made the whole process easy. The trailer was exactly as described - clean, well-maintained, and ready to work. Their team genuinely cares about their customers.",
    author: "Michael R.",
    role: "Owner Operator",
    rating: 5,
  },
};

const TrailerProfile56171 = () => {
  return <TrailerProfileTemplate data={trailerData} />;
};

export default TrailerProfile56171;
