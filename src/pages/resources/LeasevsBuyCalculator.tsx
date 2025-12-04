import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Scale, DollarSign, TrendingUp, RefreshCw, Calculator, CheckCircle2, XCircle, Shield, Wallet, ArrowRight, Lightbulb } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";
import { Link } from "react-router-dom";

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Lease vs Buy Calculator",
  "description": "Compare the costs of leasing versus buying a trailer with our free calculator. See side-by-side projections to make the best decision for your business.",
  "url": "https://crumsleasing.com/resources/tools/lease-vs-buy",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": {
    "@type": "Organization",
    "name": "CRUMS Leasing"
  }
};

interface BuyInputs {
  purchasePrice: number;
  downPayment: number;
  loanInterestRate: number;
  loanTermYears: number;
  annualInsurance: number;
  annualMaintenance: number;
  annualRegistration: number;
  resaleValuePercent: number;
}

interface LeaseInputs {
  monthlyPayment: number;
  leaseTerm: number;
  securityDeposit: number;
  annualInsurance: number;
  annualMaintenance: number;
}

const LeasevsBuyCalculator = () => {
  const [buyInputs, setBuyInputs] = useState<BuyInputs>({
    purchasePrice: 45000,
    downPayment: 9000,
    loanInterestRate: 7.5,
    loanTermYears: 5,
    annualInsurance: 2400,
    annualMaintenance: 2500,
    annualRegistration: 500,
    resaleValuePercent: 25,
  });

  const [leaseInputs, setLeaseInputs] = useState<LeaseInputs>({
    monthlyPayment: 1100,
    leaseTerm: 60,
    securityDeposit: 3000,
    annualInsurance: 1800,
    annualMaintenance: 600,
  });

  const [analysisYears, setAnalysisYears] = useState(3);

  const calculations = useMemo(() => {
    // Buy calculations
    const loanAmount = buyInputs.purchasePrice - buyInputs.downPayment;
    const monthlyRate = buyInputs.loanInterestRate / 100 / 12;
    const numPayments = buyInputs.loanTermYears * 12;
    
    const monthlyLoanPayment = monthlyRate > 0 
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : loanAmount / numPayments;
    
    const totalLoanPayments = monthlyLoanPayment * numPayments;
    const totalInterest = totalLoanPayments - loanAmount;
    const resaleValue = buyInputs.purchasePrice * (buyInputs.resaleValuePercent / 100);

    // Yearly projections
    const yearlyData = [];
    let buyCumulativeCost = buyInputs.downPayment;
    let leaseCumulativeCost = leaseInputs.securityDeposit;

    for (let year = 1; year <= analysisYears; year++) {
      // Buy costs for this year
      const buyYearlyLoanPayment = year <= buyInputs.loanTermYears 
        ? monthlyLoanPayment * 12 
        : 0;
      const buyYearlyCosts = buyYearlyLoanPayment + buyInputs.annualInsurance + buyInputs.annualMaintenance + buyInputs.annualRegistration;
      buyCumulativeCost += buyYearlyCosts;

      // Lease costs for this year
      const leaseMonths = Math.min(12, Math.max(0, leaseInputs.leaseTerm - (year - 1) * 12));
      const leaseYearlyCosts = (leaseInputs.monthlyPayment * leaseMonths) + 
        (leaseMonths > 0 ? leaseInputs.annualInsurance + leaseInputs.annualMaintenance : 0);
      leaseCumulativeCost += leaseYearlyCosts;

      // Adjusted buy cost (accounting for resale value at end)
      const adjustedBuyCost = year === analysisYears 
        ? buyCumulativeCost - resaleValue 
        : buyCumulativeCost;

      // Adjusted lease cost (security deposit returned at end of term)
      const leaseTermYears = leaseInputs.leaseTerm / 12;
      const adjustedLeaseCost = year >= leaseTermYears 
        ? leaseCumulativeCost - leaseInputs.securityDeposit 
        : leaseCumulativeCost;

      yearlyData.push({
        year: `Year ${year}`,
        yearNum: year,
        buyCost: Math.round(buyCumulativeCost),
        leaseCost: Math.round(leaseCumulativeCost),
        buyAdjusted: Math.round(adjustedBuyCost),
        leaseAdjusted: Math.round(adjustedLeaseCost),
      });
    }

    // Total costs over analysis period
    const totalBuyCost = buyCumulativeCost - resaleValue;
    const totalLeaseCost = leaseCumulativeCost - leaseInputs.securityDeposit;
    const difference = totalLeaseCost - totalBuyCost;
    const recommendation = difference > 0 ? 'buy' : difference < 0 ? 'lease' : 'equal';

    // Monthly comparison
    const buyMonthlyAvg = totalBuyCost / (analysisYears * 12);
    const leaseMonthlyAvg = totalLeaseCost / (analysisYears * 12);

    // Capital preserved calculation
    const capitalPreserved = buyInputs.downPayment - leaseInputs.securityDeposit;

    // Find break-even point
    let breakEvenYear = null;
    for (let i = 0; i < yearlyData.length; i++) {
      if (yearlyData[i].buyAdjusted < yearlyData[i].leaseAdjusted) {
        breakEvenYear = yearlyData[i].yearNum;
        break;
      }
    }

    return {
      monthlyLoanPayment,
      totalLoanPayments,
      totalInterest,
      resaleValue,
      totalBuyCost,
      totalLeaseCost,
      difference: Math.abs(difference),
      recommendation,
      buyMonthlyAvg,
      leaseMonthlyAvg,
      yearlyData,
      capitalPreserved,
      breakEvenYear,
    };
  }, [buyInputs, leaseInputs, analysisYears]);

  const handleBuyInputChange = (field: keyof BuyInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBuyInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const handleLeaseInputChange = (field: keyof LeaseInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLeaseInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const resetCalculator = () => {
    setBuyInputs({
      purchasePrice: 45000,
      downPayment: 9000,
      loanInterestRate: 7.5,
      loanTermYears: 5,
      annualInsurance: 2400,
      annualMaintenance: 2500,
      annualRegistration: 500,
      resaleValuePercent: 25,
    });
    setLeaseInputs({
      monthlyPayment: 1100,
      leaseTerm: 60,
      securityDeposit: 3000,
      annualInsurance: 1800,
      annualMaintenance: 600,
    });
    setAnalysisYears(3);
  };

  return (
    <>
      <SEO
        title="Why Leasing Makes Sense - Trailer Lease Calculator"
        description="Discover why leasing trailers makes more sense for most carriers. Our free calculator shows how leasing preserves capital, reduces risk, and keeps your business flexible."
        canonical="https://crumsleasing.com/resources/tools/lease-vs-buy"
        structuredData={toolSchema}
      />

      <Navigation />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <Scale className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Why Leasing Makes Sense for Your Business
              </h1>
            </div>
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              Preserve your capital, eliminate risk, and stay flexible. See why most carriers choose leasing over buying.
            </p>
          </div>
        </section>

        <Breadcrumbs />

        {/* Quick Facts Banner */}
        <section className="bg-secondary/10 border-y border-secondary/20 py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-secondary flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground">$6,000+ Preserved</p>
                  <p className="text-xs text-muted-foreground">Less capital tied up</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-secondary flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground">100% Deductible</p>
                  <p className="text-xs text-muted-foreground">Operating expense</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-secondary flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground">No Repair Surprises</p>
                  <p className="text-xs text-muted-foreground">Major maintenance covered</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-8 w-8 text-secondary flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground">Upgrade Anytime</p>
                  <p className="text-xs text-muted-foreground">Never stuck with old equipment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Intro Text */}
            <div className="mb-8 p-6 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium mb-2">For carriers operating trailers 1-5 years, leasing almost always makes more financial sense.</p>
                  <p className="text-muted-foreground text-sm">You'll preserve working capital, avoid depreciation risk, and maintain the flexibility to scale your fleet as your business grows. Use this calculator to see the real numbers for your situation.</p>
                </div>
              </div>
            </div>

            {/* Beyond the Numbers Section - Moved Higher */}
            <Card className="mb-8 bg-gradient-to-r from-secondary/5 via-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-secondary" />
                  What This Calculator Can't Measure
                </CardTitle>
                <CardDescription>Important factors that favor leasing but don't show up in cost calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">No Depreciation Risk</p>
                      <p className="text-sm text-muted-foreground">CRUMS takes the risk on market value fluctuations, not you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">No Surprise Repair Bills</p>
                      <p className="text-sm text-muted-foreground">Budget with confidence - major repairs are typically covered</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Flexibility to Scale</p>
                      <p className="text-sm text-muted-foreground">Add or reduce trailers as your business needs change</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Always Newer Equipment</p>
                      <p className="text-sm text-muted-foreground">Upgrade at end of term - no selling hassle</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Preserve Working Capital</p>
                      <p className="text-sm text-muted-foreground">Use your cash for loads, not locked in depreciating assets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Simpler Taxes</p>
                      <p className="text-sm text-muted-foreground">Lease payments are typically 100% deductible operating expense</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendation Banner */}
            <Card className={`mb-8 ${calculations.recommendation === 'buy' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' : calculations.recommendation === 'lease' ? 'bg-secondary/10 border-secondary' : 'bg-muted'}`}>
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {calculations.recommendation === 'buy' ? (
                      <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    ) : calculations.recommendation === 'lease' ? (
                      <CheckCircle2 className="h-10 w-10 text-secondary" />
                    ) : (
                      <Scale className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        {analysisYears}-Year Comparison
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {calculations.recommendation === 'buy' 
                          ? 'Buying may show lower long-term cost' 
                          : calculations.recommendation === 'lease'
                          ? 'Leasing is the smarter choice'
                          : 'Both options are financially similar'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {calculations.recommendation === 'buy' 
                          ? "But you're tying up capital, taking on depreciation risk, and losing flexibility. See the real story below."
                          : calculations.recommendation === 'lease'
                          ? 'Lower upfront cost, predictable expenses, no depreciation risk, and easier fleet scaling.'
                          : 'Consider the non-financial factors below to help decide.'}
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-muted-foreground">Cost Difference</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${calculations.difference.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Buy Inputs */}
              <Card>
                <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                    Buy / Finance
                  </CardTitle>
                  <CardDescription>Enter the costs associated with purchasing a trailer</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        value={buyInputs.purchasePrice}
                        onChange={(e) => handleBuyInputChange("purchasePrice", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downPayment">Down Payment ($)</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={buyInputs.downPayment}
                        onChange={(e) => handleBuyInputChange("downPayment", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanInterestRate">Loan Interest Rate (%)</Label>
                      <Input
                        id="loanInterestRate"
                        type="number"
                        step="0.1"
                        value={buyInputs.loanInterestRate}
                        onChange={(e) => handleBuyInputChange("loanInterestRate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                      <select
                        id="loanTermYears"
                        value={buyInputs.loanTermYears}
                        onChange={(e) => handleBuyInputChange("loanTermYears", e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value={3}>3 Years (36 months)</option>
                        <option value={5}>5 Years (60 months)</option>
                        <option value={6}>6 Years (72 months)</option>
                        <option value={7}>7 Years (84 months)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Financing locks you in for 3-7 years. <span className="text-secondary font-medium">Leasing starts at just 12 months.</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyAnnualInsurance">Annual Insurance ($)</Label>
                      <Input
                        id="buyAnnualInsurance"
                        type="number"
                        value={buyInputs.annualInsurance}
                        onChange={(e) => handleBuyInputChange("annualInsurance", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyAnnualMaintenance">Annual Maintenance ($)</Label>
                      <Input
                        id="buyAnnualMaintenance"
                        type="number"
                        value={buyInputs.annualMaintenance}
                        onChange={(e) => handleBuyInputChange("annualMaintenance", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Includes tires, brakes, DOT inspections, and unexpected repairs</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annualRegistration">Annual Registration ($)</Label>
                      <Input
                        id="annualRegistration"
                        type="number"
                        value={buyInputs.annualRegistration}
                        onChange={(e) => handleBuyInputChange("annualRegistration", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resaleValuePercent">Resale Value (%)</Label>
                      <Input
                        id="resaleValuePercent"
                        type="number"
                        value={buyInputs.resaleValuePercent}
                        onChange={(e) => handleBuyInputChange("resaleValuePercent", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Realistic depreciation: 20-30% after 5 years</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Loan Payment:</span>
                      <span className="font-semibold">${calculations.monthlyLoanPayment.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Interest Paid:</span>
                      <span className="font-semibold">${calculations.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Resale Value:</span>
                      <span className="font-semibold text-emerald-600">${calculations.resaleValue.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lease Inputs */}
              <Card>
                <CardHeader className="bg-secondary/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <RefreshCw className="h-5 w-5" />
                    Lease
                  </CardTitle>
                  <CardDescription>Enter the costs associated with leasing a trailer</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyPayment">Monthly Lease Payment ($)</Label>
                      <Input
                        id="monthlyPayment"
                        type="number"
                        value={leaseInputs.monthlyPayment}
                        onChange={(e) => handleLeaseInputChange("monthlyPayment", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaseTerm">Lease Term (Months)</Label>
                      <Input
                        id="leaseTerm"
                        type="number"
                        value={leaseInputs.leaseTerm}
                        onChange={(e) => handleLeaseInputChange("leaseTerm", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                      <Input
                        id="securityDeposit"
                        type="number"
                        value={leaseInputs.securityDeposit}
                        onChange={(e) => handleLeaseInputChange("securityDeposit", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaseAnnualInsurance">Annual Insurance ($)</Label>
                      <Input
                        id="leaseAnnualInsurance"
                        type="number"
                        value={leaseInputs.annualInsurance}
                        onChange={(e) => handleLeaseInputChange("annualInsurance", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="leaseAnnualMaintenance">Annual Maintenance ($)</Label>
                      <Input
                        id="leaseAnnualMaintenance"
                        type="number"
                        value={leaseInputs.annualMaintenance}
                        onChange={(e) => handleLeaseInputChange("annualMaintenance", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Often lower with leasing as major repairs are typically covered</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lease Term:</span>
                      <span className="font-semibold">{(leaseInputs.leaseTerm / 12).toFixed(1)} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Lease Payments:</span>
                      <span className="font-semibold">${(leaseInputs.monthlyPayment * leaseInputs.leaseTerm).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Security Deposit (Refundable):</span>
                      <span className="font-semibold text-secondary">${leaseInputs.securityDeposit.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Period & Reset */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="analysisYears" className="whitespace-nowrap">Analysis Period:</Label>
                <select
                  id="analysisYears"
                  value={analysisYears}
                  onChange={(e) => setAnalysisYears(parseInt(e.target.value))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={7}>7 Years</option>
                  <option value={10}>10 Years</option>
                </select>
              </div>
              <Button variant="outline" onClick={resetCalculator}>
                Reset to Defaults
              </Button>
              <PrintButton />
            </div>
            <p className="text-sm text-secondary font-medium mb-8">
              <CheckCircle2 className="h-4 w-4 inline mr-1" />
              CRUMS Leasing offers flexible terms starting at just 12 months — no long-term commitment required.
            </p>

            {/* Pro Tip */}
            <Card className="mb-8 bg-secondary/5 border-secondary/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Pro Tip:</strong> For 1-3 year needs, leasing almost always makes more financial sense. 
                    Try selecting "3 Years" above to see the comparison. Most carriers find leasing provides better cash flow flexibility.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Capital & Cash Flow Insight Card */}
            <Card className="mb-8 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-secondary" />
                  Capital & Cash Flow Advantage
                </CardTitle>
                <CardDescription>What the numbers don't always show</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Capital Preserved</p>
                    <p className="text-3xl font-bold text-secondary">${calculations.capitalPreserved.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Down payment vs security deposit
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Cash Flow</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${Math.abs(calculations.monthlyLoanPayment - leaseInputs.monthlyPayment).toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculations.monthlyLoanPayment > leaseInputs.monthlyPayment 
                        ? 'Lower with leasing' 
                        : calculations.monthlyLoanPayment < leaseInputs.monthlyPayment 
                        ? 'Lower with buying' 
                        : 'Same payment'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Capital Opportunity</p>
                    <p className="text-xl font-bold text-foreground">
                      What could ${calculations.capitalPreserved.toLocaleString()} do?
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      More loads, equipment, or emergency fund
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Cost Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Cost Over Time</CardTitle>
                  <CardDescription>Total costs including resale value / deposit return</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calculations.yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                          labelFormatter={(label) => label}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="buyAdjusted" 
                          name="Buy (Net Cost)" 
                          stroke="hsl(142 76% 36%)" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(142 76% 36%)" }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="leaseAdjusted" 
                          name="Lease (Net Cost)" 
                          stroke="hsl(var(--secondary))" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--secondary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Monthly Cost</CardTitle>
                  <CardDescription>Over the {analysisYears}-year analysis period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Buy', cost: calculations.buyMonthlyAvg, fill: 'hsl(142 76% 36%)' },
                        { name: 'Lease', cost: calculations.leaseMonthlyAvg, fill: 'hsl(var(--secondary))' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                        <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}`, 'Monthly Cost']} />
                        <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>{analysisYears}-Year Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Cost Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">Buy / Finance</th>
                        <th className="text-right py-3 px-4 font-semibold text-secondary">Lease</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Initial Cost</td>
                        <td className="text-right py-3 px-4">${buyInputs.downPayment.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">${leaseInputs.securityDeposit.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Monthly Payments ({analysisYears * 12} months)</td>
                        <td className="text-right py-3 px-4">
                          ${(calculations.monthlyLoanPayment * Math.min(analysisYears * 12, buyInputs.loanTermYears * 12)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-4">
                          ${(leaseInputs.monthlyPayment * Math.min(analysisYears * 12, leaseInputs.leaseTerm)).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Insurance ({analysisYears} years)</td>
                        <td className="text-right py-3 px-4">${(buyInputs.annualInsurance * analysisYears).toLocaleString()}</td>
                        <td className="text-right py-3 px-4">${(leaseInputs.annualInsurance * Math.min(analysisYears, leaseInputs.leaseTerm / 12)).toLocaleString()}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Maintenance ({analysisYears} years)</td>
                        <td className="text-right py-3 px-4">${(buyInputs.annualMaintenance * analysisYears).toLocaleString()}</td>
                        <td className="text-right py-3 px-4">${(leaseInputs.annualMaintenance * Math.min(analysisYears, leaseInputs.leaseTerm / 12)).toLocaleString()}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Registration ({analysisYears} years)</td>
                        <td className="text-right py-3 px-4">${(buyInputs.annualRegistration * analysisYears).toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-muted-foreground">Included</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 text-emerald-600">Less: Resale Value / Deposit Return</td>
                        <td className="text-right py-3 px-4 text-emerald-600">-${calculations.resaleValue.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-secondary">-${leaseInputs.securityDeposit.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-muted/50 font-semibold">
                        <td className="py-3 px-4">Net Total Cost</td>
                        <td className="text-right py-3 px-4 text-emerald-700 dark:text-emerald-400">
                          ${calculations.totalBuyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-4 text-secondary">
                          ${calculations.totalLeaseCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>


            {/* Pros & Cons */}
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <Card>
                <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 rounded-t-lg">
                  <CardTitle className="text-emerald-700 dark:text-emerald-400">Buying Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-emerald-600 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> Advantages
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Build equity and own an asset</li>
                        <li>• No mileage restrictions</li>
                        <li>• Tax depreciation benefits</li>
                        <li>• Can sell or trade anytime</li>
                        <li>• Lower long-term cost if kept many years</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4" /> Disadvantages
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Higher upfront capital required</li>
                        <li>• Responsible for ALL maintenance & repairs</li>
                        <li>• Depreciation risk - market value fluctuates</li>
                        <li>• Capital locked in depreciating asset</li>
                        <li>• Unexpected major repairs can exceed budget</li>
                        <li>• Selling takes time, effort, and negotiation</li>
                        <li>• May get less than expected at resale</li>
                        <li>• Stuck with equipment if business needs change</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-secondary/10 rounded-t-lg">
                  <CardTitle className="text-secondary">Leasing Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-emerald-600 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> Advantages
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Much lower upfront costs - preserve capital</li>
                        <li>• Predictable monthly payments for budgeting</li>
                        <li>• Major maintenance often included</li>
                        <li>• Upgrade to newer equipment easily</li>
                        <li>• Preserve capital for other business needs</li>
                        <li>• No depreciation risk - return the trailer</li>
                        <li>• Flexibility to scale fleet up or down</li>
                        <li>• 100% tax deductible as operating expense</li>
                        <li>• Registration often included</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4" /> Disadvantages
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• No equity built</li>
                        <li>• Possible mileage restrictions</li>
                        <li>• Committed for lease term</li>
                        <li>• May cost more if kept 7+ years</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Legal Disclaimer */}
            <Card className="mt-8 bg-muted/50 border-muted">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> This calculator provides estimates for informational purposes only and does not constitute financial, tax, or legal advice. 
                  Results are based on the information you provide and may not reflect actual costs, depreciation, or market conditions. 
                  Always consult with a qualified accountant or financial advisor before making leasing or purchasing decisions. 
                  CRUMS Leasing is not responsible for decisions made based on these estimates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-secondary-foreground">
              Ready to Keep Your Capital Working?
            </h2>
            <p className="text-secondary-foreground/80 mb-8 max-w-2xl mx-auto">
              CRUMS Leasing offers flexible terms starting at just 12 months. Preserve your cash, eliminate depreciation risk, 
              and keep your fleet moving. Get a personalized quote today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90">
                <Link to="/contact">
                  Get a Lease Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10">
                <a href="tel:+18885704564">
                  Call (888) 570-4564
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default LeasevsBuyCalculator;
