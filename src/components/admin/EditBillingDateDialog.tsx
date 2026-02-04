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

interface EditBillingDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  currentAnchorDay: number | null;
  applicationId: string;
}

export function EditBillingDateDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  currentAnchorDay,
  applicationId,
}: EditBillingDateDialogProps) {
  const queryClient = useQueryClient();
  const [billingAnchorDay, setBillingAnchorDay] = useState<1 | 15>(
    currentAnchorDay === 15 ? 15 : 1
  );

  const updateMutation = useMutation({
    mutationFn: async (anchorDay: number) => {
      const { error } = await supabase
        .from("customer_applications")
        .update({ billing_anchor_day: anchorDay })
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

  const handleSave = () => {
    updateMutation.mutate(billingAnchorDay);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
              value={billingAnchorDay.toString()}
              onValueChange={(val) => setBillingAnchorDay(val === "1" ? 1 : 15)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="1"
                  id="edit-anchor-1"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="edit-anchor-1"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-2xl font-bold">1st</span>
                  <span className="text-sm text-muted-foreground">of the month</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="15"
                  id="edit-anchor-15"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="edit-anchor-15"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-2xl font-bold">15th</span>
                  <span className="text-sm text-muted-foreground">of the month</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {currentAnchorDay && (
            <p className="text-sm text-muted-foreground">
              Current setting: {currentAnchorDay === 1 ? "1st" : "15th"} of the month
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || billingAnchorDay === currentAnchorDay}
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
