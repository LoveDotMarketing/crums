import { useState, useEffect, useRef } from "react";
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
import { logTollAssigned } from "@/lib/eventLogger";
import { Camera, X, Loader2 } from "lucide-react";

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

interface Customer {
  id: string;
  full_name: string;
  email: string | null;
  company_name: string | null;
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [tollPhoto, setTollPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      fetchCustomers();
      fetchTrailers();
    } else {
      setTollPhoto(null);
      setPhotoPreview(null);
    }
  }, [open]);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, email, company_name")
      .order("full_name");
    
    if (!error && data) {
      setCustomers(data);
    }
  };
  
  const getCustomerLabel = (customer: Customer) => {
    const name = customer.full_name || customer.email || "Unknown";
    return customer.company_name ? `${name} (${customer.company_name})` : name;
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setTollPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setTollPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhoto = async (tollId: string, customerId: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${customerId}/${tollId}.${ext}`;
    const { error } = await supabase.storage
      .from("toll-receipts")
      .upload(path, file, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    return path;
  };

  const sendTollEmail = async (tollId: string) => {
    try {
      await supabase.functions.invoke("send-toll-email", {
        body: { toll_id: tollId },
      });
    } catch (err) {
      console.error("Failed to send toll email:", err);
    }
  };

  const onSubmit = async (values: TollFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: inserted, error } = await supabase.from("tolls").insert({
        company_id: COMPANY_ID,
        customer_id: values.customer_id,
        trailer_id: values.trailer_id || null,
        toll_date: values.toll_date,
        amount: parseFloat(values.amount),
        toll_location: values.toll_location || null,
        toll_authority: values.toll_authority || null,
        notes: values.notes || null,
        status: "pending",
      }).select("id").single();

      if (error) throw error;

      // Upload photo if one was selected
      if (tollPhoto && inserted) {
        const storagePath = await uploadPhoto(inserted.id, values.customer_id, tollPhoto);
        if (storagePath) {
          await supabase.from("tolls").update({ receipt_url: storagePath }).eq("id", inserted.id);
          // Auto-send email with toll photo
          await sendTollEmail(inserted.id);
          toast.success("Toll added and email sent with photo");
        } else {
          toast.success("Toll added but photo upload failed");
        }
      } else {
        toast.success("Toll added successfully");
      }

      // Log the admin action
      const customerProfile = profiles?.find(p => p.id === values.customer_id);
      logTollAssigned(
        customerProfile ? `${customerProfile.first_name || ''} ${customerProfile.last_name || ''}`.trim() || customerProfile.email : values.customer_id,
        parseFloat(values.amount),
        values.toll_authority || undefined
      );
      form.reset();
      removePhoto();
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {getCustomerLabel(customer)}
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

            {/* Toll Photo Upload */}
            <div className="space-y-2">
              <FormLabel>Toll Photo</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative w-full">
                  <img
                    src={photoPreview}
                    alt="Toll photo preview"
                    className="w-full h-32 object-cover rounded-md border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removePhoto}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Attach Toll Photo
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a photo of the toll notice. An email with the photo will be sent to the customer automatically.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : "Add Toll"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
