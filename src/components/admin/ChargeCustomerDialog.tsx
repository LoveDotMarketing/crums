import { useState } from "react";
import { DollarSign, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/eventLogger";

const PRESETS = [
  { label: "Custom", value: "custom", amount: 0 },
  { label: "Missed Payment", value: "Missed Payment", amount: 0 },
  { label: "Late Fee - $150", value: "Late Fee", amount: 150 },
  { label: "ACH Decline Fee - $100", value: "ACH Decline Fee", amount: 100 },
  { label: "Deposit", value: "Deposit", amount: 0 },
  { label: "Adjustment", value: "Adjustment", amount: 0 },
];

interface ChargeCustomerDialogProps {
  customerId: string;
  customerName: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ChargeCustomerDialog({ customerId, customerName, trigger, onSuccess }: ChargeCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [preset, setPreset] = useState("custom");
  const [isCharging, setIsCharging] = useState(false);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const found = PRESETS.find((p) => p.value === value);
    if (found && found.value !== "custom") {
      setDescription(found.value);
      if (found.amount > 0) setAmount(found.amount.toString());
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Enter a description");
      return;
    }

    setIsCharging(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("charge-customer", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { customer_id: customerId, amount: numAmount, description: description.trim() },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast.success(`Charged $${numAmount.toFixed(2)} to ${customerName}`, {
        description: `Invoice: ${data.stripe_invoice_id} — Status: ${data.status}`,
      });

      logAdminAction("customer_charged", `Charged $${numAmount.toFixed(2)} to ${customerName}`, {
        customer_id: customerId,
        amount: numAmount,
        description: description.trim(),
        stripe_invoice_id: data.stripe_invoice_id,
        payment_method: data.payment_method,
      });

      setOpen(false);
      setAmount("");
      setDescription("");
      setPreset("custom");
      onSuccess?.();
    } catch (err: any) {
      toast.error("Charge failed", { description: err.message });
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Charge
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Charge Customer</DialogTitle>
          <DialogDescription>
            Apply a one-time charge to <strong>{customerName}</strong> via their ACH payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason Preset</Label>
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="charge-amount">Amount ($)</Label>
            <Input
              id="charge-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="charge-desc">Description</Label>
            <Input
              id="charge-desc"
              placeholder="e.g. Missed January payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCharging}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCharging}>
            {isCharging ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Charging...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Charge ${parseFloat(amount || "0").toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
