import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Loader2,
  Truck,
  Calendar,
  DollarSign,
  Wrench,
  MapPin
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  year_purchased: number | null;
  purchase_price: number | null;
  total_maintenance_cost: number | null;
  is_rented: boolean | null;
  rental_income: number | null;
  status: string;
  assigned_to: string | null;
  vin: string | null;
  license_plate: string | null;
  notes: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

interface MaintenanceRecord {
  id: string;
  description: string;
  cost: number;
  maintenance_date: string;
  completed: boolean | null;
  mechanic_id: string | null;
}

export default function TrailerDetail() {
  const { trailerId } = useParams<{ trailerId: string }>();
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Trailer>>({});

  useEffect(() => {
    if (trailerId) {
      fetchTrailerData();
    }
  }, [trailerId]);

  const fetchTrailerData = async () => {
    try {
      // Fetch trailer details
      const { data: trailerData, error: trailerError } = await supabase
        .from("trailers")
        .select("*")
        .eq("id", trailerId)
        .maybeSingle();

      if (trailerError) throw trailerError;
      
      if (!trailerData) {
        toast.error("Trailer not found");
        navigate("/dashboard/admin/fleet");
        return;
      }

      setTrailer(trailerData);
      setFormData(trailerData);

      // Fetch maintenance records
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("trailer_id", trailerId)
        .order("maintenance_date", { ascending: false });

      if (maintenanceError) throw maintenanceError;
      setMaintenanceRecords(maintenanceData || []);
    } catch (error) {
      console.error("Error fetching trailer data:", error);
      toast.error("Failed to load trailer data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!trailer) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("trailers")
        .update({
          trailer_number: formData.trailer_number,
          type: formData.type,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          year_purchased: formData.year_purchased,
          purchase_price: formData.purchase_price,
          vin: formData.vin,
          license_plate: formData.license_plate,
          status: formData.status,
          is_rented: formData.status === "rented",
          notes: formData.notes,
        })
        .eq("id", trailer.id);

      if (error) throw error;

      toast.success("Trailer updated successfully");
      setTrailer({ ...trailer, ...formData } as Trailer);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating trailer:", error);
      toast.error("Failed to update trailer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!trailer) return;

    try {
      const { error } = await supabase
        .from("trailers")
        .delete()
        .eq("id", trailer.id);

      if (error) throw error;

      toast.success(`Trailer ${trailer.trailer_number} deleted`);
      navigate("/dashboard/admin/fleet");
    } catch (error) {
      console.error("Error deleting trailer:", error);
      toast.error("Failed to delete trailer");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      rented: "default",
      available: "secondary",
      maintenance: "destructive",
      in_use: "default"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!trailer) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger />
            <div className="flex-1 flex items-center justify-between ml-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/admin/fleet")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Fleet
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                  Trailer #{trailer.trailer_number}
                </h1>
                {getStatusBadge(trailer.status)}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(trailer); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Trailer
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Trailer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete trailer #{trailer.trailer_number}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Details Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Trailer Details
                  </CardTitle>
                  <CardDescription>Core information about this trailer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trailer Number</Label>
                      {isEditing ? (
                        <Input
                          value={formData.trailer_number || ""}
                          onChange={(e) => setFormData({ ...formData, trailer_number: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg font-semibold">{trailer.trailer_number}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      {isEditing ? (
                        <Select
                          value={formData.type || ""}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dry Van">Dry Van</SelectItem>
                            <SelectItem value="Flat Bed">Flat Bed</SelectItem>
                            <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                            <SelectItem value="Lowboy">Lowboy</SelectItem>
                            <SelectItem value="Step Deck">Step Deck</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-lg">{trailer.type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>VIN</Label>
                      {isEditing ? (
                        <Input
                          value={formData.vin || ""}
                          onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-mono">{trailer.vin || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>License Plate</Label>
                      {isEditing ? (
                        <Input
                          value={formData.license_plate || ""}
                          onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{trailer.license_plate || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Make</Label>
                      {isEditing ? (
                        <Input
                          value={formData.make || ""}
                          onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{trailer.make || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      {isEditing ? (
                        <Input
                          value={formData.model || ""}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg">{trailer.model || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Year</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.year || ""}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || null })}
                        />
                      ) : (
                        <p className="text-lg">{trailer.year || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      {isEditing ? (
                        <Select
                          value={formData.status || ""}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getStatusBadge(trailer.status)
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Notes</Label>
                      {isEditing ? (
                        <Textarea
                          value={formData.notes || ""}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                        />
                      ) : (
                        <p className="text-muted-foreground">{trailer.notes || "No notes"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Card */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Price</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-32 text-right"
                          value={formData.purchase_price || ""}
                          onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || null })}
                        />
                      ) : (
                        <span className="font-semibold">${(trailer.purchase_price || 0).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Maintenance</span>
                      <span className="font-semibold text-destructive">
                        ${(trailer.total_maintenance_cost || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental Income</span>
                      <span className="font-semibold text-green-600">
                        ${(trailer.rental_income || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-4 flex justify-between">
                      <span className="text-muted-foreground">Net Return</span>
                      <span className={`font-bold ${((trailer.rental_income || 0) - (trailer.purchase_price || 0) - (trailer.total_maintenance_cost || 0)) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        ${((trailer.rental_income || 0) - (trailer.purchase_price || 0) - (trailer.total_maintenance_cost || 0)).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Year Purchased</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-24 text-right"
                          value={formData.year_purchased || ""}
                          onChange={(e) => setFormData({ ...formData, year_purchased: parseInt(e.target.value) || null })}
                        />
                      ) : (
                        <span>{trailer.year_purchased || "-"}</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Added to System</span>
                      <span>{new Date(trailer.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{new Date(trailer.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Maintenance History */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance History
                </CardTitle>
                <CardDescription>All maintenance records for this trailer</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No maintenance records found for this trailer.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.maintenance_date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>${record.cost.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={record.completed ? "default" : "secondary"}>
                              {record.completed ? "Completed" : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
