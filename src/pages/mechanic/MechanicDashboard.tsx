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
import { Wrench, LogOut, Truck, Search, MapPin, DollarSign, ClipboardList, ClipboardCheck, Eye, ArrowDownToLine, ArrowUpFromLine, History, Calendar, Loader2, UserCheck, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ChatBot } from "@/components/ChatBot";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { PendingReleasesQueue } from "@/components/mechanic/PendingReleasesQueue";
import { ScheduledDropoffsQueue } from "@/components/mechanic/ScheduledDropoffsQueue";
import { CustomerCheckoutDialog } from "@/components/mechanic/CustomerCheckoutDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  license_plate: string | null;
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

interface FleetActivityLog {
  id: string;
  trailer_id: string;
  action_type: string;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
  metadata: {
    trailer_number?: string;
    vin?: string;
    customer_name?: string;
  } | null;
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
  const [checkOutType, setCheckOutType] = useState<"service" | "use" | "customer">("service");
  const [isCustomerCheckoutOpen, setIsCustomerCheckoutOpen] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; full_name: string; company_name: string | null; email: string }>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [pendingInspections, setPendingInspections] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyTrailer, setHistoryTrailer] = useState<Trailer | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isCompleteServiceDialogOpen, setIsCompleteServiceDialogOpen] = useState(false);
  const [completeServiceTrailer, setCompleteServiceTrailer] = useState<{ id: string; trailer_number: string } | null>(null);
  const [fleetActivityLogs, setFleetActivityLogs] = useState<FleetActivityLog[]>([]);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [awaitingAcknowledgments, setAwaitingAcknowledgments] = useState<Array<{
    id: string;
    trailer_id: string;
    trailer_number: string;
    inspection_date: string;
    customer_name: string | null;
    customer_company_name: string | null;
    customer_acknowledged: boolean;
  }>>([]);

  // Helper to log fleet activity
  const logFleetActivity = async (
    trailerId: string,
    actionType: string,
    previousStatus: string,
    newStatus: string,
    notes?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("fleet_activity_logs").insert([{
        trailer_id: trailerId,
        performed_by: currentUserId,
        action_type: actionType,
        previous_status: previousStatus,
        new_status: newStatus,
        notes,
        metadata: metadata || {},
      }]);
    } catch (error) {
      console.error("Error logging fleet activity:", error);
    }
  };

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

  const fetchFleetActivityLogs = async () => {
    setLoadingActivityLogs(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("fleet_activity_logs")
        .select("id, trailer_id, action_type, previous_status, new_status, notes, created_at, metadata")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setFleetActivityLogs(data || []);
    } catch (error) {
      console.error("Error fetching fleet activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoadingActivityLogs(false);
    }
  };

  const handleViewActivityLog = () => {
    setIsActivityLogOpen(true);
    fetchFleetActivityLogs();
  };

  const getActionTypeLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      check_in: "Check In",
      check_out_service: "Check Out (Service)",
      check_out_transport: "Check Out (Transport)",
      customer_checkout: "Released to Customer",
      maintenance_started: "Maintenance Started",
      service_completed: "Service Completed",
    };
    return labels[actionType] || actionType.replace(/_/g, " ");
  };

  const getActionTypeBadgeVariant = (actionType: string): "default" | "secondary" | "destructive" | "outline" => {
    if (actionType.includes("check_in") || actionType === "service_completed") return "default";
    if (actionType.includes("customer") || actionType === "customer_checkout") return "secondary";
    if (actionType.includes("maintenance")) return "destructive";
    return "outline";
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

  const fetchAwaitingAcknowledgments = async () => {
    try {
      const { data, error } = await supabase
        .from("dot_inspections")
        .select("id, trailer_id, trailer_number, inspection_date, customer_name, customer_company_name, customer_acknowledged")
        .eq("status", "completed")
        .eq("customer_acknowledged", false)
        .order("inspection_date", { ascending: false });

      if (error) throw error;
      setAwaitingAcknowledgments(data || []);
    } catch (error) {
      console.error("Error fetching awaiting acknowledgments:", error);
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

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, company_name, email")
        .eq("status", "active")
        .order("full_name");
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchTrailers();
    if (currentUserId) {
      fetchPendingInspections();
      fetchActiveJobs();
      fetchAwaitingAcknowledgments();
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

    const inspectionChannel = supabase
      .channel('inspection-ack-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dot_inspections' }, () => {
        fetchAwaitingAcknowledgments();
        fetchPendingInspections();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      supabase.removeChannel(maintenanceChannel);
      supabase.removeChannel(inspectionChannel);
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
          vin,
          license_plate
        `)
        .order("vin");

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
      const previousStatus = selectedTrailer.status;
      const newStatus = checkOutType === "service" ? "maintenance" : "checked_out";
      
      const { error } = await supabase
        .from("trailers")
        .update({ status: newStatus })
        .eq("id", selectedTrailer.id);

      if (error) throw error;

      // Log the activity
      await logFleetActivity(
        selectedTrailer.id,
        checkOutType === "service" ? "check_out_service" : "check_out_transport",
        previousStatus,
        newStatus,
        `Checked out for ${checkOutType === "service" ? "service/maintenance" : "yard/transport"}`,
        { trailer_number: selectedTrailer.trailer_number, vin: selectedTrailer.vin }
      );

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
      const previousStatus = trailer.status;
      
      const { error } = await supabase
        .from("trailers")
        .update({ 
          status: "available",
          customer_id: null,
          is_rented: false
        })
        .eq("id", trailer.id);

      if (error) throw error;

      // Log the activity
      await logFleetActivity(
        trailer.id,
        "check_in",
        previousStatus,
        "available",
        "Checked in, unassigned, and marked available",
        { trailer_number: trailer.trailer_number, vin: trailer.vin }
      );

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
      const previousStatus = selectedTrailer.status;

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

      // Log the activity
      await logFleetActivity(
        selectedTrailer.id,
        "maintenance_started",
        previousStatus,
        "maintenance",
        maintenanceDescription,
        { trailer_number: selectedTrailer.trailer_number, vin: selectedTrailer.vin, estimated_cost: parseFloat(maintenanceCost) || 0 }
      );

      toast.success(`${selectedTrailer.trailer_number} checked in for maintenance`);
      setIsDialogOpen(false);
      setSelectedTrailer(null);
    } catch (error) {
      console.error("Error checking in trailer:", error);
      toast.error("Failed to check in trailer for service");
    }
  };

  const openCompleteServiceConfirmation = (trailerId: string, trailerNumber: string) => {
    setCompleteServiceTrailer({ id: trailerId, trailer_number: trailerNumber });
    setIsCompleteServiceDialogOpen(true);
  };

  const handleCompleteService = async () => {
    if (!completeServiceTrailer) return;
    
    const { id: trailerId, trailer_number: trailerNumber } = completeServiceTrailer;
    
    try {
      // Get current trailer to find VIN
      const trailer = trailers.find(t => t.id === trailerId);
      
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

      // Log the activity
      await logFleetActivity(
        trailerId,
        "service_completed",
        "maintenance",
        "available",
        "Service completed and trailer marked available",
        { trailer_number: trailerNumber, vin: trailer?.vin }
      );

      toast.success(`${trailerNumber} service completed and marked available`);
      setIsCompleteServiceDialogOpen(false);
      setCompleteServiceTrailer(null);
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
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      trailer.vin?.toLowerCase().includes(query) ||
      trailer.license_plate?.toLowerCase().includes(query) ||
      trailer.trailer_number.toLowerCase().includes(query) ||
      trailer.type.toLowerCase().includes(query) ||
      trailer.make?.toLowerCase().includes(query);
    
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

        {/* Scheduled Drop-offs Queue */}
        <ScheduledDropoffsQueue />

        {/* Work Orders Quick Access */}
        <Card className="mb-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/dashboard/mechanic/work-orders")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Work Orders</p>
                <p className="text-sm text-muted-foreground">Create and manage invoices for labor &amp; parts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardContent>
        </Card>

        {/* Awaiting Customer DOT Acknowledgment */}
        {awaitingAcknowledgments.length > 0 && (
          <Card className="mb-6 border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <CardTitle>Awaiting Customer DOT Acknowledgment</CardTitle>
                </div>
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  {awaitingAcknowledgments.length} pending
                </Badge>
              </div>
              <CardDescription>
                DOT inspections completed — waiting for customers to sign their acknowledgment form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {awaitingAcknowledgments.map((inspection) => (
                  <Card key={inspection.id} className="bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base font-semibold">
                            {inspection.trailer_number}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="border-blue-500 text-blue-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Awaiting
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {inspection.customer_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{inspection.customer_name}</span>
                        </div>
                      )}
                      {inspection.customer_company_name && (
                        <p className="text-xs text-muted-foreground ml-5">
                          {inspection.customer_company_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        <span>Inspected {new Date(inspection.inspection_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs text-blue-700 dark:text-blue-400">
                        <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Customer has not yet signed the DOT acknowledgment</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                            openCompleteServiceConfirmation(trailer.id, trailer.trailer_number);
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

        {/* Search and Activity Log */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by VIN, license plate, or type..."
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
          <Button variant="outline" onClick={handleViewActivityLog}>
            <History className="mr-2 h-4 w-4" />
            Activity Log
          </Button>
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
                                onClick={() => openCompleteServiceConfirmation(trailer.id, trailer.trailer_number)}
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
        if (!open) {
          setSelectedTrailer(null);
          setSelectedCustomerId("");
          setCheckOutType("service");
        } else {
          // Fetch customers when dialog opens for customer checkout
          fetchCustomers();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
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
            <div className="space-y-3">
              <Label>Check Out Type</Label>
              <div className="grid gap-3">
                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  checkOutType === "service" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                )}>
                  <input
                    type="radio"
                    name="checkout-type"
                    value="service"
                    checked={checkOutType === "service"}
                    onChange={(e) => setCheckOutType(e.target.value as "service" | "use" | "customer")}
                    className="h-4 w-4"
                  />
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">For Maintenance</span>
                    <p className="text-xs text-muted-foreground">Check out for service or repairs</p>
                  </div>
                </label>
                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  checkOutType === "use" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                )}>
                  <input
                    type="radio"
                    name="checkout-type"
                    value="use"
                    checked={checkOutType === "use"}
                    onChange={(e) => setCheckOutType(e.target.value as "service" | "use" | "customer")}
                    className="h-4 w-4"
                  />
                  <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">For Yard/Transport</span>
                    <p className="text-xs text-muted-foreground">Internal use or yard movement</p>
                  </div>
                </label>
                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  checkOutType === "customer" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                )}>
                  <input
                    type="radio"
                    name="checkout-type"
                    value="customer"
                    checked={checkOutType === "customer"}
                    onChange={(e) => setCheckOutType(e.target.value as "service" | "use" | "customer")}
                    className="h-4 w-4"
                  />
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Release to Customer</span>
                    <p className="text-xs text-muted-foreground">Customer pickup with ID verification & agreements</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Customer Selection - only show when customer checkout is selected */}
            {checkOutType === "customer" && (
              <div className="space-y-2 pt-2 border-t">
                <Label>Select Customer</Label>
                {loadingCustomers ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading customers...
                  </div>
                ) : (
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{customer.full_name}</span>
                            {customer.company_name && (
                              <span className="text-muted-foreground">({customer.company_name})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCheckOutDialogOpen(false);
              setSelectedTrailer(null);
              setSelectedCustomerId("");
            }}>
              Cancel
            </Button>
            {checkOutType === "customer" ? (
              <Button 
                onClick={() => {
                  setIsCheckOutDialogOpen(false);
                  setIsCustomerCheckoutOpen(true);
                }} 
                disabled={!selectedTrailer || !selectedCustomerId}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Start Customer Checkout
              </Button>
            ) : (
              <Button onClick={handleSubmitCheckOut} disabled={!selectedTrailer}>
                Check Out
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Checkout Dialog */}
      {selectedTrailer && selectedCustomerId && (
        <CustomerCheckoutDialog
          open={isCustomerCheckoutOpen}
          onOpenChange={(open) => {
            setIsCustomerCheckoutOpen(open);
            if (!open) {
              setSelectedTrailer(null);
              setSelectedCustomerId("");
            }
          }}
          trailer={{
            id: selectedTrailer.id,
            trailer_number: selectedTrailer.trailer_number,
            vin: selectedTrailer.vin,
            license_plate: selectedTrailer.license_plate,
            type: selectedTrailer.type
          }}
          customerId={selectedCustomerId}
          mechanicId={currentUserId}
          onCheckoutComplete={() => {
            fetchTrailers();
            setIsCustomerCheckoutOpen(false);
            setSelectedTrailer(null);
            setSelectedCustomerId("");
          }}
        />
      )}

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

      {/* Complete Service Confirmation Dialog */}
      <Dialog open={isCompleteServiceDialogOpen} onOpenChange={setIsCompleteServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Complete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark <strong>{completeServiceTrailer?.trailer_number}</strong> as service complete? 
              This will set the trailer status to available and close all open maintenance records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCompleteServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteService}>
              <Wrench className="mr-2 h-4 w-4" />
              Complete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fleet Activity Log Dialog */}
      <Dialog open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Fleet Activity Log
            </DialogTitle>
            <DialogDescription>
              Recent check-in, check-out, and maintenance activity
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {loadingActivityLogs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fleetActivityLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Trailer</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status Change</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetActivityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.metadata?.trailer_number || "-"}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono">
                          {log.metadata?.vin ? log.metadata.vin.slice(-8) : "-"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionTypeBadgeVariant(log.action_type)}>
                          {getActionTypeLabel(log.action_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.previous_status && log.new_status ? (
                          <span>
                            <span className="text-muted-foreground">{log.previous_status}</span>
                            {" → "}
                            <span className="font-medium">{log.new_status}</span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {log.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivityLogOpen(false)}>
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

