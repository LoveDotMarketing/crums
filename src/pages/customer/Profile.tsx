import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Loader2, Truck, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface TrailerInfo {
  id: string;
  vin: string;
  trailer_number: string;
  type: string;
  rental_rate: number | null;
  rental_frequency: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentSetupStatus, setPaymentSetupStatus] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch customer's trailers
  const { data: trailers = [] } = useQuery({
    queryKey: ['my-trailers', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      // First get the customer record by email
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      
      if (customerError || !customer) return [];
      
      // Then get trailers for this customer
      const { data, error } = await supabase
        .from('trailers')
        .select('id, vin, trailer_number, type, rental_rate, rental_frequency')
        .eq('customer_id', customer.id)
        .order('trailer_number');
      
      if (error) throw error;
      return (data || []) as TrailerInfo[];
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    fetchProfile();
    fetchApplicationStatus();
  }, [user]);

  const fetchApplicationStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("customer_applications")
      .select("status, payment_setup_status")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) {
      setApplicationStatus(data.status);
      setPaymentSetupStatus(data.payment_setup_status);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Track profile completion in outreach status
      if (profile.first_name && profile.last_name && profile.phone) {
        supabase.functions.invoke("update-outreach-status", {
          body: { action: "profile_completed", email: user?.email },
        }).catch(err => console.error("Failed to update outreach status:", err));
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      // Track password set in outreach status
      supabase.functions.invoke("update-outreach-status", {
        body: { action: "password_set", email: user?.email },
      }).catch(err => console.error("Failed to update outreach status:", err));

      toast.success("Password updated successfully");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

          {/* ACH Payment Setup Alert */}
          {applicationStatus === "approved" && paymentSetupStatus !== "completed" && (
            <Card className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <CreditCard className="h-5 w-5" />
                  Action Required: Complete Payment Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Complete your ACH payment setup to finalize your account and start leasing trailers.
                </p>
                <Link to="/dashboard/customer/payment-setup">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Payment Setup
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <Card>
              <CardContent className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* My Trailers Section */}
              {trailers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      My Trailers ({trailers.length})
                    </CardTitle>
                    <CardDescription>Trailers currently leased to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trailers.map((trailer) => (
                        <div
                          key={trailer.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">#{trailer.trailer_number}</span>
                              <Badge variant="outline">{trailer.type}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground font-mono">
                              VIN: {trailer.vin}
                            </span>
                          </div>
                          {trailer.rental_rate && (
                            <div className="text-right">
                              <span className="font-bold text-lg text-primary">
                                ${trailer.rental_rate.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground ml-1">
                                /{trailer.rental_frequency || 'month'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={profile.first_name}
                          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={profile.last_name}
                          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed here
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <Button type="submit" disabled={saving} className="w-full md:w-auto">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button type="submit" disabled={changingPassword} className="w-full md:w-auto">
                      {changingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
