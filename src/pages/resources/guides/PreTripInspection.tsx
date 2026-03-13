import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  BookOpen,
  Printer,
  RotateCcw,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Phone,
  CircleDot,
  Gauge,
  Lightbulb,
  Shield,
  FileCheck
} from "lucide-react";

// Article metadata
const articleData = {
  title: "How to Check Your Trailer Before Every Trip",
  description: "Complete pre-trip inspection checklist for truck drivers. Follow FMCSA 393.75 requirements to avoid breakdowns, DOT violations, and roadside failures.",
  publishedDate: "2026-01-20",
  updatedDate: "2026-01-20",
  readTime: "10 min read",
  author: "Eric",
  authorSlug: "eric"
};

// Structured data for SEO
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": articleData.title,
  "description": articleData.description,
  "datePublished": articleData.publishedDate,
  "dateModified": articleData.updatedDate,
  "author": {
    "@type": "Person",
    "name": "Eric",
    "url": "https://crumsleasing.com/about/eric",
    "jobTitle": "CEO / Principal"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://crumsleasing.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://crumsleasing.com/resources/guides/pre-trip-inspection"
  }
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a pre-trip inspection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A pre-trip inspection is a systematic check of your commercial vehicle and trailer before operating it. Required by FMCSA regulations (49 CFR 396.13), drivers must inspect their vehicles before each trip to ensure all safety equipment is in proper working condition."
      }
    },
    {
      "@type": "Question",
      "name": "Is pre-trip inspection required by law?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Federal Motor Carrier Safety Regulations require commercial motor vehicle drivers to perform pre-trip inspections before each day's first trip. Failure to conduct proper inspections can result in fines, out-of-service orders, and CSA points that affect your safety rating."
      }
    },
    {
      "@type": "Question",
      "name": "How long does a pre-trip inspection take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A thorough pre-trip inspection typically takes 15-30 minutes depending on the vehicle type and your experience level. This investment of time can prevent costly breakdowns, accidents, and regulatory violations that would take much longer to resolve."
      }
    },
    {
      "@type": "Question",
      "name": "What are the main areas to check in a trailer pre-trip inspection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The main areas include: tires and wheels (inflation, tread depth, lug nuts), brakes and air system (pads, lines, glad hands), lights and reflectors (all marker, brake, and turn lights), coupling equipment (fifth wheel, kingpin, landing gear), doors and seals (latches, hinges), and body/frame condition."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if I fail a DOT inspection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Failing a DOT inspection can result in an out-of-service order (vehicle cannot move until repaired), fines ranging from $180 to $16,000+ depending on violations, CSA points affecting your safety score, and potential loss of operating authority for severe or repeated violations."
      }
    }
  ]
};

// HowTo Schema for rich snippets
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Perform a Commercial Trailer Pre-Trip Inspection",
  "description": "Complete step-by-step guide to inspecting your semi-trailer before every trip to ensure FMCSA compliance and roadside safety.",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Inspect Tires & Wheels",
      "text": "Check tire pressure (95-110 PSI typical), tread depth (minimum 4/32\" steer, 2/32\" drive/trailer), sidewall condition, valve stems, lug nuts, rims, and hub seals."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Check Brakes & Air System",
      "text": "Verify air pressure builds to 120-140 PSI, no air leaks, glad hands sealed, air lines intact, brake chambers secure, slack adjusters properly adjusted, and spring brakes release properly."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Test Lights & Reflectors",
      "text": "Test all marker lights, brake lights, turn signals, clearance lights. Check for broken lenses, intact reflective tape (DOT-C2), and functioning ABS indicator."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Verify Coupling Equipment",
      "text": "Confirm fifth wheel locked around kingpin with no gap, kingpin condition, apron plate intact, landing gear raised and secure, and release handle in locked position."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Examine Doors & Seals",
      "text": "Test rear doors open/close freely, check hinges, latch mechanisms, weather seals, door handles, and security seals if required."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Inspect Body & Frame",
      "text": "Examine floor for holes or soft spots, sidewalls and roof condition, frame for cracks, mud flaps presence, and undercarriage components."
    },
    {
      "@type": "HowToStep",
      "position": 7,
      "name": "Verify Documentation & Equipment",
      "text": "Confirm current registration, valid annual inspection sticker, available load securement equipment, emergency triangles, and charged fire extinguisher."
    }
  ]
};

