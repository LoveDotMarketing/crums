import { useState, useEffect } from "react"; // Fleet Management
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Truck, 
  Plus, 
  Search, 
  DollarSign, 
  Wrench,
  Eye,
  Trash2,
  Loader2,
  LayoutGrid,
  UserX,
  CalendarClock,
  LogIn,
  ClipboardList
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ScheduleReleaseDialog } from "@/components/admin/ScheduleReleaseDialog";
import { ScheduleDropoffDialog } from "@/components/admin/ScheduleDropoffDialog";

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  year_purchased: number | null;
  purchase_price: number | null;
  total_maintenance_cost: number;
  is_rented: boolean;
  rental_income: number | null;
  status: string;
  assigned_to: string | null;
  customer_id: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_box_number: string | null;
  vin: string | null;
  license_plate: string | null;
  company_id: string;
}

interface Customer {
  id: string;
  full_name: string;
  company_name: string | null;
}

export default function Fleet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<keyof Trailer | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [unassignTrailerId, setUnassignTrailerId] = useState<string | null>(null);
  const [scheduleReleaseTrailer, setScheduleReleaseTrailer] = useState<Trailer | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleDropoffTrailer, setScheduleDropoffTrailer] = useState<Trailer | null>(null);
  const [isDropoffDialogOpen, setIsDropoffDialogOpen] = useState(false);
  
  const [newTrailer, setNewTrailer] = useState({
    trailer_number: "",
    type: "Dry Van",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    year_purchased: new Date().getFullYear(),
    purchase_price: "",
    vin: "",
    license_plate: "",
    gps_box_number: "",
  });

  useEffect(() => {
    fetchCompanyAndTrailers();
    fetchCustomers();

    // Set up real-time subscription
    const channel = supabase
      .channel('fleet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trailers'
        },
        () => {
          fetchCompanyAndTrailers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, company_name")
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchCompanyAndTrailers = async () => {
    try {
      // Get user's company (for adding new trailers)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;

      // Store company_id for adding new trailers (use default if not set)
      if (profileData?.company_id) {
        setCompanyId(profileData.company_id);
      }

      // Admins can view ALL trailers - RLS already enforces access control
      // Exclude archived trailers from normal fleet view
      const { data, error } = await supabase
        .from("trailers")
        .select("*")
        .neq("status", "archived")
        .order("trailer_number");

      if (error) throw error;
      setTrailers(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignTrailer = async (trailerId: string) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({
          customer_id: null,
          is_rented: false,
          status: "available"
        })
        .eq("id", trailerId);

      if (error) throw error;
      toast.success("Trailer unassigned successfully");
      setUnassignTrailerId(null);
      fetchCompanyAndTrailers();
    } catch (error) {
      console.error("Error unassigning trailer:", error);
      toast.error("Failed to unassign trailer");
    }
  };

  // Get type-based default rental rate
  const getDefaultRentalRate = (type: string): number => {
    switch (type) {
      case "Flatbed":
      case "Flat Bed":
        return 750;
      case "Refrigerated":
        return 850;
      case "Dry Van":
      default:
        return 700;
    }
  };

  const handleAddTrailer = async () => {
    if (!newTrailer.trailer_number || !newTrailer.type) {
      toast.error("Trailer number and type are required");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("trailers")
        .insert({
          company_id: companyId,
          trailer_number: newTrailer.trailer_number,
          type: newTrailer.type,
          make: newTrailer.make || null,
          model: newTrailer.model || null,
          year: newTrailer.year,
          year_purchased: newTrailer.year_purchased,
          purchase_price: newTrailer.purchase_price ? parseFloat(newTrailer.purchase_price) : null,
          vin: newTrailer.vin || null,
          license_plate: newTrailer.license_plate || null,
          gps_box_number: newTrailer.gps_box_number || null,
          status: "available",
          is_rented: false,
          total_maintenance_cost: 0,
          rental_income: 0,
          rental_rate: getDefaultRentalRate(newTrailer.type),
          rental_frequency: "monthly",
        });

      if (error) throw error;

      toast.success("Trailer added successfully");
      setIsAddDialogOpen(false);
      setNewTrailer({
        trailer_number: "",
        type: "Dry Van",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        year_purchased: new Date().getFullYear(),
        purchase_price: "",
        vin: "",
        license_plate: "",
        gps_box_number: "",
      });
    } catch (error) {
      console.error("Error adding trailer:", error);
      toast.error("Failed to add trailer");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveTrailer = async (trailerId: string, trailerNumber: string) => {
    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "archived" })
        .eq("id", trailerId);

      if (error) throw error;
      toast.success(`Trailer ${trailerNumber} archived`);
    } catch (error) {
      console.error("Error archiving trailer:", error);
      toast.error("Failed to archive trailer");
    }
  };

  const handleSort = (column: keyof Trailer) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Create a map of customer_id to customer for quick lookup
  const customerMap = customers.reduce((acc, customer) => {
    acc[customer.id] = customer;
    return acc;
  }, {} as Record<string, Customer>);

  const filteredTrailers = trailers
    .filter((trailer) => {
      const searchLower = searchQuery.toLowerCase();
      const customer = trailer.customer_id ? customerMap[trailer.customer_id] : null;
      
      const matchesSearch = 
        trailer.trailer_number.toLowerCase().includes(searchLower) ||
        trailer.type.toLowerCase().includes(searchLower) ||
        trailer.make?.toLowerCase().includes(searchLower) ||
        trailer.vin?.toLowerCase().includes(searchLower) ||
        trailer.license_plate?.toLowerCase().includes(searchLower) ||
        trailer.model?.toLowerCase().includes(searchLower) ||
        trailer.status?.toLowerCase().includes(searchLower) ||
        customer?.full_name?.toLowerCase().includes(searchLower) ||
        customer?.company_name?.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "rented" && trailer.is_rented) ||
        (statusFilter === "available" && !trailer.is_rented && trailer.status === "available") ||
        (statusFilter === "maintenance" && trailer.status === "maintenance") ||
        (statusFilter === "checked_out" && trailer.status === "checked_out") ||
        (statusFilter === "under_review" && trailer.status === "under_review");
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === "asc" ? 1 : -1;
      if (bVal == null) return sortDirection === "asc" ? -1 : 1;
      
      // Compare values
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return sortDirection === "asc" 
          ? (aVal === bVal ? 0 : aVal ? -1 : 1)
          : (aVal === bVal ? 0 : aVal ? 1 : -1);
      }
      
      return 0;
    });

  const SortableHeader = ({ column, children }: { column: keyof Trailer; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortColumn === column && (
          <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </TableHead>
  );

  const calculateROI = (trailer: Trailer) => {
    const totalInvestment = (trailer.purchase_price || 0) + (trailer.total_maintenance_cost || 0);
    if (totalInvestment === 0) return "0.0";
    const roi = (((trailer.rental_income || 0) - totalInvestment) / totalInvestment) * 100;
    return roi.toFixed(1);
  };

  // Calculate monthly price range based on year and type
  const getMonthlyPriceRange = (trailer: Trailer): string => {
    const year = trailer.year;
    const type = trailer.type?.toLowerCase() || "";
    
    if (!year) return "—";
    
    // Flatbeds (2024): $750-$800
    if (type.includes("flatbed")) {
      return "$750-$800";
    }
    
    // Dry Vans pricing by year
    if (year >= 2022 && year <= 2024) {
      return "$850-$875";
    } else if (year >= 2020 && year <= 2021) {
      return "$750-$800";
    } else if (year === 2019) {
      return "$700-$800";
    } else if (year >= 2017 && year <= 2018) {
      return "$700-$720";
    } else if (year < 2017) {
      return "$650-$700";
    }
    
    return "—";
  };

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      rented: "bg-teal-500 text-white hover:bg-teal-600",
      available: "bg-teal-600 text-white hover:bg-teal-700",
      maintenance: "bg-red-500 text-white hover:bg-red-600",
      checked_out: "bg-blue-500 text-white hover:bg-blue-600",
      pending_release: "bg-orange-500 text-white hover:bg-orange-600",
      under_review: "bg-purple-500 text-white hover:bg-purple-600"
    };
    const displayMap: Record<string, string> = {
      checked_out: "Checked Out",
      pending_release: "Pending Release",
      under_review: "Under Review"
    };
    const displayStatus = displayMap[status] || status;
    return (
      <Badge className={colorMap[status] || "bg-gray-500 text-white"}>
        {displayStatus}
      </Badge>
    );
  };

  const totalFleetCount = trailers.length;
  const totalOut = trailers.filter(t => t.is_rented).length;
  const totalIn = trailers.filter(t => !t.is_rented).length;
  const totalFleetValue = trailers.reduce((sum, t) => sum + (t.purchase_price || 0), 0);
  const totalMaintenanceCost = trailers.reduce((sum, t) => sum + (t.total_maintenance_cost || 0), 0);
  const totalRentalIncome = trailers.reduce((sum, t) => sum + (t.rental_income || 0), 0);
  const availableCount = trailers.filter(t => t.status === "available").length;
  const maintenanceCount = trailers.filter(t => t.status === "maintenance").length;
  const underReviewCount = trailers.filter(t => t.status === "under_review").length;

  // Group trailers by type
  const trailersByType = trailers.reduce((acc, trailer) => {
    acc[trailer.type] = (acc[trailer.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <h1 className="text-2xl font-bold text-foreground">Fleet Management</h1>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trailer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Trailer</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new trailer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="trailer_number">Trailer Number *</Label>
                      <Input
                        id="trailer_number"
                        value={newTrailer.trailer_number}
                        onChange={(e) => setNewTrailer({ ...newTrailer, trailer_number: e.target.value })}
                        placeholder="TRL-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={newTrailer.type}
                        onValueChange={(value) => setNewTrailer({ ...newTrailer, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dry Van">Dry Van</SelectItem>
                          <SelectItem value="Flatbed">Flatbed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        value={newTrailer.make}
                        onChange={(e) => setNewTrailer({ ...newTrailer, make: e.target.value })}
                        placeholder="Utility, Great Dane, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={newTrailer.model}
                        onChange={(e) => setNewTrailer({ ...newTrailer, model: e.target.value })}
                        placeholder="3000R, Everest, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newTrailer.year}
                        onChange={(e) => setNewTrailer({ ...newTrailer, year: parseInt(e.target.value) })}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year_purchased">Year Purchased</Label>
                      <Input
                        id="year_purchased"
                        type="number"
                        value={newTrailer.year_purchased}
                        onChange={(e) => setNewTrailer({ ...newTrailer, year_purchased: parseInt(e.target.value) })}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase_price">Purchase Price</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        value={newTrailer.purchase_price}
                        onChange={(e) => setNewTrailer({ ...newTrailer, purchase_price: e.target.value })}
                        placeholder="35000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vin">VIN</Label>
                      <Input
                        id="vin"
                        value={newTrailer.vin}
                        onChange={(e) => setNewTrailer({ ...newTrailer, vin: e.target.value })}
                        placeholder="1UYVS25387A123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_plate">License Plate</Label>
                      <Input
                        id="license_plate"
                        value={newTrailer.license_plate}
                        onChange={(e) => setNewTrailer({ ...newTrailer, license_plate: e.target.value })}
                        placeholder="ABC1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gps_box_number">GPS Box Number</Label>
                      <Input
                        id="gps_box_number"
                        value={newTrailer.gps_box_number}
                        onChange={(e) => setNewTrailer({ ...newTrailer, gps_box_number: e.target.value })}
                        placeholder="GPS-001"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTrailer} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Trailer"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {/* Fleet Stats */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Fleet
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalFleetCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All trailers
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'rented' ? 'ring-2 ring-teal-500' : ''}`}
                onClick={() => setStatusFilter('rented')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Rented
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOut}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently rented
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'available' ? 'ring-2 ring-teal-600' : ''}`}
                onClick={() => setStatusFilter('available')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Available
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ready to lease
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'maintenance' ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => setStatusFilter('maintenance')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Maintenance
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{maintenanceCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In service
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'under_review' ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setStatusFilter('under_review')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Under Review
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{underReviewCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pending review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Fleet Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalFleetValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total value
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trailer Types Summary */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Trailer Types</CardTitle>
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(trailersByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <div 
                      key={type} 
                      className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                    >
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(trailersByType).length === 0 && (
                    <p className="text-sm text-muted-foreground">No trailers in fleet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by VIN, lessee, type, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Fleet Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fleet Overview</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search trailers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader column="vin">VIN</SortableHeader>
                        <SortableHeader column="type">Type</SortableHeader>
                        <SortableHeader column="year">Year</SortableHeader>
                        <TableHead>Monthly Price</TableHead>
                        <TableHead>Lessee</TableHead>
                        <SortableHeader column="status">Status</SortableHeader>
                        <SortableHeader column="purchase_price">Purchase Price</SortableHeader>
                        <SortableHeader column="total_maintenance_cost">Maintenance</SortableHeader>
                        <SortableHeader column="rental_income">Income</SortableHeader>
                        <TableHead>ROI</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrailers.map((trailer) => {
                        const assignedCustomer = customers.find(c => c.id === trailer.customer_id);
                        return (
                          <TableRow 
                            key={trailer.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/dashboard/admin/fleet/${trailer.id}`)}
                          >
                            <TableCell className="font-mono text-sm">
                              {trailer.vin || "-"}
                            </TableCell>
                            <TableCell>{trailer.type}</TableCell>
                            <TableCell>{trailer.year}</TableCell>
                            <TableCell className="font-medium text-primary">
                              {getMonthlyPriceRange(trailer)}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {assignedCustomer ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate max-w-[150px]" title={assignedCustomer.full_name}>
                                    {assignedCustomer.full_name}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setUnassignTrailerId(trailer.id)}
                                    title="Unassign customer"
                                  >
                                    <UserX className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(trailer.status)}</TableCell>
                            <TableCell>
                              ${(trailer.purchase_price || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-destructive">
                              ${(trailer.total_maintenance_cost || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-green-600">
                              ${(trailer.rental_income || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={parseFloat(calculateROI(trailer)) > 0 ? "default" : "destructive"}>
                                {calculateROI(trailer)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                {trailer.status === "available" && !trailer.is_rented && !trailer.customer_id && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setScheduleReleaseTrailer(trailer);
                                      setIsScheduleDialogOpen(true);
                                    }}
                                    title="Schedule customer pickup"
                                  >
                                    <CalendarClock className="h-4 w-4" />
                                  </Button>
                                )}
                                {(trailer.is_rented || trailer.customer_id) && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-blue-600 border-blue-500 hover:bg-blue-50"
                                      onClick={() => {
                                        setScheduleDropoffTrailer(trailer);
                                        setIsDropoffDialogOpen(true);
                                      }}
                                      title="Schedule drop-off"
                                    >
                                      <CalendarClock className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-primary border-primary hover:bg-primary/10"
                                      onClick={() => setUnassignTrailerId(trailer.id)}
                                      title="Check in trailer (unassign from customer)"
                                    >
                                      <LogIn className="h-4 w-4 mr-1" />
                                      Check In
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigate(`/dashboard/admin/fleet/${trailer.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm(`Archive trailer ${trailer.trailer_number}? It can be restored later.`)) {
                                      handleArchiveTrailer(trailer.id, trailer.trailer_number);
                                    }
                                  }}
                                  title="Archive trailer"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Check In / Unassign Confirmation Dialog */}
            <AlertDialog open={!!unassignTrailerId} onOpenChange={(open) => !open && setUnassignTrailerId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Check In Trailer</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to check in this trailer? This will unassign it from the customer 
                    and mark it as available for lease.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => unassignTrailerId && handleUnassignTrailer(unassignTrailerId)}>
                    Check In
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Schedule Release Dialog */}
            <ScheduleReleaseDialog
              open={isScheduleDialogOpen}
              onOpenChange={setIsScheduleDialogOpen}
              trailer={scheduleReleaseTrailer}
              onScheduled={() => {
                fetchCompanyAndTrailers();
                setScheduleReleaseTrailer(null);
              }}
            />

            {/* Schedule Drop-off Dialog */}
            <ScheduleDropoffDialog
              open={isDropoffDialogOpen}
              onOpenChange={setIsDropoffDialogOpen}
              trailer={scheduleDropoffTrailer}
              onScheduled={() => {
                fetchCompanyAndTrailers();
                setScheduleDropoffTrailer(null);
              }}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
