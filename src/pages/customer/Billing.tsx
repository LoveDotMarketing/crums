import { useState } from "react";
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

  // Fetch ALL subscriptions for this customer (supports multi-sub customers)
  const { data: subscriptions, isLoading: subLoading } = useQuery({
    queryKey: ["customer-subscriptions", customerRecord?.id],
    queryFn: async () => {
      if (!customerRecord?.id) return [];
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select("*")
        .eq("customer_id", customerRecord.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerRecord?.id,
  });

  const subIds = subscriptions?.map((s) => s.id) || [];

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

  const { data: allSubscriptionItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["customer-subscription-items", subIds],
    queryFn: async () => {
      if (subIds.length === 0) return [];
      const { data, error } = await supabase
        .from("subscription_items")
        .select(`
          *,
          trailers:trailer_id (trailer_number, type)
        `)
        .in("subscription_id", subIds)
        .eq("status", "active");
      if (error) throw error;
      return data || [];
    },
    enabled: subIds.length > 0,
  });

  // Fetch applied discounts across all subscriptions
  const { data: allAppliedDiscounts } = useQuery({
    queryKey: ["customer-applied-discounts", subIds],
    queryFn: async () => {
      if (subIds.length === 0) return [];
      const { data, error } = await supabase
        .from("applied_discounts")
        .select(`
          *,
          discounts:discount_id (name, type, value, is_active)
        `)
        .in("subscription_id", subIds);
      if (error) throw error;
      return data || [];
    },
    enabled: subIds.length > 0,
  });

  const { data: allBillingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["customer-billing-history", subIds],
    queryFn: async () => {
      if (subIds.length === 0) return [];
      const { data, error } = await supabase
        .from("billing_history")
        .select("*")
        .in("subscription_id", subIds)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: subIds.length > 0,
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
      processing: "secondary",
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

  const getSubscriptionTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      standard_lease: "Standard Lease",
      "6_month_lease": "6 Month Lease",
      "24_month_lease": "24 Month Lease",
      lease_to_own: "Lease to Own",
      rent_for_storage: "Rent for Storage",
      repayment_plan: "Repayment Plan",
    };
    return labels[type || ""] || "Lease";
  };

  const getEffectiveBillingLabel = (item: any, sub: any) => {
    const cycle = item.billing_cycle || sub?.billing_cycle;
    const anchor = item.billing_anchor_day;
    if (cycle === "weekly") return "Every Friday";
    if (cycle === "semimonthly") return "1st & 15th";
    if (cycle === "monthly" && anchor === 15) return "15th of month";
    if (cycle === "monthly" && anchor === 1) return "1st of month";
    return cycle || "Monthly";
  };

  const isLoading = subLoading || itemsLoading || historyLoading;
  const hasSubscriptions = subscriptions && subscriptions.length > 0;

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
        ) : !hasSubscriptions ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  You don't have an active subscription yet. Contact us to set up your trailer lease.
                </p>
              </CardContent>
            </Card>

          </div>

        ) : (
          <div className="space-y-6">
            {/* Render each subscription */}
            {subscriptions.map((sub) => {
              const items = allSubscriptionItems?.filter((i) => i.subscription_id === sub.id) || [];
              const discounts = allAppliedDiscounts?.filter((d) => d.subscription_id === sub.id) || [];
              const history = allBillingHistory?.filter((h) => h.subscription_id === sub.id) || [];
              const totalRate = items.reduce((sum, item) => sum + Number(item.monthly_rate), 0);

              return (
                <div key={sub.id} className="space-y-4">
                  {/* Subscription header when multiple */}
                  {subscriptions.length > 1 && (
                    <div className="flex items-center gap-3 pt-2">
                      <h2 className="text-xl font-semibold">{getSubscriptionTypeLabel(sub.subscription_type)}</h2>
                      {getStatusBadge(sub.status)}
                      <span className="text-sm text-muted-foreground">
                        {items.length} trailer{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        {getStatusBadge(sub.status)}
                        <p className="text-xs text-muted-foreground mt-2 capitalize">
                          {getSubscriptionTypeLabel(sub.subscription_type)}
                          {" · "}
                          {sub.billing_cycle} billing
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
                          {sub.next_billing_date
                            ? format(new Date(sub.next_billing_date), "MMM d, yyyy")
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
                        <div className="text-2xl font-bold">{formatCurrency(totalRate)}</div>
                        <p className="text-xs text-muted-foreground">
                          per {sub.billing_cycle === "monthly" ? "month" : sub.billing_cycle === "biweekly" ? "2 weeks" : "week"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Deposit Status */}
                  {sub.deposit_amount && Number(sub.deposit_amount) > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Security Deposit</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {sub.deposit_paid ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="font-medium">
                            {formatCurrency(Number(sub.deposit_amount))}
                          </span>
                        </div>
                        <Badge variant={sub.deposit_paid ? "default" : "secondary"}>
                          {sub.deposit_paid ? "Paid" : "Pending"}
                        </Badge>
                      </CardContent>
                    </Card>
                  )}

                  {/* Active Discounts */}
                  {discounts.length > 0 && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span>🎖️</span>
                          Active Discounts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {discounts.map((ad) => {
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
                        Trailers included in this subscription
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {items.length > 0 ? (
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
                            {items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  {(item.trailers as { trailer_number: string } | null)?.trailer_number || "—"}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {(item.trailers as { type: string } | null)?.type?.replace("_", " ") || "—"}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {getEffectiveBillingLabel(item, sub)}
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
                      <CardDescription>Recent payments and invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {history.length > 0 ? (
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
                            {history.map((payment) => (
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

                  {/* Divider between subscriptions */}
                  {subscriptions.length > 1 && sub.id !== subscriptions[subscriptions.length - 1].id && (
                    <hr className="border-border" />
                  )}
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBilling;
