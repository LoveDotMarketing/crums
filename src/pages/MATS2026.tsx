import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, MapPin, Truck } from "lucide-react";
import { SEO } from "@/components/SEO";

const eventLeadSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  company: z.string().max(200).optional(),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string()
    .regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number")
    .refine((val) => val.replace(/\D/g, "").length >= 10, "Phone must have at least 10 digits"),
  notes: z.string().max(500).optional(),
  email_optin: z.literal(true, { errorMap: () => ({ message: "You must agree to receive emails" }) }),
  sms_optin: z.literal(true, { errorMap: () => ({ message: "You must agree to receive SMS messages" }) }),
});

type EventLeadForm = z.infer<typeof eventLeadSchema>;

export default function MATS2026() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventLeadForm>({
    resolver: zodResolver(eventLeadSchema),
    defaultValues: { full_name: "", email: "", phone: "", notes: "", email_optin: false as any, sms_optin: false as any },
  });

  const onSubmit = async (values: EventLeadForm) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("event_leads" as any).insert({
        full_name: values.full_name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        notes: values.notes?.trim() || null,
        event_name: "MATS 2026",
      });
      if (error) throw error;
      // Fire-and-forget thank you email
      supabase.functions.invoke('send-event-thank-you', {
        body: {
          full_name: values.full_name.trim(),
          email: values.email.trim().toLowerCase(),
        },
      }).catch(console.error);
      navigate("/mats2026-thank-you");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };




  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="CRUMS Leasing | MATS 2026 - Booth 38024" description="Visit CRUMS Leasing at MATS 2026, Booth 38024. Drop your info and we'll follow up!" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Truck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Thank You for Visiting Our Booth!</CardTitle>
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">MATS 2026 — Booth 38024</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Please fill out the form below to join our mailing list and stay up to date on our trailer leasing options.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Anything you'd like us to know..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email_optin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs text-muted-foreground font-normal">
                        I agree to receive marketing emails from CRUMS Leasing. You can unsubscribe at any time.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sms_optin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs text-muted-foreground font-normal">
                        I agree to receive SMS messages from CRUMS Leasing. Msg & data rates may apply. Reply STOP to opt out.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Join Mailing List"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
