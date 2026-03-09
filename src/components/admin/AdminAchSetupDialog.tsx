import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2, Building2 } from "lucide-react";

interface AdminAchSetupDialogProps {
  targetUserId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName: string;
}

export function AdminAchSetupDialog({ targetUserId, customerId, customerEmail, customerName }: AdminAchSetupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "connecting" | "confirming">("idle");
  const [paymentMethodType, setPaymentMethodType] = useState<"ach" | "card">("ach");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSetup = async () => {
    setLoading(true);
    setStep("connecting");

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error("Not authenticated");

      const { data: setupData, error: setupError } = await supabase.functions.invoke("create-ach-setup", {
        body: { targetUserId, customerId, customerEmail, paymentMethodType },
      });

      if (setupError) throw new Error(setupError.message || "Failed to create setup");
      if (setupData?.error) throw new Error(setupData.error);

      const { clientSecret, setupIntentId, publishableKey } = setupData;
      if (!clientSecret || !publishableKey) throw new Error("Missing setup data from server");

      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error("Failed to load Stripe");

      if (paymentMethodType === "card") {
        await handleCardSetup(stripe, clientSecret, setupIntentId);
      } else {
        await handleAchSetup(stripe, clientSecret, setupIntentId);
      }
    } catch (err: any) {
      console.error("[AdminPaymentSetup] Error:", err);
      toast({ title: "Setup Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setStep("idle");
    }
  };

  const handleCardSetup = async (stripe: any, clientSecret: string, _setupIntentId: string) => {
    const elements = stripe.elements({ clientSecret });
    const cardElement = elements.create("card", {
      style: { base: { fontSize: "16px", color: "#32325d", "::placeholder": { color: "#aab7c4" } } },
    });

    const container = document.createElement("div");
    container.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:white;padding:32px;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);min-width:400px;max-width:500px;";

    const title = document.createElement("h3");
    title.textContent = `Enter Card for ${customerName}`;
    title.style.cssText = "margin:0 0 4px;font-size:18px;font-weight:600;";
    container.appendChild(title);

    const feeNote = document.createElement("p");
    feeNote.textContent = "2.9% + $0.30 processing fee applies to card payments.";
    feeNote.style.cssText = "margin:0 0 16px;font-size:13px;color:#6b7280;";
    container.appendChild(feeNote);

    const cardDiv = document.createElement("div");
    cardDiv.style.cssText = "padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:16px;";
    container.appendChild(cardDiv);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:8px;justify-content:flex-end;";
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:6px;background:white;cursor:pointer;font-size:14px;";
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Link Card";
    confirmBtn.style.cssText = "padding:8px 16px;border:none;border-radius:6px;background:#2563eb;color:white;cursor:pointer;font-size:14px;font-weight:500;";
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    container.appendChild(btnRow);

    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;";

    document.body.appendChild(overlay);
    document.body.appendChild(container);
    cardElement.mount(cardDiv);

    return new Promise<void>((resolve, reject) => {
      const cleanup = () => { cardElement.destroy(); container.remove(); overlay.remove(); };

      cancelBtn.onclick = () => { cleanup(); resolve(); };
      overlay.onclick = () => { cleanup(); resolve(); };

      confirmBtn.onclick = async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Processing...";
        try {
          const { setupIntent: confirmedSI, error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
            payment_method: { card: cardElement },
          });
          cleanup();
          if (confirmError) throw new Error(confirmError.message);
          if (confirmedSI?.status === "succeeded") {
            setStep("confirming");
            await supabase.functions.invoke("confirm-ach-setup", {
              body: { setupIntentId: confirmedSI.id, targetUserId, customerId, paymentMethodType: "card" },
            });
            toast({ title: "Card Linked", description: `Credit card linked for ${customerName}` });
            queryClient.invalidateQueries({ queryKey: ["admin-customer-application"] });
            setOpen(false);
          }
          resolve();
        } catch (err: any) {
          cleanup();
          reject(err);
        }
      };
    });
  };

  const handleAchSetup = async (stripe: any, clientSecret: string, setupIntentId: string) => {
    const { setupIntent, error: collectError } = await stripe.collectBankAccountForSetup({
      clientSecret,
      params: {
        payment_method_type: "us_bank_account",
        payment_method_data: { billing_details: { name: customerName } },
      },
    });

    if (collectError) throw new Error(collectError.message);
    if (!setupIntent) throw new Error("No setup intent returned");
    if (setupIntent.status === "requires_payment_method") return;

    setStep("confirming");
    if (setupIntent.status === "requires_confirmation") {
      const { setupIntent: confirmed, error: confirmError } = await stripe.confirmUsBankAccountSetup(clientSecret);
      if (confirmError) throw new Error(confirmError.message);
      if (!confirmed || confirmed.status !== "succeeded") throw new Error("Bank account verification did not succeed");
    }

    const { data: confirmData, error: confirmFnError } = await supabase.functions.invoke("confirm-ach-setup", {
      body: { setupIntentId, targetUserId, customerId, paymentMethodType: "ach" },
    });

    if (confirmFnError) throw new Error(confirmFnError.message || "Failed to confirm setup");
    if (confirmData?.error) throw new Error(confirmData.error);

    toast({ title: "ACH Linked", description: `Bank account linked for ${customerName}` });
    queryClient.invalidateQueries({ queryKey: ["admin-customer-application"] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CreditCard className="h-3 w-3 mr-1" />
          Set Up Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up Payment for {customerName}</DialogTitle>
          <DialogDescription>
            Choose a payment method to link for this customer's billing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <RadioGroup
            value={paymentMethodType}
            onValueChange={(val) => setPaymentMethodType(val as "ach" | "card")}
            className="grid gap-2"
          >
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <RadioGroupItem value="ach" id="admin-pm-ach" />
              <Label htmlFor="admin-pm-ach" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building2 className="h-4 w-4" />
                <div>
                  <p className="font-medium text-sm">ACH Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">No processing fees</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <RadioGroupItem value="card" id="admin-pm-card" />
              <Label htmlFor="admin-pm-card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-4 w-4" />
                <div>
                  <p className="font-medium text-sm">Credit Card</p>
                  <p className="text-xs text-muted-foreground">2.9% + $0.30 fee per transaction</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {step === "connecting" && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening {paymentMethodType === "card" ? "card entry" : "bank connection"}…
            </p>
          )}
          {step === "confirming" && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming payment method…
            </p>
          )}
          <Button onClick={handleSetup} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                {paymentMethodType === "card" ? <CreditCard className="h-4 w-4 mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
                Link {paymentMethodType === "card" ? "Credit Card" : "Bank Account"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
