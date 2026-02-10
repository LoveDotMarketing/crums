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
  MapPin,
  User
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
  customer_id: string | null;
  vin: string | null;
  license_plate: string | null;
  notes: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_box_number: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
  rental_rate: number | null;
  rental_frequency: string | null;
}

interface Customer {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string | null;
}

interface MaintenanceRecord {
  id: string;
  description: string;
  cost: number;
  maintenance_date: string;
  completed: boolean | null;
  mechanic_id: string | null;
}

type AgreementType = 'standard_lease' | 'lease_to_own' | 'rent_for_storage' | 'repayment_plan';

const AGREEMENT_LABELS: Record<AgreementType, string> = {
  standard_lease: 'Standard Lease',
  lease_to_own: 'Lease to Own',
  rent_for_storage: 'Rent for Storage',
  repayment_plan: 'Repayment Plan',
};

export default function TrailerDetail() {
  const { trailerId } = useParams<{ trailerId: string }>();
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Trailer>>({});
  const [agreementType, setAgreementType] = useState<AgreementType | null>(null);
  const [editAgreementType, setEditAgreementType] = useState<AgreementType | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscriptionItemId, setSubscriptionItemId] = useState<string | null>(null);

  useEffect(() => {
    if (trailerId) {
      fetchTrailerData();
      fetchCustomers();
      fetchAgreementType();
    }
  }, [trailerId]);

  const fetchCustomers = async () => {
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
    }
  };

  const fetchAgreementType = async () => {
    if (!trailerId) return;
    try {
      // Get subscription item for this trailer to find the subscription
      const { data: subItem } = await supabase
        .from("subscription_items")
        .select("id, lease_to_own, subscription_id")
        .eq("trailer_id", trailerId)
        .in("status", ["active", "paused"])
        .maybeSingle();

      if (subItem) {
        setSubscriptionItemId(subItem.id);
        setSubscriptionId(subItem.subscription_id);

        // Fetch subscription type
        const { data: sub } = await supabase
          .from("customer_subscriptions")
          .select("subscription_type")
          .eq("id", subItem.subscription_id)
          .maybeSingle();

        const type = (sub?.subscription_type as AgreementType) || 'standard_lease';
        setAgreementType(type);
        setEditAgreementType(type);
      } else {
        setAgreementType(null);
        setEditAgreementType(null);
        setSubscriptionId(null);
        setSubscriptionItemId(null);
      }
    } catch (error) {
      console.error("Error fetching agreement type:", error);
    }
  };



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
      // Determine status based on customer assignment
      const hasCustomer = !!formData.customer_id;
      const newStatus = hasCustomer ? "rented" : (formData.status === "rented" ? "available" : formData.status);

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
          gps_box_number: formData.gps_box_number,
          status: newStatus,
          is_rented: hasCustomer,
          customer_id: formData.customer_id || null,
          rental_rate: formData.rental_rate,
          rental_frequency: formData.rental_frequency,
          notes: formData.notes,
        })
        .eq("id", trailer.id);

      if (error) throw error;

      // Save agreement type if subscription exists
      if (subscriptionId && editAgreementType && editAgreementType !== agreementType) {
        await supabase
          .from("customer_subscriptions")
          .update({ subscription_type: editAgreementType })
          .eq("id", subscriptionId);

        if (subscriptionItemId) {
          await supabase
            .from("subscription_items")
            .update({ lease_to_own: editAgreementType === 'lease_to_own' })
            .eq("id", subscriptionItemId);
        }

        setAgreementType(editAgreementType);
      }

      toast.success("Trailer updated successfully");
      setTrailer({ ...trailer, ...formData, status: newStatus, is_rented: hasCustomer } as Trailer);
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
                    <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(trailer); setEditAgreementType(agreementType); }}>
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
                            <SelectItem value="Flatbed">Flatbed</SelectItem>
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
                      <Label>GPS Box Number</Label>
                      {isEditing ? (
                        <Input
                          value={formData.gps_box_number || ""}
                          onChange={(e) => setFormData({ ...formData, gps_box_number: e.target.value })}
                          placeholder="GPS-001"
                        />
                      ) : (
                        <p className="text-lg">{trailer.gps_box_number || "-"}</p>
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
                            <SelectItem value="pending">Pending</SelectItem>
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

              {/* Lessee Assignment Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Lessee Assignment
                  </CardTitle>
                  <CardDescription>Assign this trailer to a customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Assigned Customer</Label>
                      {isEditing ? (
                        <Select
                          value={formData.customer_id || "unassigned"}
                          onValueChange={(value) => setFormData({ 
                            ...formData, 
                            customer_id: value === "unassigned" ? null : value 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              <span className="text-muted-foreground">— Unassigned —</span>
                            </SelectItem>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.full_name}
                                {customer.company_name && ` (${customer.company_name})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-lg">
                          {trailer.customer_id 
                            ? customers.find(c => c.id === trailer.customer_id)?.full_name || "Loading..."
                            : <span className="text-muted-foreground">Not assigned</span>
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Agreement Type</Label>
                      {isEditing ? (
                        <Select
                          value={editAgreementType || "standard_lease"}
                          onValueChange={(value) => setEditAgreementType(value as AgreementType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard_lease">Standard Lease</SelectItem>
                            <SelectItem value="lease_to_own">Lease to Own</SelectItem>
                            <SelectItem value="rent_for_storage">Rent for Storage</SelectItem>
                            <SelectItem value="repayment_plan">Repayment Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div>
                          {agreementType ? (
                            <Badge variant={agreementType === 'lease_to_own' ? 'default' : 'secondary'}>
                              {AGREEMENT_LABELS[agreementType]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No subscription</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Rate</Label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={formData.rental_rate || ""}
                            onChange={(e) => setFormData({ ...formData, rental_rate: parseFloat(e.target.value) || null })}
                            className="flex-1"
                          />
                          <Select
                            value={formData.rental_frequency || "monthly"}
                            onValueChange={(value) => setFormData({ ...formData, rental_frequency: value })}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <p className="text-lg">
                          {trailer.rental_rate 
                            ? `$${trailer.rental_rate.toLocaleString()} / ${trailer.rental_frequency || 'month'}`
                            : <span className="text-muted-foreground">Not set</span>
                          }
                        </p>
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
