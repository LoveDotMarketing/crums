import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Heart, TrendingUp, Users, Award, ArrowRight } from "lucide-react";
const teamImage = "/images/crums-leasing-careers-2.webp";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackCtaClick } from "@/lib/analytics";

const Careers = () => {
  const jobPostings = [
    {
      title: "Fleet Manager",
      location: "San Antonio, TX",
      type: "Full-Time",
      description: "Lead our growing fleet operations and help shape the future of our company."
    },
    {
      title: "Customer Service Representative",
      location: "San Antonio, TX",
      type: "Full-Time",
      description: "Be the friendly voice that helps our customers succeed every day."
    },
    {
      title: "Trailer Mechanic",
      location: "San Antonio, TX",
      type: "Full-Time",
      description: "Keep our fleet in top condition with your expert maintenance skills."
    }
  ];

  const jobPostingSchema = jobPostings.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "employmentType": job.type,
    "hiringOrganization": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "sameAs": "https://crumsleasing.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "7450 Prue Rd #2",
        "addressLocality": "San Antonio",
        "addressRegion": "TX",
        "postalCode": "78249",
        "addressCountry": "US"
      }
    },
    "datePosted": "2025-11-26",
    "validThrough": "2026-04-20"
  }));

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Careers", url: "https://crumsleasing.com/careers" }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [...jobPostingSchema, breadcrumbSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Careers - Join The CRUMS Family"
        description="Build your career at CRUMS Leasing. We're hiring fleet managers, customer service reps, and trailer mechanics. Join a company that values integrity and hard work."
        canonical="https://crumsleasing.com/careers"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Join The CRUMS Family</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90 mb-8">
            Build your career with a company that values integrity, hard work, and putting people
            first.
          </p>
          <Link to="/contact" onClick={() => trackCtaClick('View Open Positions', 'careers-hero', '/contact')}>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              View Open Positions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Breadcrumbs />

      {/* Why Work Here */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Why Work at CRUMS?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                At CRUMS Leasing, we don't just hire employees — we welcome family members. We
                believe that when you invest in people, they invest back in the mission. That's why
                we're committed to creating an environment where everyone can thrive.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Family Culture</h3>
                    <p className="text-muted-foreground">
                      Work-life balance, respect, and genuine care for every team member
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Growth Opportunities
                    </h3>
                    <p className="text-muted-foreground">
                      Clear career paths and development programs to help you advance
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Work Life Balance
                    </h3>
                    <p className="text-muted-foreground">
                      Health insurance, 401(k) matching, paid time off, and more
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src={teamImage}
                alt="CRUMS Leasing team meeting in the office"
                className="rounded-lg shadow-2xl"
                loading="lazy"
                width="800"
                height="533"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Position */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Featured Position
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We're actively hiring for this role — apply today!
          </p>
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-secondary hover:shadow-xl transition-shadow bg-background">
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    Sales
                  </span>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Now Hiring
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  Trailer Leasing Sales Representative
                </h3>
                <p className="text-muted-foreground mb-4">
                  San Antonio, TX • Full Time • $30,000/year + Commission
                </p>
                <p className="text-foreground mb-6">
                  Join our growing team as a Sales Representative. Lease trailers, manage customer accounts, 
                  and grow with a family-owned company that values long-term relationships.
                </p>
                <Link to="/careers/trailer-leasing-sales-rep" onClick={() => trackCtaClick('View Sales Rep Position', 'careers', '/careers/trailer-leasing-sales-rep')}>
                  <Button className="w-full sm:w-auto bg-secondary hover:bg-secondary/90">
                    View Position Details
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Other Open Positions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    Sales
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  Account Executive
                </h3>
                <p className="text-muted-foreground mb-4">San Antonio, TX • Full Time</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Operations
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  Fleet Manager
                </h3>
                <p className="text-muted-foreground mb-4">San Antonio, TX • Full Time</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    Customer Service
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  Customer Success Manager
                </h3>
                <p className="text-muted-foreground mb-4">San Antonio, TX • Full Time</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    Finance
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  Financial Analyst
                </h3>
                <p className="text-muted-foreground mb-4">San Antonio, TX • Full Time</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    Operations
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  Maintenance Supervisor
                </h3>
                <p className="text-muted-foreground mb-4">San Antonio, TX • Full Time</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Don't See Your Role?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our values. Send us your resume
            and let's talk about how you can contribute to the CRUMS family.
          </p>
          <Link to="/contact" onClick={() => trackCtaClick('Submit Your Resume', 'careers-cta', '/contact')}>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              Submit Your Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
