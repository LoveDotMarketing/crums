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
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from "lucide-react";

interface AdminAchSetupDialogProps {
  targetUserId: string;
  customerName: string;
}

export function AdminAchSetupDialog({ targetUserId, customerName }: AdminAchSetupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "connecting" | "confirming">("idle");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSetupACH = async () => {
    setLoading(true);
    setStep("connecting");

    try {
      // 1. Call create-ach-setup with targetUserId
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error("Not authenticated");

      const { data: setupData, error: setupError } = await supabase.functions.invoke("create-ach-setup", {
        body: { targetUserId },
      });

      if (setupError) throw new Error(setupError.message || "Failed to create ACH setup");
      if (setupData?.error) throw new Error(setupData.error);

      const { clientSecret, setupIntentId, publishableKey } = setupData;
      if (!clientSecret || !publishableKey) throw new Error("Missing setup data from server");

      // 2. Load Stripe and collect bank account
      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error("Failed to load Stripe");

      const { setupIntent, error: collectError } = await stripe.collectBankAccountForSetup({
        clientSecret,
        params: {
          payment_method_type: "us_bank_account",
          payment_method_data: {
            billing_details: { name: customerName },
          },
        },
      });

      if (collectError) throw new Error(collectError.message);
      if (!setupIntent) throw new Error("No setup intent returned");

      // User may have closed the modal
      if (setupIntent.status === "requires_payment_method") {
        setLoading(false);
        setStep("idle");
        return;
      }

      // 3. Confirm the bank account setup
      setStep("confirming");
      if (setupIntent.status === "requires_confirmation") {
        const { setupIntent: confirmed, error: confirmError } = await stripe.confirmUsBankAccountSetup(clientSecret);
        if (confirmError) throw new Error(confirmError.message);
        if (!confirmed || confirmed.status !== "succeeded") {
          throw new Error("Bank account verification did not succeed");
        }
      }

      // 4. Call confirm-ach-setup
      const { data: confirmData, error: confirmFnError } = await supabase.functions.invoke("confirm-ach-setup", {
        body: { setupIntentId, targetUserId },
      });

      if (confirmFnError) throw new Error(confirmFnError.message || "Failed to confirm ACH setup");
      if (confirmData?.error) throw new Error(confirmData.error);

      toast({ title: "ACH Linked", description: `Bank account linked for ${customerName}` });

      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ["admin-customer-application"] });

      setOpen(false);
    } catch (err: any) {
      console.error("[AdminAchSetup] Error:", err);
      toast({ title: "ACH Setup Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setStep("idle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CreditCard className="h-3 w-3 mr-1" />
          Set Up ACH
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up ACH for {customerName}</DialogTitle>
          <DialogDescription>
            This will open Stripe Financial Connections to link a bank account for this customer. The customer's bank info will be securely connected for future billing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          {step === "connecting" && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening bank connection…
            </p>
          )}
          {step === "confirming" && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming bank account…
            </p>
          )}
          <Button onClick={handleSetupACH} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Link Bank Account
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
