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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditSubscriptionDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: {
    id: string;
    customerName: string;
    startDate: string;
    endDate: string | null;
  } | null;
}

export function EditSubscriptionDatesDialog({
  open,
  onOpenChange,
  subscription,
}: EditSubscriptionDatesDialogProps) {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date | undefined>(
    subscription?.startDate ? new Date(subscription.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    subscription?.endDate ? new Date(subscription.endDate) : undefined
  );

  // Reset state when subscription changes
  useState(() => {
    if (subscription) {
      setStartDate(new Date(subscription.startDate));
      setEndDate(subscription.endDate ? new Date(subscription.endDate) : undefined);
    }
  });

  const updateDatesMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) throw new Error("No subscription selected");

      const { error } = await supabase
        .from("customer_subscriptions")
        .update({
          contract_start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
          end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
        })
        .eq("id", subscription.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      toast.success("Contract dates updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update dates: " + error.message);
    },
  });

  const handleSave = () => {
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    updateDatesMutation.mutate();
  };

  // Update local state when dialog opens with new subscription
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && subscription) {
      setStartDate(new Date(subscription.startDate));
      setEndDate(subscription.endDate ? new Date(subscription.endDate) : undefined);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contract Dates</DialogTitle>
          <DialogDescription>
            Update the lease start and end dates for {subscription?.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label>Contract Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>Contract End Date (Optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "No end date (ongoing)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {endDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEndDate(undefined)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty for ongoing leases with no fixed end date
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateDatesMutation.isPending}
          >
            {updateDatesMutation.isPending ? (
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
