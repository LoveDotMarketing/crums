import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Loader2, Truck, MapPin, Calendar, FileText, DollarSign, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SubscriptionItemData {
  trailer_id: string;
  status: string;
  monthly_rate: number;
  lease_to_own: boolean | null;
  lease_to_own_total: number | null;
  start_date: string;
  end_date: string | null;
  subscription: {
    customer_id: string;
    status: string;
    subscription_type: string | null;
  };
  trailer: {
    id: string;
    trailer_number: string;
    type: string;
    make: string | null;
    model: string | null;
    status: string;
    year: number | null;
    vin: string | null;
  } | null;
}

interface LeaseToOwnInfo {
  totalOwed: number;
  totalPaid: number;
  remaining: number;
  monthlyRate: number;
  percentPaid: number;
}

export default function Rentals() {
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;
  const [loading, setLoading] = useState(true);
  const [subscriptionItems, setSubscriptionItems] = useState<SubscriptionItemData[]>([]);
  const [billingPaid, setBillingPaid] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRentals();
  }, [currentEmail]);

  const fetchRentals = async () => {
    if (!currentEmail) return;

    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();

      if (!customer) {
        setSubscriptionItems([]);
        setLoading(false);
        return;
      }

      const { data: items, error } = await supabase
        .from("subscription_items")
        .select(`
          trailer_id,
          status,
          monthly_rate,
          lease_to_own,
          lease_to_own_total,
          start_date,
          end_date,
          subscription:customer_subscriptions!inner(
            customer_id,
            status,
            subscription_type
          ),
          trailer:trailers(
            id,
            trailer_number,
            type,
            make,
            model,
            status,
            year,
            vin
          )
        `)
        .eq("subscription.customer_id", customer.id)
        .in("status", ["active", "paused"]);

      if (error) throw error;

      const validItems = (items || []).filter(item => item.trailer) as SubscriptionItemData[];
      setSubscriptionItems(validItems);

      // Fetch billing history totals for lease-to-own subscriptions
      const leaseToOwnItems = validItems.filter(i => i.lease_to_own || i.subscription?.subscription_type === "lease_to_own");
      if (leaseToOwnItems.length > 0) {
        const subIds = [...new Set(leaseToOwnItems.map(i => (i.subscription as any)?.id).filter(Boolean))];
        
        // Get subscription IDs from customer_subscriptions
        const { data: subs } = await supabase
          .from("customer_subscriptions")
          .select("id")
          .eq("customer_id", customer.id)
          .in("status", ["active", "paused"]);

        if (subs && subs.length > 0) {
          const { data: billingData } = await supabase
            .from("billing_history")
            .select("subscription_id, net_amount")
            .in("subscription_id", subs.map(s => s.id))
            .eq("status", "succeeded");

          if (billingData) {
            const totals: Record<string, number> = {};
            billingData.forEach(b => {
              totals[b.subscription_id] = (totals[b.subscription_id] || 0) + Number(b.net_amount);
            });
            setBillingPaid(totals);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching rentals:", error);
      toast.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  const getLeaseToOwnInfo = (item: SubscriptionItemData): LeaseToOwnInfo | null => {
    if (!item.lease_to_own && item.subscription?.subscription_type !== "lease_to_own") return null;
    if (!item.lease_to_own_total) return null;

    const totalOwed = Number(item.lease_to_own_total);
    // Sum paid from billing history for this subscription
    const subId = Object.keys(billingPaid).find(id => billingPaid[id] > 0);
    const totalPaid = subId ? billingPaid[subId] || 0 : 0;
    const remaining = Math.max(0, totalOwed - totalPaid);
    const percentPaid = totalOwed > 0 ? Math.min(100, (totalPaid / totalOwed) * 100) : 0;

    return {
      totalOwed,
      totalPaid,
      remaining,
      monthlyRate: Number(item.monthly_rate),
      percentPaid,
    };
  };

  const trailers = subscriptionItems.filter(item => item.trailer).map(item => item.trailer!);
  const hasLeaseToOwn = subscriptionItems.some(i => i.lease_to_own || i.subscription?.subscription_type === "lease_to_own");

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Rentals</h1>

          {loading ? (
            <Card>
              <CardContent className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : trailers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Rentals</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active trailer rentals at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Lease to Own Balance Summary */}
              {hasLeaseToOwn && (() => {
                const leaseItems = subscriptionItems.filter(i => i.lease_to_own || i.subscription?.subscription_type === "lease_to_own");
                const totalOwed = leaseItems.reduce((sum, i) => sum + (Number(i.lease_to_own_total) || 0), 0);
                const totalPaid = Object.values(billingPaid).reduce((sum, v) => sum + v, 0);
                const remaining = Math.max(0, totalOwed - totalPaid);
                const percentPaid = totalOwed > 0 ? Math.min(100, (totalPaid / totalOwed) * 100) : 0;

                if (totalOwed === 0) return null;

                return (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-primary" />
                        Lease-to-Own Balance
                      </CardTitle>
                      <CardDescription>Track your progress toward ownership</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="text-2xl font-bold text-foreground">${totalOwed.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Paid</p>
                          <p className="text-2xl font-bold text-primary">${totalPaid.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining</p>
                          <p className="text-2xl font-bold text-foreground">${remaining.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress to ownership</span>
                          <span>{percentPaid.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentPaid} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subscriptionItems.map((item) => {
                  const trailer = item.trailer;
                  if (!trailer) return null;
                  const isLeaseToOwn = item.lease_to_own || item.subscription?.subscription_type === "lease_to_own";
                  const leaseInfo = getLeaseToOwnInfo(item);

                  return (
                    <Card key={trailer.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              Trailer #{trailer.trailer_number}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {trailer.type}
                            </CardDescription>
                          </div>
                          <Badge variant="default" className={isLeaseToOwn ? "bg-primary" : "bg-primary"}>
                            {isLeaseToOwn ? "Lease to Own" : "Leased"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {trailer.vin && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs">{trailer.vin}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {trailer.make && trailer.model
                              ? `${trailer.make} ${trailer.model}`
                              : "Standard Trailer"}
                          </span>
                        </div>
                        {trailer.year && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{trailer.year}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${Number(item.monthly_rate).toLocaleString()}/mo</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Currently Assigned</span>
                        </div>

                        {/* Lease to Own progress per trailer */}
                        {isLeaseToOwn && leaseInfo && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Remaining</span>
                              <span className="font-semibold">${leaseInfo.remaining.toLocaleString()}</span>
                            </div>
                            <Progress value={leaseInfo.percentPaid} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">{leaseInfo.percentPaid.toFixed(1)}% paid</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
