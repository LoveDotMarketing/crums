import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BillingPreference = 
  | { cycle: "monthly"; anchorDay: 1 | 15 }
  | { cycle: "weekly"; anchorDay: 5 };

interface EditBillingDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  currentAnchorDay: number | null;
  currentPreferredCycle?: string | null;
  applicationId: string;
}

export function EditBillingDateDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  currentAnchorDay,
  currentPreferredCycle,
  applicationId,
}: EditBillingDateDialogProps) {
  const queryClient = useQueryClient();

  const getInitialPreference = (): BillingPreference => {
    if (currentPreferredCycle === "weekly" || currentAnchorDay === 5) {
      return { cycle: "weekly", anchorDay: 5 };
    }
    if (currentAnchorDay === 15) return { cycle: "monthly", anchorDay: 15 };
    return { cycle: "monthly", anchorDay: 1 };
  };

  const [preference, setPreference] = useState<BillingPreference>(getInitialPreference);

  const radioValue =
    preference.cycle === "weekly" ? "weekly" : preference.anchorDay.toString();

  const handleRadioChange = (val: string) => {
    if (val === "weekly") setPreference({ cycle: "weekly", anchorDay: 5 });
    else if (val === "1") setPreference({ cycle: "monthly", anchorDay: 1 });
    else setPreference({ cycle: "monthly", anchorDay: 15 });
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("customer_applications")
        .update({
          billing_anchor_day: preference.anchorDay,
          preferred_billing_cycle: preference.cycle,
        })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ready-to-activate"] });
      queryClient.invalidateQueries({ queryKey: ["customer-application"] });
      toast.success(`Billing date updated for ${customerName}`);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update billing date: " + error.message);
    },
  });

  const currentLabel =
    currentPreferredCycle === "weekly" || currentAnchorDay === 5
      ? "Every Friday (Weekly)"
      : currentAnchorDay === 15
      ? "15th of the month"
      : currentAnchorDay === 1
      ? "1st of the month"
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Billing Date
          </DialogTitle>
          <DialogDescription>
            Change the preferred payment due date for {customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="font-medium">Payment Due Date</Label>
            <RadioGroup
              value={radioValue}
              onValueChange={handleRadioChange}
              className="grid grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem value="1" id="edit-anchor-1" className="peer sr-only" />
                <Label
                  htmlFor="edit-anchor-1"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-2xl font-bold">1st</span>
                  <span className="text-sm text-muted-foreground text-center">of the month</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="15" id="edit-anchor-15" className="peer sr-only" />
                <Label
                  htmlFor="edit-anchor-15"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-2xl font-bold">15th</span>
                  <span className="text-sm text-muted-foreground text-center">of the month</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="weekly" id="edit-anchor-weekly" className="peer sr-only" />
                <Label
                  htmlFor="edit-anchor-weekly"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-lg font-bold">Every</span>
                  <span className="text-lg font-bold">Friday</span>
                  <span className="text-sm text-muted-foreground text-center">weekly</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {currentLabel && (
            <p className="text-sm text-muted-foreground">
              Current setting: <span className="font-medium">{currentLabel}</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
