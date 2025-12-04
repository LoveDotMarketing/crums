import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign, Route, Fuel, TrendingUp, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { PrintButton } from "@/components/PrintButton";

const ProfitPerLoadCalculator = () => {
  const [loadRate, setLoadRate] = useState<string>("2500");
  const [loadedMiles, setLoadedMiles] = useState<string>("800");
  const [deadheadMiles, setDeadheadMiles] = useState<string>("100");
  const [fuelCostPerGallon, setFuelCostPerGallon] = useState<string>("3.50");
  const [mpg, setMpg] = useState<string>("6.5");
  const [driverPay, setDriverPay] = useState<string>("0.55");
  const [dispatchFee, setDispatchFee] = useState<string>("10");
  const [factoringFee, setFactoringFee] = useState<string>("3");
  const [otherExpenses, setOtherExpenses] = useState<string>("50");

  const parseNum = (val: string) => parseFloat(val) || 0;

  // Calculations
  const totalMiles = parseNum(loadedMiles) + parseNum(deadheadMiles);
  const gallonsUsed = totalMiles / parseNum(mpg);
  const fuelCost = gallonsUsed * parseNum(fuelCostPerGallon);
  const driverPayTotal = totalMiles * parseNum(driverPay);
  const dispatchFeeTotal = (parseNum(dispatchFee) / 100) * parseNum(loadRate);
  const factoringFeeTotal = (parseNum(factoringFee) / 100) * parseNum(loadRate);
  const otherExpensesTotal = parseNum(otherExpenses);

  const totalExpenses = fuelCost + driverPayTotal + dispatchFeeTotal + factoringFeeTotal + otherExpensesTotal;
  const grossProfit = parseNum(loadRate) - totalExpenses;
  const profitMargin = parseNum(loadRate) > 0 ? (grossProfit / parseNum(loadRate)) * 100 : 0;
  const ratePerMile = totalMiles > 0 ? parseNum(loadRate) / totalMiles : 0;
  const profitPerMile = totalMiles > 0 ? grossProfit / totalMiles : 0;
  const ratePerLoadedMile = parseNum(loadedMiles) > 0 ? parseNum(loadRate) / parseNum(loadedMiles) : 0;

  const expenseData = [
    { name: "Fuel", value: fuelCost, color: "hsl(var(--chart-1))" },
    { name: "Driver Pay", value: driverPayTotal, color: "hsl(var(--chart-2))" },
    { name: "Dispatch Fee", value: dispatchFeeTotal, color: "hsl(var(--chart-3))" },
    { name: "Factoring Fee", value: factoringFeeTotal, color: "hsl(var(--chart-4))" },
    { name: "Other", value: otherExpensesTotal, color: "hsl(var(--chart-5))" },
  ].filter(item => item.value > 0);

  const comparisonData = [
    { name: "Load Rate", amount: parseNum(loadRate) },
    { name: "Total Expenses", amount: totalExpenses },
    { name: "Net Profit", amount: grossProfit },
  ];

  const resetForm = () => {
    setLoadRate("2500");
    setLoadedMiles("800");
    setDeadheadMiles("100");
    setFuelCostPerGallon("3.50");
    setMpg("6.5");
    setDriverPay("0.55");
    setDispatchFee("10");
    setFactoringFee("3");
    setOtherExpenses("50");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Profit Per Load Calculator - Trucking Load Profitability Tool"
        description="Calculate your profit per load with our free trucking calculator. Input rate, miles, fuel costs, and expenses to see your true profit margin and per-mile earnings."
        canonical="https://crumsleasing.com/resources/tools/profit-calculator"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Calculator className="h-12 w-12" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Profit Per Load Calculator</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Calculate the true profitability of each load by factoring in all expenses including deadhead miles.
          </p>
        </div>
      </section>

      <Breadcrumbs />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Load Details
                  </CardTitle>
                  <CardDescription>Enter the load rate and mileage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="loadRate">Load Rate ($)</Label>
                    <Input
                      id="loadRate"
                      type="number"
                      value={loadRate}
                      onChange={(e) => setLoadRate(e.target.value)}
                      placeholder="2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loadedMiles">Loaded Miles</Label>
                    <Input
                      id="loadedMiles"
                      type="number"
                      value={loadedMiles}
                      onChange={(e) => setLoadedMiles(e.target.value)}
                      placeholder="800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadheadMiles">Deadhead Miles</Label>
                    <Input
                      id="deadheadMiles"
                      type="number"
                      value={deadheadMiles}
                      onChange={(e) => setDeadheadMiles(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" />
                    Fuel & Operations
                  </CardTitle>
                  <CardDescription>Fuel costs and driver expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fuelCost">Fuel Cost ($/gallon)</Label>
                    <Input
                      id="fuelCost"
                      type="number"
                      step="0.01"
                      value={fuelCostPerGallon}
                      onChange={(e) => setFuelCostPerGallon(e.target.value)}
                      placeholder="3.50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpg">MPG</Label>
                    <Input
                      id="mpg"
                      type="number"
                      step="0.1"
                      value={mpg}
                      onChange={(e) => setMpg(e.target.value)}
                      placeholder="6.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverPay">Driver Pay ($/mile)</Label>
                    <Input
                      id="driverPay"
                      type="number"
                      step="0.01"
                      value={driverPay}
                      onChange={(e) => setDriverPay(e.target.value)}
                      placeholder="0.55"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5 text-primary" />
                    Fees & Other Costs
                  </CardTitle>
                  <CardDescription>Dispatch, factoring, and other expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dispatchFee">Dispatch Fee (%)</Label>
                    <Input
                      id="dispatchFee"
                      type="number"
                      step="0.1"
                      value={dispatchFee}
                      onChange={(e) => setDispatchFee(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="factoringFee">Factoring Fee (%)</Label>
                    <Input
                      id="factoringFee"
                      type="number"
                      step="0.1"
                      value={factoringFee}
                      onChange={(e) => setFactoringFee(e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherExpenses">Other Expenses ($)</Label>
                    <Input
                      id="otherExpenses"
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Reset to Defaults
                </Button>
                <PrintButton className="flex-1" />
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={grossProfit >= 0 ? "border-green-500/50" : "border-destructive/50"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className={`h-8 w-8 mx-auto mb-2 ${grossProfit >= 0 ? "text-green-500" : "text-destructive"}`} />
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                      <p className={`text-2xl font-bold ${grossProfit >= 0 ? "text-green-500" : "text-destructive"}`}>
                        ${grossProfit.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Profit/Mile (All)</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${profitPerMile.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Route className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Rate/Loaded Mile</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${ratePerLoadedMile.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className={`text-2xl font-bold ${profitMargin >= 20 ? "text-green-500" : profitMargin >= 0 ? "text-yellow-500" : "text-destructive"}`}>
                        {profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warning for low/negative profit */}
              {grossProfit < 0 && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <div>
                        <p className="font-semibold text-destructive">Negative Profit Warning</p>
                        <p className="text-sm text-muted-foreground">This load would result in a loss. Consider negotiating a higher rate or reducing deadhead miles.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Distribution of costs for this load</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue vs Expenses</CardTitle>
                    <CardDescription>Load profitability comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Summary</CardTitle>
                  <CardDescription>Complete breakdown of load profitability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                      <div>
                        <p className="text-sm text-muted-foreground">Load Rate</p>
                        <p className="text-lg font-semibold text-foreground">${parseNum(loadRate).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Miles</p>
                        <p className="text-lg font-semibold text-foreground">{totalMiles} mi</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Loaded Miles</p>
                        <p className="text-lg font-semibold text-foreground">{parseNum(loadedMiles)} mi</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deadhead Miles</p>
                        <p className="text-lg font-semibold text-foreground">{parseNum(deadheadMiles)} mi</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">Expenses</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Fuel ({gallonsUsed.toFixed(1)} gal)</span>
                        <span className="text-right text-foreground">${fuelCost.toFixed(2)}</span>
                        <span className="text-muted-foreground">Driver Pay ({totalMiles} mi)</span>
                        <span className="text-right text-foreground">${driverPayTotal.toFixed(2)}</span>
                        <span className="text-muted-foreground">Dispatch Fee ({parseNum(dispatchFee)}%)</span>
                        <span className="text-right text-foreground">${dispatchFeeTotal.toFixed(2)}</span>
                        <span className="text-muted-foreground">Factoring Fee ({parseNum(factoringFee)}%)</span>
                        <span className="text-right text-foreground">${factoringFeeTotal.toFixed(2)}</span>
                        <span className="text-muted-foreground">Other Expenses</span>
                        <span className="text-right text-foreground">${otherExpensesTotal.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t font-semibold">
                        <span className="text-foreground">Total Expenses</span>
                        <span className="text-right text-foreground">${totalExpenses.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                      <span className="font-bold text-foreground">Net Profit</span>
                      <span className={`text-right font-bold ${grossProfit >= 0 ? "text-green-500" : "text-destructive"}`}>
                        ${grossProfit.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">Rate Per Total Mile</span>
                      <span className="text-right text-foreground">${ratePerMile.toFixed(2)}</span>
                      <span className="text-muted-foreground">Profit Per Mile</span>
                      <span className="text-right text-foreground">${profitPerMile.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <Card className="mt-8 bg-muted/50 border-muted">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> This calculator provides estimates for informational purposes only and does not constitute financial, tax, or legal advice. 
                Results are based on the information you provide and may not reflect actual profits or expenses. 
                Always consult with a qualified accountant or financial advisor before making business decisions. 
                CRUMS Leasing is not responsible for decisions made based on these estimates.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProfitPerLoadCalculator;
