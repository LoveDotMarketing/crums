import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  make: string;
  model: string;
  status: string;
}

export default function MechanicDashboard() {
  const { user, signOut } = useAuth();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrailers();
  }, []);

  const fetchTrailers = async () => {
    try {
      const { data, error } = await supabase
        .from("trailers")
        .select("id, trailer_number, type, make, model, status")
        .order("trailer_number");

      if (error) throw error;
      setTrailers(data || []);
    } catch (error) {
      console.error("Error fetching trailers:", error);
      toast.error("Failed to load trailers");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (trailerId: string) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "maintenance" })
        .eq("id", trailerId);

      if (error) throw error;
      toast.success("Trailer checked in for maintenance");
      fetchTrailers();
    } catch (error) {
      console.error("Error checking in trailer:", error);
      toast.error("Failed to check in trailer");
    }
  };

  const handleCheckOut = async (trailerId: string) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "available" })
        .eq("id", trailerId);

      if (error) throw error;
      toast.success("Trailer checked out and marked available");
      fetchTrailers();
    } catch (error) {
      console.error("Error checking out trailer:", error);
      toast.error("Failed to check out trailer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "maintenance":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rented":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Mechanic Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Trailer Maintenance</h2>
          <p className="text-muted-foreground">
            Check trailers in and out for maintenance
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading trailers...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trailers.map((trailer) => (
              <Card key={trailer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{trailer.trailer_number}</span>
                    <Badge className={getStatusColor(trailer.status)}>
                      {trailer.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {trailer.make} {trailer.model} - {trailer.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {trailer.status === "maintenance" ? (
                    <Button
                      onClick={() => handleCheckOut(trailer.id)}
                      className="flex-1"
                      variant="default"
                    >
                      Check Out
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckIn(trailer.id)}
                      className="flex-1"
                      variant="secondary"
                    >
                      Check In
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
