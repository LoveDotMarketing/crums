import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Loader2, Truck, MapPin, Calendar, CreditCard, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  make: string | null;
  model: string | null;
  status: string;
  year: number | null;
  vin: string | null;
}

export default function Rentals() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [paymentSetupStatus, setPaymentSetupStatus] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRentals();
    fetchApplicationStatus();
  }, [user]);

  const fetchApplicationStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("customer_applications")
      .select("status, payment_setup_status")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) {
      setApplicationStatus(data.status);
      setPaymentSetupStatus(data.payment_setup_status);
    }
  };

  const fetchRentals = async () => {
    if (!user?.email) return;

    try {
      // First find the customer record by email (since customers.id ≠ profiles.id)
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!customer) {
        setTrailers([]);
        setLoading(false);
        return;
      }

      // Get trailers through subscription_items for this customer
      const { data: subscriptionItems, error } = await supabase
        .from("subscription_items")
        .select(`
          trailer_id,
          status,
          subscription:customer_subscriptions!inner(
            customer_id,
            status
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

      // Extract trailers from subscription items
      const rentedTrailers = (subscriptionItems || [])
        .filter(item => item.trailer)
        .map(item => item.trailer as Trailer);

      setTrailers(rentedTrailers);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      toast.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trailers.map((trailer) => (
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
                      <Badge variant="default" className="bg-primary">
                        Leased
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
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Currently Assigned</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
