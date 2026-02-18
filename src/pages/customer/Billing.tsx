import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CreditCard, Calendar, DollarSign, Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

const CustomerBilling = () => {
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;

  // First look up the customer record by email
  const { data: customerRecord } = useQuery({
    queryKey: ["customer-record-billing", currentEmail],
    queryFn: async () => {
      if (!currentEmail) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentEmail,
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["customer-subscription", customerRecord?.id],
    queryFn: async () => {
      if (!customerRecord?.id) return null;
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select("*")
        .eq("customer_id", customerRecord.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!customerRecord?.id,
  });

  // Fetch customer's billing anchor preference from application
  const { data: application } = useQuery({
    queryKey: ["customer-application-billing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("billing_anchor_day, preferred_billing_cycle")
        .maybeSingle();
      if (error) return null;
      return data;
    },
  });

  const { data: subscriptionItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["customer-subscription-items", subscription?.id],
    queryFn: async () => {
      if (!subscription?.id) return [];
      const { data, error } = await supabase
        .from("subscription_items")
        .select(`
          *,
          trailers:trailer_id (trailer_number, type)
        `)
        .eq("subscription_id", subscription.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!subscription?.id,
  });

  // Fetch applied discounts
  const { data: appliedDiscounts } = useQuery({
    queryKey: ["customer-applied-discounts", subscription?.id],
    queryFn: async () => {
      if (!subscription?.id) return [];
      const { data, error } = await supabase
        .from("applied_discounts")
        .select(`
          *,
          discounts:discount_id (name, type, value, is_active)
        `)
        .eq("subscription_id", subscription.id);
      if (error) throw error;
      return data;
    },
    enabled: !!subscription?.id,
  });

  const { data: billingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["customer-billing-history", subscription?.id],
    queryFn: async () => {
      if (!subscription?.id) return [];
      const { data, error } = await supabase
        .from("billing_history")
        .select("*")
        .eq("subscription_id", subscription.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!subscription?.id,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      active: { variant: "default", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
      past_due: { variant: "destructive", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      canceled: { variant: "outline", icon: null },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.icon}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      succeeded: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getEffectiveBillingLabel = (item: any) => {
    const cycle = item.billing_cycle || subscription?.billing_cycle;
    const anchor = item.billing_anchor_day;
    if (cycle === "weekly") return "Every Friday";
    if (cycle === "semimonthly") return "1st & 15th";
    if (cycle === "monthly" && anchor === 15) return "15th of month";
    if (cycle === "monthly" && anchor === 1) return "1st of month";
    return cycle || "Monthly";
  };

  const totalMonthlyRate = subscriptionItems?.reduce(
    (sum, item) => sum + Number(item.monthly_rate),
    0
  ) || 0;

  const isLoading = subLoading || itemsLoading || historyLoading;

  return (
    <div className="min-h-screen bg-background">
      {!isImpersonating && <Navigation />}
      <CustomerNav />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground mt-1">
            View your subscription details and payment history
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : !subscription ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                You don't have an active subscription yet. Contact us to set up your trailer lease.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {getStatusBadge(subscription.status)}
                  <p className="text-xs text-muted-foreground mt-2 capitalize">
                    {subscription.billing_cycle} billing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Billing Date</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription.next_billing_date
                      ? format(new Date(subscription.next_billing_date), "MMM d, yyyy")
                      : "—"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Rate</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalMonthlyRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    per {subscription.billing_cycle === "monthly" ? "month" : subscription.billing_cycle === "biweekly" ? "2 weeks" : "week"}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Due Date Card */}
              {(application?.billing_anchor_day || (application as any)?.preferred_billing_cycle === "weekly") && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Due Date</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {(application as any)?.preferred_billing_cycle === "weekly" || application?.billing_anchor_day === 5 ? (
                      <>
                        <div className="text-2xl font-bold">Every Friday</div>
                        <p className="text-xs text-muted-foreground">weekly billing</p>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {application?.billing_anchor_day === 1 ? "1st" : "15th"}
                        </div>
                        <p className="text-xs text-muted-foreground">of each month</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Deposit Status */}
            {subscription.deposit_amount && subscription.deposit_amount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Deposit</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {subscription.deposit_paid ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">
                      {formatCurrency(Number(subscription.deposit_amount))}
                    </span>
                  </div>
                  <Badge variant={subscription.deposit_paid ? "default" : "secondary"}>
                    {subscription.deposit_paid ? "Paid" : "Pending"}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Active Discounts */}
            {appliedDiscounts && appliedDiscounts.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>🎖️</span>
                    Active Discounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appliedDiscounts.map((ad) => {
                      const discount = ad.discounts as { name: string; type: string; value: number; is_active: boolean } | null;
                      if (!discount || !discount.is_active) return null;
                      return (
                        <div key={ad.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="default" className="bg-primary">
                              {discount.type === 'percentage' ? `${discount.value}% OFF` : formatCurrency(Number(discount.value))}
                            </Badge>
                            <span className="font-medium">{discount.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Applied {format(new Date(ad.applied_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leased Trailers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Leased Trailers
                </CardTitle>
                <CardDescription>
                  Trailers included in your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionItems && subscriptionItems.length > 0 ? (
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Trailer #</TableHead>
                         <TableHead>Type</TableHead>
                         <TableHead>Billing Schedule</TableHead>
                         <TableHead>Start Date</TableHead>
                         <TableHead className="text-right">Rate</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {subscriptionItems.map((item) => (
                         <TableRow key={item.id}>
                           <TableCell className="font-medium">
                             {(item.trailers as { trailer_number: string } | null)?.trailer_number || "—"}
                           </TableCell>
                           <TableCell className="capitalize">
                             {(item.trailers as { type: string } | null)?.type?.replace("_", " ") || "—"}
                           </TableCell>
                           <TableCell>
                             <span className="text-sm text-muted-foreground">
                               {getEffectiveBillingLabel(item)}
                             </span>
                           </TableCell>
                           <TableCell>
                             {format(new Date(item.start_date), "MMM d, yyyy")}
                           </TableCell>
                           <TableCell className="text-right">
                             {formatCurrency(Number(item.monthly_rate))}
                           </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No trailers in this subscription
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory && billingHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {payment.billing_period_start && payment.billing_period_end
                              ? `${format(new Date(payment.billing_period_start), "MMM d")} - ${format(new Date(payment.billing_period_end), "MMM d")}`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {formatCurrency(Number(payment.net_amount))}
                              </span>
                              {Number(payment.discount_amount) > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  -{formatCurrency(Number(payment.discount_amount))} discount
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No payment history yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBilling;
