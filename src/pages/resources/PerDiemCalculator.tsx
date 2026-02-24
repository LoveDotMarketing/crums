import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Calculator, DollarSign, Calendar, Truck, ArrowRight, Info, CheckCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const PerDiemCalculator = () => {
  const [daysAway, setDaysAway] = useState<string>("250");
  const [partialDays, setPartialDays] = useState<string>("20");
  const [taxBracket, setTaxBracket] = useState<string>("22");

  // 2024 IRS per diem rate for transportation industry
  const PER_DIEM_RATE = 69; // $69 per day for 2024
  const PARTIAL_DAY_RATE = PER_DIEM_RATE * 0.75; // 75% for partial days

  const daysAwayNum = parseFloat(daysAway) || 0;
  const partialDaysNum = parseFloat(partialDays) || 0;
  const taxBracketNum = parseFloat(taxBracket) || 0;

  const fullDayDeduction = daysAwayNum * PER_DIEM_RATE;
  const partialDayDeduction = partialDaysNum * PARTIAL_DAY_RATE;
  const totalDeduction = fullDayDeduction + partialDayDeduction;
  const estimatedTaxSavings = totalDeduction * (taxBracketNum / 100);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Resources", url: "https://crumsleasing.com/resources" },
    { name: "Tools", url: "https://crumsleasing.com/resources/tools" },
    { name: "Per Diem Calculator", url: "https://crumsleasing.com/resources/tools/per-diem-calculator" }
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the per diem rate for truck drivers in 2024?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The IRS per diem rate for truck drivers in 2024 is $69 per day for travel within the continental United States. This special rate applies to transportation industry workers who are subject to DOT hours of service regulations."
        }
      },
      {
        "@type": "Question",
        "name": "How do I calculate my truck driver per diem?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Multiply the number of full days you're away from home overnight by $69 (the 2024 rate). For partial days (departure and return days), use 75% of the rate ($51.75). Add these together for your total per diem deduction."
        }
      },
      {
        "@type": "Question",
        "name": "Can owner-operators claim per diem?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, owner-operators and self-employed truck drivers can claim per diem as a business expense on Schedule C. Company drivers typically receive per diem as part of their pay structure, which reduces taxable income but may affect other calculations."
        }
      },
      {
        "@type": "Question",
        "name": "What qualifies as a day away from home for per diem?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A qualifying day is when you're away from your tax home overnight for work. Your tax home is your main place of business, not necessarily where you live. The IRS requires you to sleep or rest while away to claim the full daily rate."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to keep receipts for per diem?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, the per diem method is an alternative to tracking actual meal expenses. You don't need meal receipts, but you should keep a log of your travel days, routes, and overnight locations to substantiate your deduction."
        }
      }
    ]
  };

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Truck Driver Per Diem Calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free per diem calculator for truck drivers and owner-operators. Calculate your annual per diem tax deduction based on days away from home."
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, faqSchema, calculatorSchema]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Truck Driver Per Diem Calculator 2024 | Free Tax Deduction Tool"
        description="Free per diem calculator for truck drivers. Calculate your 2024 per diem tax deduction at $69/day. Estimate annual savings for owner-operators and OTR drivers."
        canonical="https://crumsleasing.com/resources/tools/per-diem-calculator"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
            <Calculator className="h-5 w-5" />
            <span className="text-sm font-medium">Free Trucking Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Truck Driver Per Diem Calculator</h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Calculate your annual per diem tax deduction based on the 2024 IRS rate of $69 per day for transportation workers.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      {/* Calculator Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Input Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Enter Your Travel Days
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="daysAway">Full Days Away From Home</Label>
                  <Input
                    id="daysAway"
                    type="number"
                    value={daysAway}
                    onChange={(e) => setDaysAway(e.target.value)}
                    placeholder="250"
                    min="0"
                    max="365"
                  />
                  <p className="text-sm text-muted-foreground">
                    Days you slept away from your tax home overnight (max 365)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partialDays">Partial Days (Departure/Return)</Label>
                  <Input
                    id="partialDays"
                    type="number"
                    value={partialDays}
                    onChange={(e) => setPartialDays(e.target.value)}
                    placeholder="20"
                    min="0"
                    max="100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Days you departed or returned home (75% rate applies)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxBracket">Estimated Tax Bracket (%)</Label>
                  <Input
                    id="taxBracket"
                    type="number"
                    value={taxBracket}
                    onChange={(e) => setTaxBracket(e.target.value)}
                    placeholder="22"
                    min="0"
                    max="50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Your combined federal + state tax rate (typically 15-35%)
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">2024 IRS Per Diem Rate</p>
                      <p>Transportation workers: <strong>${PER_DIEM_RATE}/day</strong> for continental U.S. travel</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-secondary" />
                  Your Per Diem Deduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Full Days ({daysAwayNum} × ${PER_DIEM_RATE})</span>
                    <span className="font-semibold">${fullDayDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Partial Days ({partialDaysNum} × ${PARTIAL_DAY_RATE.toFixed(2)})</span>
                    <span className="font-semibold">${partialDayDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-primary/10 rounded-lg px-4">
                    <span className="font-bold text-lg">Total Annual Deduction</span>
                    <span className="font-bold text-2xl text-primary">${totalDeduction.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Estimated Tax Savings</p>
                  <p className="text-3xl font-bold text-secondary">${estimatedTaxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {taxBracketNum}% combined tax rate
                  </p>
                </div>

                <div className="pt-4">
                  <Link to="/resources/tools/tax-deductions">
                    <Button className="w-full">
                      View All Tax Deductions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            How Per Diem Works for Truck Drivers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 text-center">
              <CardContent className="pt-8">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Track Your Days</h3>
                <p className="text-sm text-muted-foreground">
                  Keep a log of every night you sleep away from your tax home while on the road. Include departure and return dates.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 text-center">
              <CardContent className="pt-8">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Calculate Deduction</h3>
                <p className="text-sm text-muted-foreground">
                  Multiply full days by $69 and partial days by $51.75. No meal receipts needed with this simplified method.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 text-center">
              <CardContent className="pt-8">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Reduce Your Taxes</h3>
                <p className="text-sm text-muted-foreground">
                  Owner-operators deduct on Schedule C. Company drivers may receive per diem pay that reduces taxable income.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What is the per diem rate for truck drivers in 2024?</h3>
                <p className="text-muted-foreground">
                  The IRS per diem rate for truck drivers in 2024 is <strong>$69 per day</strong> for travel within the continental United States. 
                  This special rate applies to transportation industry workers who are subject to DOT hours of service regulations.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How do I calculate my truck driver per diem?</h3>
                <p className="text-muted-foreground">
                  Multiply the number of full days you're away from home overnight by $69 (the 2024 rate). 
                  For partial days (departure and return days), use 75% of the rate ($51.75). Add these together for your total per diem deduction.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Can owner-operators claim per diem?</h3>
                <p className="text-muted-foreground">
                  Yes, owner-operators and self-employed truck drivers can claim per diem as a business expense on Schedule C. 
                  Company drivers typically receive per diem as part of their pay structure, which reduces taxable income but may affect other calculations.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">What qualifies as a day away from home for per diem?</h3>
                <p className="text-muted-foreground">
                  A qualifying day is when you're away from your tax home overnight for work. Your tax home is your main place of business, 
                  not necessarily where you live. The IRS requires you to sleep or rest while away to claim the full daily rate.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Do I need to keep receipts for per diem?</h3>
                <p className="text-muted-foreground">
                  No, the per diem method is an alternative to tracking actual meal expenses. You don't need meal receipts, 
                  but you should keep a log of your travel days, routes, and overnight locations to substantiate your deduction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            More Trucking Calculators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/resources/tools/cost-per-mile" className="block group">
              <Card className="border-2 hover:border-primary hover:shadow-lg transition-all h-full">
                <CardContent className="p-6">
                  <h3 className="font-bold group-hover:text-primary transition-colors mb-2">Cost Per Mile Calculator</h3>
                  <p className="text-sm text-muted-foreground">Calculate your true operating cost per mile.</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/resources/tools/profit-calculator" className="block group">
              <Card className="border-2 hover:border-primary hover:shadow-lg transition-all h-full">
                <CardContent className="p-6">
                  <h3 className="font-bold group-hover:text-primary transition-colors mb-2">Profit Per Load Calculator</h3>
                  <p className="text-sm text-muted-foreground">Estimate your profit margin on each load.</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/resources/tools/tax-deductions" className="block group">
              <Card className="border-2 hover:border-primary hover:shadow-lg transition-all h-full">
                <CardContent className="p-6">
                  <h3 className="font-bold group-hover:text-primary transition-colors mb-2">Tax Deduction Guide</h3>
                  <p className="text-sm text-muted-foreground">Complete guide to carrier tax deductions.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-brand-teal-dark text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Maximize Your Trucking Business</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Lower your costs with flexible trailer leasing from CRUMS. Explore{" "}
            <Link to="/dry-van-trailer-leasing" className="text-primary-foreground underline font-semibold">dry van</Link>{" "}
            and{" "}
            <Link to="/flatbed-trailer-leasing" className="text-primary-foreground underline font-semibold">flatbed</Link>{" "}
            leasing options to keep more money in your pocket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
              <Link to="/dry-van-trailer-leasing">
                Dry Van Leasing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/flatbed-trailer-leasing">Flatbed Leasing</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PerDiemCalculator;
