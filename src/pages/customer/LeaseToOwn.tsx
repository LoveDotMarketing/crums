import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import {
  Loader2,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  Mail,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Clock,
  ClipboardCheck,
  XCircle,
} from "lucide-react";
import { format, addMonths, addYears, differenceInDays, isAfter, isBefore } from "date-fns";

interface LeaseSubscription {
  id: string;
  contract_start_date: string | null;
  billing_cycle: string;
  status: string;
  lease_agreement_url: string | null;
}

interface SubscriptionItem {
  id: string;
  subscription_id: string;
  monthly_rate: number;
  lease_to_own_total: number | null;
  lease_to_own: boolean | null;
  trailer: {
    trailer_number: string;
    type: string;
    year: number | null;
    vin: string | null;
    axle_count: number | null;
    body_material: string | null;
  } | null;
}

interface BillingPayment {
  id: string;
  subscription_id: string;
  net_amount: number;
  paid_at: string | null;
  billing_period_start: string | null;
  status: string;
}

interface DotInspection {
  id: string;
  trailer_id: string;
  inspection_date: string;
  status: string | null;
  trailer_number: string;
  inspector_name: string | null;
}

export default function LeaseToOwn() {
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<LeaseSubscription | null>(null);
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [downloadingAgreement, setDownloadingAgreement] = useState(false);
  const [dotInspections, setDotInspections] = useState<DotInspection[]>([]);

  useEffect(() => {
    fetchLeaseData();
  }, [currentEmail]);

  const fetchLeaseData = async () => {
    if (!currentEmail) return;
    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();

      if (!customer) {
        setLoading(false);
        return;
      }

      // Get lease-to-own subscription
      const { data: sub } = await supabase
        .from("customer_subscriptions")
        .select("id, contract_start_date, billing_cycle, status, lease_agreement_url")
        .eq("customer_id", customer.id)
        .eq("subscription_type", "lease_to_own")
        .maybeSingle();

      if (!sub) {
        setLoading(false);
        return;
      }
      setSubscription(sub as LeaseSubscription);

      // Get subscription items (trailers) with lease_to_own_total
      const { data: subItems } = await supabase
        .from("subscription_items")
        .select(`
          id,
          subscription_id,
          monthly_rate,
          lease_to_own_total,
          lease_to_own,
          trailer:trailers(trailer_number, type, year, vin, axle_count, body_material)
        `)
        .eq("subscription_id", sub.id)
        .in("status", ["active", "paused"]);

      setItems((subItems || []) as SubscriptionItem[]);

      // Get succeeded billing history for this subscription
      const { data: billingData } = await supabase
        .from("billing_history")
        .select("id, subscription_id, net_amount, paid_at, billing_period_start, status")
        .eq("subscription_id", sub.id)
        .eq("status", "succeeded")
        .order("paid_at", { ascending: true });

      setPayments(billingData || []);

      // Get DOT inspections for trailers in this subscription
      const trailerIds = (subItems || [])
        .map((si: SubscriptionItem) => si.trailer ? (si as any).trailer_id : null)
        .filter(Boolean);

      // Fetch trailer IDs directly from subscription_items
      const { data: siWithTrailers } = await supabase
        .from("subscription_items")
        .select("trailer_id")
        .eq("subscription_id", sub.id)
        .in("status", ["active", "paused"]);

      const tids = (siWithTrailers || []).map((si: { trailer_id: string }) => si.trailer_id).filter(Boolean);

      if (tids.length > 0) {
        const { data: inspections } = await supabase
          .from("dot_inspections")
          .select("id, trailer_id, inspection_date, status, trailer_number, inspector_name")
          .in("trailer_id", tids)
          .order("inspection_date", { ascending: false });

        setDotInspections((inspections || []) as DotInspection[]);
      }
    } catch (err) {
      console.error("Error fetching lease data:", err);
      toast.error("Failed to load lease-to-own data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAgreement = async () => {
    if (!subscription?.lease_agreement_url) return;
    setDownloadingAgreement(true);
    try {
      const { data, error } = await supabase.storage
        .from("customer-documents")
        .createSignedUrl(subscription.lease_agreement_url, 300);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error("Error downloading agreement:", err);
      toast.error("Failed to download agreement");
    } finally {
      setDownloadingAgreement(false);
    }
  };

  // Computed values
  const totalBuyoutPrice = items.reduce(
    (sum, item) => sum + Number(item.lease_to_own_total || 0),
    0
  );
  const monthlyRate = items.reduce(
    (sum, item) => sum + Number(item.monthly_rate || 0),
    0
  );
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.net_amount), 0);
  const remaining = Math.max(0, totalBuyoutPrice - totalPaid);
  const percentPaid = totalBuyoutPrice > 0 ? Math.min(100, (totalPaid / totalBuyoutPrice) * 100) : 0;
  const monthsRemaining = monthlyRate > 0 ? Math.ceil(remaining / monthlyRate) : 0;
  const estimatedPayoff = monthsRemaining > 0 ? addMonths(new Date(), monthsRemaining) : null;
  const contractStart = subscription?.contract_start_date
    ? new Date(subscription.contract_start_date)
    : null;

  // Build projected future payments table rows
  const projectedPayments = Array.from({ length: Math.min(monthsRemaining, 24) }, (_, i) => {
    const paymentNum = payments.length + i + 1;
    const projectedDate = addMonths(new Date(), i + 1);
    const runningPaid = totalPaid + (i + 1) * monthlyRate;
    const projectedRemaining = Math.max(0, totalBuyoutPrice - runningPaid);
    return { paymentNum, projectedDate, amount: monthlyRate, projectedRemaining };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <CustomerNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <CustomerNav />
        <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Lease-to-Own Agreement</h3>
                <p className="text-muted-foreground">
                  You don't have an active lease-to-own agreement. Contact us if you believe this is an error.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <CustomerNav showLeaseToOwn />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">

          {/* Hero */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <TrendingDown className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Lease-to-Own</h1>
              </div>
              <p className="text-muted-foreground">Track your path to trailer ownership</p>
            </div>
            <Badge className="text-sm px-4 py-1.5 self-start sm:self-auto bg-primary/10 text-primary border border-primary/20">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {remaining > 0 ? "On Track to Ownership" : "Agreement Complete"}
            </Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Buyout Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  ${totalBuyoutPrice.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Full ownership price</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Amount Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  ${totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{payments.length} payment{payments.length !== 1 ? "s" : ""} made</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Remaining Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  ${remaining.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthsRemaining > 0 ? `~${monthsRemaining} payment${monthsRemaining !== 1 ? "s" : ""} remaining` : "Paid in full"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ownership Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Ownership Timeline
              </CardTitle>
              <CardDescription>
                {monthlyRate > 0 && (
                  <span>${monthlyRate.toLocaleString()}/mo payment</span>
                )}
                {estimatedPayoff && (
                  <span> · Estimated payoff: <strong>{format(estimatedPayoff, "MMMM yyyy")}</strong></span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>
                  {contractStart ? `Started ${format(contractStart, "MMM d, yyyy")}` : "Contract start date TBD"}
                </span>
                <span className="font-semibold text-foreground">{percentPaid.toFixed(1)}% complete</span>
              </div>
              <Progress value={percentPaid} className="h-4" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">$0</span>
                <span className="text-muted-foreground">${totalBuyoutPrice.toLocaleString()}</span>
              </div>
              {estimatedPayoff && (
                <p className="text-sm text-muted-foreground text-center pt-1">
                  Estimated ownership: <strong className="text-foreground">{format(estimatedPayoff, "MMMM d, yyyy")}</strong>
                  {monthsRemaining > 0 && ` (${monthsRemaining} payment${monthsRemaining !== 1 ? "s" : ""} at $${monthlyRate.toLocaleString()}/mo)`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Payment Schedule
              </CardTitle>
              <CardDescription>History of payments made and projected future payments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                    <TableHead className="text-right">Running Total</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Actual payments */}
                  {payments.map((p, i) => {
                    const runningTotal = payments.slice(0, i + 1).reduce((s, x) => s + Number(x.net_amount), 0);
                    const remainingAfter = Math.max(0, totalBuyoutPrice - runningTotal);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          {p.paid_at ? format(new Date(p.paid_at), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(p.net_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-primary">
                          ${runningTotal.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${remainingAfter.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="border border-border">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-primary" />
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Separator row if there are projections */}
                  {projectedPayments.length > 0 && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-2 italic">
                        — Projected future payments based on ${monthlyRate.toLocaleString()}/mo —
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Projected payments */}
                  {projectedPayments.map((p) => (
                    <TableRow key={`proj-${p.paymentNum}`} className="text-muted-foreground opacity-70">
                      <TableCell>{p.paymentNum}</TableCell>
                      <TableCell>{format(p.projectedDate, "MMM yyyy")}</TableCell>
                      <TableCell className="text-right">${p.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        ${Math.min(totalPaid + (p.paymentNum - payments.length) * monthlyRate, totalBuyoutPrice).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">${p.projectedRemaining.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">Projected</Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {payments.length === 0 && projectedPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payment history available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* DOT Inspection Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Annual DOT Inspection Status
              </CardTitle>
              <CardDescription>
                As a lease-to-own customer, you are responsible for scheduling and paying for annual DOT inspections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">No trailers found on this agreement.</p>
              ) : (
                <div className="space-y-4">
                  {items.map(item => {
                    const trailerInspections = dotInspections.filter(
                      d => d.trailer_number === item.trailer?.trailer_number
                    );
                    const latestInspection = trailerInspections[0] ?? null;
                    const lastInspectionDate = latestInspection
                      ? new Date(latestInspection.inspection_date)
                      : null;
                    const nextDueDate = lastInspectionDate
                      ? addYears(lastInspectionDate, 1)
                      : null;
                    const today = new Date();
                    const daysUntilDue = nextDueDate ? differenceInDays(nextDueDate, today) : null;
                    const isOverdue = nextDueDate ? isBefore(nextDueDate, today) : false;
                    const isDueSoon = !isOverdue && daysUntilDue !== null && daysUntilDue <= 60;
                    const isCurrent = !isOverdue && !isDueSoon && nextDueDate !== null;
                    const neverInspected = !latestInspection;

                    let statusBadge;
                    if (neverInspected) {
                      statusBadge = (
                        <Badge variant="outline" className="gap-1 border-destructive/50 text-destructive">
                          <XCircle className="h-3 w-3" /> No Inspection on File
                        </Badge>
                      );
                    } else if (isOverdue) {
                      statusBadge = (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Overdue
                        </Badge>
                      );
                    } else if (isDueSoon) {
                      statusBadge = (
                        <Badge variant="outline" className="gap-1 border-destructive/40 text-destructive/80">
                          <Clock className="h-3 w-3" /> Due Soon
                        </Badge>
                      );
                    } else {
                      statusBadge = (
                        <Badge variant="secondary" className="gap-1 border border-border">
                          <CheckCircle2 className="h-3 w-3 text-primary" /> Current
                        </Badge>
                      );
                    }

                    return (
                      <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-semibold text-foreground">
                              Trailer #{item.trailer?.trailer_number || "—"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.trailer?.type}{item.trailer?.year ? ` · ${item.trailer.year}` : ""}
                              {item.trailer?.axle_count ? ` · ${item.trailer.axle_count} Axle` : ""}
                              {item.trailer?.body_material ? ` · ${item.trailer.body_material}` : ""}
                              {item.trailer?.vin ? ` · VIN: ${item.trailer.vin}` : ""}
                            </p>
                          </div>
                          {statusBadge}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Inspection</p>
                            <p className="font-medium text-foreground mt-0.5">
                              {lastInspectionDate
                                ? format(lastInspectionDate, "MMM d, yyyy")
                                : "None on record"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Due</p>
                            <p className={`font-medium mt-0.5 ${isOverdue ? "text-destructive" : isDueSoon ? "text-destructive/70" : "text-foreground"}`}>
                              {nextDueDate ? format(nextDueDate, "MMM d, yyyy") : "—"}
                              {daysUntilDue !== null && !isOverdue && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (in {daysUntilDue}d)
                                </span>
                              )}
                              {isOverdue && nextDueDate && (
                                <span className="text-xs ml-1">
                                  ({Math.abs(differenceInDays(nextDueDate, today))}d overdue)
                                </span>
                              )}
                            </p>
                          </div>
                          {latestInspection?.inspector_name && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Inspector</p>
                              <p className="font-medium text-foreground mt-0.5">{latestInspection.inspector_name}</p>
                            </div>
                          )}
                        </div>

                        {(isOverdue || neverInspected) && (
                          <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {neverInspected
                                ? "No DOT inspection is on file for this trailer. Please schedule an annual DOT inspection as required by your lease-to-own agreement."
                                : "This trailer's DOT inspection is overdue. Please schedule an inspection immediately to remain in compliance with your agreement."}
                            </span>
                          </div>
                        )}

                        {isDueSoon && (
                          <div className="flex items-start gap-2 rounded-md bg-destructive/5 border border-destructive/20 p-3 text-sm text-destructive/80">
                            <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>
                              Your annual DOT inspection is due within {daysUntilDue} days. Schedule it soon to stay current.
                            </span>
                          </div>
                        )}

                        {trailerInspections.length > 1 && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View inspection history ({trailerInspections.length} total)
                            </summary>
                            <div className="mt-2 space-y-1 pl-1">
                              {trailerInspections.map(insp => (
                                <div key={insp.id} className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-1">
                                  <span>{format(new Date(insp.inspection_date), "MMM d, yyyy")}</span>
                                  <span className="capitalize">{insp.status || "completed"}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Alert className="border-border bg-muted/40">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="font-semibold text-foreground">
              Lease-to-Own Responsibilities
            </AlertTitle>
            <AlertDescription className="mt-3 space-y-2 text-muted-foreground">
              <p>As a lease-to-own customer, you have additional obligations beyond a standard lease:</p>
              <ul className="space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Annual DOT Inspections:</strong> You are responsible for scheduling and paying for annual DOT inspections on your trailer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Property Taxes:</strong> Property taxes on the trailer may be your responsibility depending on your state. Please consult your accountant.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Insurance Coverage:</strong> You must maintain adequate insurance coverage on the trailer throughout the lease term.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Title Transfer:</strong> At the end of your agreement, contact us to initiate the title transfer process. This is how ownership officially transfers to you.</span>
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Lease Agreement
              </CardTitle>
              <CardDescription>Your signed lease-to-own agreement document</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription.lease_agreement_url ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Lease-to-Own Agreement</p>
                    <p className="text-sm text-muted-foreground">
                      {contractStart ? `Signed ${format(contractStart, "MMMM d, yyyy")}` : "Signed agreement on file"}
                    </p>
                  </div>
                  <Button
                    onClick={handleDownloadAgreement}
                    disabled={downloadingAgreement}
                    variant="outline"
                    className="gap-2"
                  >
                    {downloadingAgreement ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download PDF
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Agreement Not Yet Available</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your signed lease-to-own agreement hasn't been uploaded yet. Please contact us at{" "}
                      <a href="tel:+12107037900" className="text-primary underline">
                        (210) 703-7900
                      </a>{" "}
                      or{" "}
                      <a href="mailto:info@crumsleasing.com" className="text-primary underline">
                        info@crumsleasing.com
                      </a>{" "}
                      to receive your signed copy.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trailer Info */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  Leased Trailer{items.length > 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">
                          Trailer #{item.trailer?.trailer_number || "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.trailer?.type}
                          {item.trailer?.year ? ` · ${item.trailer.year}` : ""}
                          {item.trailer?.vin ? ` · VIN: ${item.trailer.vin}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${Number(item.monthly_rate).toLocaleString()}/mo</p>
                        {item.lease_to_own_total && (
                          <p className="text-xs text-muted-foreground">Buyout: ${Number(item.lease_to_own_total).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
