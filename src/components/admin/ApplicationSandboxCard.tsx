import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ApplicationSandboxCardProps {
  applicationId: string;
  sandbox: boolean;
  sandboxStripeCustomerId: string | null;
  paymentSetupStatus: string | null;
}

export function ApplicationSandboxCard({
  applicationId,
  sandbox,
  sandboxStripeCustomerId,
  paymentSetupStatus,
}: ApplicationSandboxCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [busy, setBusy] = useState(false);
  const [showEnable, setShowEnable] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showForce, setShowForce] = useState(false);
  const [enableReason, setEnableReason] = useState("");
  const [disableReason, setDisableReason] = useState("");
  const [pendingDisableReason, setPendingDisableReason] = useState("");
  const [copied, setCopied] = useState(false);

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-customer-application"] });
    queryClient.invalidateQueries({ queryKey: ["sandbox-audit-recent"] });
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  const callToggle = async (
    enable: boolean,
    reason: string,
    force = false,
  ): Promise<{ ok: boolean; needsForce?: boolean; message?: string }> => {
    const { data, error } = await supabase.functions.invoke(
      "toggle-application-sandbox",
      { body: { applicationId, enable, reason: reason || undefined, force } },
    );
    if (error) {
      // Try to extract structured error from non-2xx response
      const ctx = (error as any)?.context;
      try {
        const body = ctx?.body ? JSON.parse(ctx.body) : null;
        if (body?.requiresForce) {
          return { ok: false, needsForce: true, message: body.error };
        }
        return { ok: false, message: body?.error || error.message };
      } catch {
        return { ok: false, message: error.message };
      }
    }
    if (data?.requiresForce) {
      return { ok: false, needsForce: true, message: data.error };
    }
    return { ok: true };
  };

  const handleEnable = async () => {
    const reason = enableReason.trim();
    setShowEnable(false);
    setBusy(true);
    try {
      const res = await callToggle(true, reason);
      if (!res.ok) throw new Error(res.message || "Failed to enable sandbox");
      toast({
        title: "Sandbox enabled",
        description:
          "Payment setup will now run against Stripe test mode. No real bank or card will be charged.",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Failed to enable sandbox",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setEnableReason("");
    }
  };

  const handleDisable = async () => {
    const reason = disableReason.trim();
    setShowDisable(false);
    setBusy(true);
    try {
      const res = await callToggle(false, reason);
      if (res.needsForce) {
        // Stash reason and prompt for force
        setPendingDisableReason(reason);
        setShowForce(true);
        return;
      }
      if (!res.ok) throw new Error(res.message || "Failed to switch to live");
      toast({ title: "Switched to live mode" });
      refetch();
    } catch (err: any) {
      toast({
        title: "Failed to switch to live",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setDisableReason("");
    }
  };

  const handleForceDisable = async () => {
    setShowForce(false);
    setBusy(true);
    try {
      const res = await callToggle(false, pendingDisableReason, true);
      if (!res.ok) throw new Error(res.message || "Failed to force-switch to live");
      toast({
        title: "Switched to live — payment cleared",
        description:
          "The customer's stored payment method has been cleared. They'll be re-prompted to set up payment in live mode.",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Failed to switch to live",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setPendingDisableReason("");
    }
  };

  const handleCopy = async () => {
    if (!sandboxStripeCustomerId) return;
    await navigator.clipboard.writeText(sandboxStripeCustomerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Sandbox Application
            {sandbox ? (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
                Sandbox
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm">Use Stripe test mode for payment setup</Label>
              <p className="text-xs text-muted-foreground">
                When on, this application's ACH/card linking runs against Stripe test mode.
                The downstream subscription auto-inherits sandbox.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {busy && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={sandbox}
                disabled={busy}
                onCheckedChange={(next) => {
                  if (next) setShowEnable(true);
                  else setShowDisable(true);
                }}
              />
            </div>
          </div>

          {sandbox && sandboxStripeCustomerId && (
            <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Test Stripe customer
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-background border border-border rounded px-2 py-1.5 truncate">
                    {sandboxStripeCustomerId}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
              <a
                href={`https://dashboard.stripe.com/test/customers/${sandboxStripeCustomerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in Stripe test dashboard
              </a>
              <p className="text-xs text-muted-foreground">
                ℹ Test ACH:{" "}
                <code className="font-mono">routing 110000000</code> /{" "}
                <code className="font-mono">account 000123456789</code> · Test
                card <code className="font-mono">4242 4242 4242 4242</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enable confirmation */}
      <AlertDialog
        open={showEnable}
        onOpenChange={(open) => {
          setShowEnable(open);
          if (!open) setEnableReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Enable sandbox mode for this application?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  • Payment setup runs against Stripe test mode — no real bank
                  or card will be linked or charged.
                </p>
                <p>
                  • A test-mode Stripe customer will be created the first time
                  the customer hits payment setup.
                </p>
                <p>
                  • The resulting subscription will automatically inherit
                  sandbox mode on activation.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="enable-app-sandbox-reason" className="text-sm">
              Reason{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="enable-app-sandbox-reason"
              rows={2}
              maxLength={500}
              placeholder="e.g. Internal QA account"
              value={enableReason}
              onChange={(e) => setEnableReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnable}>
              Enable sandbox
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable confirmation */}
      <AlertDialog
        open={showDisable}
        onOpenChange={(open) => {
          setShowDisable(open);
          if (!open) setDisableReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch application back to live mode?</AlertDialogTitle>
            <AlertDialogDescription>
              {paymentSetupStatus === "completed"
                ? "Payment setup is already completed in sandbox mode — you may be asked to confirm clearing the stored test payment method."
                : "Future payment setup attempts will route through your live Stripe account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="disable-app-sandbox-reason" className="text-sm">
              Reason{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="disable-app-sandbox-reason"
              rows={2}
              maxLength={500}
              placeholder="e.g. Done testing — switching to production"
              value={disableReason}
              onChange={(e) => setDisableReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable}>
              Switch to live
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force-clear confirmation */}
      <AlertDialog
        open={showForce}
        onOpenChange={(open) => {
          setShowForce(open);
          if (!open) setPendingDisableReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Clear test payment method and switch to live?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  This application has a completed payment setup in sandbox mode.
                  Switching to live will <strong>clear the stored test
                  payment method</strong> so it doesn't orphan in your live Stripe
                  account.
                </p>
                <p>
                  The customer will be re-prompted to set up a real bank account
                  or card in live mode the next time they visit payment setup.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDisable}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear & switch to live
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
