import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { WorkOrderForm } from "@/components/mechanic/WorkOrderForm";
import type { ExistingWorkOrder, LineItem } from "@/components/mechanic/WorkOrderForm";
import { format } from "date-fns";

interface WorkOrder {
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
  submitted_at: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  created_at: string;
}

interface TrailerInfo {
  trailer_number: string;
  type: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  in_progress: { label: "Draft", variant: "outline", icon: Clock },
  submitted: { label: "Submitted", variant: "secondary", icon: FileText },
  under_review: { label: "Under Review", variant: "default", icon: AlertCircle },
  approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  needs_info: { label: "Needs Info", variant: "outline", icon: AlertCircle },
};

const EDITABLE_STATUSES = ["in_progress", "needs_info", "submitted"];

export default function WorkOrders() {
  const navigate = useNavigate();
  const { effectiveUserId } = useAuth();
  const [workOrders, setWorkOrders] = useState<(WorkOrder & { trailer?: TrailerInfo })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<ExistingWorkOrder | null>(null);
  const [editingLineItems, setEditingLineItems] = useState<LineItem[]>([]);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<(WorkOrder & { trailer?: TrailerInfo }) | null>(null);
  const [viewingLineItems, setViewingLineItems] = useState<LineItem[]>([]);
  const [viewingPhotos, setViewingPhotos] = useState<{ id: string; photo_url: string; category: string }[]>([]);

  useEffect(() => {
    if (effectiveUserId) fetchWorkOrders();
  }, [effectiveUserId]);

  const fetchWorkOrders = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("work_orders")
        .select("*")
        .eq("mechanic_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch trailer info
      const trailerIds = [...new Set((data || []).map((wo: WorkOrder) => wo.trailer_id))] as string[];
      if (trailerIds.length > 0) {
        const { data: trailerData } = await supabase
          .from("trailers")
          .select("id, trailer_number, type")
          .in("id", trailerIds);

        const trailerMap = new Map(trailerData?.map((t) => [t.id, { trailer_number: t.trailer_number, type: t.type }]) || []);
        setWorkOrders((data || []).map((wo: WorkOrder) => ({ ...wo, trailer: trailerMap.get(wo.trailer_id) })));
      } else {
        setWorkOrders(data || []);
      }
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast.error("Failed to load work orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (wo: WorkOrder & { trailer?: TrailerInfo }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lineItems, error } = await (supabase as any)
        .from("work_order_line_items")
        .select("id, description, quantity, unit_cost")
        .eq("work_order_id", wo.id);

      if (error) throw error;

      const mappedItems = (lineItems || []).map((li: LineItem) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity,
        unit_cost: li.unit_cost,
      }));

      if (EDITABLE_STATUSES.includes(wo.status)) {
        setEditingWorkOrder({
          id: wo.id,
          trailer_id: wo.trailer_id,
          repair_type: wo.repair_type,
          description: wo.description,
          work_start_date: wo.work_start_date,
          work_completion_date: wo.work_completion_date,
          labor_hours: wo.labor_hours,
          labor_rate: wo.labor_rate,
          travel_fee: wo.travel_fee,
          labor_total: wo.labor_total,
          parts_total: wo.parts_total,
          grand_total: wo.grand_total,
          status: wo.status,
        });
        setEditingLineItems(mappedItems);
      } else {
        // Read-only view for approved/rejected
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: photos } = await (supabase as any)
          .from("work_order_photos")
          .select("id, photo_url, category")
          .eq("work_order_id", wo.id);

        setViewingWorkOrder(wo);
        setViewingLineItems(mappedItems);
        setViewingPhotos(photos || []);
      }
    } catch (error) {
      console.error("Error fetching work order details:", error);
      toast.error("Failed to open work order");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.in_progress;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Show edit form
  if (editingWorkOrder) {
    return (
      <div className="min-h-screen bg-background p-6">
        <SEO title="Edit Work Order | CRUMS Leasing" description="Edit work order" />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => { setEditingWorkOrder(null); setEditingLineItems([]); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Work Order</h1>
            {getStatusBadge(editingWorkOrder.status)}
          </div>
          <WorkOrderForm
            existingWorkOrder={editingWorkOrder}
            existingLineItems={editingLineItems}
            onSuccess={() => {
              setEditingWorkOrder(null);
              setEditingLineItems([]);
              fetchWorkOrders();
            }}
            onCancel={() => { setEditingWorkOrder(null); setEditingLineItems([]); }}
          />
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background p-6">
        <SEO title="New Work Order | CRUMS Leasing" description="Create a new work order" />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">New Work Order</h1>
          </div>
          <WorkOrderForm
            onSuccess={() => {
              setShowForm(false);
              fetchWorkOrders();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO title="Work Orders | CRUMS Leasing" description="Manage your work orders" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/mechanic")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Work Orders</h1>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Work Order
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : workOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Work Orders Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first work order to get started</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Work Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workOrders.map((wo) => (
              <Card
                key={wo.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCardClick(wo)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {wo.trailer?.trailer_number || "Unknown Trailer"}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{wo.repair_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{wo.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(wo.work_start_date), "MMM d, yyyy")}
                        {wo.work_completion_date && ` — ${format(new Date(wo.work_completion_date), "MMM d, yyyy")}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(wo.status)}
                      <span className="text-lg font-bold">${wo.grand_total.toFixed(2)}</span>
                    </div>
                  </div>
                  {wo.approval_notes && wo.status === "needs_info" && (
                    <>
                      <Separator className="my-3" />
                      <div className="bg-muted/50 p-3 rounded text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">Admin Note:</p>
                        <p>{wo.approval_notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
