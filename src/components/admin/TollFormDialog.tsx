import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTollAuthorityOptions } from "@/lib/tollAuthorities";

const COMPANY_ID = "fac613bd-c65f-42a5-b241-75afe75d53c5";

const tollSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  trailer_id: z.string().optional(),
  toll_date: z.string().min(1, "Toll date is required"),
  amount: z.string().min(1, "Amount is required"),
  toll_location: z.string().max(200).optional(),
  toll_authority: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

type TollFormValues = z.infer<typeof tollSchema>;

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface Trailer {
  id: string;
  trailer_number: string;
}

interface TollFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TollFormDialog({ open, onOpenChange, onSuccess }: TollFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);

  const form = useForm<TollFormValues>({
    resolver: zodResolver(tollSchema),
    defaultValues: {
      customer_id: "",
      trailer_id: "",
      toll_date: new Date().toISOString().split('T')[0],
      amount: "",
      toll_location: "",
      toll_authority: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchProfiles();
      fetchTrailers();
    }
  }, [open]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .order("email");
    
    if (!error && data) {
      setProfiles(data);
    }
  };
  
  const getProfileName = (profile: Profile) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.email;
  };

  const fetchTrailers = async () => {
    const { data, error } = await supabase
      .from("trailers")
      .select("id, trailer_number")
      .order("trailer_number");
    
    if (!error && data) {
      setTrailers(data);
    }
  };

  const onSubmit = async (values: TollFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("tolls").insert({
        company_id: COMPANY_ID,
        customer_id: values.customer_id,
        trailer_id: values.trailer_id || null,
        toll_date: values.toll_date,
        amount: parseFloat(values.amount),
        toll_location: values.toll_location || null,
        toll_authority: values.toll_authority || null,
        notes: values.notes || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Toll added successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to add toll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Toll</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {getProfileName(profile)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trailer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trailer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trailer (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trailers.map((trailer) => (
                        <SelectItem key={trailer.id} value={trailer.id}>
                          {trailer.trailer_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="toll_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toll Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="toll_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., I-95 Delaware" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toll_authority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toll Authority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select toll authority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getTollAuthorityOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Toll"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
