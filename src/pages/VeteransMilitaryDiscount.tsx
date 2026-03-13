import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Truck, 
  ArrowRight,
  Phone
} from "lucide-react";
import { trackCtaClick, trackPhoneClick } from "@/lib/analytics";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const VeteransMilitaryDiscount = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Veterans & Military Discount", url: "https://crumsleasing.com/veterans-military-discount" }
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbSchema,
      {
        "@type": "SpecialAnnouncement",
        "name": "Veterans & Military Discount Program",
        "text": "CRUMS Leasing offers a 10% discount on base lease rates for U.S. military veterans and active-duty service members.",
        "category": "https://schema.org/SpecialAnnouncement",
        "datePosted": "2025-01-01",
        "expires": "2026-12-31"
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Veterans & Military Discount - 10% Off Trailer Leasing"
        description="CRUMS Leasing proudly offers 10% off base lease rates for U.S. veterans and active-duty military. Valid ID required. Serving those who served."
        canonical="https://crumsleasing.com/veterans-military-discount"
        structuredData={structuredData}
      />
      <Navigation />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-brand-navy py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <img 
                src="/images/thank-a-veteran.png" 
                alt="Thank a Veteran - CRUMS Leasing Military Discount Program" 
                className="h-32 md:h-40 w-auto mb-8"
              />
              <Badge className="bg-secondary text-secondary-foreground mb-4">
                10% Off Base Lease Rate
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Veterans & Military Discount
              </h1>
              <p className="text-xl text-white/80 max-w-2xl">
                CRUMS Leasing proudly honors U.S. military veterans and active-duty service members 
                by offering a 10% discount on the base lease rate.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Veterans & Military Discount", href: "/veterans-military-discount" }
            ]}
          />
        </div>

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Who Qualifies */}
              <Card className="mb-8 border-l-4 border-l-primary">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">1. Who Qualifies</h2>
                      <p className="text-muted-foreground mb-4">
                        The discount applies to U.S. military veterans and active-duty service members, including:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-secondary" />
                          Active-duty service members
                        </li>
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-secondary" />
                          National Guard
                        </li>
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-secondary" />
                          Reserves
                        </li>
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-secondary" />
                          Retired military
                        </li>
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-secondary" />
                          Veterans with honorable discharge
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proof of Eligibility */}
              <Card className="mb-8 border-l-4 border-l-secondary">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">2. Proof of Eligibility</h2>
                      <p className="text-muted-foreground mb-4">
                        Valid military identification or proof of service is required and must be presented 
                        at the time of lease execution. Acceptable examples:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          Military ID
                        </li>
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          DD-214 (Certificate of Release or Discharge)
                        </li>
                        <li className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          VA ID card
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discount Amount */}
              <Card className="mb-8 border-l-4 border-l-primary">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">%</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">3. Discount Amount</h2>
                      <p className="text-muted-foreground mb-4">
                        Discount applies to the base lease rate only and excludes taxes, fees, and add-on services.
                      </p>
                      <div className="bg-muted p-4 rounded-lg mb-4">
                        <p className="text-lg font-semibold text-foreground">
                          <span className="text-secondary">10% off</span> the base lease rate
                        </p>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2">What the discount does NOT apply to:</p>
                      <ul className="space-y-1 text-muted-foreground text-sm">
                        <li>• Security deposits</li>
                        <li>• Late fees</li>
                        <li>• Maintenance or damage fees</li>
                        <li>• Taxes or government fees</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* When the Discount Applies */}
              <Card className="mb-8 border-l-4 border-l-secondary">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">4. When the Discount Applies</h2>
                      <p className="text-muted-foreground">
                        Discount must be requested and verified <strong className="text-foreground">prior to lease execution</strong> and 
                        cannot be applied retroactively to existing leases.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Combination with Other Offers */}
              <Card className="mb-8 border-l-4 border-l-primary">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">!</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">5. Combination with Other Offers</h2>
                      <p className="text-muted-foreground">
                        This discount <strong className="text-foreground">may not be combined</strong> with other offers, promotions, 
                        or referral discounts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Eligible Equipment */}
              <Card className="mb-8 border-l-4 border-l-secondary">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">6. Eligible Equipment & Lease Types</h2>
                      <p className="text-muted-foreground mb-4">
                        Discount applies to standard trailer leases with a <strong className="text-foreground">minimum lease term of 12 months</strong>.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-lg text-center">
                          <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="font-semibold text-foreground">Dry Van Trailers</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-center">
                          <Truck className="h-8 w-8 text-secondary mx-auto mb-2" />
                          <p className="font-semibold text-foreground">Flatbed Trailers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Rights Clause */}
              <Card className="mb-12 bg-muted/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-2">7. Company Rights Clause</h2>
                  <p className="text-sm text-muted-foreground">
                    CRUMS Leasing reserves the right to modify or discontinue this program at any time without prior notice. 
                    Terms and conditions are subject to change. Contact us for the most current program details.
                  </p>
                </CardContent>
              </Card>

              {/* Download PDF Button */}
              <div className="text-center mb-12">
                <a 
                  href="/documents/veterans-military-discount.pdf" 
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick('Download Veterans PDF', 'veterans-military-discount', '/documents/veterans-military-discount.pdf')}
                >
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                </a>
              </div>

              {/* CTA Section */}
              <div className="text-center bg-primary/5 rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Contact us today to learn more about our Veterans & Military Discount program and start your lease application.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button 
                      size="lg" 
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      onClick={() => trackCtaClick('Veterans Contact', 'veterans-military-discount', '/contact')}
                    >
                      Get Your Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <a href="tel:+18885704564">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => trackPhoneClick('veterans-military-discount')}
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      1-888-570-4564
                    </Button>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VeteransMilitaryDiscount;
