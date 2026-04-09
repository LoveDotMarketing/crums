import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck, RefreshCw, DollarSign, Tag, CalendarIcon, Info, KeyRound, Warehouse, FileText, CreditCard, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { logSubscriptionCreated } from "@/lib/eventLogger";

type BillingCycle = "weekly" | "biweekly" | "semimonthly" | "monthly";
type SubscriptionType = "standard_lease" | "6_month_lease" | "24_month_lease" | "month_to_month" | "rent_for_storage" | "lease_to_own" | "repayment_plan";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
}

interface AvailableTrailer {
  id: string;
  trailer_number: string;
  vin: string | null;
  type: string;
  year: number | null;
  rental_rate: number | null;
}

interface SelectedTrailer {
  id: string;
  trailer_number: string;
  vin: string | null;
  type: string;
  year: number | null;
  customRate: number;
  leaseToOwn: boolean;
  billingSchedule: "default" | "monthly-1" | "monthly-15" | "weekly-friday";
}

interface Discount {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  is_active: boolean;
}

interface CreateSubscriptionDialogProps {
  onSuccess?: () => void;
  mode?: "dialog" | "inline";
  onCancel?: () => void;
}

export function CreateSubscriptionDialog({ onSuccess, mode = "dialog", onCancel }: CreateSubscriptionDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [depositAmount, setDepositAmount] = useState<number>(1000); // Standard $1,000 deposit requirement
  const [selectedTrailers, setSelectedTrailers] = useState<SelectedTrailer[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("standard_lease");
  const [leaseToOwnTotal, setLeaseToOwnTotal] = useState<number>(0);
  const [billingAnchorDay, setBillingAnchorDay] = useState<number>(1);
  const [firstBillingDate, setFirstBillingDate] = useState<Date | undefined>(undefined);
  const [showReview, setShowReview] = useState(false);
  const [confirmAmount, setConfirmAmount] = useState("");

  // Fetch customer's billing anchor preference
  const { data: customerApplication } = useQuery({
    queryKey: ["customer-application-billing-preference", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const { data: customer } = await supabase
        .from("customers")
        .select("email")
        .eq("id", selectedCustomerId)
        .single();
      
      if (!customer?.email) return null;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", customer.email)
        .maybeSingle();
      
      if (!profile?.id) return null;
      
      // Use order + limit to handle repeat customers instead of maybeSingle
      const { data, error } = await supabase
        .from("customer_applications")
        .select("billing_anchor_day")
        .eq("user_id", profile.id)
        .order("updated_at", { ascending: false })
        .limit(1);
      
      if (error || !data?.length) return null;
      return data[0];
    },
    enabled: !!selectedCustomerId && (isOpen || mode === "inline"),
  });

  // Sync billing anchor day from customer preference when loaded
  useEffect(() => {
    if (customerApplication?.billing_anchor_day) {
      setBillingAnchorDay(customerApplication.billing_anchor_day);
    } else {
      setBillingAnchorDay(1);
    }
  }, [customerApplication]);

  // Fetch all active customers (no subscription filter — supports split billing)
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers-for-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, company_name")
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      return (data || []) as Customer[];
    },
    enabled: isOpen || mode === "inline"
  });

  // Fetch trailer IDs already on active/pending/paused subscriptions for the selected customer
  const { data: subscribedTrailerIds } = useQuery({
    queryKey: ["subscribed-trailer-ids", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const { data, error } = await supabase
        .from("subscription_items")
        .select("trailer_id, customer_subscriptions!inner(customer_id, status)")
        .eq("customer_subscriptions.customer_id", selectedCustomerId)
        .in("customer_subscriptions.status", ["active", "pending", "paused"]);

      if (error) throw error;
      return (data || []).map(item => item.trailer_id);
    },
    enabled: (isOpen || mode === "inline") && !!selectedCustomerId
  });

  // Fetch available trailers + trailers already assigned to selected customer
  const { data: availableTrailers, isLoading: loadingTrailers } = useQuery({
    queryKey: ["available-trailers-for-subscription", selectedCustomerId, subscribedTrailerIds],
    queryFn: async () => {
      const cols = "id, trailer_number, vin, type, year, rental_rate";
      const excludeIds = new Set(subscribedTrailerIds || []);

      if (selectedCustomerId) {
        // Two explicit queries to avoid PostgREST .or() edge cases
        const [availableRes, customerRes] = await Promise.all([
          supabase
            .from("trailers")
            .select(cols)
            .in("status", ["available", "pending"])
            .is("customer_id", null)
            .order("trailer_number"),
          supabase
            .from("trailers")
            .select(cols)
            .eq("customer_id", selectedCustomerId)
            .order("trailer_number"),
        ]);

        if (availableRes.error) throw availableRes.error;
        if (customerRes.error) throw customerRes.error;

        // Merge and deduplicate
        const seen = new Set<string>();
        const merged: AvailableTrailer[] = [];
        for (const t of [...(customerRes.data || []), ...(availableRes.data || [])]) {
          if (!seen.has(t.id) && !excludeIds.has(t.id)) {
            seen.add(t.id);
            merged.push(t as AvailableTrailer);
          }
        }
        return merged;
      } else {
        const { data, error } = await supabase
          .from("trailers")
          .select(cols)
          .in("status", ["available", "pending"])
          .is("customer_id", null)
          .order("trailer_number");

        if (error) throw error;
        const filtered = excludeIds.size > 0
          ? (data || []).filter(t => !excludeIds.has(t.id))
          : (data || []);
        return filtered as AvailableTrailer[];
      }
    },
    enabled: (isOpen || mode === "inline") && (!!selectedCustomerId ? subscribedTrailerIds !== undefined : true)
  });

  // Fetch active discounts
  const { data: discounts } = useQuery({
    queryKey: ["active-discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discounts")
        .select("id, name, type, value, is_active")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Discount[];
    },
    enabled: isOpen || mode === "inline"
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomerId) throw new Error("Please select a customer");
      if (selectedTrailers.length === 0) throw new Error("Please select at least one trailer");

      // ACH guard: Check if customer has a payment method linked
      const customer = customers?.find(c => c.id === selectedCustomerId);
      if (customer?.email) {
        let hasPaymentMethod = false;

        // Path 1: profile → user_id → customer_applications (hardened for repeat customers)
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", customer.email)
          .maybeSingle();
        
        if (profile?.id) {
          const { data: applications } = await supabase
            .from("customer_applications")
            .select("stripe_payment_method_id")
            .eq("user_id", profile.id)
            .not("stripe_payment_method_id", "is", null)
            .order("updated_at", { ascending: false })
            .limit(1);
          
          if (applications?.[0]?.stripe_payment_method_id) {
            hasPaymentMethod = true;
          }
        }

        // Path 2 (fallback): customer_id → customer_applications
        if (!hasPaymentMethod) {
          const { data: appByCustomerRows } = await supabase
            .from("customer_applications")
            .select("stripe_payment_method_id")
            .eq("customer_id", selectedCustomerId)
            .not("stripe_payment_method_id", "is", null)
            .order("updated_at", { ascending: false })
            .limit(1);

          if (appByCustomerRows?.[0]?.stripe_payment_method_id) {
            hasPaymentMethod = true;
          }
        }

        if (!hasPaymentMethod) {
          throw new Error("Customer has no payment method linked. Set up ACH or card on their profile first.");
        }
      }

      // For lease_to_own subscription type, all trailers should be marked as lease to own
      const leaseToOwnFlags = selectedTrailers.reduce((acc, t) => {
        acc[t.id] = subscriptionType === "lease_to_own" ? true : t.leaseToOwn;
        return acc;
      }, {} as Record<string, boolean>);

      // Call edge function to create subscription in Stripe and local DB
      const trailerBillingSchedules = selectedTrailers.reduce((acc, t) => {
        if (t.billingSchedule !== "default") {
          acc[t.id] = {
            billing_cycle: t.billingSchedule === "weekly-friday" ? "weekly" : "monthly",
            billing_anchor_day: t.billingSchedule === "weekly-friday" ? 5 : t.billingSchedule === "monthly-15" ? 15 : 1,
          };
        }
        return acc;
      }, {} as Record<string, { billing_cycle: string; billing_anchor_day: number }>);

      const { data, error } = await supabase.functions.invoke("create-subscription", {
        body: {
          customerId: selectedCustomerId,
          trailerIds: selectedTrailers.map(t => t.id),
          billingCycle,
          depositAmount,
          discountId: selectedDiscountId || undefined,
          customRates: selectedTrailers.reduce((acc, t) => {
            acc[t.id] = t.customRate;
            return acc;
          }, {} as Record<string, number>),
          leaseToOwnFlags,
          trailerBillingSchedules,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          subscriptionType,
          billingAnchorDay,
          firstBillingDate: firstBillingDate ? format(firstBillingDate, "yyyy-MM-dd") : undefined,
          leaseToOwnTotal: subscriptionType === "lease_to_own" && leaseToOwnTotal > 0 ? leaseToOwnTotal : undefined
        }
      });

      if (error) {
        // Surface the actual backend error message if available
        const backendMsg = (error as any)?.context?.body ? 
          (() => { try { return JSON.parse((error as any).context.body)?.error; } catch { return null; } })() 
          : null;
        throw new Error(backendMsg || error.message || "Failed to create subscription");
      }
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
      queryClient.invalidateQueries({ queryKey: ["available-trailers-for-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["customers-for-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customer-assigned-trailers"] });
      
      // Log admin action
      const customer = customers?.find(c => c.id === selectedCustomerId);
      logSubscriptionCreated(
        customer?.full_name || selectedCustomerId,
        selectedTrailers.length,
        subscriptionType
      );
      
      if (mode === "inline") {
        resetForm();
        onSuccess?.();
      } else {
        setIsOpen(false);
        resetForm();
        toast.success("Subscription created successfully");
        onSuccess?.();
      }
    },
    onError: (error) => {
      toast.error("Failed to create subscription: " + error.message);
    }
  });

  const resetForm = () => {
    setSelectedCustomerId("");
    setBillingCycle("monthly");
    setDepositAmount(1000); // Reset to standard $1,000 deposit
    setSelectedTrailers([]);
    setSelectedDiscountId("");
    setEndDate(undefined);
    setSubscriptionType("standard_lease");
    setLeaseToOwnTotal(0);
    setBillingAnchorDay(1);
    setFirstBillingDate(undefined);
    setShowReview(false);
  };

  // Get type-based default rental rate
  const getDefaultRentalRate = (type: string): number => {
    const typeLower = type?.toLowerCase() || "";
    if (typeLower.includes("flat") || typeLower.includes("flatbed")) {
      return 750;
    }
    if (typeLower.includes("refrigerated") || typeLower.includes("reefer")) {
      return 850;
    }
    return 700; // Dry Van default
  };

  const handleTrailerToggle = (trailer: AvailableTrailer, checked: boolean) => {
    if (checked) {
      setSelectedTrailers(prev => [
        ...prev,
        {
          id: trailer.id,
          trailer_number: trailer.trailer_number,
          vin: trailer.vin,
          type: trailer.type,
          year: trailer.year,
          customRate: trailer.rental_rate || getDefaultRentalRate(trailer.type),
          leaseToOwn: false,
          billingSchedule: "default",
        }
      ]);
    } else {
      setSelectedTrailers(prev => prev.filter(t => t.id !== trailer.id));
    }
  };

  const handleLeaseToOwnToggle = (trailerId: string, checked: boolean) => {
    setSelectedTrailers(prev =>
      prev.map(t => t.id === trailerId ? { ...t, leaseToOwn: checked } : t)
    );
  };

  // Handle subscription type change
  const handleSubscriptionTypeChange = (value: SubscriptionType) => {
    setSubscriptionType(value);
    
    // Auto-set end date for standard lease (12 months)
    if (value === "standard_lease") {
      const twelveMonthsFromNow = new Date();
      twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);
      setEndDate(twelveMonthsFromNow);
    }
    
    // Auto-set end date for 6-month lease
    if (value === "6_month_lease") {
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      setEndDate(sixMonthsFromNow);
    }
    
    // Auto-set end date for 24-month lease
    if (value === "24_month_lease") {
      const twentyFourMonthsFromNow = new Date();
      twentyFourMonthsFromNow.setMonth(twentyFourMonthsFromNow.getMonth() + 24);
      setEndDate(twentyFourMonthsFromNow);
    }
    
    // If lease to own, mark all trailers as lease to own
    if (value === "lease_to_own") {
      setSelectedTrailers(prev =>
        prev.map(t => ({ ...t, leaseToOwn: true }))
      );
    }
  };

  const handleRateChange = (trailerId: string, rate: number) => {
    setSelectedTrailers(prev =>
      prev.map(t => t.id === trailerId ? { ...t, customRate: rate } : t)
    );
  };

  const handleBillingScheduleChange = (trailerId: string, schedule: SelectedTrailer["billingSchedule"]) => {
    setSelectedTrailers(prev =>
      prev.map(t => t.id === trailerId ? { ...t, billingSchedule: schedule } : t)
    );
  };

  const getBillingScheduleLabel = (schedule: SelectedTrailer["billingSchedule"]) => {
    switch (schedule) {
      case "monthly-1": return "1st of month";
      case "monthly-15": return "15th of month";
      case "weekly-friday": return "Every Friday";
      default: return "Subscription default";
    }
  };

  const totalMonthlyRate = selectedTrailers.reduce((sum, t) => sum + t.customRate, 0);
  
  // Detect if any trailer uses weekly billing for summary labels
  const hasWeeklyTrailer = selectedTrailers.some(t => t.billingSchedule === "weekly-friday");
  const effectiveBillingLabel = hasWeeklyTrailer ? "Weekly" : billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1);
  const effectiveTotalLabel = hasWeeklyTrailer ? "Weekly Total" : "Monthly Total";

  const isTrailerSelected = (trailerId: string) => 
    selectedTrailers.some(t => t.id === trailerId);

  // Shared form body
  const formBody = (
        <div className="space-y-6 py-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            {loadingCustomers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading customers...
              </div>
            ) : customers && customers.length > 0 ? (
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex flex-col">
                        <span>{customer.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {customer.company_name || customer.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No customers available without active subscriptions.
              </p>
            )}
          </div>

          {/* Billing Anchor Day Selection */}
          {selectedCustomerId && (
            <>
            <div className="space-y-3">
              <Label>Billing Anchor Day</Label>
              {customerApplication?.billing_anchor_day && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  Customer preference: {customerApplication.billing_anchor_day === 1 ? "1st" : `${customerApplication.billing_anchor_day}th`} of the month
                </div>
              )}
              <Select
                value={billingAnchorDay.toString()}
                onValueChange={(v) => setBillingAnchorDay(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st of the month</SelectItem>
                  <SelectItem value="15">15th of the month</SelectItem>
                  <SelectItem value="5">5th of the month</SelectItem>
                  <SelectItem value="10">10th of the month</SelectItem>
                  <SelectItem value="20">20th of the month</SelectItem>
                  <SelectItem value="25">25th of the month</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sets the Stripe billing cycle anchor. Use different anchor days for split billing across multiple subscriptions.
              </p>
            </div>

            {/* First Billing Date Override */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                First Billing Date (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !firstBillingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {firstBillingDate ? format(firstBillingDate, "PPP") : "Auto (next anchor date)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={firstBillingDate}
                    onSelect={setFirstBillingDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {firstBillingDate && (() => {
                const daysOut = Math.ceil((firstBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isDelayed = daysOut > 25;
                return (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {isDelayed 
                          ? `Delayed start: deposit charged now, first recurring charge on ${format(firstBillingDate, "MMM d, yyyy")} (~${daysOut} days out).`
                          : `Overrides anchor day calculation. First charge will be on ${format(firstBillingDate, "MMM d, yyyy")}.`
                        }
                      </p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setFirstBillingDate(undefined)}>
                        Clear
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
            </>
          )}

          {/* Subscription Type Selection */}
          <div className="space-y-3">
            <Label>Subscription Type</Label>
            <RadioGroup 
              value={subscriptionType} 
              onValueChange={(v) => handleSubscriptionTypeChange(v as SubscriptionType)}
              className="grid gap-3"
            >
              <div className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                subscriptionType === "standard_lease" && "border-primary bg-primary/5"
              )}>
                <RadioGroupItem value="standard_lease" id="standard_lease" className="mt-1" />
                <Label htmlFor="standard_lease" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Standard 12 Month Lease
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    Minimum 12-month commitment with recurring billing
                  </p>
                </Label>
              </div>

              <div className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                subscriptionType === "6_month_lease" && "border-green-500 bg-green-500/5"
              )}>
                <RadioGroupItem value="6_month_lease" id="6_month_lease" className="mt-1" />
                <Label htmlFor="6_month_lease" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-green-500" />
                    6 Month Lease
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    Short-term 6-month commitment with recurring billing
                  </p>
                </Label>
              </div>

              <div className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                subscriptionType === "24_month_lease" && "border-indigo-500 bg-indigo-500/5"
              )}>
                <RadioGroupItem value="24_month_lease" id="24_month_lease" className="mt-1" />
                <Label htmlFor="24_month_lease" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    24 Month Lease
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    Extended 24-month commitment with recurring billing
                  </p>
                </Label>
              </div>

              <div className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                subscriptionType === "rent_for_storage" && "border-blue-500 bg-blue-500/5"
              )}>
                <RadioGroupItem value="rent_for_storage" id="rent_for_storage" className="mt-1" />
                <Label htmlFor="rent_for_storage" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <Warehouse className="h-4 w-4 text-blue-500" />
                    Rent for Storage
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    Flexible rental for storage purposes
                  </p>
                </Label>
              </div>

              <div className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                subscriptionType === "lease_to_own" && "border-primary bg-primary/5"
              )}>
                <RadioGroupItem value="lease_to_own" id="lease_to_own" className="mt-1" />
                <Label htmlFor="lease_to_own" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <KeyRound className="h-4 w-4 text-primary" />
                    Lease to Own
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    Customer will own trailer(s) at end of lease
                  </p>
                </Label>
              </div>

              <div className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                subscriptionType === "month_to_month" && "border-teal-500 bg-teal-500/5"
              )}>
                <RadioGroupItem value="month_to_month" id="month_to_month" className="mt-1" />
                <Label htmlFor="month_to_month" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarIcon className="h-4 w-4 text-teal-500" />
                    Month to Month
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    No long-term commitment, cancel anytime
                  </p>
                </Label>
              </div>

              <div className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                subscriptionType === "repayment_plan" && "border-amber-500 bg-amber-500/5"
              )}>
                <RadioGroupItem value="repayment_plan" id="repayment_plan" className="mt-1" />
                <Label htmlFor="repayment_plan" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <CreditCard className="h-4 w-4 text-amber-500" />
                    Repayment Plan
                  </div>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    Recovery plan for customers with failed payments
                  </p>
                </Label>
              </div>
            </RadioGroup>

            {/* Lease to Own Total Price */}
            {subscriptionType === "lease_to_own" && (
              <div className="mt-3 p-3 border rounded-lg bg-primary/5 space-y-2">
                <Label htmlFor="lease-to-own-total" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Total Buyout Price
                </Label>
                <Input
                  id="lease-to-own-total"
                  type="number"
                  min="0"
                  step="500"
                  value={leaseToOwnTotal || ""}
                  onChange={(e) => setLeaseToOwnTotal(Number(e.target.value))}
                  placeholder="e.g. 25000"
                />
                <p className="text-xs text-muted-foreground">
                  The total amount the customer must pay to own the trailer(s). This will be shown on their portal.
                </p>
              </div>
            )}
          </div>

          {/* Billing Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-cycle">Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly (every 2 weeks)</SelectItem>
                  
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Security Deposit ($)</Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                step="100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">Standard deposit is $1,000</p>
            </div>
          </div>


          {/* End Date */}
          <div className="space-y-2">
            <Label>Lease End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "No end date (ongoing)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {endDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setEndDate(undefined)}
              >
                Clear end date
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty for an open-ended lease. Set a date for fixed-term agreements.
            </p>
          </div>

          {/* Discount Selection */}
          <div className="space-y-2">
            <Label htmlFor="discount">Apply Discount (Optional)</Label>
            <Select 
              value={selectedDiscountId || "none"} 
              onValueChange={(val) => setSelectedDiscountId(val === "none" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No discount</SelectItem>
                {discounts?.map(discount => (
                  <SelectItem key={discount.id} value={discount.id}>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>{discount.name}</span>
                      <span className="text-muted-foreground">
                        ({discount.type === "percentage" ? `${discount.value}% off` : `$${discount.value} off`})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDiscountId && discounts?.find(d => d.id === selectedDiscountId) && (
              <p className="text-xs text-primary flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {discounts.find(d => d.id === selectedDiscountId)?.type === "percentage"
                  ? `${discounts.find(d => d.id === selectedDiscountId)?.value}% discount will be applied`
                  : `$${discounts.find(d => d.id === selectedDiscountId)?.value} discount will be applied`}
              </p>
            )}
          </div>

          {/* Trailer Selection */}
          <div className="space-y-2">
            <Label>Select Trailers & Set Rates</Label>
            {loadingTrailers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading available trailers...
              </div>
            ) : availableTrailers && availableTrailers.length > 0 ? (
              <div className="border rounded-lg">
                  <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead className="w-12"></TableHead>
                       <TableHead>VIN</TableHead>
                       <TableHead>Type</TableHead>
                       <TableHead>Year</TableHead>
                       <TableHead>Default Rate</TableHead>
                       <TableHead>Custom Rate</TableHead>
                       <TableHead>Billing Schedule</TableHead>
                       <TableHead className="text-center">LTO</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {availableTrailers.map(trailer => {
                       const isSelected = isTrailerSelected(trailer.id);
                       const selectedTrailer = selectedTrailers.find(t => t.id === trailer.id);
                       
                       return (
                         <TableRow key={trailer.id} className={isSelected ? "bg-muted/50" : ""}>
                           <TableCell>
                             <Checkbox
                               checked={isSelected}
                               onCheckedChange={(checked) => handleTrailerToggle(trailer, !!checked)}
                             />
                           </TableCell>
                           <TableCell className="font-medium font-mono text-xs">
                             <div className="flex items-center gap-2">
                               <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                               <span className="truncate max-w-[140px]" title={trailer.vin || "—"}>
                                 {trailer.vin || "—"}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell>
                             <Badge variant="outline">{trailer.type}</Badge>
                           </TableCell>
                           <TableCell>{trailer.year || "—"}</TableCell>
                           <TableCell className="text-muted-foreground">
                             ${trailer.rental_rate?.toLocaleString() || 0}/mo
                           </TableCell>
                           <TableCell>
                             {isSelected ? (
                               <div className="flex items-center gap-1">
                                 <DollarSign className="h-4 w-4 text-muted-foreground" />
                                 <Input
                                   type="number"
                                   min="0"
                                   step="50"
                                   className="w-24 h-8"
                                   value={selectedTrailer?.customRate || 0}
                                   onChange={(e) => handleRateChange(trailer.id, Number(e.target.value))}
                                 />
                               </div>
                             ) : (
                               <span className="text-muted-foreground">—</span>
                             )}
                           </TableCell>
                           <TableCell>
                             {isSelected ? (
                               <Select
                                 value={selectedTrailer?.billingSchedule || "default"}
                                 onValueChange={(v) => handleBillingScheduleChange(trailer.id, v as SelectedTrailer["billingSchedule"])}
                               >
                                 <SelectTrigger className="h-8 w-40">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="default">Sub. default</SelectItem>
                                   <SelectItem value="monthly-1">Monthly – 1st</SelectItem>
                                   <SelectItem value="monthly-15">Monthly – 15th</SelectItem>
                                   <SelectItem value="weekly-friday">Weekly – Friday</SelectItem>
                                 </SelectContent>
                               </Select>
                             ) : (
                               <span className="text-muted-foreground">—</span>
                             )}
                           </TableCell>
                           <TableCell className="text-center">
                             {isSelected ? (
                               <Checkbox
                                 checked={selectedTrailer?.leaseToOwn || false}
                                 onCheckedChange={(checked) => handleLeaseToOwnToggle(trailer.id, !!checked)}
                               />
                             ) : (
                               <span className="text-muted-foreground">—</span>
                             )}
                           </TableCell>
                         </TableRow>
                       );
                     })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No available trailers</p>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedTrailers.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Subscription Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trailers:</span>{" "}
                  <span className="font-medium">{selectedTrailers.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Billing:</span>{" "}
                  <span className="font-medium capitalize">{effectiveBillingLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{effectiveTotalLabel}:</span>{" "}
                  <span className="font-medium text-primary">${totalMonthlyRate.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Deposit:</span>{" "}
                  <span className="font-medium">${depositAmount.toLocaleString()}</span>
                </div>
                {selectedDiscountId && discounts?.find(d => d.id === selectedDiscountId) && (
                  <div className="col-span-2 pt-2 border-t">
                    <span className="text-muted-foreground">Discount:</span>{" "}
                    <span className="font-medium text-primary flex items-center gap-1 inline-flex">
                      <Tag className="h-3 w-3" />
                      {discounts.find(d => d.id === selectedDiscountId)?.name} 
                      ({discounts.find(d => d.id === selectedDiscountId)?.type === "percentage"
                        ? `${discounts.find(d => d.id === selectedDiscountId)?.value}% off`
                        : `$${discounts.find(d => d.id === selectedDiscountId)?.value} off`})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
  );

  const firstChargeTotal = depositAmount;
  const isLargeSubscription = firstChargeTotal >= 2000;
  const requiresTypeConfirm = firstChargeTotal >= 2000;

  const reviewSummary = (
    <div className="space-y-4 py-2">
      {isLargeSubscription && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            <p className="font-semibold">Large subscription warning</p>
            <p>Deposit of ${firstChargeTotal.toLocaleString()} will be charged immediately. Recurring billing starts on the anchor date.</p>
          </div>
        </div>
      )}
      <div className="rounded-md border p-4 space-y-2 bg-muted/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Customer</span>
          <span className="font-medium">{customers?.find(c => c.id === selectedCustomerId)?.full_name || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Trailers</span>
          <span className="font-medium">{selectedTrailers.length} trailer{selectedTrailers.length !== 1 ? "s" : ""}</span>
        </div>
        {selectedTrailers.map(t => (
          <div key={t.id} className="flex justify-between text-sm pl-4">
            <span className="text-muted-foreground">{t.trailer_number}</span>
            <span>${t.customRate.toFixed(2)}/mo</span>
          </div>
        ))}
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-muted-foreground">{effectiveTotalLabel}</span>
          <span className="font-bold">${totalMonthlyRate.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Deposit</span>
          <span className="font-medium">${depositAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-muted-foreground">Immediate Charge (Deposit Only)</span>
          <span className="font-bold text-lg">${firstChargeTotal.toFixed(2)}</span>
        </div>
        {firstBillingDate ? (
          <div className="text-xs text-muted-foreground">
            Deposit charges now. Recurring billing of ${totalMonthlyRate.toFixed(2)} starts on {format(firstBillingDate, "MMM d, yyyy")}. No separate activation step needed.
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Deposit charges now. Recurring billing of ${totalMonthlyRate.toFixed(2)} starts on anchor day {billingAnchorDay}.
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Billing</span>
          <span>{effectiveBillingLabel} — Anchor day {billingAnchorDay}</span>
        </div>
        {firstBillingDate && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">First Billing Date</span>
            <span className="font-medium">{format(firstBillingDate, "MMM d, yyyy")}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <span>{subscriptionType.replace(/_/g, " ")}</span>
        </div>
      </div>
    </div>
  );

  const formActions = showReview ? (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setShowReview(false)}>
        Back
      </Button>
      <Button
        variant={isLargeSubscription ? "destructive" : "default"}
        onClick={() => createSubscriptionMutation.mutate()}
        disabled={createSubscriptionMutation.isPending}
      >
        {createSubscriptionMutation.isPending ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          "Confirm & Create Subscription"
        )}
      </Button>
    </div>
  ) : (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => {
        if (mode === "inline") {
          resetForm();
          onCancel?.();
        } else {
          setIsOpen(false);
        }
      }}>
        Cancel
      </Button>
      <Button
        onClick={() => setShowReview(true)}
        disabled={!selectedCustomerId || selectedTrailers.length === 0}
      >
        Review Subscription
      </Button>
    </div>
  );

  // Inline mode: render directly on page
  if (mode === "inline") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Create New Subscription</h2>
          <p className="text-sm text-muted-foreground">
            Set up a new billing subscription for a customer with custom trailer rates.
          </p>
        </div>
        {showReview ? reviewSummary : formBody}
        <div className="sticky bottom-0 bg-background border-t pt-4 pb-2">
          {formActions}
        </div>
      </div>
    );
  }

  // Dialog mode (default)
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Subscription</DialogTitle>
          <DialogDescription>
            Set up a new billing subscription for a customer with custom trailer rates.
          </DialogDescription>
        </DialogHeader>
        {showReview ? reviewSummary : formBody}
        <DialogFooter>
          {formActions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
