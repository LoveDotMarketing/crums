import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { PrintButton } from "@/components/PrintButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Receipt, CheckCircle2, AlertTriangle, Calendar, FileText, DollarSign, Truck, Building2, Phone, Fuel, Shield, Wrench, Scale } from "lucide-react";

const TaxDeductionGuide = () => {
  const commonDeductions = [
    { icon: Fuel, name: "Fuel Expenses", description: "All fuel costs for business operations, including diesel, DEF, and reefer fuel." },
    { icon: Wrench, name: "Maintenance & Repairs", description: "Routine maintenance, repairs, tires, oil changes, and roadside assistance." },
    { icon: Shield, name: "Insurance Premiums", description: "Liability, cargo, physical damage, and occupational accident insurance." },
    { icon: Building2, name: "Lease/Rental Payments", description: "Truck and trailer lease payments, equipment rentals." },
    { icon: Scale, name: "Licensing & Permits", description: "CDL fees, IFTA permits, IRP registration, oversize/overweight permits." },
    { icon: DollarSign, name: "Tolls & Parking", description: "Highway tolls, weigh station fees, truck parking, and lumper fees." },
    { icon: Phone, name: "Communication", description: "Cell phone, GPS/ELD subscriptions, satellite radio for business use." },
    { icon: FileText, name: "Professional Services", description: "Accounting, legal fees, tax preparation, and dispatch services." },
  ];

  const perDiemRates = [
    { year: "2024", rate: "$69/day", partial: "$51.75 (75%)", notes: "For travel within continental US" },
    { year: "2023", rate: "$69/day", partial: "$51.75 (75%)", notes: "For travel within continental US" },
  ];

  const depreciationSchedule = [
    { asset: "Semi-Truck (New)", method: "MACRS", years: "5 years", notes: "May qualify for Section 179" },
    { asset: "Semi-Truck (Used)", method: "MACRS", years: "5 years", notes: "May qualify for Section 179" },
    { asset: "Trailer", method: "MACRS", years: "5 years", notes: "May qualify for Section 179" },
    { asset: "Computer/ELD", method: "MACRS", years: "5 years", notes: "Often fully deductible Year 1" },
    { asset: "Office Equipment", method: "MACRS", years: "5-7 years", notes: "Depends on equipment type" },
  ];

  const recordKeepingItems = [
    "Fuel receipts with date, location, gallons, and total cost",
    "Maintenance and repair invoices",
    "Trip logs with miles driven, origin, destination, and purpose",
    "Toll receipts and records",
    "Insurance policy documents and payment records",
    "Lease/loan payment statements",
    "Permit and registration receipts",
    "Settlement statements from carriers",
    "Bank and credit card statements",
    "Per diem log with dates away from home",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Tax Deduction Guide for Truckers - Common Deductions & Record-Keeping"
        description="Tax deduction guide for carriers. Learn about deductible expenses, per diem allowances, depreciation rules, and record-keeping tips."
        canonical="https://crumsleasing.com/resources/tools/tax-deductions"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Receipt className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Tax Deduction Guide</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-primary-foreground/90">
            Essential tax deductions and record-keeping tips for carriers and owner-operators.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      <main className="py-12 bg-background flex-grow">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex justify-end mb-6 print:hidden">
            <PrintButton title="Print / Save as PDF" />
          </div>

          {/* Disclaimer */}
          <Alert className="mb-8 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Important Disclaimer</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              This guide is for informational purposes only and does not constitute tax advice. 
              Tax laws change frequently. Always consult with a qualified tax professional 
              or CPA for advice specific to your situation.
            </AlertDescription>
          </Alert>

          {/* Common Deductible Expenses */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Common Deductible Expenses
              </CardTitle>
              <CardDescription>
                These are typical business expenses that carriers and owner-operators may deduct from their taxes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {commonDeductions.map((deduction, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <deduction.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{deduction.name}</h4>
                      <p className="text-sm text-muted-foreground">{deduction.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="additional">
                  <AccordionTrigger>Additional Deductible Expenses</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {[
                        "Shower and laundry costs while on the road",
                        "Truck washes and cleaning supplies",
                        "Safety equipment (fire extinguisher, triangles, PPE)",
                        "Uniforms and work clothing (if required)",
                        "Association dues and subscriptions",
                        "Drug and alcohol testing fees",
                        "Medical exams (DOT physicals)",
                        "Training and education costs",
                        "Interest on truck loans",
                        "Home office expenses (if applicable)",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Per Diem Allowances */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Per Diem Allowances
              </CardTitle>
              <CardDescription>
                Transportation workers can deduct a per diem allowance for meals and incidental expenses while away from home.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Tax Year</th>
                      <th className="text-left py-2 font-medium">Full Day Rate</th>
                      <th className="text-left py-2 font-medium">Partial Day (75%)</th>
                      <th className="text-left py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perDiemRates.map((rate, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{rate.year}</td>
                        <td className="py-2 font-medium text-primary">{rate.rate}</td>
                        <td className="py-2">{rate.partial}</td>
                        <td className="py-2 text-muted-foreground">{rate.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Key Per Diem Rules:</h4>
                <ul className="space-y-2">
                  {[
                    "Must be away from your tax home overnight to qualify",
                    "Use partial per diem (75%) for first and last day of travel",
                    "Keep a log of days away from home with dates and locations",
                    "Per diem replaces actual meal receipts - you don't need to save meal receipts",
                    "The 80% deduction rule applies to transportation workers (vs. 50% for other businesses)",
                    "Cannot claim per diem if employer provides meals or meal allowance",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Depreciation Rules */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Depreciation Rules
              </CardTitle>
              <CardDescription>
                Understanding how to depreciate your truck, trailer, and equipment for tax purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Asset Type</th>
                      <th className="text-left py-2 font-medium">Method</th>
                      <th className="text-left py-2 font-medium">Recovery Period</th>
                      <th className="text-left py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depreciationSchedule.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{item.asset}</td>
                        <td className="py-2">{item.method}</td>
                        <td className="py-2">{item.years}</td>
                        <td className="py-2 text-muted-foreground">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="section179">
                  <AccordionTrigger>Section 179 Deduction</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Section 179 allows you to deduct the full purchase price of qualifying equipment 
                        in the year it's placed in service, rather than depreciating it over several years.
                      </p>
                      <ul className="space-y-2">
                        {[
                          "2024 deduction limit: $1,220,000 for qualifying equipment",
                          "Applies to new and used equipment",
                          "Must be used more than 50% for business",
                          "Phase-out begins at $3,050,000 total equipment purchases",
                          "Can combine with bonus depreciation for maximum benefit",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bonus">
                  <AccordionTrigger>Bonus Depreciation</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Bonus depreciation allows an additional first-year depreciation deduction 
                        on qualifying property. The rate is being phased down.
                      </p>
                      <ul className="space-y-2">
                        {[
                          "2024: 60% bonus depreciation",
                          "2025: 40% bonus depreciation",
                          "2026: 20% bonus depreciation",
                          "Applies after Section 179 deduction",
                          "Can create a business loss",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Record-Keeping Best Practices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Record-Keeping Best Practices
              </CardTitle>
              <CardDescription>
                Proper documentation is essential for claiming deductions and surviving an IRS audit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Documents to Keep:</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {recordKeepingItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">How Long to Keep Records:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>General tax records</span>
                      <span className="font-medium text-primary">3 years minimum</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>Employment tax records</span>
                      <span className="font-medium text-primary">4 years minimum</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>Property/depreciation records</span>
                      <span className="font-medium text-primary">Until asset sold + 3 years</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>If income underreported by 25%+</span>
                      <span className="font-medium text-primary">6 years</span>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="tips">
                    <AccordionTrigger>Organization Tips</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {[
                          "Use a dedicated business bank account and credit card",
                          "Scan and store digital copies of all receipts",
                          "Use expense tracking apps like Expensify, QuickBooks, or TruckingOffice",
                          "Organize by category: fuel, maintenance, insurance, etc.",
                          "Back up digital records to cloud storage",
                          "Set aside time weekly to organize receipts",
                          "Keep a mileage log or use GPS tracking for business miles",
                          "Save ELD data and trip logs for per diem documentation",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference Checklist</CardTitle>
              <CardDescription>
                Use this checklist when preparing for tax season.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase">Before Tax Season</h4>
                  {[
                    "Gather all fuel receipts or fuel card statements",
                    "Compile maintenance and repair invoices",
                    "Total up per diem days from trip logs",
                    "Calculate total business miles driven",
                    "Organize insurance payment records",
                    "Collect lease/loan payment statements",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 border rounded shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase">During Tax Season</h4>
                  {[
                    "Review depreciation schedules with CPA",
                    "Determine Section 179 election",
                    "Verify per diem calculations",
                    "Confirm all deductions are documented",
                    "File quarterly estimated taxes if needed",
                    "Schedule follow-up with tax professional",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 border rounded shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TaxDeductionGuide;