// Breadcrumb Schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "https://crumsleasing.com/" },
  { name: "Resources", url: "https://crumsleasing.com/resources" },
  { name: "Industry Guides", url: "https://crumsleasing.com/resources/guides" },
  { name: "Pre-Trip Inspection Checklist", url: "https://crumsleasing.com/resources/guides/pre-trip-inspection" }
]);

const guideNavigation = {
  previous: {
    title: "Trailer Specifications Guide",
    href: "/resources/guides/trailer-specifications"
  },
  next: {
    title: "Choosing the Right Trailer",
    href: "/resources/guides/choosing-trailer"
  }
};

// Inspection categories with items
interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface InspectionCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  items: ChecklistItem[];
  notes: string;
}

const initialCategories: InspectionCategory[] = [
  {
    id: "tires",
    title: "Tires & Wheels",
    icon: CircleDot,
    description: "Check all tires for proper inflation, tread depth, and wheel condition.",
    items: [
      { id: "tires-1", label: "Tire pressure within manufacturer specs (95-110 PSI typical)", checked: false },
      { id: "tires-2", label: "Tread depth minimum 4/32\" for steer, 2/32\" for drive/trailer", checked: false },
      { id: "tires-3", label: "No cuts, bulges, or exposed cords on sidewalls", checked: false },
      { id: "tires-4", label: "All valve stems present with caps", checked: false },
      { id: "tires-5", label: "Matching tire sizes on each axle", checked: false },
      { id: "tires-6", label: "Lug nuts tight and none missing", checked: false },
      { id: "tires-7", label: "Rims free of cracks, dents, or damage", checked: false },
      { id: "tires-8", label: "Hub seals not leaking oil", checked: false }
    ],
    notes: ""
  },
  {
    id: "brakes",
    title: "Brakes & Air System",
    icon: Gauge,
    description: "Verify brake components and air system integrity for safe stopping.",
    items: [
      { id: "brakes-1", label: "Air pressure builds to governor cut-out (120-140 PSI)", checked: false },
      { id: "brakes-2", label: "No audible air leaks at connections", checked: false },
      { id: "brakes-3", label: "Glad hands sealed and secured properly", checked: false },
      { id: "brakes-4", label: "Air lines not rubbing, cracked, or kinked", checked: false },
      { id: "brakes-5", label: "Brake chambers secure and not cracked", checked: false },
      { id: "brakes-6", label: "Slack adjusters properly adjusted (< 1\" travel)", checked: false },
      { id: "brakes-7", label: "Brake pads/shoes have adequate material", checked: false },
      { id: "brakes-8", label: "Spring brakes release properly", checked: false },
      { id: "brakes-9", label: "Low air warning activates at 60 PSI", checked: false }
    ],
    notes: ""
  },
  {
    id: "lights",
    title: "Lights & Reflectors",
    icon: Lightbulb,
    description: "Ensure all lighting and reflective equipment is operational.",
    items: [
      { id: "lights-1", label: "All marker lights operational (front, side, rear)", checked: false },
      { id: "lights-2", label: "Brake lights illuminate when brakes applied", checked: false },
      { id: "lights-3", label: "Turn signals working (left and right)", checked: false },
      { id: "lights-4", label: "Clearance lights functional", checked: false },
      { id: "lights-5", label: "No broken or cracked lenses", checked: false },
      { id: "lights-6", label: "Reflective tape intact (DOT-C2 conspicuity)", checked: false },
      { id: "lights-7", label: "License plate light working", checked: false },
      { id: "lights-8", label: "ABS indicator light functioning", checked: false }
    ],
    notes: ""
  },
  {
    id: "coupling",
    title: "Coupling Equipment",
    icon: FileCheck,
    description: "Inspect fifth wheel, kingpin, and landing gear for secure connection.",
    items: [
      { id: "coupling-1", label: "Fifth wheel locked around kingpin (no gap)", checked: false },
      { id: "coupling-2", label: "Kingpin not bent, cracked, or worn", checked: false },
      { id: "coupling-3", label: "Apron plate not damaged or bent", checked: false },
      { id: "coupling-4", label: "Landing gear fully raised and secure", checked: false },
      { id: "coupling-5", label: "Landing gear crank handle stowed", checked: false },
      { id: "coupling-6", label: "No visible cracks in fifth wheel plate", checked: false },
      { id: "coupling-7", label: "Release handle in locked position", checked: false },
      { id: "coupling-8", label: "Slide pins locked (if sliding fifth wheel)", checked: false }
    ],
    notes: ""
  },
  {
    id: "doors",
    title: "Doors & Seals",
    icon: Shield,
    description: "Check door operation and cargo protection.",
    items: [
      { id: "doors-1", label: "Rear doors open/close freely", checked: false },
      { id: "doors-2", label: "Door hinges not bent or broken", checked: false },
      { id: "doors-3", label: "Latch mechanisms lock securely", checked: false },
      { id: "doors-4", label: "Weather seals intact (no gaps)", checked: false },
      { id: "doors-5", label: "Door handles operational", checked: false },
      { id: "doors-6", label: "Safety/security seal in place if required", checked: false }
    ],
    notes: ""
  },
  {
    id: "body",
    title: "Body & Frame",
    icon: ClipboardCheck,
    description: "Examine trailer structure and undercarriage.",
    items: [
      { id: "body-1", label: "Floor intact with no holes or soft spots", checked: false },
      { id: "body-2", label: "Sidewalls and roof free of holes/damage", checked: false },
      { id: "body-3", label: "No frame cracks or visible damage", checked: false },
      { id: "body-4", label: "Mud flaps present and secured", checked: false },
      { id: "body-5", label: "Undercarriage components secure", checked: false },
      { id: "body-6", label: "No sharp edges that could injure or damage cargo", checked: false },
      { id: "body-7", label: "Logistic posts/E-track in good condition", checked: false }
    ],
    notes: ""
  },
  {
    id: "documentation",
    title: "Documentation & Equipment",
    icon: FileCheck,
    description: "Verify all required documents and safety equipment.",
    items: [
      { id: "docs-1", label: "Current registration on file", checked: false },
      { id: "docs-2", label: "Annual inspection sticker valid (within 12 months)", checked: false },
      { id: "docs-3", label: "Load securement equipment available (straps, bars)", checked: false },
      { id: "docs-4", label: "Triangles/reflectors for emergency use", checked: false },
      { id: "docs-5", label: "Fire extinguisher present and charged", checked: false }
    ],
    notes: ""
  }
];

