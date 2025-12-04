import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

// IFTA fuel tax rates per gallon (as of 2024 - these should be updated periodically)
const STATE_TAX_RATES: Record<string, { name: string; rate: number }> = {
  AL: { name: "Alabama", rate: 0.29 },
  AK: { name: "Alaska", rate: 0.0895 },
  AZ: { name: "Arizona", rate: 0.26 },
  AR: { name: "Arkansas", rate: 0.285 },
  CA: { name: "California", rate: 0.683 },
  CO: { name: "Colorado", rate: 0.22 },
  CT: { name: "Connecticut", rate: 0.25 },
  DE: { name: "Delaware", rate: 0.22 },
  FL: { name: "Florida", rate: 0.35 },
  GA: { name: "Georgia", rate: 0.327 },
  HI: { name: "Hawaii", rate: 0.16 },
  ID: { name: "Idaho", rate: 0.32 },
  IL: { name: "Illinois", rate: 0.467 },
  IN: { name: "Indiana", rate: 0.55 },
  IA: { name: "Iowa", rate: 0.30 },
  KS: { name: "Kansas", rate: 0.24 },
  KY: { name: "Kentucky", rate: 0.246 },
  LA: { name: "Louisiana", rate: 0.20 },
  ME: { name: "Maine", rate: 0.312 },
  MD: { name: "Maryland", rate: 0.361 },
  MA: { name: "Massachusetts", rate: 0.24 },
  MI: { name: "Michigan", rate: 0.287 },
  MN: { name: "Minnesota", rate: 0.285 },
  MS: { name: "Mississippi", rate: 0.18 },
  MO: { name: "Missouri", rate: 0.22 },
  MT: { name: "Montana", rate: 0.3275 },
  NE: { name: "Nebraska", rate: 0.294 },
  NV: { name: "Nevada", rate: 0.23 },
  NH: { name: "New Hampshire", rate: 0.222 },
  NJ: { name: "New Jersey", rate: 0.415 },
  NM: { name: "New Mexico", rate: 0.21 },
  NY: { name: "New York", rate: 0.336 },
  NC: { name: "North Carolina", rate: 0.405 },
  ND: { name: "North Dakota", rate: 0.23 },
  OH: { name: "Ohio", rate: 0.385 },
  OK: { name: "Oklahoma", rate: 0.19 },
  OR: { name: "Oregon", rate: 0.38 },
  PA: { name: "Pennsylvania", rate: 0.741 },
  RI: { name: "Rhode Island", rate: 0.35 },
  SC: { name: "South Carolina", rate: 0.28 },
  SD: { name: "South Dakota", rate: 0.28 },
  TN: { name: "Tennessee", rate: 0.27 },
  TX: { name: "Texas", rate: 0.20 },
  UT: { name: "Utah", rate: 0.314 },
  VT: { name: "Vermont", rate: 0.305 },
  VA: { name: "Virginia", rate: 0.298 },
  WA: { name: "Washington", rate: 0.494 },
  WV: { name: "West Virginia", rate: 0.357 },
  WI: { name: "Wisconsin", rate: 0.309 },
  WY: { name: "Wyoming", rate: 0.24 },
};

interface StateEntry {
  id: string;
  state: string;
  miles: number;
  gallonsPurchased: number;
}

