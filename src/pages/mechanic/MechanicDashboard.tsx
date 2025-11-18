import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wrench, LogOut, Truck, Search, MapPin, DollarSign, ClipboardList } from "lucide-react";
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
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  const [checkOutType, setCheckOutType] = useState<"service" | "use">("service");

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

  const handleCheckInForService = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setMaintenanceDescription("");
    setMaintenanceCost("");
    setIsDialogOpen(true);
  };

  const handleCheckOut = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setIsCheckOutDialogOpen(true);
  };

  const handleSubmitCheckOut = async () => {
    if (!selectedTrailer) return;

    try {
      const newStatus = checkOutType === "service" ? "maintenance" : "in_use";
      
      const { error } = await supabase
        .from("trailers")
        .update({ status: newStatus })
        .eq("id", selectedTrailer.id);

      if (error) throw error;

      toast.success(`Trailer ${selectedTrailer.trailer_number} checked out for ${checkOutType}`);
      setIsCheckOutDialogOpen(false);
      setSelectedTrailer(null);
      fetchTrailers();
    } catch (error) {
      console.error("Error checking out trailer:", error);
      toast.error("Failed to check out trailer");
    }
  };

  const handleSubmitMaintenance = async () => {
    if (!selectedTrailer || !maintenanceDescription) {
      toast.error("Please provide maintenance description");
      return;
    }

    try {
      // Create maintenance record
      const { error: maintenanceError } = await supabase
        .from("maintenance_records")
        .insert({
          trailer_id: selectedTrailer.id,
          mechanic_id: user?.id,
          description: maintenanceDescription,
          cost: parseFloat(maintenanceCost) || 0,
          maintenance_date: new Date().toISOString().split('T')[0],
          completed: false
        });

      if (maintenanceError) throw maintenanceError;

      // Update trailer status to maintenance
      const { error: statusError } = await supabase
        .from("trailers")
        .update({ status: "maintenance" })
        .eq("id", selectedTrailer.id);

      if (statusError) throw statusError;

      toast.success(`${selectedTrailer.trailer_number} checked in for maintenance`);
      setIsDialogOpen(false);
      setSelectedTrailer(null);
    } catch (error) {
      console.error("Error checking in trailer:", error);
      toast.error("Failed to check in trailer for service");
    }
  };

  const handleCompleteService = async (trailerId: string, trailerNumber: string) => {
    try {
      // Mark all maintenance records for this trailer as completed
      await supabase
        .from("maintenance_records")
        .update({ completed: true })
        .eq("trailer_id", trailerId)
        .eq("completed", false);

      // Update trailer status to available
      const { error } = await supabase
        .from("trailers")
        .update({ status: "available" })
        .eq("id", trailerId);

      if (error) throw error;
      toast.success(`${trailerNumber} service completed and marked available`);
    } catch (error) {
      console.error("Error completing service:", error);
      toast.error("Failed to complete service");
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
            <Dialog open={isCheckOutDialogOpen} onOpenChange={setIsCheckOutDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">
                  <Truck className="h-4 w-4 mr-2" />
                  Check Out Trailer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check Out Trailer</DialogTitle>
                  <DialogDescription>
                    Select a trailer from the fleet to check out
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="trailer-select">Select Trailer</Label>
                    <select
                      id="trailer-select"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onChange={(e) => {
                        const trailer = trailers.find(t => t.id === e.target.value);
                        setSelectedTrailer(trailer || null);
                      }}
                    >
                      <option value="">Choose a trailer...</option>
                      {trailers.filter(t => t.status === "available").map((trailer) => (
                        <option key={trailer.id} value={trailer.id}>
                          {trailer.trailer_number} - {trailer.type} ({trailer.make} {trailer.model})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Check Out Type</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="checkout-type"
                          value="service"
                          checked={checkOutType === "service"}
                          onChange={(e) => setCheckOutType(e.target.value as "service" | "use")}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">For Service</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="checkout-type"
                          value="use"
                          checked={checkOutType === "use"}
                          onChange={(e) => setCheckOutType(e.target.value as "service" | "use")}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">For Use</span>
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmitCheckOut} disabled={!selectedTrailer}>
                    Check Out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleCompleteService(trailer.id, trailer.trailer_number)}
                              >
                                <Wrench className="mr-2 h-4 w-4" />
                                Complete Service
                              </Button>
                            ) : (
                              <Button 
                                size="sm"
                                variant="default"
                                onClick={() => handleCheckInForService(trailer)}
                                disabled={trailer.is_rented}
                              >
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Check In for Service
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

      {/* Maintenance Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Check In Trailer for Service</DialogTitle>
            <DialogDescription>
              Create a maintenance record for {selectedTrailer?.trailer_number}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the maintenance work needed..."
                value={maintenanceDescription}
                onChange={(e) => setMaintenanceDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Estimated Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={maintenanceCost}
                onChange={(e) => setMaintenanceCost(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitMaintenance}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Check In for Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