const PreTripInspection = () => {
  const [categories, setCategories] = useState<InspectionCategory[]>(initialCategories);
  const printRef = useRef<HTMLDivElement>(null);

  const handleItemChange = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      }
      return cat;
    }));
  };

  const handleNotesChange = (categoryId: string, notes: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, notes } : cat
    ));
  };

  const resetChecklist = () => {
    setCategories(initialCategories);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate progress
  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = categories.reduce((acc, cat) => 
    acc + cat.items.filter(item => item.checked).length, 0
  );
  const progressPercent = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const getCategoryStatus = (category: InspectionCategory) => {
    const checked = category.items.filter(i => i.checked).length;
    const total = category.items.length;
    if (checked === 0) return "not-started";
    if (checked === total) return "complete";
    return "in-progress";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={articleData.title}
        description={articleData.description}
        canonical="https://crumsleasing.com/resources/guides/pre-trip-inspection"
        structuredData={[articleSchema, faqSchema, howToSchema, breadcrumbSchema]}
        article={{
          publishedTime: articleData.publishedDate,
          modifiedTime: articleData.updatedDate,
          section: "Industry Guides",
          author: articleData.author
        }}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-20 overflow-hidden print:hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="h-3 w-3 mr-1" />
              Interactive Guide
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {articleData.title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              A comprehensive pre-trip inspection checklist aligned with FMCSA 393.75 requirements. Check each item before every trip to stay safe, compliant, and on the road.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {articleData.readTime}
              </span>
              <span>•</span>
              <span>By <Link to={`/about/${articleData.authorSlug}`} className="underline hover:text-primary-foreground transition-colors">{articleData.author}</Link></span>
              <span>•</span>
              <span>Updated {new Date(articleData.updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Main Content */}
      <article className="py-16 bg-background" ref={printRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <section className="prose prose-lg max-w-none mb-12 print:hidden">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Every professional driver knows that a thorough pre-trip inspection is the foundation of a safe journey. According to the <strong>Federal Motor Carrier Safety Administration (FMCSA)</strong>, vehicle maintenance issues contribute to over <strong>10% of all truck crashes</strong>. A proper pre-trip inspection can catch these problems before they cause breakdowns, accidents, or costly DOT violations.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At <strong>CRUMS Leasing</strong>, we maintain our fleet to the highest standards so your inspections go smoothly. Use this interactive checklist to ensure you never miss a critical safety item.
              </p>
            </section>

            {/* Print Header (only visible when printing) */}
            <div className="hidden print:block mb-8">
              <h1 className="text-2xl font-bold mb-2">Pre-Trip Inspection Checklist</h1>
              <p className="text-sm text-muted-foreground">CRUMS Leasing • {new Date().toLocaleDateString()}</p>
              <Separator className="my-4" />
            </div>

            {/* Progress Bar */}
            <section className="mb-8 print:hidden">
              <Card className="p-6 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold">Inspection Progress</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetChecklist}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>
                <Progress value={progressPercent} className="h-3 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{checkedItems} of {totalItems} items checked</span>
                  <span>{Math.round(progressPercent)}% complete</span>
                </div>
              </Card>
            </section>

            {/* Quick Status Overview */}
            <section className="mb-8 print:hidden">
              <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {categories.map(cat => {
                  const status = getCategoryStatus(cat);
                  return (
                    <a
                      key={cat.id}
                      href={`#${cat.id}`}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        status === "complete" 
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                          : status === "in-progress"
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      {status === "complete" && <CheckCircle2 className="h-5 w-5 mx-auto text-green-600 mb-1" />}
                      {status === "in-progress" && <Circle className="h-5 w-5 mx-auto text-amber-600 mb-1" />}
                      {status === "not-started" && <Circle className="h-5 w-5 mx-auto text-muted-foreground mb-1" />}
                      <span className="text-xs font-medium">{cat.title.split(" ")[0]}</span>
                    </a>
                  );
                })}
              </div>
            </section>

            {/* Why It Matters */}
            <section className="mb-12 print:hidden">
              <Card className="bg-destructive/5 border-destructive/20 p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-destructive shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Why Pre-Trip Inspections Matter</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>Safety First:</strong> Catch issues before they cause accidents or breakdowns</li>
                      <li>• <strong>Stay Compliant:</strong> FMCSA requires pre-trip inspections (49 CFR 396.13)</li>
                      <li>• <strong>Avoid Fines:</strong> DOT violations can cost $180 to $16,000+ per offense</li>
                      <li>• <strong>Protect Your CSA Score:</strong> Vehicle maintenance violations affect your safety rating</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            <Separator className="my-12 print:hidden" />

            {/* Checklist Sections */}
            <section className="space-y-8">
              {categories.map((category, idx) => (
                <Card key={category.id} id={category.id} className="overflow-hidden print:break-inside-avoid">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center print:bg-gray-200">
                        <category.icon className="h-6 w-6 text-primary-foreground print:text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3">
                          <span>{idx + 1}. {category.title}</span>
                          {getCategoryStatus(category) === "complete" && (
                            <Badge variant="default" className="bg-green-600 print:hidden">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {getCategoryStatus(category) === "in-progress" && (
                            <Badge variant="secondary" className="print:hidden">
                              In Progress
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 mb-6">
                      {category.items.map(item => (
                        <div 
                          key={item.id} 
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            item.checked 
                              ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                              : "bg-muted/30 border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleItemChange(category.id, item.id)}
                        >
                          <Checkbox
                            id={item.id}
                            checked={item.checked}
                            onCheckedChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 pointer-events-none"
                          />
                          <span 
                            className={`text-sm flex-1 ${item.checked ? "text-muted-foreground line-through" : ""}`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Notes Section */}
                    <div className="print:hidden">
                      <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                      <Textarea
                        placeholder={`Add notes for ${category.title.toLowerCase()}...`}
                        value={category.notes}
                        onChange={(e) => handleNotesChange(category.id, e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                    </div>
                    {category.notes && (
                      <div className="hidden print:block mt-4 p-3 bg-muted/30 rounded text-sm">
                        <strong>Notes:</strong> {category.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </section>

            <Separator className="my-12 print:hidden" />

            {/* Quick Tips */}
            <section className="mb-12 print:hidden">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-primary" />
                Pro Tips for Efficient Inspections
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-bold mb-3">Walk-Around Method</h3>
                  <p className="text-sm text-muted-foreground">
                    Start at the driver's door and walk counter-clockwise around the entire rig. This systematic approach ensures you never miss a component.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold mb-3">Use All Your Senses</h3>
                  <p className="text-sm text-muted-foreground">
                    Look for damage, listen for air leaks, feel for loose components, and smell for burning or leaking fluids. A complete inspection uses every sense.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold mb-3">Document Everything</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep records of your inspections. If you find issues, note them in your DVIR (Driver Vehicle Inspection Report) before operating the vehicle.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold mb-3">Know Your Equipment</h3>
                  <p className="text-sm text-muted-foreground">
                    Familiarize yourself with the specific make and model. Different trailers have different features and potential problem areas.
                  </p>
                </Card>
              </div>
            </section>

            {/* CTA Section */}
            <section className="mb-16 print:hidden">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Need a Well-Maintained Trailer?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  CRUMS Leasing trailers are inspected before every lease. Start your journey with equipment you can trust.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/get-started">
                      Get Started Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/contact">
                      <Phone className="mr-2 h-5 w-5" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </Card>
            </section>

            {/* Sources */}
            <section className="mb-12 print:hidden">
              <h2 className="text-xl font-bold mb-4">Sources</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><sup>[1]</sup> Federal Motor Carrier Safety Administration (FMCSA), 49 CFR 396.13 - Driver Inspection</p>
                <p><sup>[2]</sup> FMCSA 49 CFR 393.75 - Tires and Wheels Requirements</p>
                <p><sup>[3]</sup> Commercial Vehicle Safety Alliance (CVSA) Out-of-Service Criteria</p>
              </div>
            </section>

            {/* Guide Navigation */}
            <nav className="mb-8 print:hidden">
              <div className="grid sm:grid-cols-2 gap-4">
                <Link 
                  to={guideNavigation.previous.href}
                  className="group p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <ArrowLeft className="h-4 w-4" />
                    Previous Guide
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {guideNavigation.previous.title}
                  </span>
                </Link>
                <Link 
                  to={guideNavigation.next.href}
                  className="group p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                    Next Guide
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {guideNavigation.next.title}
                  </span>
                </Link>
              </div>
            </nav>

          </div>
        </div>
      </article>

      <GuideRelatedContent currentSlug="pre-trip-inspection" />
      <Footer />
    </div>
  );
};

export default PreTripInspection;
