import { useState } from "react";
import { DollarSign, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
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
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [confirmAmount, setConfirmAmount] = useState("");

  const numAmount = parseFloat(amount || "0");
  const isLargeCharge = numAmount >= 1000;
  const requiresTypeConfirm = numAmount >= 2000;

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const found = PRESETS.find((p) => p.value === value);
    if (found && found.value !== "custom") {
      setDescription(found.value);
      if (found.amount > 0) setAmount(found.amount.toString());
    }
  };

  const handleReview = () => {
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Enter a description");
      return;
    }
    setStep("confirm");
    setConfirmAmount("");
  };

  const handleSubmit = async () => {
    if (requiresTypeConfirm && confirmAmount !== numAmount.toFixed(2)) {
      toast.error(`Type "${numAmount.toFixed(2)}" to confirm this charge`);
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

      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error("Charge failed", { description: err.message });
    } finally {
      setIsCharging(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAmount("");
    setDescription("");
    setPreset("custom");
    setStep("form");
    setConfirmAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Charge
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
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
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleReview}>
                Review Charge
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isLargeCharge ? <ShieldAlert className="h-5 w-5 text-destructive" /> : <DollarSign className="h-5 w-5" />}
                Confirm Charge
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {isLargeCharge && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm text-destructive">
                    <p className="font-semibold">Large charge warning</p>
                    <p>ACH charges cannot be reversed for 5–7 business days. Please verify this amount is correct.</p>
                  </div>
                </div>
              )}

              <div className="rounded-md border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">${numAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">ACH / Default</span>
                </div>
              </div>

              {requiresTypeConfirm && (
                <div className="space-y-2">
                  <Label>Type <strong>{numAmount.toFixed(2)}</strong> to confirm</Label>
                  <Input
                    value={confirmAmount}
                    onChange={(e) => setConfirmAmount(e.target.value)}
                    placeholder={numAmount.toFixed(2)}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("form")} disabled={isCharging}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={isCharging || (requiresTypeConfirm && confirmAmount !== numAmount.toFixed(2))}
              >
                {isCharging ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Charging...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Confirm Charge ${numAmount.toFixed(2)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
