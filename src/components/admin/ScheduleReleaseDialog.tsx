import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
}

interface Mechanic {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Trailer {
  id: string;
  trailer_number: string;
  type: string;
  vin: string | null;
}

interface ScheduleReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trailer: Trailer | null;
  onScheduled: () => void;
}

export function ScheduleReleaseDialog({
  open,
  onOpenChange,
  trailer,
  onScheduled,
}: ScheduleReleaseDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setSelectedCustomerId("");
    setCustomerName("");
    setCustomerCompany("");
    setCustomerPhone("");
    setScheduledDate(undefined);
    setSelectedMechanicId("");
    setNotes("");
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch customers
      const { data: customersData } = await supabase
        .from("customers")
        .select("id, full_name, company_name, phone")
        .eq("status", "active")
        .order("full_name");

      setCustomers(customersData || []);

      // Fetch mechanics (users with mechanic role)
      const { data: mechanicsData } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          user_roles!inner(role)
        `)
        .eq("user_roles.role", "mechanic");

      setMechanics(
        mechanicsData?.map((m) => ({
          id: m.id,
          email: m.email,
          first_name: m.first_name,
          last_name: m.last_name,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setCustomerName(customer.full_name);
      setCustomerCompany(customer.company_name || "");
      setCustomerPhone(customer.phone || "");
    }
  };

  const handleSubmit = async () => {
    if (!trailer || !scheduledDate) {
      toast.error("Please select a pickup date");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please provide customer name");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("trailer_release_requests").insert({
        trailer_id: trailer.id,
        customer_id: selectedCustomerId || null,
        requested_by: user?.id,
        assigned_mechanic_id: selectedMechanicId || null,
        scheduled_pickup_date: scheduledDate.toISOString(),
        customer_name: customerName,
        customer_company: customerCompany || null,
        customer_phone: customerPhone || null,
        notes: notes || null,
        status: "pending",
      });

      if (error) throw error;

      // Update trailer status to indicate pending release
      await supabase
        .from("trailers")
        .update({ status: "pending_release" })
        .eq("id", trailer.id);

      toast.success(`Release scheduled for ${trailer.trailer_number}`);
      onOpenChange(false);
      onScheduled();
    } catch (error) {
      console.error("Error scheduling release:", error);
      toast.error("Failed to schedule release");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Trailer Release</DialogTitle>
          <DialogDescription>
            {trailer
              ? `Schedule customer pickup for trailer ${trailer.trailer_number} (${trailer.type})`
              : "Select a trailer to schedule for release"}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>Select Existing Customer (Optional)</Label>
              <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Manual Entry</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                      {customer.company_name && ` (${customer.company_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            {/* Customer Company */}
            <div className="space-y-2">
              <Label htmlFor="customerCompany">Company Name</Label>
              <Input
                id="customerCompany"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Scheduled Pickup Date */}
            <div className="space-y-2">
              <Label>Scheduled Pickup Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Select pickup date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Assign Mechanic */}
            <div className="space-y-2">
              <Label>Assign Mechanic (Optional)</Label>
              <Select value={selectedMechanicId} onValueChange={setSelectedMechanicId}>
                <SelectTrigger>
                  <SelectValue placeholder="Any available mechanic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Available</SelectItem>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.id} value={mechanic.id}>
                      {mechanic.first_name && mechanic.last_name
                        ? `${mechanic.first_name} ${mechanic.last_name}`
                        : mechanic.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for Mechanic</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes..."
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loadingData}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Release"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