const IFTACalculator = () => {
  const [mpg, setMpg] = useState<number>(6.5);
  const [stateEntries, setStateEntries] = useState<StateEntry[]>([
    { id: "1", state: "TX", miles: 0, gallonsPurchased: 0 },
  ]);

  const addStateEntry = () => {
    const usedStates = stateEntries.map(e => e.state);
    const availableStates = Object.keys(STATE_TAX_RATES).filter(s => !usedStates.includes(s));
    const nextState = availableStates[0] || "TX";
    
    setStateEntries([
      ...stateEntries,
      { id: Date.now().toString(), state: nextState, miles: 0, gallonsPurchased: 0 },
    ]);
  };

  const removeStateEntry = (id: string) => {
    if (stateEntries.length > 1) {
      setStateEntries(stateEntries.filter((entry) => entry.id !== id));
    }
  };

  const updateStateEntry = (id: string, field: keyof StateEntry, value: string | number) => {
    setStateEntries(
      stateEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Calculate IFTA
  const totalMiles = stateEntries.reduce((sum, e) => sum + (e.miles || 0), 0);
  const totalGallonsPurchased = stateEntries.reduce((sum, e) => sum + (e.gallonsPurchased || 0), 0);
  const totalGallonsUsed = mpg > 0 ? totalMiles / mpg : 0;

  const stateCalculations = stateEntries.map((entry) => {
    const stateName = STATE_TAX_RATES[entry.state]?.name || entry.state;
    const taxRate = STATE_TAX_RATES[entry.state]?.rate || 0;
    const milesInState = entry.miles || 0;
    const gallonsPurchasedInState = entry.gallonsPurchased || 0;
    
    // Calculate gallons used in this state based on proportion of miles
    const gallonsUsedInState = totalMiles > 0 ? (milesInState / totalMiles) * totalGallonsUsed : 0;
    
    // Net taxable gallons = gallons used - gallons purchased
    const netTaxableGallons = gallonsUsedInState - gallonsPurchasedInState;
    
    // Tax due (positive) or credit (negative)
    const taxDue = netTaxableGallons * taxRate;

    return {
      state: entry.state,
      stateName,
      miles: milesInState,
      gallonsPurchased: gallonsPurchasedInState,
      gallonsUsed: gallonsUsedInState,
      netTaxableGallons,
      taxRate,
      taxDue,
    };
  });

  const totalTaxDue = stateCalculations.reduce((sum, calc) => sum + calc.taxDue, 0);

  const chartData = stateCalculations
    .filter((calc) => calc.miles > 0 || calc.gallonsPurchased > 0)
    .map((calc) => ({
      state: calc.state,
      "Tax Due/Credit": parseFloat(calc.taxDue.toFixed(2)),
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="IFTA Tax Estimator - Calculate Fuel Tax by State"
        description="Free IFTA tax calculator for carriers. Estimate your fuel tax liability or credits by state based on miles driven and fuel purchased. Simplify your IFTA reporting."
        canonical="https://crumsleasing.com/resources/ifta-calculator"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-10 w-10" />
            <h1 className="text-3xl md:text-5xl font-bold">IFTA Tax Estimator</h1>
          </div>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Estimate your fuel tax liability or credits by state for IFTA reporting
          </p>
        </div>
      </section>

      <Breadcrumbs />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fleet MPG</CardTitle>
                  <CardDescription>
                    Enter your average miles per gallon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="mpg">Average MPG</Label>
                    <Input
                      id="mpg"
                      type="number"
                      step="0.1"
                      min="1"
                      value={mpg}
                      onChange={(e) => setMpg(parseFloat(e.target.value) || 0)}
                      placeholder="6.5"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Miles & Fuel by State</CardTitle>
                  <CardDescription>
                    Enter miles driven and fuel purchased in each state
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stateEntries.map((entry, index) => (
                    <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">State {index + 1}</Label>
                        {stateEntries.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStateEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`state-${entry.id}`} className="text-xs">
                            State
                          </Label>
                          <select
                            id={`state-${entry.id}`}
                            value={entry.state}
                            onChange={(e) =>
                              updateStateEntry(entry.id, "state", e.target.value)
                            }
                            className="w-full h-10 px-3 border rounded-md bg-background text-sm"
                          >
                            {Object.entries(STATE_TAX_RATES).map(([code, { name }]) => (
                              <option key={code} value={code}>
                                {code} - {name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`miles-${entry.id}`} className="text-xs">
                            Miles Driven
                          </Label>
                          <Input
                            id={`miles-${entry.id}`}
                            type="number"
                            min="0"
                            value={entry.miles || ""}
                            onChange={(e) =>
                              updateStateEntry(
                                entry.id,
                                "miles",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`gallons-${entry.id}`} className="text-xs">
                            Gallons Purchased
                          </Label>
                          <Input
                            id={`gallons-${entry.id}`}
                            type="number"
                            min="0"
                            step="0.1"
                            value={entry.gallonsPurchased || ""}
                            onChange={(e) =>
                              updateStateEntry(
                                entry.id,
                                "gallonsPurchased",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tax rate: ${STATE_TAX_RATES[entry.state]?.rate.toFixed(3)}/gal
                      </p>
                    </div>
                  ))}
                  <Button onClick={addStateEntry} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another State
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Miles</p>
                      <p className="text-2xl font-bold">{totalMiles.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Gallons Purchased</p>
                      <p className="text-2xl font-bold">{totalGallonsPurchased.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Gallons Used</p>
                      <p className="text-2xl font-bold">{totalGallonsUsed.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${totalTaxDue > 0 ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                      <p className="text-sm text-muted-foreground">
                        {totalTaxDue > 0 ? 'Total Tax Due' : 'Total Credit'}
                      </p>
                      <p className={`text-2xl font-bold ${totalTaxDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        ${Math.abs(totalTaxDue).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg flex items-start gap-3 ${totalTaxDue > 0 ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                    {totalTaxDue > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {totalTaxDue > 0
                          ? `You owe approximately $${totalTaxDue.toFixed(2)} in fuel taxes`
                          : `You have approximately $${Math.abs(totalTaxDue).toFixed(2)} in fuel tax credits`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {totalTaxDue > 0
                          ? 'Consider purchasing more fuel in high-tax states to offset liability'
                          : 'You purchased more fuel than you used in these states'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>State-by-State Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {stateCalculations
                      .filter((calc) => calc.miles > 0 || calc.gallonsPurchased > 0)
                      .map((calc) => (
                        <div
                          key={calc.state}
                          className="p-3 border rounded-lg text-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{calc.stateName}</span>
                            <span
                              className={`font-bold ${
                                calc.taxDue > 0 ? "text-destructive" : "text-green-600"
                              }`}
                            >
                              {calc.taxDue > 0 ? "Due: " : "Credit: "}$
                              {Math.abs(calc.taxDue).toFixed(2)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
                            <span>Miles: {calc.miles.toLocaleString()}</span>
                            <span>Gallons Used: {calc.gallonsUsed.toFixed(1)}</span>
                            <span>Purchased: {calc.gallonsPurchased.toFixed(1)} gal</span>
                            <span>Net: {calc.netTaxableGallons.toFixed(1)} gal</span>
                          </div>
                        </div>
                      ))}
                    {stateCalculations.filter((calc) => calc.miles > 0 || calc.gallonsPurchased > 0).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Enter miles or fuel purchases to see breakdown
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {chartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Due/Credit by State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="state" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip
                            formatter={(value: number) => [
                              `$${value.toFixed(2)}`,
                              value >= 0 ? "Tax Due" : "Credit",
                            ]}
                          />
                          <Legend />
                          <Bar dataKey="Tax Due/Credit" name="Tax Due/Credit">
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry["Tax Due/Credit"] >= 0 ? "hsl(var(--destructive))" : "hsl(142, 76%, 36%)"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Disclaimer:</strong> This calculator provides estimates only
                    and should not be used as official IFTA reporting. Tax rates are
                    approximate and may change. Always verify current rates with your
                    state's Department of Transportation and consult with a tax
                    professional for official filings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IFTACalculator;
