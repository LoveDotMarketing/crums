import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  Plus, 
  Minus, 
  ArrowRightLeft, 
  RefreshCw,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionItem {
  id: string;
  trailer_id: string;
  monthly_rate: number;
  status: string;
  trailers?: {
    trailer_number: string;
    type: string;
    vin?: string | null;
    year?: number;
  };
}

interface ManageTrailersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  currentItems: SubscriptionItem[];
}

export function ManageTrailersDialog({
  open,
  onOpenChange,
  subscriptionId,
  customerId,
  customerName,
  currentItems,
}: ManageTrailersDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMode, setActionMode] = useState<"view" | "add" | "remove" | "swap">("view");
  const [selectedAddTrailers, setSelectedAddTrailers] = useState<string[]>([]);
  const [selectedRemoveTrailers, setSelectedRemoveTrailers] = useState<string[]>([]);
  const [swapFromTrailerId, setSwapFromTrailerId] = useState<string>("");
  const [swapToTrailerId, setSwapToTrailerId] = useState<string>("");
  const [customRates, setCustomRates] = useState<Record<string, number>>({});

  // Fetch available trailers
  const { data: availableTrailers, isLoading: loadingTrailers } = useQuery({
    queryKey: ["available-trailers-for-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trailers")
        .select("id, trailer_number, type, vin, rental_rate, year, make, model")
        .eq("is_rented", false)
        .in("status", ["available"])
        .order("trailer_number");

      if (error) throw error;
      return data;
    },
    enabled: open && (actionMode === "add" || actionMode === "swap"),
  });

  const activeItems = currentItems.filter(item => item.status === "active");

  const handleAddTrailers = async () => {
    if (selectedAddTrailers.length === 0) {
      toast.error("Please select at least one trailer to add");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("modify-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          subscriptionId,
          action: "add_trailers",
          addTrailerIds: selectedAddTrailers,
          customRates: Object.keys(customRates).length > 0 ? customRates : undefined,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      toast.success(`Added ${data.addedTrailers?.length || 0} trailer(s) to subscription`);
      await queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      await queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-customer-assigned-trailers"] });
      resetState();
      onOpenChange(false);
    } catch (error) {
      console.error("Add trailers error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add trailers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTrailers = async () => {
    if (selectedRemoveTrailers.length === 0) {
      toast.error("Please select at least one trailer to remove");
      return;
    }

    if (selectedRemoveTrailers.length >= activeItems.length) {
      toast.error("Cannot remove all trailers. Cancel the subscription instead.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("modify-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          subscriptionId,
          action: "remove_trailers",
          removeTrailerIds: selectedRemoveTrailers,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      toast.success(`Removed ${data.removedTrailerIds?.length || 0} trailer(s) from subscription`);
      await queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      await queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
      resetState();
      onOpenChange(false);
    } catch (error) {
      console.error("Remove trailers error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove trailers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwapTrailer = async () => {
    if (!swapFromTrailerId || !swapToTrailerId) {
      toast.error("Please select both trailers for swap");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("modify-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          subscriptionId,
          action: "swap_trailer",
          swapFromTrailerId,
          swapToTrailerId,
          customRates: Object.keys(customRates).length > 0 ? customRates : undefined,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      toast.success("Trailer swapped successfully");
      await queryClient.invalidateQueries({ queryKey: ["customer-subscriptions"] });
      await queryClient.invalidateQueries({ queryKey: ["subscription-items"] });
      resetState();
      onOpenChange(false);
    } catch (error) {
      console.error("Swap trailer error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to swap trailer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setActionMode("view");
    setSelectedAddTrailers([]);
    setSelectedRemoveTrailers([]);
    setSwapFromTrailerId("");
    setSwapToTrailerId("");
    setCustomRates({});
  };

  const toggleAddTrailer = (trailerId: string) => {
    setSelectedAddTrailers(prev =>
      prev.includes(trailerId)
        ? prev.filter(id => id !== trailerId)
        : [...prev, trailerId]
    );
  };

  const toggleRemoveTrailer = (trailerId: string) => {
    setSelectedRemoveTrailers(prev =>
      prev.includes(trailerId)
        ? prev.filter(id => id !== trailerId)
        : [...prev, trailerId]
    );
  };

  const updateCustomRate = (trailerId: string, rate: string) => {
    const numRate = parseFloat(rate);
    if (!isNaN(numRate) && numRate > 0) {
      setCustomRates(prev => ({ ...prev, [trailerId]: numRate }));
    } else {
      setCustomRates(prev => {
        const next = { ...prev };
        delete next[trailerId];
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetState(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Manage Trailers
          </DialogTitle>
          <DialogDescription>
            Manage trailers for {customerName}'s subscription
          </DialogDescription>
        </DialogHeader>

        {/* Current Trailers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Current Trailers ({activeItems.length})</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={actionMode === "add" ? "default" : "outline"}
                onClick={() => setActionMode(actionMode === "add" ? "view" : "add")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant={actionMode === "remove" ? "default" : "outline"}
                onClick={() => setActionMode(actionMode === "remove" ? "view" : "remove")}
                disabled={activeItems.length <= 1}
              >
                <Minus className="h-4 w-4 mr-1" />
                Remove
              </Button>
              <Button
                size="sm"
                variant={actionMode === "swap" ? "default" : "outline"}
                onClick={() => setActionMode(actionMode === "swap" ? "view" : "swap")}
                disabled={activeItems.length < 1}
              >
                <ArrowRightLeft className="h-4 w-4 mr-1" />
                Swap
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {actionMode === "remove" && <TableHead className="w-[50px]">Remove</TableHead>}
                {actionMode === "swap" && <TableHead className="w-[50px]">Swap From</TableHead>}
                <TableHead>Trailer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeItems.map((item) => (
                <TableRow 
                  key={item.id}
                  className={
                    selectedRemoveTrailers.includes(item.trailer_id) 
                      ? "bg-destructive/10" 
                      : swapFromTrailerId === item.trailer_id 
                        ? "bg-amber-50 dark:bg-amber-950/30"
                        : ""
                  }
                >
                  {actionMode === "remove" && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRemoveTrailers.includes(item.trailer_id)}
                        onChange={() => toggleRemoveTrailer(item.trailer_id)}
                        disabled={activeItems.length - selectedRemoveTrailers.length <= 1 && !selectedRemoveTrailers.includes(item.trailer_id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                  )}
                  {actionMode === "swap" && (
                    <TableCell>
                      <input
                        type="radio"
                        name="swapFrom"
                        checked={swapFromTrailerId === item.trailer_id}
                        onChange={() => setSwapFromTrailerId(item.trailer_id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {item.trailers?.trailer_number || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.trailers?.type || "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.trailers?.vin || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.monthly_rate}/mo
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator />

        {/* Add Trailers Section */}
        {actionMode === "add" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Trailers to Subscription
            </h4>
            
            {loadingTrailers ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : availableTrailers && availableTrailers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Add</TableHead>
                    <TableHead>Trailer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTrailers.map((trailer) => (
                    <TableRow 
                      key={trailer.id}
                      className={selectedAddTrailers.includes(trailer.id) ? "bg-primary/10" : ""}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedAddTrailers.includes(trailer.id)}
                          onChange={() => toggleAddTrailer(trailer.id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{trailer.trailer_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{trailer.type}</Badge>
                      </TableCell>
                      <TableCell>{trailer.year || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {trailer.vin || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {selectedAddTrailers.includes(trailer.id) ? (
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder={String(trailer.rental_rate || 700)}
                              value={customRates[trailer.id] || ""}
                              onChange={(e) => updateCustomRate(trailer.id, e.target.value)}
                              className="w-24 h-8 text-right"
                            />
                          </div>
                        ) : (
                          <span>${trailer.rental_rate || 700}/mo</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No available trailers</p>
              </div>
            )}

            {selectedAddTrailers.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  {selectedAddTrailers.length} trailer(s) selected
                </span>
                <Button onClick={handleAddTrailers} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add to Subscription
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Remove Trailers Section */}
        {actionMode === "remove" && selectedRemoveTrailers.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">
                {selectedRemoveTrailers.length} trailer(s) will be removed and released to inventory
              </span>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleRemoveTrailers} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Minus className="h-4 w-4 mr-2" />
              )}
              Remove Trailers
            </Button>
          </div>
        )}

        {/* Swap Trailer Section */}
        {actionMode === "swap" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Swap Trailer
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground mb-2 block">Swap From (select above)</Label>
                <div className="p-3 border rounded-lg bg-muted/50">
                  {swapFromTrailerId ? (
                    <span className="font-medium">
                      {activeItems.find(i => i.trailer_id === swapFromTrailerId)?.trailers?.trailer_number}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select a trailer above</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">Swap To</Label>
                <Select value={swapToTrailerId} onValueChange={setSwapToTrailerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new trailer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTrailers?.map((trailer) => (
                      <SelectItem key={trailer.id} value={trailer.id}>
                        {trailer.trailer_number} - {trailer.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {swapToTrailerId && (
              <div className="flex items-center gap-2">
                <Label>Custom Rate:</Label>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={String(
                      availableTrailers?.find(t => t.id === swapToTrailerId)?.rental_rate || 700
                    )}
                    value={customRates[swapToTrailerId] || ""}
                    onChange={(e) => updateCustomRate(swapToTrailerId, e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
            )}

            {swapFromTrailerId && swapToTrailerId && (
              <div className="flex items-center justify-end">
                <Button onClick={handleSwapTrailer} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                  )}
                  Swap Trailer
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetState(); onOpenChange(false); }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
