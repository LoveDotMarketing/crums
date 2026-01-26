import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wrench, LogOut, Truck, Search, MapPin, DollarSign, ClipboardList, ClipboardCheck, Eye, ArrowDownToLine, ArrowUpFromLine, History, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChatBot } from "@/components/ChatBot";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { PendingReleasesQueue } from "@/components/mechanic/PendingReleasesQueue";
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
  vin: string | null;
}

interface ActiveJob {
  id: string;
  trailer_id: string;
  trailer_number: string;
  trailer_type: string;
  description: string;
  cost: number;
  maintenance_date: string;
  job_type: "maintenance" | "checked_out";
}

interface MaintenanceRecord {
  id: string;
  description: string;
  cost: number;
  maintenance_date: string;
  completed: boolean;
  maintenance_type: string | null;
}

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const { user, signOut, effectiveUserId, isImpersonating, impersonatedUser } = useAuth();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  const [checkOutType, setCheckOutType] = useState<"service" | "use">("service");
  const [pendingInspections, setPendingInspections] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyTrailer, setHistoryTrailer] = useState<Trailer | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Use effectiveUserId for queries when impersonating
  const currentUserId = effectiveUserId;

  const fetchMaintenanceHistory = async (trailerId: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("id, description, cost, maintenance_date, completed, maintenance_type")
        .eq("trailer_id", trailerId)
        .order("maintenance_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMaintenanceHistory(data || []);
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
      toast.error("Failed to load maintenance history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewHistory = (trailer: Trailer) => {
    setHistoryTrailer(trailer);
    setIsHistoryDialogOpen(true);
    fetchMaintenanceHistory(trailer.id);
  };

  const fetchPendingInspections = async () => {
    if (!currentUserId) return;
    try {
      const { data } = await supabase
        .from("dot_inspections")
        .select("id, trailer_id")
        .eq("inspector_id", currentUserId)
        .eq("status", "in_progress");
      
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(i => { map[i.trailer_id] = i.id; });
        setPendingInspections(map);
      }
    } catch (error) {
      console.error("Error fetching inspections:", error);
    }
  };

  const fetchActiveJobs = async () => {
    if (!currentUserId) return;
    try {
      // Fetch maintenance records for this mechanic that are not completed
      const { data: maintenanceData } = await supabase
        .from("maintenance_records")
        .select(`
          id,
          trailer_id,
          description,
          cost,
          maintenance_date
        `)
        .eq("mechanic_id", currentUserId)
        .eq("completed", false)
        .order("maintenance_date", { ascending: false });

      // Get trailer details for maintenance jobs
      const jobs: ActiveJob[] = [];
      
      if (maintenanceData && maintenanceData.length > 0) {
        const trailerIds = maintenanceData.map(m => m.trailer_id);
        const { data: trailerData } = await supabase
          .from("trailers")
          .select("id, trailer_number, type")
          .in("id", trailerIds);
        
        const trailerMap = new Map(trailerData?.map(t => [t.id, t]) || []);
        
        for (const record of maintenanceData) {
          const trailer = trailerMap.get(record.trailer_id);
          if (trailer) {
            jobs.push({
              id: record.id,
              trailer_id: record.trailer_id,
              trailer_number: trailer.trailer_number,
              trailer_type: trailer.type,
              description: record.description,
              cost: record.cost || 0,
              maintenance_date: record.maintenance_date,
              job_type: "maintenance"
            });
          }
        }
      }

      setActiveJobs(jobs);
    } catch (error) {
      console.error("Error fetching active jobs:", error);
    }
  };

  useEffect(() => {
    fetchTrailers();
    if (currentUserId) {
      fetchPendingInspections();
      fetchActiveJobs();
    }
    
    const channel = supabase
      .channel('trailer-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trailers' }, () => { 
        fetchTrailers(); 
        fetchActiveJobs();
      })
      .subscribe();

    const maintenanceChannel = supabase
      .channel('maintenance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_records' }, () => {
        fetchActiveJobs();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      supabase.removeChannel(maintenanceChannel);
    };
  }, [currentUserId]);

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
          assigned_to,
          vin
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

  const handleStartDOTInspection = (trailer: Trailer) => {
    navigate(`/dashboard/mechanic/inspection?trailerId=${trailer.id}`);
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
      const newStatus = checkOutType === "service" ? "maintenance" : "checked_out";
      
      const { error } = await supabase
        .from("trailers")
        .update({ status: newStatus })
        .eq("id", selectedTrailer.id);

      if (error) throw error;

      toast.success(`Trailer ${selectedTrailer.trailer_number} checked out for ${checkOutType === "service" ? "service" : "yard/transport"}`);
      setIsCheckOutDialogOpen(false);
      setSelectedTrailer(null);
      fetchTrailers();
    } catch (error) {
      console.error("Error checking out trailer:", error);
      toast.error("Failed to check out trailer");
    }
  };

  const handleCheckIn = async (trailer: Trailer) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({ 
          status: "available",
          customer_id: null,
          is_rented: false
        })
        .eq("id", trailer.id);

      if (error) throw error;
      toast.success(`Trailer ${trailer.trailer_number} checked in, unassigned, and available`);
      fetchTrailers();
    } catch (error) {
      console.error("Error checking in trailer:", error);
      toast.error("Failed to check in trailer");
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
          mechanic_id: currentUserId,
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
      maintenance: "destructive",
      checked_out: "default",
      pending_release: "default"
    };
    const displayMap: Record<string, string> = {
      checked_out: "Checked Out",
      pending_release: "Pending Release"
    };
    const displayStatus = displayMap[status] || status;
    return <Badge variant={variants[status] || "secondary"}>{displayStatus}</Badge>;
  };

  const filteredTrailers = trailers.filter((trailer) => {
    const matchesSearch =
      trailer.trailer_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trailer.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trailer.make?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!statusFilter) return matchesSearch;
    
    if (statusFilter === "available") return matchesSearch && trailer.status === "available";
    if (statusFilter === "maintenance") return matchesSearch && trailer.status === "maintenance";
    if (statusFilter === "checked_out") return matchesSearch && trailer.status === "checked_out";
    if (statusFilter === "rented") return matchesSearch && trailer.is_rented;
    
    return matchesSearch;
  });

  const totalFleet = trailers.length;
  const inMaintenance = trailers.filter(t => t.status === "maintenance").length;
  const available = trailers.filter(t => t.status === "available").length;
  const checkedOut = trailers.filter(t => t.status === "checked_out").length;
  const rented = trailers.filter(t => t.is_rented).length;
  const totalMaintenanceCost = trailers.reduce((sum, t) => sum + (t.total_maintenance_cost || 0), 0);

  const handleCardClick = (filter: string) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  return (
    <>
      <SEO
        title="Mechanic Dashboard"
        description="CRUMS Leasing mechanic dashboard for fleet maintenance management."
        noindex
      />
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
            <span className="text-sm text-muted-foreground">
              {isImpersonating ? impersonatedUser?.email : user?.email}
            </span>
            {!isImpersonating && (
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Fleet Stats - Clickable for filtering */}
        <div className="grid gap-6 md:grid-cols-6 mb-8">
          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
              statusFilter === null && "ring-2 ring-primary"
            )}
            onClick={() => setStatusFilter(null)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Fleet
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFleet}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === null ? "Showing all" : "Click to show all"}
              </p>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
              statusFilter === "maintenance" && "ring-2 ring-primary"
            )}
            onClick={() => handleCardClick("maintenance")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Maintenance
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{inMaintenance}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "maintenance" ? "Filtered" : "Click to filter"}
              </p>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
              statusFilter === "available" && "ring-2 ring-primary"
            )}
            onClick={() => handleCardClick("available")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{available}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "available" ? "Filtered" : "Click to filter"}
              </p>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
              statusFilter === "checked_out" && "ring-2 ring-primary"
            )}
            onClick={() => handleCardClick("checked_out")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Checked Out
              </CardTitle>
              <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{checkedOut}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "checked_out" ? "Filtered" : "Click to filter"}
              </p>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
              statusFilter === "rented" && "ring-2 ring-primary"
            )}
            onClick={() => handleCardClick("rented")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rented Out
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rented}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "rented" ? "Filtered" : "Click to filter"}
              </p>
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

        {/* Pending Releases Queue */}
        <PendingReleasesQueue />

        {/* My Active Jobs Section */}
        {activeJobs.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <CardTitle>My Active Jobs</CardTitle>
              </div>
              <CardDescription>
                Trailers you're currently working on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          {job.trailer_number}
                        </CardTitle>
                        <Badge variant="destructive">
                          <Wrench className="h-3 w-3 mr-1" />
                          In Service
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{job.trailer_type}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm line-clamp-2">{job.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Est. Cost: ${job.cost.toLocaleString()}</span>
                        <span>{new Date(job.maintenance_date).toLocaleDateString()}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => {
                          const trailer = trailers.find(t => t.id === job.trailer_id);
                          if (trailer) {
                            handleCompleteService(trailer.id, trailer.trailer_number);
                          }
                        }}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        Complete Service
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, type, or make..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {statusFilter && (
            <Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)}>
              Clear filter
            </Button>
          )}
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
                    <TableHead>VIN</TableHead>
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
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No trailers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrailers.map((trailer) => (
                      <TableRow key={trailer.id}>
                        <TableCell className="font-medium">{trailer.trailer_number}</TableCell>
                        <TableCell className="font-mono text-xs">{trailer.vin || "-"}</TableCell>
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
                          <div className="flex gap-2 flex-wrap">
                            {/* Maintenance status - show Complete Service */}
                            {trailer.status === "maintenance" && (
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleCompleteService(trailer.id, trailer.trailer_number)}
                              >
                                <Wrench className="mr-2 h-4 w-4" />
                                Complete Service
                              </Button>
                            )}
                            
                            {/* Checked out status - show Check In */}
                            {trailer.status === "checked_out" && (
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleCheckIn(trailer)}
                              >
                                <ArrowDownToLine className="mr-2 h-4 w-4" />
                                Check In
                              </Button>
                            )}
                            
                            {/* Available status - show Check Out and DOT Inspection */}
                            {trailer.status === "available" && !trailer.is_rented && (
                              <>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTrailer(trailer);
                                    setIsCheckOutDialogOpen(true);
                                  }}
                                >
                                  <ArrowUpFromLine className="mr-2 h-4 w-4" />
                                  Check Out
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleStartDOTInspection(trailer)}
                                >
                                  <ClipboardCheck className="mr-2 h-4 w-4" />
                                  DOT Inspection
                                </Button>
                              </>
                            )}
                            
                            {/* Rented - view only, no actions */}
                            {trailer.is_rented && (
                              <span className="text-xs text-muted-foreground italic">Assigned to customer</span>
                            )}
                            
                            {/* Resume pending inspection if exists */}
                            {pendingInspections[trailer.id] && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/dashboard/mechanic/inspection?trailerId=${trailer.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Resume Inspection
                              </Button>
                            )}

                            {/* View History - always available */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewHistory(trailer)}
                            >
                              <History className="mr-2 h-4 w-4" />
                              History
                            </Button>
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

      {/* Check Out Dialog */}
      <Dialog open={isCheckOutDialogOpen} onOpenChange={(open) => {
        setIsCheckOutDialogOpen(open);
        if (!open) setSelectedTrailer(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out Trailer</DialogTitle>
            <DialogDescription>
              {selectedTrailer 
                ? `Check out ${selectedTrailer.trailer_number}`
                : "Select a trailer from the fleet to check out"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTrailer && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Trailer #</span>
                  <span className="font-semibold">{selectedTrailer.trailer_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">VIN</span>
                  <span className="font-mono text-sm">{selectedTrailer.vin || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <span>{selectedTrailer.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Make/Model</span>
                  <span>{selectedTrailer.make} {selectedTrailer.model}</span>
                </div>
              </div>
            )}
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
                  <span className="text-sm">For Use (Yard/Transport)</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCheckOutDialogOpen(false);
              setSelectedTrailer(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCheckOut} disabled={!selectedTrailer}>
              Check Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Maintenance History
            </DialogTitle>
            <DialogDescription>
              Service records for {historyTrailer?.trailer_number} ({historyTrailer?.type})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading history...</span>
              </div>
            ) : maintenanceHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No maintenance records found for this trailer.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {maintenanceHistory.map((record) => (
                  <Card key={record.id} className={cn(
                    "transition-colors",
                    record.completed ? "bg-muted/30" : "border-amber-500/50 bg-amber-500/5"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={record.completed ? "secondary" : "destructive"}>
                              {record.completed ? "Completed" : "In Progress"}
                            </Badge>
                            {record.maintenance_type && (
                              <Badge variant="outline">{record.maintenance_type}</Badge>
                            )}
                          </div>
                          <p className="text-sm mt-2">{record.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.maintenance_date).toLocaleDateString()}
                          </div>
                          <p className="text-sm font-medium text-destructive">
                            ${record.cost.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChatBot userType="mechanic" />
    </div>
    </>
  );
}

