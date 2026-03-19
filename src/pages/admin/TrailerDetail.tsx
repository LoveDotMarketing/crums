import { useState, useEffect, useCallback } from "react";
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
  User,
  Camera,
  X,
  ImageIcon
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
import { decodeVin } from "@/lib/vinDecoder";

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
  axle_count: number | null;
  body_material: string | null;
  door_type: string | null;
  suspension_type: string | null;
  empty_weight: number | null;
  last_pm_date: string | null;
  inside_width: string | null;
  side_post_spacing: string | null;
  crossmember_spacing: string | null;
  has_side_skirts: boolean | null;
  side_skirt_type: string | null;
  tire_type: string | null;
  tire_tread_condition: string | null;
  floor_thickness: string | null;
  roof_type: string | null;
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
  maintenance_type: string | null;
  source: string | null;
  work_order_id: string | null;
}

type AgreementType = 'standard_lease' | '6_month_lease' | '24_month_lease' | 'lease_to_own' | 'rent_for_storage' | 'repayment_plan';

const AGREEMENT_LABELS: Record<AgreementType, string> = {
  standard_lease: 'Standard Lease',
  '6_month_lease': '6 Month Lease',
  '24_month_lease': '24 Month Lease',
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
  const [decodingVin, setDecodingVin] = useState(false);
  const [formData, setFormData] = useState<Partial<Trailer>>({});
  const [agreementType, setAgreementType] = useState<AgreementType | null>(null);
  const [editAgreementType, setEditAgreementType] = useState<AgreementType | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscriptionItemId, setSubscriptionItemId] = useState<string | null>(null);
  const [contractStartDate, setContractStartDate] = useState<string | null>(null);
  const [contractEndDate, setContractEndDate] = useState<string | null>(null);

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

        // Fetch subscription type and contract dates
        const { data: sub } = await supabase
          .from("customer_subscriptions")
          .select("subscription_type, contract_start_date, end_date")
          .eq("id", subItem.subscription_id)
          .maybeSingle();

        const type = (sub?.subscription_type as AgreementType) || 'standard_lease';
        setAgreementType(type);
        setEditAgreementType(type);
        setContractStartDate(sub?.contract_start_date || null);
        setContractEndDate(sub?.end_date || null);
      } else {
        setAgreementType(null);
        setEditAgreementType(null);
        setSubscriptionId(null);
        setSubscriptionItemId(null);
        setContractStartDate(null);
        setContractEndDate(null);
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
          axle_count: formData.axle_count || null,
          body_material: formData.body_material || null,
          door_type: formData.door_type || null,
          suspension_type: formData.suspension_type || null,
          empty_weight: formData.empty_weight || null,
          last_pm_date: formData.last_pm_date || null,
          inside_width: formData.inside_width || null,
          side_post_spacing: formData.side_post_spacing || null,
          crossmember_spacing: formData.crossmember_spacing || null,
          has_side_skirts: formData.has_side_skirts ?? false,
          side_skirt_type: formData.side_skirt_type || null,
          tire_type: formData.tire_type || null,
          tire_tread_condition: formData.tire_tread_condition || null,
          floor_thickness: formData.floor_thickness || null,
          roof_type: formData.roof_type || null,
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

  const handleArchive = async () => {
    if (!trailer) return;

    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "archived" })
        .eq("id", trailer.id);

      if (error) throw error;

      toast.success(`Trailer ${trailer.trailer_number} archived`);
      navigate("/dashboard/admin/fleet");
    } catch (error) {
      console.error("Error archiving trailer:", error);
      toast.error("Failed to archive trailer");
    }
  };

  const handleRestore = async () => {
    if (!trailer) return;

    try {
      const { error } = await supabase
        .from("trailers")
        .update({ status: "available" })
        .eq("id", trailer.id);

      if (error) throw error;

      toast.success(`Trailer ${trailer.trailer_number} restored`);
      fetchTrailerData();
    } catch (error) {
      console.error("Error restoring trailer:", error);
      toast.error("Failed to restore trailer");
    }
  };

  const handlePermanentDelete = async () => {
    if (!trailer) return;

    try {
      const { error } = await supabase
        .from("trailers")
        .delete()
        .eq("id", trailer.id);

      if (error) throw error;

      toast.success(`Trailer ${trailer.trailer_number} permanently deleted`);
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
                    {trailer.status === "archived" ? (
                      <>
                        <Button variant="default" onClick={handleRestore}>
                          Restore
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Permanently Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Permanently Delete Trailer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete trailer #{trailer.trailer_number}? This action cannot be undone and all associated data will be lost.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handlePermanentDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Permanently Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Archive
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Archive Trailer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to archive trailer #{trailer.trailer_number}? It can be restored later from the Archived Trailers page.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
                        <div className="flex gap-2">
                          <Input
                            value={formData.vin || ""}
                            onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            disabled={!formData.vin || formData.vin.trim().length !== 17 || decodingVin}
                            onClick={async () => {
                              setDecodingVin(true);
                              try {
                                const decoded = await decodeVin(formData.vin!);
                                setFormData(prev => ({
                                  ...prev,
                                  ...(decoded.make ? { make: decoded.make } : {}),
                                  ...(decoded.model ? { model: decoded.model } : {}),
                                  ...(decoded.year ? { year: decoded.year } : {}),
                                  ...(decoded.type ? { type: decoded.type } : {}),
                                  ...(decoded.axle_count ? { axle_count: decoded.axle_count } : {}),
                                  ...(decoded.body_material ? { body_material: decoded.body_material } : {}),
                                  ...(decoded.suspension_type ? { suspension_type: decoded.suspension_type } : {}),
                                }));
                                toast.success("VIN decoded successfully");
                              } catch (err: any) {
                                toast.error(err.message || "Failed to decode VIN");
                              } finally {
                                setDecodingVin(false);
                              }
                            }}
                          >
                            {decodingVin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decode"}
                          </Button>
                        </div>
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
                      <Label>Axle Count</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.axle_count || ""}
                          onChange={(e) => setFormData({ ...formData, axle_count: parseInt(e.target.value) || null })}
                          placeholder="2"
                        />
                      ) : (
                        <p className="text-lg">{trailer.axle_count || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Body Material</Label>
                      {isEditing ? (
                        <Input
                          value={formData.body_material || ""}
                          onChange={(e) => setFormData({ ...formData, body_material: e.target.value })}
                          placeholder="Aluminum/Steel"
                        />
                      ) : (
                        <p className="text-lg">{trailer.body_material || "-"}</p>
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

              {/* Specifications Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Specifications
                  </CardTitle>
                  <CardDescription>Detailed trailer specifications for sales team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Door Type */}
                    <div className="space-y-2">
                      <Label>Door Type</Label>
                      {isEditing ? (
                        <Select
                          value={formData.door_type || ""}
                          onValueChange={(value) => setFormData({ ...formData, door_type: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="swing">Swing</SelectItem>
                            <SelectItem value="roll">Roll-Up</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-lg capitalize">{trailer.door_type || "-"}</p>
                      )}
                    </div>

                    {/* Suspension */}
                    <div className="space-y-2">
                      <Label>Suspension</Label>
                      {isEditing ? (
                        <Select
                          value={formData.suspension_type || ""}
                          onValueChange={(value) => setFormData({ ...formData, suspension_type: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="air_ride">Air Ride</SelectItem>
                            <SelectItem value="spring">Spring</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-lg">{trailer.suspension_type === 'air_ride' ? 'Air Ride' : trailer.suspension_type === 'spring' ? 'Spring' : '-'}</p>
                      )}
                    </div>

                    {/* Roof Type */}
                    <div className="space-y-2">
                      <Label>Roof Type</Label>
                      {isEditing ? (
                        <Input
                          value={formData.roof_type || ""}
                          onChange={(e) => setFormData({ ...formData, roof_type: e.target.value })}
                          placeholder="Aluminum, Translucent..."
                        />
                      ) : (
                        <p className="text-lg">{trailer.roof_type || "-"}</p>
                      )}
                    </div>

                    {/* Floor Thickness */}
                    <div className="space-y-2">
                      <Label>Floor Thickness</Label>
                      {isEditing ? (
                        <Input
                          value={formData.floor_thickness || ""}
                          onChange={(e) => setFormData({ ...formData, floor_thickness: e.target.value })}
                          placeholder='1-1/8" hardwood'
                        />
                      ) : (
                        <p className="text-lg">{trailer.floor_thickness || "-"}</p>
                      )}
                    </div>

                    {/* Inside Width */}
                    <div className="space-y-2">
                      <Label>Inside Width</Label>
                      {isEditing ? (
                        <Input
                          value={formData.inside_width || ""}
                          onChange={(e) => setFormData({ ...formData, inside_width: e.target.value })}
                          placeholder='101.5"'
                        />
                      ) : (
                        <p className="text-lg">{trailer.inside_width || "-"}</p>
                      )}
                    </div>

                    {/* Empty Weight */}
                    <div className="space-y-2">
                      <Label>Empty Weight (lbs)</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.empty_weight || ""}
                          onChange={(e) => setFormData({ ...formData, empty_weight: parseInt(e.target.value) || null })}
                          placeholder="14,000"
                        />
                      ) : (
                        <p className="text-lg">{trailer.empty_weight ? `${trailer.empty_weight.toLocaleString()} lbs` : "-"}</p>
                      )}
                    </div>

                    {/* Side Post Spacing */}
                    <div className="space-y-2">
                      <Label>Side Post Spacing</Label>
                      {isEditing ? (
                        <Input
                          value={formData.side_post_spacing || ""}
                          onChange={(e) => setFormData({ ...formData, side_post_spacing: e.target.value })}
                          placeholder='12", E-Track 2 rows...'
                        />
                      ) : (
                        <p className="text-lg">{trailer.side_post_spacing || "-"}</p>
                      )}
                    </div>

                    {/* Crossmember Spacing */}
                    <div className="space-y-2">
                      <Label>Crossmember Spacing</Label>
                      {isEditing ? (
                        <Input
                          value={formData.crossmember_spacing || ""}
                          onChange={(e) => setFormData({ ...formData, crossmember_spacing: e.target.value })}
                          placeholder='12"'
                        />
                      ) : (
                        <p className="text-lg">{trailer.crossmember_spacing || "-"}</p>
                      )}
                    </div>

                    {/* Side Skirts */}
                    <div className="space-y-2">
                      <Label>Side Skirts</Label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.has_side_skirts || false}
                              onChange={(e) => setFormData({ ...formData, has_side_skirts: e.target.checked, side_skirt_type: e.target.checked ? formData.side_skirt_type : null })}
                              className="h-4 w-4 rounded border-primary"
                            />
                            <span className="text-sm">Has side skirts</span>
                          </div>
                          {formData.has_side_skirts && (
                            <Input
                              value={formData.side_skirt_type || ""}
                              onChange={(e) => setFormData({ ...formData, side_skirt_type: e.target.value })}
                              placeholder="Full length, Partial..."
                            />
                          )}
                        </div>
                      ) : (
                        <p className="text-lg">{trailer.has_side_skirts ? (trailer.side_skirt_type || "Yes") : "No"}</p>
                      )}
                    </div>

                    {/* Tire Type */}
                    <div className="space-y-2">
                      <Label>Tire Type</Label>
                      {isEditing ? (
                        <Input
                          value={formData.tire_type || ""}
                          onChange={(e) => setFormData({ ...formData, tire_type: e.target.value })}
                          placeholder="Goodyear G316"
                        />
                      ) : (
                        <p className="text-lg">{trailer.tire_type || "-"}</p>
                      )}
                    </div>

                    {/* Tread Condition */}
                    <div className="space-y-2">
                      <Label>Tread Condition</Label>
                      {isEditing ? (
                        <Select
                          value={formData.tire_tread_condition || ""}
                          onValueChange={(value) => setFormData({ ...formData, tire_tread_condition: value || null })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-lg">{trailer.tire_tread_condition || "-"}</p>
                      )}
                    </div>

                    {/* Last PM Date */}
                    <div className="space-y-2">
                      <Label>Last PM Date</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={formData.last_pm_date || ""}
                          onChange={(e) => setFormData({ ...formData, last_pm_date: e.target.value || null })}
                        />
                      ) : (
                        <p className="text-lg">{trailer.last_pm_date ? new Date(trailer.last_pm_date + 'T00:00:00').toLocaleDateString() : "-"}</p>
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
                            <SelectItem value="6_month_lease">6 Month Lease</SelectItem>
                            <SelectItem value="24_month_lease">24 Month Lease</SelectItem>
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

                  {/* Contract Dates — shown only when a subscription exists */}
                  {agreementType && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Contract Start</Label>
                        <p className="text-sm">
                          {contractStartDate
                            ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(contractStartDate))
                            : <span className="text-muted-foreground">Not set</span>
                          }
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Contract End</Label>
                        <p className="text-sm">
                          {contractEndDate
                            ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(contractEndDate))
                            : <span className="text-muted-foreground">Ongoing</span>
                          }
                        </p>
                      </div>
                    </div>
                  )}
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
                        <TableHead>Type</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.maintenance_date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell className="text-muted-foreground">{record.maintenance_type || "—"}</TableCell>
                          <TableCell>${record.cost.toLocaleString()}</TableCell>
                          <TableCell>
                            {record.source === "work_order" && record.work_order_id ? (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => navigate(`/dashboard/admin/work-orders`)}
                              >
                                Work Order
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Manual</span>
                            )}
                          </TableCell>
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
