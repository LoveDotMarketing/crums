import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Heart,
  Shield
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";

const TrailerLeasingSalesRep = () => {
  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "Trailer Leasing Sales Representative",
    "description": "CRUMS Leasing is looking for a motivated, relationship-driven Sales Representative to lease trailers, manage customer accounts, and support basic administrative and accounting functions.",
    "employmentType": "FULL_TIME",
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "value": 30000,
        "unitText": "YEAR"
      }
    },
    "hiringOrganization": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "sameAs": "https://crumsleasing.com",
      "logo": "https://crumsleasing.com/logo.png"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "4070 FM1863",
        "addressLocality": "Bulverde",
        "addressRegion": "TX",
        "postalCode": "78163",
        "addressCountry": "US"
      }
    },
    "datePosted": "2026-01-06",
    "validThrough": "2026-03-31",
    "industry": "Transportation and Logistics",
    "occupationalCategory": "Sales Representatives, Wholesale and Manufacturing",
    "experienceRequirements": "2-3 years of sales, leasing, or account management experience preferred",
    "skills": "Cold calling, relationship-based selling, account management, basic accounting, organizational skills"
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Careers", url: "https://crumsleasing.com/careers" },
    { name: "Trailer Leasing Sales Representative", url: "https://crumsleasing.com/careers/trailer-leasing-sales-rep" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [jobPostingSchema, breadcrumbSchema]
  };

  const responsibilities = [
    "Lease trailers to owner-operators and small fleet customers",
    "Build and manage your own portfolio of customer accounts",
    "Conduct outbound prospecting, cold calling, and follow-ups",
    "Guide customers through the lease application and onboarding process",
    "Maintain accurate records of leases, payments, and customer activity",
    "Assist with basic invoicing, payment tracking, and documentation (training provided)",
    "Manage and update your sales pipeline",
    "Identify upsell or renewal opportunities within existing accounts",
    "Communicate customer needs, risks, or concerns to leadership",
    "Operate in a fast-paced, hands-on environment while maintaining professionalism"
  ];

  const qualifications = [
    "2–3 years of sales, leasing, or account management experience preferred",
    "Experience in trucking, transportation, logistics, or CDL-related industries strongly preferred",
    "Comfortable with cold calling and relationship-based selling",
    "CDL experience or industry knowledge is a strong plus",
    "Willingness to learn basic accounting and administrative processes",
    "Strong attention to detail and organizational skills",
    "Self-motivated with a strong work ethic",
    "Confident decision-maker who understands risk and accountability",
    "Ability to remain professional and calm in stressful situations",
    "Clear, effective communication skills (verbal and written)",
    "High level of integrity — protects company assets and customer trust"
  ];

  const benefits = [
    { icon: DollarSign, text: "Competitive base pay ($30,000/year) plus commission" },
    { icon: TrendingUp, text: "Hands-on training, including accounting and internal systems" },
    { icon: Users, text: "Direct access to leadership and decision-makers" },
    { icon: TrendingUp, text: "Opportunity to grow with a scaling company" },
    { icon: Heart, text: "Flexible, entrepreneurial environment" },
    { icon: Shield, text: "Be part of a business that values relationships, safety, and long-term success" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Trailer Leasing Sales Representative - Careers at CRUMS Leasing"
        description="Join CRUMS Leasing as a Sales Representative. $30,000 base + commission. Lease trailers, manage accounts, and grow with a family-owned company in San Antonio, TX."
        canonical="https://crumsleasing.com/careers/trailer-leasing-sales-rep"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center text-sm font-semibold bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full">
                <Briefcase className="h-4 w-4 mr-2" />
                Full-Time
              </span>
              <span className="inline-flex items-center text-sm font-semibold bg-white/20 text-white px-4 py-1.5 rounded-full">
                <MapPin className="h-4 w-4 mr-2" />
                San Antonio, TX
              </span>
              <span className="inline-flex items-center text-sm font-semibold bg-white/20 text-white px-4 py-1.5 rounded-full">
                <DollarSign className="h-4 w-4 mr-2" />
                $30,000/year + Commission
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Trailer Leasing Sales Representative
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              A ground-level opportunity for someone who understands the trucking industry, values integrity, 
              and wants to grow with a company that prioritizes long-term relationships over transactional sales.
            </p>
            <Link to="/contact" onClick={() => trackCtaClick('Apply Now - Hero', 'sales-rep-job', '/contact')}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* About the Role */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">About CRUMS Leasing</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              CRUMS Leasing is a growing, family-owned trailer leasing company committed to supporting 
              owner-operators and small fleets with reliable equipment and honest service. As we expand, 
              we are looking for a motivated, relationship-driven Sales Representative to lease trailers, 
              manage customer accounts, and support basic administrative and accounting functions (training provided).
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Position Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              As a Trailer Leasing Sales Representative, you will be responsible for leasing trailers to 
              qualified customers, building and maintaining an account portfolio, and supporting light 
              accounting and administrative processes related to leases and payments. This role blends 
              sales, customer service, and operational awareness — and is ideal for someone comfortable 
              working independently while collaborating with ownership and operations.
            </p>
          </div>
        </div>
      </section>

      {/* Daily Responsibilities */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">Daily Responsibilities</h2>
            <div className="grid gap-4">
              {responsibilities.map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-background p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Skills */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
              Experience, Skills & Characteristics
            </h2>
            <div className="grid gap-4">
              {qualifications.map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-muted p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why CRUMS */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground text-center">
              Why CRUMS Leasing?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">{benefit.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the CRUMS Family?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            If you're passionate about the trucking industry and ready to build meaningful relationships 
            with customers, we want to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" onClick={() => trackCtaClick('Apply Now - Bottom CTA', 'sales-rep-job', '/contact')}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/careers" onClick={() => trackCtaClick('View All Positions', 'sales-rep-job', '/careers')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View All Positions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrailerLeasingSalesRep;
