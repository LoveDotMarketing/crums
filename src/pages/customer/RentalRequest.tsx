import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trackFormSubmission, trackConversion, trackFormStart, fireMetaCapi } from "@/lib/analytics";

export default function RentalRequest() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch user profile data
    const fetchUserData = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("email, first_name, last_name")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setUserEmail(data.email);
          setUserName(
            [data.first_name, data.last_name]
              .filter(Boolean)
              .join(" ") || "Customer"
          );
        }
      }
    };

    fetchUserData();
  }, [user?.id]);

  const [formData, setFormData] = useState({
    phone_number: "",
    trailer_type: "",
    start_date: "",
    secondary_contact_name: "",
    secondary_contact_phone: "",
    secondary_contact_relationship: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone_number || !formData.trailer_type) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("customer_applications")
        .upsert({
          user_id: user?.id,
          phone_number: formData.phone_number,
          date_needed: formData.start_date || null,
          secondary_contact_name: formData.secondary_contact_name || null,
          secondary_contact_phone: formData.secondary_contact_phone || null,
          secondary_contact_relationship: formData.secondary_contact_relationship || null,
          trailer_type: formData.trailer_type || null,
          status: "new",
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Send email notification to Henry and team
      await supabase.functions.invoke('send-rental-request-email', {
        body: {
          ...formData,
          user_email: userEmail,
          user_name: userName,
        },
      }).catch(err => console.warn('Email notification failed:', err));

      trackFormSubmission('rental_request', true);
      trackConversion('rental_request');
      toast.success("Rental request submitted successfully!");
      
      // Reset form
      setFormData({
        phone_number: "",
        trailer_type: "",
        start_date: "",
        secondary_contact_name: "",
        secondary_contact_phone: "",
        secondary_contact_relationship: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit rental request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">Request a Rental</h1>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Application Process</AlertTitle>
            <AlertDescription>
              Submit your rental request and our team will review it within 24-48 hours. 
              You'll need to provide additional documents for final approval.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>New Rental Application</CardTitle>
              <CardDescription>
                Fill out the form below to request a trailer rental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    onFocus={() => {
                      if (!formStarted) {
                        setFormStarted(true);
                        trackFormStart('rental_request', 'phone_number');
                      }
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailer_type">Trailer Type Needed *</Label>
                  <Input
                    id="trailer_type"
                    required
                    value={formData.trailer_type}
                    onChange={(e) => setFormData({ ...formData, trailer_type: e.target.value })}
                    placeholder="e.g., Dry Van, Flatbed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Desired Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Secondary Contact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondary_contact_name">Name</Label>
                      <Input
                        id="secondary_contact_name"
                        value={formData.secondary_contact_name}
                        onChange={(e) => setFormData({ ...formData, secondary_contact_name: e.target.value })}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary_contact_phone">Phone</Label>
                      <Input
                        id="secondary_contact_phone"
                        type="tel"
                        value={formData.secondary_contact_phone}
                        onChange={(e) => setFormData({ ...formData, secondary_contact_phone: e.target.value })}
                        placeholder="(555) 987-6543"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="secondary_contact_relationship">Relationship</Label>
                    <Input
                      id="secondary_contact_relationship"
                      value={formData.secondary_contact_relationship}
                      onChange={(e) => setFormData({ ...formData, secondary_contact_relationship: e.target.value })}
                      placeholder="e.g., Spouse, Parent, Business Partner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requirements or questions..."
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Rental Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
