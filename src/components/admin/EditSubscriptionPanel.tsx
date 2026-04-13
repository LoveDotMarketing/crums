import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ManageTrailersDialog } from "./ManageTrailersDialog";
import { CustomerFormDialog } from "./CustomerFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CreditCard,
  KeyRound,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Truck,
  User,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BillingCycle = "weekly" | "biweekly" | "semimonthly" | "monthly";
type SubscriptionType = "standard_lease" | "6_month_lease" | "24_month_lease" | "month_to_month" | "rent_for_storage" | "lease_to_own" | "repayment_plan";

interface EditSubscriptionPanelProps {
  subscriptionId: string;
  onSave: () => void;
  onCancel: () => void;
}

const subscriptionTypes: { value: SubscriptionType; label: string; icon: React.ReactNode }[] = [
  { value: "standard_lease", label: "Standard 12 Month Lease", icon: null },
  { value: "6_month_lease", label: "6 Month Lease", icon: <CalendarIcon className="h-4 w-4" /> },
  { value: "24_month_lease", label: "24 Month Lease", icon: <CalendarIcon className="h-4 w-4" /> },
  { value: "month_to_month", label: "Month to Month", icon: <CalendarIcon className="h-4 w-4" /> },
  { value: "rent_for_storage", label: "Rent for Storage", icon: <Warehouse className="h-4 w-4" /> },
  { value: "lease_to_own", label: "Lease to Own", icon: <KeyRound className="h-4 w-4" /> },
  { value: "repayment_plan", label: "Repayment Plan", icon: <CreditCard className="h-4 w-4" /> },
];

