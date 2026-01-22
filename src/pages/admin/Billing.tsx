import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  Users,
  CreditCard,
  Receipt,
  Plus,
  Percent,
  Tag,
  Truck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type BillingCycle = "weekly" | "biweekly" | "monthly";
type DiscountType = "percentage" | "fixed" | "multi_trailer" | "promo_code";
type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded";

interface CustomerSubscription {
  id: string;
  customer_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  status: string;
  created_at: string;
  customers?: {
    full_name: string;
    email: string;
    company_name: string | null;
  };
}

interface SubscriptionItem {
  id: string;
  subscription_id: string;
  trailer_id: string;
  monthly_rate: number;
  start_date: string;
  end_date: string | null;
  status: string;
  trailers?: {
    trailer_number: string;
    type: string;
    year: number;
  };
}

interface Discount {
  id: string;
  name: string;
  code: string | null;
  type: DiscountType;
  value: number;
  min_trailers: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

interface BillingHistoryItem {
  id: string;
  subscription_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  discount_amount: number;
  net_amount: number;
  status: PaymentStatus;
  billing_period_start: string | null;
  billing_period_end: string | null;
  paid_at: string | null;
  created_at: string;
  customer_subscriptions?: {
    customers?: {
      full_name: string;
      company_name: string | null;
    };
  };
}

export default function Billing() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    name: "",
    code: "",
    type: "percentage" as DiscountType,
    value: 0,
    min_trailers: 1,
    max_uses: null as number | null,
    valid_until: ""
  });

  // Fetch subscriptions with customer data
  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ["customer-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select(`
          *,
          customers (
            full_name,
            email,
            company_name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CustomerSubscription[];
    }
  });

  // Fetch subscription items
  const { data: subscriptionItems } = useQuery({
    queryKey: ["subscription-items"],
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
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SubscriptionItem[];
    }
  });

  // Fetch discounts
  const { data: discounts, isLoading: loadingDiscounts } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Discount[];
    }
  });

  // Fetch billing history
  const { data: billingHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["billing-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_history")
        .select(`
          *,
          customer_subscriptions (
            customers (
              full_name,
              company_name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as BillingHistoryItem[];
    }
  });

  // Create discount mutation
  const createDiscountMutation = useMutation({
    mutationFn: async (discount: typeof newDiscount) => {
      const { error } = await supabase
        .from("discounts")
        .insert({
          name: discount.name,
          code: discount.code || null,
          type: discount.type,
          value: discount.value,
          min_trailers: discount.min_trailers,
          max_uses: discount.max_uses,
          valid_until: discount.valid_until || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setIsDiscountDialogOpen(false);
      setNewDiscount({
        name: "",
        code: "",
        type: "percentage",
        value: 0,
        min_trailers: 1,
        max_uses: null,
        valid_until: ""
      });
      toast.success("Discount created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create discount: " + error.message);
    }
  });

  // Toggle discount active status
  const toggleDiscountMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("discounts")
        .update({ is_active })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("Discount updated");
    }
  });

  // Calculate stats
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
  const totalMonthlyRevenue = subscriptionItems?.filter(i => i.status === "active")
    .reduce((sum, item) => sum + Number(item.monthly_rate), 0) || 0;
  const pendingDeposits = subscriptions?.filter(s => !s.deposit_paid && s.deposit_amount > 0).length || 0;
  const recentPayments = billingHistory?.filter(h => h.status === "succeeded").slice(0, 5) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      paused: "outline",
      cancelled: "destructive",
      succeeded: "default",
      failed: "destructive",
      processing: "secondary",
      refunded: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getBillingCycleLabel = (cycle: BillingCycle) => {
    const labels: Record<BillingCycle, string> = {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly"
    };
    return labels[cycle];
  };

  const getDiscountTypeIcon = (type: DiscountType) => {
    switch (type) {
      case "percentage": return <Percent className="h-4 w-4" />;
      case "fixed": return <DollarSign className="h-4 w-4" />;
      case "multi_trailer": return <Truck className="h-4 w-4" />;
      case "promo_code": return <Tag className="h-4 w-4" />;
    }
  };

  const formatDiscountValue = (discount: Discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}% off`;
    }
    return `$${discount.value} off`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Billing & Payments</h1>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers with active billing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalMonthlyRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From active leases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Deposits
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingDeposits}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting payment
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Discounts
                  </CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {discounts?.filter(d => d.is_active).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently available
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="discounts">Discounts</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
              </TabsList>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Subscriptions</CardTitle>
                    <CardDescription>
                      Manage billing cycles, deposits, and trailer assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSubscriptions ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : subscriptions && subscriptions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Billing Cycle</TableHead>
                            <TableHead>Next Billing</TableHead>
                            <TableHead>Deposit</TableHead>
                            <TableHead>Trailers</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.map((sub) => {
                            const trailerCount = subscriptionItems?.filter(
                              i => i.subscription_id === sub.id && i.status === "active"
                            ).length || 0;
                            
                            return (
                              <TableRow key={sub.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {sub.customers?.full_name || "Unknown"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {sub.customers?.company_name || sub.customers?.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {getBillingCycleLabel(sub.billing_cycle)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {sub.next_billing_date 
                                    ? format(new Date(sub.next_billing_date), "MMM d, yyyy")
                                    : "—"
                                  }
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>${sub.deposit_amount}</span>
                                    {sub.deposit_paid ? (
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                    ) : sub.deposit_amount > 0 ? (
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                    ) : null}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    <Truck className="h-3 w-3 mr-1" />
                                    {trailerCount}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No subscriptions yet</p>
                        <p className="text-sm">Subscriptions are created when customers complete ACH setup</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discounts Tab */}
              <TabsContent value="discounts">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Discounts & Promo Codes</CardTitle>
                      <CardDescription>
                        Create and manage discount rules
                      </CardDescription>
                    </div>
                    <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Discount
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Discount</DialogTitle>
                          <DialogDescription>
                            Set up a new discount or promo code
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Discount Name</Label>
                            <Input
                              id="name"
                              value={newDiscount.name}
                              onChange={(e) => setNewDiscount(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Summer Special"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="type">Discount Type</Label>
                            <Select
                              value={newDiscount.type}
                              onValueChange={(value: DiscountType) => 
                                setNewDiscount(prev => ({ ...prev, type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage Off</SelectItem>
                                <SelectItem value="fixed">Fixed Dollar Amount</SelectItem>
                                <SelectItem value="multi_trailer">Multi-Trailer Discount</SelectItem>
                                <SelectItem value="promo_code">Promo Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(newDiscount.type === "promo_code" || newDiscount.type === "multi_trailer") && (
                            <div className="grid gap-2">
                              <Label htmlFor="code">Promo Code</Label>
                              <Input
                                id="code"
                                value={newDiscount.code}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  code: e.target.value.toUpperCase() 
                                }))}
                                placeholder="e.g., SUMMER25"
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="value">
                                {newDiscount.type === "percentage" ? "Percentage" : "Amount ($)"}
                              </Label>
                              <Input
                                id="value"
                                type="number"
                                value={newDiscount.value}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  value: Number(e.target.value) 
                                }))}
                              />
                            </div>
                            {newDiscount.type === "multi_trailer" && (
                              <div className="grid gap-2">
                                <Label htmlFor="min_trailers">Min. Trailers</Label>
                                <Input
                                  id="min_trailers"
                                  type="number"
                                  value={newDiscount.min_trailers}
                                  onChange={(e) => setNewDiscount(prev => ({ 
                                    ...prev, 
                                    min_trailers: Number(e.target.value) 
                                  }))}
                                />
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="max_uses">Max Uses (optional)</Label>
                              <Input
                                id="max_uses"
                                type="number"
                                value={newDiscount.max_uses || ""}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  max_uses: e.target.value ? Number(e.target.value) : null 
                                }))}
                                placeholder="Unlimited"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="valid_until">Expires (optional)</Label>
                              <Input
                                id="valid_until"
                                type="date"
                                value={newDiscount.valid_until}
                                onChange={(e) => setNewDiscount(prev => ({ 
                                  ...prev, 
                                  valid_until: e.target.value 
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDiscountDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => createDiscountMutation.mutate(newDiscount)}
                            disabled={!newDiscount.name || newDiscount.value <= 0}
                          >
                            Create Discount
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {loadingDiscounts ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : discounts && discounts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Valid Until</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {discounts.map((discount) => (
                            <TableRow key={discount.id}>
                              <TableCell className="font-medium">{discount.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getDiscountTypeIcon(discount.type)}
                                  <span className="capitalize">
                                    {discount.type.replace("_", " ")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDiscountValue(discount)}</TableCell>
                              <TableCell>
                                {discount.code ? (
                                  <code className="bg-muted px-2 py-1 rounded text-sm">
                                    {discount.code}
                                  </code>
                                ) : "—"}
                              </TableCell>
                              <TableCell>
                                {discount.current_uses}
                                {discount.max_uses ? ` / ${discount.max_uses}` : ""}
                              </TableCell>
                              <TableCell>
                                {discount.valid_until 
                                  ? format(new Date(discount.valid_until), "MMM d, yyyy")
                                  : "No expiry"
                                }
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={discount.is_active ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleDiscountMutation.mutate({
                                    id: discount.id,
                                    is_active: !discount.is_active
                                  })}
                                >
                                  {discount.is_active ? "Active" : "Inactive"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No discounts created</p>
                        <p className="text-sm">Create your first discount to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      View all processed and pending payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : billingHistory && billingHistory.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Net</TableHead>
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
                                {payment.customer_subscriptions?.customers?.full_name || "—"}
                              </TableCell>
                              <TableCell>
                                {payment.billing_period_start && payment.billing_period_end ? (
                                  <span className="text-sm">
                                    {format(new Date(payment.billing_period_start), "MMM d")} - 
                                    {format(new Date(payment.billing_period_end), "MMM d")}
                                  </span>
                                ) : "—"}
                              </TableCell>
                              <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                              <TableCell>
                                {Number(payment.discount_amount) > 0 
                                  ? `-$${Number(payment.discount_amount).toFixed(2)}`
                                  : "—"
                                }
                              </TableCell>
                              <TableCell className="font-medium">
                                ${Number(payment.net_amount).toFixed(2)}
                              </TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No payment history</p>
                        <p className="text-sm">Payments will appear here once customers are billed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
