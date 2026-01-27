import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Truck, RefreshCw, DollarSign, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BillingCycle = "weekly" | "biweekly" | "monthly";

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
          }, {} as Record<string, number>)
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
          customRate: trailer.rental_rate || getDefaultRentalRate(trailer.type)
        }
      ]);
    } else {
      setSelectedTrailers(prev => prev.filter(t => t.id !== trailer.id));
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
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
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