export function EditSubscriptionPanel({ subscriptionId, onSave, onCancel }: EditSubscriptionPanelProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [showManageTrailers, setShowManageTrailers] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isResettingPayment, setIsResettingPayment] = useState(false);
  const [rateEdits, setRateEdits] = useState<Record<string, string>>({});

  // Form state
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("standard_lease");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [contractStartDate, setContractStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [nextBillingDate, setNextBillingDate] = useState<Date | undefined>();
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositPaid, setDepositPaid] = useState(false);

  // Fetch the subscription
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription-detail", subscriptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select(`
          *,
          customers (
            id,
            full_name,
            email,
            company_name,
            phone,
            city,
            state,
            zip,
            status,
            notes,
            payment_type,
            account_number,
            birthday
          )
        `)
        .eq("id", subscriptionId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch subscription items (trailers)
  const { data: items } = useQuery({
    queryKey: ["subscription-items-detail", subscriptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_items")
        .select(`
          *,
          trailers (
            trailer_number,
            type,
            year
          )
        `)
        .eq("subscription_id", subscriptionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch application for payment method info
  const { data: application } = useQuery({
    queryKey: ["subscription-application", subscription?.customer_id],
    enabled: !!subscription?.customer_id,
    queryFn: async () => {
      const { data: customer } = await supabase
        .from("customers")
        .select("email")
        .eq("id", subscription!.customer_id)
        .single();

      if (!customer?.email) return null;

      const { data, error } = await supabase
        .from("customer_applications")
        .select("id, payment_method_type, payment_setup_status, stripe_customer_id")
        .ilike("phone_number", `%`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !data) return null;

      // Find matching application by looking up user via email
      const { data: profiles } = await supabase
        .from("customer_applications")
        .select("id, payment_method_type, payment_setup_status, stripe_customer_id, customer_id")
        .eq("customer_id", subscription!.customer_id)
        .order("created_at", { ascending: false })
        .limit(1);

      return profiles?.[0] || null;
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (subscription) {
      setSubscriptionType((subscription.subscription_type as SubscriptionType) || "standard_lease");
      setBillingCycle(subscription.billing_cycle as BillingCycle);
      setContractStartDate(subscription.contract_start_date ? new Date(subscription.contract_start_date + "T00:00:00") : undefined);
      setEndDate(subscription.end_date ? new Date(subscription.end_date + "T00:00:00") : undefined);
      setNextBillingDate(subscription.next_billing_date ? new Date(subscription.next_billing_date + "T00:00:00") : undefined);
      setDepositAmount(String(subscription.deposit_amount || 0));
      setDepositPaid(subscription.deposit_paid || false);
    }
  }, [subscription]);

  // Initialize rate edits when items load
  useEffect(() => {
    if (items) {
      const activeItems = items.filter(i => i.status === "active");
      const initialRates: Record<string, string> = {};
      activeItems.forEach((item: any) => {
        initialRates[item.id] = String(item.monthly_rate || 0);
      });
      setRateEdits(initialRates);
    }
  }, [items]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: Record<string, any> = {
        subscription_type: subscriptionType,
        billing_cycle: billingCycle,
        contract_start_date: contractStartDate ? format(contractStartDate, "yyyy-MM-dd") : null,
        end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
        next_billing_date: nextBillingDate ? format(nextBillingDate, "yyyy-MM-dd") : null,
        deposit_amount: parseFloat(depositAmount) || 0,
        deposit_paid: depositPaid,
      };

      if (depositPaid && !subscription?.deposit_paid) {
        updateData.deposit_paid_at = new Date().toISOString();
      } else if (!depositPaid) {
        updateData.deposit_paid_at = null;
      }

      const { error } = await supabase
        .from("customer_subscriptions")
        .update(updateData)
        .eq("id", subscriptionId);

      if (error) throw error;

      // Update rates for each active item that changed
      const activeItems = items?.filter(i => i.status === "active") || [];
      const rateUpdatePromises: Promise<any>[] = [];

      for (const item of activeItems) {
        const newRate = parseFloat(rateEdits[item.id] || "0");
        const oldRate = item.monthly_rate || 0;
        if (newRate !== oldRate && newRate > 0) {
          // Update local DB
          const dbUpdate = async () => {
            await supabase
              .from("subscription_items")
              .update({ monthly_rate: newRate })
              .eq("id", item.id);
          };
          rateUpdatePromises.push(dbUpdate());

          // Sync to Stripe if subscription is active and has stripe ID
          if (subscription?.stripe_subscription_id && subscription?.status === "active") {
            rateUpdatePromises.push(
              supabase.functions.invoke("modify-subscription", {
                body: {
                  subscriptionId,
                  action: "change_rate",
                  itemId: item.id,
                  trailerId: item.trailer_id,
                  newRate,
                },
              })
            );
          }
        }
      }

      // Sync billing date to Stripe if changed and subscription is active
      const originalNextBilling = subscription?.next_billing_date;
      const newNextBilling = nextBillingDate ? format(nextBillingDate, "yyyy-MM-dd") : null;
      if (
        newNextBilling !== originalNextBilling &&
        subscription?.stripe_subscription_id &&
        subscription?.status === "active" &&
        nextBillingDate
      ) {
        rateUpdatePromises.push(
          supabase.functions.invoke("modify-subscription", {
            body: {
              subscriptionId,
              action: "change_billing_date",
              newBillingDate: newNextBilling,
            },
          })
        );
      }

      if (rateUpdatePromises.length > 0) {
        await Promise.all(rateUpdatePromises);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["subscription-detail", subscriptionId] }),
        queryClient.invalidateQueries({ queryKey: ["subscription-items-detail", subscriptionId] }),
      ]);

      toast.success("Subscription updated successfully");
      onSave();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPayment = async () => {
    if (!application?.id) {
      toast.error("No application found for this customer");
      return;
    }
    setIsResettingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-payment-setup", {
        body: { applicationId: application.id },
      });
      if (error) throw error;
      toast.success(`Payment method reset. ${data.detachedCount} method(s) detached from Stripe.`);
      queryClient.invalidateQueries({ queryKey: ["subscription-application"] });
    } catch (error) {
      toast.error("Failed to reset: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsResettingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Subscription not found.
        <Button variant="link" onClick={onCancel}>Go back</Button>
      </div>
    );
  }

  const activeItems = items?.filter(i => i.status === "active") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            Edit Subscription — {subscription.customers?.full_name || "Unknown"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {subscription.customers?.company_name || subscription.customers?.email} · Status: <Badge variant="outline">{subscription.status}</Badge>
          </p>
        </div>
        {subscription.customers && (
          <Button variant="outline" size="sm" onClick={() => setShowCustomerForm(true)}>
            <User className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Subscription Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {subscriptionTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSubscriptionType(t.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                  subscriptionType === t.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                {t.icon && <span className="text-muted-foreground">{t.icon}</span>}
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Billing & Dates */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Billing Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Contract Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !contractStartDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {contractStartDate ? format(contractStartDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={contractStartDate} onSelect={setContractStartDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Next Billing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !nextBillingDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextBillingDate ? format(nextBillingDate, "PPP") : "Not set"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={nextBillingDate} onSelect={setNextBillingDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                {subscription.status === "active" && subscription.stripe_subscription_id && (
                  <p className="text-xs text-muted-foreground">Changing this will update the billing anchor in Stripe</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deposit, Trailers & Payment Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Amount ($)</Label>
              <Input
                type="number"
                min="0"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Deposit Paid</Label>
              <Switch checked={depositPaid} onCheckedChange={setDepositPaid} />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded border border-border">
              <div>
                <span className="text-sm font-medium">
                  {application?.payment_method_type === "card" ? "Credit/Debit Card" : "ACH Bank Transfer"}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  Status: {application?.payment_setup_status || "unknown"}
                </span>
              </div>
              <Badge variant={application?.payment_setup_status === "completed" ? "default" : "secondary"}>
                {application?.payment_setup_status || "N/A"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleResetPayment}
              disabled={isResettingPayment || !application?.stripe_customer_id}
            >
              {isResettingPayment ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reset Payment Method
            </Button>
            {!application?.stripe_customer_id && (
              <p className="text-xs text-muted-foreground">No Stripe customer linked — cannot reset</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trailers with Rate Editing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Assigned Trailers ({activeItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeItems.length > 0 ? (
            <div className="space-y-3">
              {activeItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{item.trailers?.trailer_number}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.trailers?.year} {item.trailers?.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">$/mo</Label>
                    <Input
                      type="number"
                      min="0"
                      step="25"
                      className="w-24 h-8 text-sm"
                      value={rateEdits[item.id] ?? String(item.monthly_rate || 0)}
                      onChange={(e) =>
                        setRateEdits((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No trailers assigned</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => setShowManageTrailers(true)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Manage Trailers
          </Button>
          <ManageTrailersDialog
            open={showManageTrailers}
            onOpenChange={(open) => {
              setShowManageTrailers(open);
              if (!open) {
                queryClient.invalidateQueries({ queryKey: ["subscription-items-detail", subscriptionId] });
              }
            }}
            subscriptionId={subscriptionId}
            customerId={subscription.customer_id}
            customerName={subscription.customers?.full_name || "Customer"}
            currentItems={activeItems}
          />
        </CardContent>
      </Card>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-background border-t border-border -mx-6 px-6 py-4 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Customer Edit Dialog */}
      {subscription.customers && (
        <CustomerFormDialog
          open={showCustomerForm}
          onOpenChange={(open) => {
            setShowCustomerForm(open);
            if (!open) {
              queryClient.invalidateQueries({ queryKey: ["subscription-detail", subscriptionId] });
            }
          }}
          customer={subscription.customers as any}
        />
      )}
    </div>
  );
}
