import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Copy, Gift, UserCheck, Truck, Award } from "lucide-react";
import { logCustomerCreated } from "@/lib/eventLogger";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const customerSchema = z.object({
  account_number: z.string().min(1, "Account number is required"),
  full_name: z.string().min(1, "Full name is required").max(100),
  company_name: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  birthday: z.date().optional().nullable(),
  city: z.string().max(50).optional().or(z.literal("")),
  state: z.string().max(20).optional().or(z.literal("")),
  zip: z.string().max(10).optional().or(z.literal("")),
  status: z.enum(["active", "pending", "archived"]),
  payment_type: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface Customer {
  id: string;
  account_number: string;
  full_name: string;
  company_name: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  notes: string | null;
  payment_type: string | null;
  birthday?: string | null;
  // Referral data from parent
  referral_code?: string;
  referral_code_id?: string;
  referral_code_active?: boolean;
  referrals_sent?: number;
  referrals_pending?: number;
  referrals_approved?: number;
  referrals_credited?: number;
  credits_earned?: number;
  was_referred?: boolean;
  referred_by_name?: string;
}

interface TrailerInfo {
  id: string;
  vin: string;
  trailer_number: string;
  type: string;
  rental_rate: number | null;
  rental_frequency: string | null;
  lease_to_own: boolean | null;
  contract_start_date?: string | null;
  end_date?: string | null;
}

const formatSubscriptionType = (type: string | null): string => {
  switch (type) {
    case 'standard_lease': return 'Standard Lease';
    case '6_month_lease': return '6 Month Lease';
    case '24_month_lease': return '24 Month Lease';
    case 'rent_for_storage': return 'Rent for Storage';
    case 'lease_to_own': return 'Lease to Own';
    case 'repayment_plan': return 'Repayment Plan';
    default: return type || 'Unknown';
  }
};

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

function generateAccountNumber(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CRUMS-${randomNum}`;
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!customer;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      account_number: "",
      full_name: "",
      company_name: "",
      email: "",
      phone: "",
      birthday: null,
      city: "",
      state: "",
      zip: "",
      status: "active",
      payment_type: "",
      notes: "",
    },
  });

  // Fetch subscription type for this customer
  const { data: subscriptionData } = useQuery({
    queryKey: ['customer-subscription-type', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return null;
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select('subscription_type')
        .eq('customer_id', customer.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!customer?.id && open,
  });

  // Fetch trailers assigned to this customer via subscription_items
  const { data: customerTrailers = [] } = useQuery({
    queryKey: ['customer-trailers', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return [];
      
      // Get trailers through subscription_items to include lease_to_own and contract dates
      const { data: subItems, error: subError } = await supabase
        .from('subscription_items')
        .select(`
          lease_to_own,
          subscription:customer_subscriptions!inner(customer_id, contract_start_date, end_date),
          trailer:trailers(id, vin, trailer_number, type, rental_rate, rental_frequency)
        `)
        .eq('subscription.customer_id', customer.id)
        .in('status', ['active', 'paused']);
      
      if (subError) throw subError;
      
      const trailersFromSubs: TrailerInfo[] = (subItems || [])
        .filter(item => item.trailer)
        .map(item => ({
          ...(item.trailer as any),
          lease_to_own: item.lease_to_own,
          contract_start_date: (item.subscription as any)?.contract_start_date || null,
          end_date: (item.subscription as any)?.end_date || null,
        }));
      
      // Also get directly assigned trailers not in subscription_items
      const subTrailerIds = trailersFromSubs.map(t => t.id);
      const { data: directTrailers, error: directError } = await supabase
        .from('trailers')
        .select('id, vin, trailer_number, type, rental_rate, rental_frequency')
        .eq('customer_id', customer.id)
        .order('trailer_number');
      
      if (directError) throw directError;
      
      const extraTrailers: TrailerInfo[] = (directTrailers || [])
        .filter(t => !subTrailerIds.includes(t.id))
        .map(t => ({ ...t, lease_to_own: null }));
      
      return [...trailersFromSubs, ...extraTrailers];
    },
    enabled: !!customer?.id && open,
  });

  // Fetch applied discounts for this customer's subscription
  const { data: customerDiscounts = [] } = useQuery({
    queryKey: ['customer-discounts', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return [];
      
      // Get customer's subscription first
      const { data: subData } = await supabase
        .from('customer_subscriptions')
        .select('id')
        .eq('customer_id', customer.id)
        .maybeSingle();
      
      if (!subData?.id) return [];
      
      const { data, error } = await supabase
        .from('applied_discounts')
        .select(`
          id,
          applied_at,
          discounts:discount_id (id, name, type, value, is_active)
        `)
        .eq('subscription_id', subData.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!customer?.id && open,
  });

  // Fetch referral history for this customer
  const { data: referralHistory = [] } = useQuery({
    queryKey: ['customer-referrals', customer?.referral_code_id],
    queryFn: async () => {
      if (!customer?.referral_code_id) return [];
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_email,
          status,
          credit_amount,
          created_at,
          approved_at,
          credited_at
        `)
        .eq('referrer_code_id', customer.referral_code_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!customer?.referral_code_id && open,
  });

  useEffect(() => {
    if (open) {
      if (customer) {
        form.reset({
          account_number: customer.account_number,
          full_name: customer.full_name,
          company_name: customer.company_name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          birthday: customer.birthday ? new Date(customer.birthday) : null,
          city: customer.city || "",
          state: customer.state || "",
          zip: customer.zip || "",
          status: customer.status as "active" | "pending" | "archived",
          payment_type: customer.payment_type || "",
          notes: customer.notes || "",
        });
      } else {
        form.reset({
          account_number: generateAccountNumber(),
          full_name: "",
          company_name: "",
          email: "",
          phone: "",
          birthday: null,
          city: "",
          state: "",
          zip: "",
          status: "active",
          payment_type: "",
          notes: "",
        });
      }
    }
  }, [open, customer, form]);

  const createMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const { error } = await supabase.from("customers").insert({
        account_number: values.account_number,
        full_name: values.full_name,
        company_name: values.company_name || null,
        email: values.email || null,
        phone: values.phone || null,
        birthday: values.birthday ? format(values.birthday, "yyyy-MM-dd") : null,
        city: values.city || null,
        state: values.state || null,
        zip: values.zip || null,
        status: values.status,
        payment_type: values.payment_type || null,
        notes: values.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, values) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer created successfully" });
      logCustomerCreated(values.full_name, values.email || undefined);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error creating customer", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const { error } = await supabase
        .from("customers")
        .update({
          account_number: values.account_number,
          full_name: values.full_name,
          company_name: values.company_name || null,
          email: values.email || null,
          phone: values.phone || null,
          birthday: values.birthday ? format(values.birthday, "yyyy-MM-dd") : null,
          city: values.city || null,
          state: values.state || null,
          zip: values.zip || null,
          status: values.status,
          payment_type: values.payment_type || null,
          notes: values.notes || null,
        })
        .eq("id", customer!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer updated successfully" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error updating customer", description: error.message, variant: "destructive" });
    },
  });

  const toggleReferralCodeMutation = useMutation({
    mutationFn: async (active: boolean) => {
      if (!customer?.referral_code_id) return;
      const { error } = await supabase
        .from("referral_codes")
        .update({ is_active: active })
        .eq("id", customer.referral_code_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Referral code updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating referral code", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: CustomerFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const copyReferralCode = () => {
    if (customer?.referral_code) {
      navigator.clipboard.writeText(customer.referral_code);
      toast({ title: "Referral code copied!" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-blue-500">Approved</Badge>;
      case 'credited':
        return <Badge variant="default" className="bg-green-600">Credited</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birthday</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Payment- $2,000.00 Due- 1st of month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lease Agreement Type - Only show when editing and has subscription */}
            {isEditing && subscriptionData?.subscription_type && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Lease Agreement:</span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    subscriptionData.subscription_type === 'lease_to_own' && 'bg-blue-100 text-blue-800 border-blue-200',
                    subscriptionData.subscription_type === 'standard_lease' && 'bg-green-100 text-green-800 border-green-200',
                    subscriptionData.subscription_type === 'rent_for_storage' && 'bg-amber-100 text-amber-800 border-amber-200',
                    subscriptionData.subscription_type === 'repayment_plan' && 'bg-purple-100 text-purple-800 border-purple-200',
                  )}
                >
                  {formatSubscriptionType(subscriptionData.subscription_type)}
                </Badge>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trailers Section - Only show when editing */}
            {isEditing && (
              <>
                <Separator className="my-6" />
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Assigned Trailers ({customerTrailers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customerTrailers.length > 0 ? (
                      <div className="space-y-2">
                        {customerTrailers.map((trailer) => (
                          <div
                            key={trailer.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/50 rounded-lg gap-2"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">#{trailer.trailer_number}</span>
                                <Badge variant="outline">{trailer.type}</Badge>
                                {trailer.lease_to_own !== null && (
                                  <Badge 
                                    variant="secondary"
                                    className={trailer.lease_to_own 
                                      ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                      : 'bg-green-100 text-green-800 border-green-200'
                                    }
                                  >
                                    {trailer.lease_to_own ? 'Lease to Own' : 'Standard Lease'}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground font-mono break-all">
                                {trailer.vin}
                              </span>
                            </div>
                            {trailer.rental_rate && (
                              <div className="text-left sm:text-right">
                                <span className="font-semibold text-green-600">
                                  ${trailer.rental_rate.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">
                                  /{trailer.rental_frequency || 'monthly'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="pt-2 border-t mt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Monthly Revenue:</span>
                            <span className="font-semibold">
                              ${customerTrailers.reduce((sum, t) => {
                                if (!t.rental_rate) return sum;
                                if (t.rental_frequency === 'weekly') {
                                  return sum + (t.rental_rate * 4.33);
                                }
                                return sum + t.rental_rate;
                              }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {(() => {
                            const startDate = customerTrailers.find(t => t.contract_start_date)?.contract_start_date;
                            const endDate = customerTrailers.find(t => t.end_date !== undefined)?.end_date;
                            if (!startDate) return null;
                            const fmt = (d: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(d));
                            return (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Contract Period:</span>
                                <span className="font-medium">
                                  {fmt(startDate)} → {endDate ? fmt(endDate) : 'Ongoing'}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No trailers assigned to this customer.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Active Discounts Section - Only show when editing and has discounts */}
            {isEditing && customerDiscounts.length > 0 && (
              <>
                <Separator className="my-6" />
                
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Active Discounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customerDiscounts.map((ad) => {
                        const discount = ad.discounts as { id: string; name: string; type: string; value: number; is_active: boolean } | null;
                        if (!discount || !discount.is_active) return null;
                        return (
                          <div
                            key={ad.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-background rounded-lg gap-2"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="default" className="bg-primary">
                                {discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value}`}
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
              </>
            )}

            {/* Referral Information Section - Only show when editing */}
            {isEditing && (
              <>
                <Separator className="my-6" />
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Referral Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Referral Code */}
                    {customer?.referral_code ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Referral Code</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="bg-muted px-3 py-1 rounded text-base sm:text-lg font-mono break-all">
                                {customer.referral_code}
                              </code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={copyReferralCode}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Active</span>
                            <Switch
                              checked={customer.referral_code_active}
                              onCheckedChange={(checked) => toggleReferralCodeMutation.mutate(checked)}
                              disabled={toggleReferralCodeMutation.isPending}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="text-xl sm:text-2xl font-bold">{customer.referrals_sent || 0}</p>
                            <p className="text-xs text-muted-foreground">Total Sent</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="text-xl sm:text-2xl font-bold">{customer.referrals_pending || 0}</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="text-xl sm:text-2xl font-bold">{customer.referrals_credited || 0}</p>
                            <p className="text-xs text-muted-foreground">Credited</p>
                          </div>
                          <div className="text-center p-2 bg-green-500/10 rounded">
                            <p className="text-xl sm:text-2xl font-bold text-green-600">${customer.credits_earned || 0}</p>
                            <p className="text-xs text-muted-foreground">Earned</p>
                          </div>
                        </div>

                        {/* Was Referred By */}
                        {customer.was_referred && (
                          <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              This customer was referred by{" "}
                              <strong>{customer.referred_by_name || "another customer"}</strong>
                            </span>
                          </div>
                        )}

                        {/* Referral History */}
                        {referralHistory.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Referral History</p>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {referralHistory.map((referral) => (
                                <div
                                  key={referral.id}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-muted/50 rounded text-sm gap-1 sm:gap-2"
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium break-all">{referral.referred_email}</span>
                                    {getStatusBadge(referral.status)}
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                                    <span>${referral.credit_amount}</span>
                                    <span>·</span>
                                    <span>{format(new Date(referral.created_at), "MMM d, yyyy")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No referral code assigned to this customer.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
