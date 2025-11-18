import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Wrench, LogOut, Truck, Search, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  make: string | null;
  model: string | null;
  status: string;
  year: number | null;
  total_maintenance_cost: number;
  is_rented: boolean;
  assigned_to: string | null;
}

export default function MechanicDashboard() {
  const { user, signOut } = useAuth();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrailers();
    
    // Set up real-time subscription for trailer changes
    const channel = supabase
      .channel('trailer-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trailers'
        },
        () => {
          fetchTrailers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrailers = async () => {
    try {
      const { data, error } = await supabase
        .from("trailers")
        .select(`
          id, 
          trailer_number, 
          type, 
          make, 
          model, 
          status,
          year,
          total_maintenance_cost,
          is_rented,
          assigned_to
        `)
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

  const handleCheckIn = async (trailerId: string, trailerNumber: string) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "maintenance" })
        .eq("id", trailerId);

      if (error) throw error;
      toast.success(`${trailerNumber} checked in for maintenance`);
    } catch (error) {
      console.error("Error checking in trailer:", error);
      toast.error("Failed to check in trailer");
    }
  };

  const handleCheckOut = async (trailerId: string, trailerNumber: string) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "available" })
        .eq("id", trailerId);

      if (error) throw error;
      toast.success(`${trailerNumber} checked out and marked available`);
    } catch (error) {
      console.error("Error checking out trailer:", error);
      toast.error("Failed to check out trailer");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      rented: "default",
      available: "secondary",
      maintenance: "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filteredTrailers = trailers.filter(
    (trailer) =>
      trailer.trailer_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trailer.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trailer.make?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFleet = trailers.length;
  const inMaintenance = trailers.filter(t => t.status === "maintenance").length;
  const available = trailers.filter(t => t.status === "available").length;
  const rented = trailers.filter(t => t.is_rented).length;
  const totalMaintenanceCost = trailers.reduce((sum, t) => sum + (t.total_maintenance_cost || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Mechanic Dashboard</h1>
              <p className="text-xs text-muted-foreground">Fleet Management & Maintenance</p>
            </div>
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
        {/* Fleet Stats */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Fleet
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFleet}</div>
              <p className="text-xs text-muted-foreground mt-1">All trailers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Maintenance
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inMaintenance}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently servicing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{available}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to rent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rented Out
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rented}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently rented</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Maintenance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMaintenanceCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time costs</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, type, or make..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading fleet...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
              <CardDescription>
                Check trailers in/out for maintenance - Updates in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trailer #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Maintenance Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrailers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No trailers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrailers.map((trailer) => (
                      <TableRow key={trailer.id}>
                        <TableCell className="font-medium">{trailer.trailer_number}</TableCell>
                        <TableCell>{trailer.type}</TableCell>
                        <TableCell>
                          {trailer.make && trailer.model 
                            ? `${trailer.make} ${trailer.model}` 
                            : "-"}
                        </TableCell>
                        <TableCell>{trailer.year || "-"}</TableCell>
                        <TableCell>{getStatusBadge(trailer.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">
                              {trailer.is_rented ? trailer.assigned_to : "Yard"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-600">
                          ${(trailer.total_maintenance_cost || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {trailer.status === "maintenance" ? (
                              <Button 
                                onClick={() => handleCheckOut(trailer.id, trailer.trailer_number)}
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                Check Out
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleCheckIn(trailer.id, trailer.trailer_number)}
                                variant="outline"
                                size="sm"
                                disabled={trailer.is_rented}
                              >
                                Check In
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

