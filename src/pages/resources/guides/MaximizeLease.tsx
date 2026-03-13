import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GuideRelatedContent } from "@/components/GuideRelatedContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { FileCheck, DollarSign, Wrench, Shield, Calendar, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MaximizeLease = () => {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Get the Most Out of Your Trailer Lease",
      "description": "Expert tips on maintenance, payments, upgrades, and protecting your investment when leasing a trailer from CRUMS Leasing.",
      "author": {
        "@type": "Organization",
        "name": "CRUMS Leasing"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CRUMS Leasing",
        "logo": {
          "@type": "ImageObject",
          "url": "https://crumsleasing.com/logo.png"
        }
      },
      "datePublished": "2026-02-01",
      "dateModified": "2026-02-01",
      "mainEntityOfPage": "https://crumsleasing.com/resources/guides/maximize-lease"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How can I avoid extra charges on my trailer lease?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Keep detailed maintenance records, report issues promptly, perform regular inspections, and return the trailer in good condition. Document the trailer's condition at pickup and return with photos."
          }
        },
        {
          "@type": "Question",
          "name": "What maintenance am I responsible for on a leased trailer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "As a lessee, you're typically responsible for routine maintenance like tire pressure checks, light inspections, and keeping the trailer clean. Major repairs and structural issues are usually handled by the leasing company."
          }
        },
        {
          "@type": "Question",
          "name": "Can I upgrade my lease to a different trailer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, most leasing companies including CRUMS Leasing offer flexible upgrade options. Contact your leasing representative to discuss transitioning to a different trailer type or adding equipment to your fleet."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://crumsleasing.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://crumsleasing.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Guides", "item": "https://crumsleasing.com/resources/guides" },
        { "@type": "ListItem", "position": 4, "name": "Maximize Your Lease", "item": "https://crumsleasing.com/resources/guides/maximize-lease" }
      ]
    }
  ];

  const maintenanceTips = [
    { title: "Daily Walk-Arounds", description: "Check tires, lights, and doors before each trip" },
    { title: "Weekly Deep Checks", description: "Inspect brakes, suspension, and undercarriage" },
    { title: "Monthly Documentation", description: "Log all maintenance activities and repairs" },
    { title: "Seasonal Prep", description: "Prepare for weather changes with appropriate maintenance" }
  ];

  const paymentTips = [
    { title: "Set Up Auto-Pay", description: "Never miss a payment with automatic billing" },
    { title: "Budget for Extras", description: "Account for tolls, insurance, and maintenance costs" },
    { title: "Track Deductions", description: "Lease payments are often tax-deductible business expenses" },
    { title: "Pay Early When Possible", description: "Build goodwill and potentially qualify for better rates" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="How to Get the Most Out of Your Trailer Lease"
        description="Expert tips on maintenance, payments, upgrades, and protecting your investment when leasing a trailer. Maximize value from your CRUMS Leasing trailer."
        canonical="https://crumsleasing.com/resources/guides/maximize-lease"
        structuredData={structuredData}
        article={{
          publishedTime: "2026-02-01",
          modifiedTime: "2026-02-01",
          section: "Resources",
          author: "CRUMS Leasing"
        }}
      />
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-lg">
                <FileCheck className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Lease Management Guide
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How to Get the Most Out of Your Trailer Lease
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl">
              Your trailer lease is an investment in your business. Learn how to maximize its value 
              through smart maintenance, payment strategies, and building a strong relationship with 
              your leasing partner.
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p className="text-lg text-muted-foreground leading-relaxed">
                A trailer lease represents more than just monthly payments—it's a partnership that 
                can make or break your trucking operation. Whether you're a new owner-operator or 
                expanding your fleet, understanding how to maximize your lease value puts money back 
                in your pocket and keeps your business running smoothly.
              </p>
            </div>
          </div>
        </section>

        {/* Maintenance Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Wrench className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Maintenance That Pays Off</h2>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
                Proper maintenance isn't just about avoiding breakdowns—it protects you from 
                end-of-lease charges and keeps your equipment running efficiently.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {maintenanceTips.map((tip, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                      <p className="text-muted-foreground">{tip.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-accent/50 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Document Everything
                </h3>
                <p className="text-muted-foreground mb-4">
                  Keep a maintenance log with dates, mileage, and work performed. Take photos of 
                  the trailer at pickup and return. This documentation protects you from disputes 
                  and demonstrates responsible care.
                </p>
                <Link to="/resources/guides/maintenance-schedules" className="text-primary hover:underline font-medium">
                  View our complete maintenance schedule guide →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Strategies */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Smart Payment Strategies</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {paymentTips.map((tip, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{tip.title}</h3>
                        <p className="text-muted-foreground">{tip.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="font-semibold text-lg mb-3">💡 Pro Tip: Build Your Credit History</h3>
                <p className="text-muted-foreground">
                  Consistent, on-time lease payments build your business credit profile. This can 
                  qualify you for better rates on future leases, equipment financing, and business loans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Protecting Your Investment */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Shield className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Protecting Your Investment</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-xl mb-4">Avoid Common Pitfalls</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Skipping pre-trip inspections leads to unnoticed damage</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Delayed repairs can turn minor issues into major problems</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Not reporting incidents immediately can void coverage</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Exceeding weight limits causes premature wear</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">Best Practices</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Read and understand your lease agreement thoroughly</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Maintain adequate insurance coverage at all times</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Communicate proactively with your leasing company</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Plan for end-of-lease return requirements early</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upgrades and Flexibility */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Upgrades and Flexibility</h2>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-muted-foreground">
                  Your business needs may change over time. A good leasing partner offers flexibility 
                  to adapt your equipment to your evolving requirements.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-lg mb-2">Fleet Expansion</h3>
                    <p className="text-muted-foreground text-sm">
                      Add trailers as your business grows with volume discounts and streamlined onboarding.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-lg mb-2">Equipment Swaps</h3>
                    <p className="text-muted-foreground text-sm">
                      Switch between dry vans, flatbeds, or reefers based on seasonal demand.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-lg mb-2">Lease Extensions</h3>
                    <p className="text-muted-foreground text-sm">
                      Extend your lease term or transition to month-to-month for maximum flexibility.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CRUMS Partnership */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Phone className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-6">Partner with CRUMS Leasing</h2>
              <p className="text-xl text-primary-foreground/90 mb-8">
                At CRUMS Leasing, we're more than a trailer provider—we're your partner in success. 
                Our team is here to help you get the most value from your lease with responsive 
                support, flexible terms, and well-maintained equipment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/dry-van-trailer-leasing">Lease a Dry Van</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/flatbed-trailer-leasing">Lease a Flatbed</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Guides */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/resources/guides/maintenance-schedules" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Maintenance Schedules</h3>
                  <p className="text-sm text-muted-foreground">Complete maintenance checklists for your trailer</p>
                </Link>
                <Link to="/resources/guides/pre-trip-inspection" className="p-4 bg-background rounded-lg border hover:border-primary transition-colors">
                  <h3 className="font-semibold mb-1">Pre-Trip Inspection</h3>
                  <p className="text-sm text-muted-foreground">Daily inspection checklist to keep you DOT-compliant</p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <GuideRelatedContent currentSlug="maximize-lease" />
      <Footer />
    </div>
  );
};

export default MaximizeLease;
