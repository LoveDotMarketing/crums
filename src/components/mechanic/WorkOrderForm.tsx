import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Loader2, DollarSign, Search } from "lucide-react";
import { toast } from "sonner";

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  vin: string | null;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  parts_price: number | null;
  labor_price: number | null;
  labor_hours: number | null;
}

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  catalog_labor_hours?: number | null;
}

export interface ExistingWorkOrder {
  id: string;
  trailer_id: string;
  repair_type: string;
  description: string;
  work_start_date: string;
  work_completion_date: string | null;
  labor_hours: number;
  labor_rate: number;
  travel_fee: number;
  labor_total: number;
  parts_total: number;
  grand_total: number;
  status: string;
}

interface WorkOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  existingWorkOrder?: ExistingWorkOrder;
  existingLineItems?: LineItem[];
}

const REPAIR_TYPES = [
  "Preventative Maintenance",
  "Yard Repair",
  "Safety/DOT",
  "Emergency Repair",
];

const CATEGORY_ORDER = [
  "General",
  "Tires and Wheels",
  "Brakes",
  "Electrical and Lights",
  "Hub and Bearings",
  "Mud Flaps",
  "Maintenance Supplies",
  "Body and Structure",
];

export function WorkOrderForm({ onSuccess, onCancel, existingWorkOrder, existingLineItems }: WorkOrderFormProps) {
  const { effectiveUserId } = useAuth();
  const isEditMode = !!existingWorkOrder;
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrailers, setLoadingTrailers] = useState(true);

  // Form state
  const [trailerId, setTrailerId] = useState(existingWorkOrder?.trailer_id || "");
  const [repairType, setRepairType] = useState(existingWorkOrder?.repair_type || "");
  const [description, setDescription] = useState(existingWorkOrder?.description || "");
  const [workStartDate, setWorkStartDate] = useState(existingWorkOrder?.work_start_date || new Date().toISOString().split("T")[0]);
  const [workCompletionDate, setWorkCompletionDate] = useState(existingWorkOrder?.work_completion_date || "");
  const [laborHours, setLaborHours] = useState<number>(existingWorkOrder?.labor_hours || 0);
  const [includeTravelFee, setIncludeTravelFee] = useState(existingWorkOrder ? existingWorkOrder.travel_fee > 0 : false);
  const [parts, setParts] = useState<LineItem[]>(existingLineItems || []);

  const LABOR_RATE = 85;
  const TRAVEL_FEE = 75;

  // Auto-sum catalog labor hours into the labor hours field
  const catalogLaborHours = parts.reduce((sum, p) => sum + ((p.catalog_labor_hours || 0) * p.quantity), 0);
  const totalLaborHours = laborHours + catalogLaborHours;
  const laborTotal = totalLaborHours * LABOR_RATE + (includeTravelFee ? TRAVEL_FEE : 0);
  const partsTotal = parts.reduce((sum, p) => sum + p.quantity * p.unit_cost, 0);
  const grandTotal = laborTotal + partsTotal;

  useEffect(() => {
    fetchTrailers();
    fetchCatalog();
  }, []);

  const fetchTrailers = async () => {
    try {
      const { data, error } = await supabase
        .from("trailers")
        .select("id, trailer_number, type, vin")
        .order("trailer_number");
      if (error) throw error;
      setTrailers(data || []);
    } catch (error) {
      console.error("Error fetching trailers:", error);
    } finally {
      setLoadingTrailers(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("service_catalog")
        .select("id, name, category, parts_price, labor_price, labor_hours")
        .eq("is_active", true)
        .order("category")
        .order("name");
      if (error) throw error;
      setCatalog(data || []);
    } catch (error) {
      console.error("Error fetching service catalog:", error);
    }
  };

  const addFromCatalog = (catalogId: string) => {
    if (catalogId === "custom") {
      setParts([...parts, { description: "", quantity: 1, unit_cost: 0, catalog_labor_hours: null }]);
      return;
    }

    const item = catalog.find((c) => c.id === catalogId);
    if (!item) return;

    const unitCost = item.parts_price || item.labor_price || 0;
    setParts([
      ...parts,
      {
        description: item.name,
        quantity: 1,
        unit_cost: unitCost,
        catalog_labor_hours: item.labor_hours,
      },
    ]);
  };

  const updatePart = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...parts];
    if (field === "quantity" || field === "unit_cost") {
      updated[index][field] = typeof value === "string" ? parseFloat(value) || 0 : value;
    } else if (field === "description") {
      updated[index].description = value as string;
    }
    setParts(updated);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  // Group catalog items by category
  const groupedCatalog = CATEGORY_ORDER.reduce<Record<string, CatalogItem[]>>((acc, cat) => {
    const items = catalog.filter((c) => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const handleSubmit = async (submitForReview: boolean) => {
    if (!trailerId || !repairType || !description || !workStartDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create work order
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: workOrder, error: woError } = await (supabase as any)
        .from("work_orders")
        .insert({
          trailer_id: trailerId,
          mechanic_id: effectiveUserId,
          repair_type: repairType,
          description,
          work_start_date: workStartDate,
          work_completion_date: workCompletionDate || null,
          labor_hours: totalLaborHours,
          labor_rate: LABOR_RATE,
          travel_fee: includeTravelFee ? TRAVEL_FEE : 0,
          parts_total: partsTotal,
          grand_total: totalLaborHours * LABOR_RATE + (includeTravelFee ? TRAVEL_FEE : 0) + partsTotal,
          status: submitForReview ? "submitted" : "in_progress",
          submitted_at: submitForReview ? new Date().toISOString() : null,
        })
        .select("id")
        .single();

      if (woError) throw woError;

      // Insert line items
      if (parts.length > 0) {
        const lineItems = parts
          .filter((p) => p.description.trim())
          .map((p) => ({
            work_order_id: workOrder.id,
            item_type: "part",
            description: p.description,
            quantity: p.quantity,
            unit_cost: p.unit_cost,
          }));

        if (lineItems.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: liError } = await (supabase as any)
            .from("work_order_line_items")
            .insert(lineItems);
          if (liError) throw liError;
        }
      }

      toast.success(submitForReview ? "Work order submitted for review" : "Work order saved as draft");
      onSuccess();
    } catch (error) {
      console.error("Error creating work order:", error);
      toast.error("Failed to create work order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trailer & Repair Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trailer *</Label>
              <Select value={trailerId} onValueChange={setTrailerId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTrailers ? "Loading..." : "Select trailer"} />
                </SelectTrigger>
                <SelectContent>
                  {trailers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.trailer_number} — {t.type} {t.vin ? `(${t.vin.slice(-6)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Repair Type *</Label>
              <Select value={repairType} onValueChange={setRepairType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REPAIR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work performed..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={workStartDate} onChange={(e) => setWorkStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Completion Date</Label>
              <Input type="date" value={workCompletionDate} onChange={(e) => setWorkCompletionDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Labor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Labor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Additional Hours</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={laborHours || ""}
                onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Rate</Label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted text-muted-foreground">
                ${LABOR_RATE}/hr
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Hours</Label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted font-medium">
                {totalLaborHours.toFixed(1)} hrs = ${(totalLaborHours * LABOR_RATE).toFixed(2)}
              </div>
            </div>
          </div>
          {catalogLaborHours > 0 && (
            <p className="text-xs text-muted-foreground">
              Includes {catalogLaborHours.toFixed(1)} hrs from catalog items + {laborHours.toFixed(1)} hrs additional
            </p>
          )}
          <div className="flex items-center justify-between p-3 rounded-md border">
            <div>
              <p className="font-medium">Travel Fee</p>
              <p className="text-sm text-muted-foreground">Flat rate of ${TRAVEL_FEE} when travel is required</p>
            </div>
            <div className="flex items-center gap-3">
              {includeTravelFee && <Badge variant="secondary">${TRAVEL_FEE}.00</Badge>}
              <Switch checked={includeTravelFee} onCheckedChange={setIncludeTravelFee} />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Labor Total</p>
              <p className="text-lg font-bold">${laborTotal.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts & Services */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Parts & Services</CardTitle>
          <Select onValueChange={addFromCatalog}>
            <SelectTrigger className="w-[260px]">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Service/Part</span>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              <SelectGroup>
                <SelectItem value="custom">
                  <span className="font-medium">✏️ Custom Item</span>
                </SelectItem>
              </SelectGroup>
              {Object.entries(groupedCatalog).map(([category, items]) => (
                <SelectGroup key={category}>
                  <SelectLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </SelectLabel>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ${(item.parts_price || item.labor_price || 0).toFixed(0)}
                          {item.labor_hours ? ` · ${item.labor_hours}hr` : ""}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-3">
          {parts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No parts or services added yet. Use the dropdown above to add from the catalog.</p>
          )}
          {parts.map((part, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5 space-y-1">
                {index === 0 && <Label className="text-xs">Description</Label>}
                <Input
                  value={part.description}
                  onChange={(e) => updatePart(index, "description", e.target.value)}
                  placeholder="Part or service name"
                />
              </div>
              <div className="col-span-2 space-y-1">
                {index === 0 && <Label className="text-xs">Qty</Label>}
                <Input
                  type="number"
                  min="1"
                  value={part.quantity || ""}
                  onChange={(e) => updatePart(index, "quantity", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1">
                {index === 0 && <Label className="text-xs">Unit Cost</Label>}
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={part.unit_cost || ""}
                  onChange={(e) => updatePart(index, "unit_cost", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1">
                {index === 0 && <Label className="text-xs">Total</Label>}
                <div className="flex items-center h-10 px-2 rounded-md border bg-muted text-sm font-medium">
                  ${(part.quantity * part.unit_cost).toFixed(2)}
                </div>
              </div>
              <div className="col-span-1">
                <Button variant="ghost" size="icon" onClick={() => removePart(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {parts.length > 0 && (
            <div className="flex justify-end pt-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Parts Total</p>
                <p className="text-lg font-bold">${partsTotal.toFixed(2)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grand Total */}
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Grand Total</span>
            </div>
            <span className="text-2xl font-bold text-primary">${grandTotal.toFixed(2)}</span>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Labor ({totalLaborHours.toFixed(1)} hrs)</p>
              <p className="font-medium text-foreground">${(totalLaborHours * LABOR_RATE).toFixed(2)}</p>
            </div>
            <div>
              <p>Travel</p>
              <p className="font-medium text-foreground">${includeTravelFee ? TRAVEL_FEE.toFixed(2) : "0.00"}</p>
            </div>
            <div>
              <p>Parts</p>
              <p className="font-medium text-foreground">${partsTotal.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Draft
        </Button>
        <Button onClick={() => handleSubmit(true)} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
