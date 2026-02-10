import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ScheduleDropoffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trailer: {
    id: string;
    trailer_number: string;
    customer_id: string | null;
  } | null;
  onScheduled: () => void;
}

export function ScheduleDropoffDialog({ open, onOpenChange, trailer, onScheduled }: ScheduleDropoffDialogProps) {
  const { user } = useAuth();
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{
    full_name: string;
    company_name: string | null;
    phone: string | null;
  } | null>(null);

  useEffect(() => {
    if (open && trailer?.customer_id) {
      fetchCustomerInfo(trailer.customer_id);
    }
    if (!open) {
      setScheduledDate("");
      setNotes("");
      setCustomerInfo(null);
    }
  }, [open, trailer?.customer_id]);

  const fetchCustomerInfo = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("full_name, company_name, phone")
        .eq("id", customerId)
        .single();

      if (error) throw error;
      setCustomerInfo(data);
    } catch (error) {
      console.error("Error fetching customer info:", error);
    }
  };

  const handleSubmit = async () => {
    if (!trailer || !scheduledDate || !user) return;

    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("trailer_dropoff_requests")
        .insert({
          trailer_id: trailer.id,
          customer_id: trailer.customer_id,
          scheduled_by: user.id,
          customer_name: customerInfo?.full_name || null,
          customer_company: customerInfo?.company_name || null,
          customer_phone: customerInfo?.phone || null,
          scheduled_dropoff_date: new Date(scheduledDate).toISOString(),
          notes: notes || null,
        });

      if (error) throw error;

      toast.success(`Drop-off scheduled for trailer ${trailer.trailer_number}`);
      onOpenChange(false);
      onScheduled();
    } catch (error) {
      console.error("Error scheduling dropoff:", error);
      toast.error("Failed to schedule drop-off");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Trailer Drop-off</DialogTitle>
          <DialogDescription>
            Schedule a return date for trailer {trailer?.trailer_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {customerInfo && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium">{customerInfo.full_name}</p>
              {customerInfo.company_name && (
                <p className="text-xs text-muted-foreground">{customerInfo.company_name}</p>
              )}
              {customerInfo.phone && (
                <p className="text-xs text-muted-foreground">{customerInfo.phone}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dropoff-date">Scheduled Drop-off Date & Time *</Label>
            <Input
              id="dropoff-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff-notes">Notes</Label>
            <Textarea
              id="dropoff-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the return..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!scheduledDate || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Schedule Drop-off
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
