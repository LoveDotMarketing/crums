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
import { Plus, Truck, RefreshCw, DollarSign, Tag, CalendarIcon, Info, KeyRound, Warehouse, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { logSubscriptionCreated } from "@/lib/eventLogger";

type BillingCycle = "weekly" | "biweekly" | "semimonthly" | "monthly";
type SubscriptionType = "standard_lease" | "rent_for_storage" | "lease_to_own" | "repayment_plan";

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
}

export function CreateSubscriptionDialog({ onSuccess }: CreateSubscriptionDialogProps) {
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

  // Fetch customer's billing anchor preference
  const { data: customerApplication } = useQuery({
    queryKey: ["customer-application-billing-preference", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      // First get the customer email to find their profile
      const { data: customer } = await supabase
        .from("customers")
        .select("email")
        .eq("id", selectedCustomerId)
        .single();
      
      if (!customer?.email) return null;
      
      // Get profile by email to find user_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customer.email)
        .maybeSingle();
      
      if (!profile?.id) return null;
      
      // Get application with billing preference
      const { data, error } = await supabase
        .from("customer_applications")
        .select("billing_anchor_day")
        .eq("user_id", profile.id)
        .maybeSingle();
      
      if (error) return null;
      return data;
    },
    enabled: !!selectedCustomerId && isOpen,
  });

  // Fetch customers without active subscriptions
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers-for-subscription"],
    queryFn: async () => {
      // Get customers
      const { data: allCustomers, error: customersError } = await supabase
        .from("customers")
        .select("id, full_name, email, company_name")
        .eq("status", "active")
        .order("full_name");

      if (customersError) throw customersError;

      // Get existing subscriptions to filter out customers who already have one
      const { data: existingSubs } = await supabase
        .from("customer_subscriptions")
        .select("customer_id")
        .in("status", ["active", "pending"]);

      const existingCustomerIds = new Set(existingSubs?.map(s => s.customer_id) || []);
      
      return (allCustomers || []).filter(c => !existingCustomerIds.has(c.id)) as Customer[];
    },
    enabled: isOpen
  });

  // Fetch available trailers
  const { data: availableTrailers, isLoading: loadingTrailers } = useQuery({
    queryKey: ["available-trailers-for-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trailers")
        .select("id, trailer_number, vin, type, year, rental_rate")
        .eq("status", "available")
        .is("customer_id", null)
        .order("trailer_number");

      if (error) throw error;
      return data as AvailableTrailer[];
    },
    enabled: isOpen
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
    enabled: isOpen
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomerId) throw new Error("Please select a customer");
      if (selectedTrailers.length === 0) throw new Error("Please select at least one trailer");

      // For lease_to_own subscription type, all trailers should be marked as lease to own
      const leaseToOwnFlags = selectedTrailers.reduce((acc, t) => {
        acc[t.id] = subscriptionType === "lease_to_own" ? true : t.leaseToOwn;
        return acc;
      }, {} as Record<string, boolean>);

      // Call edge function to create subscription in Stripe and local DB
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
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          subscriptionType,
          leaseToOwnTotal: subscriptionType === "lease_to_own" && leaseToOwnTotal > 0 ? leaseToOwnTotal : undefined
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
      queryClient.invalidateQueries({ queryKey: ["available-trailers-for-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["customers-for-subscription"] });
      
      // Log admin action
      const customer = customers?.find(c => c.id === selectedCustomerId);
      logSubscriptionCreated(
        customer?.full_name || selectedCustomerId,
        selectedTrailers.length,
        subscriptionType
      );
      
      setIsOpen(false);
      resetForm();
      toast.success("Subscription created successfully");
      onSuccess?.();
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
          leaseToOwn: false
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
    if (value === "standard_lease" && !endDate) {
      const twelveMonthsFromNow = new Date();
      twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);
      setEndDate(twelveMonthsFromNow);
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

  const totalMonthlyRate = selectedTrailers.reduce((sum, t) => sum + t.customRate, 0);

  const isTrailerSelected = (trailerId: string) => 
    selectedTrailers.some(t => t.id === trailerId);

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

          {/* Customer Billing Preference Info */}
          {selectedCustomerId && (
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-foreground">Customer's Preferred Payment Date: </span>
                {customerApplication?.billing_anchor_day ? (
                  <span className="text-primary font-semibold">
                    {customerApplication.billing_anchor_day === 1 ? "1st" : "15th"} of the month
                  </span>
                ) : (
                  <span className="text-muted-foreground">No preference set</span>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  This preference will be used for the Stripe billing cycle anchor.
                </p>
              </div>
            </div>
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
                  <SelectItem value="semimonthly">Twice Monthly (1st & 15th)</SelectItem>
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
                      <TableHead>Length</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Default Rate</TableHead>
                      <TableHead>Custom Rate</TableHead>
                      <TableHead className="text-center">Lease to Own</TableHead>
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
                              <span className="truncate max-w-[180px]" title={trailer.vin || "—"}>
                                {trailer.vin || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{trailer.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {trailer.type === "Flat Bed" ? "48'" : "53'"}
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
                  <span className="font-medium capitalize">{billingCycle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Total:</span>{" "}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createSubscriptionMutation.mutate()}
            disabled={!selectedCustomerId || selectedTrailers.length === 0 || createSubscriptionMutation.isPending}
          >
            {createSubscriptionMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Subscription"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
