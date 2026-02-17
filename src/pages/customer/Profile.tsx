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
import { Loader2, Truck, FileText, Calendar, KeyRound, Warehouse, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { logProfileSaved, logProfileSaveFailed } from "@/lib/eventLogger";

interface TrailerInfo {
  id: string;
  vin: string;
  trailer_number: string;
  type: string;
  rental_rate: number | null;
  rental_frequency: string | null;
}

interface SubscriptionItemInfo {
  id: string;
  trailer_id: string;
  monthly_rate: number;
  lease_to_own: boolean | null;
  ownership_transfer_date: string | null;
  trailers: {
    id: string;
    vin: string;
    trailer_number: string;
    type: string;
  } | null;
}

type SubscriptionType = "standard_lease" | "rent_for_storage" | "lease_to_own" | "repayment_plan";

interface SubscriptionInfo {
  id: string;
  status: string;
  billing_cycle: string;
  created_at: string;
  end_date: string | null;
  next_billing_date: string | null;
  subscription_type: SubscriptionType | null;
  contract_start_date: string | null;
  docusign_completed_at: string | null;
}

export default function Profile() {
  const { user, effectiveUserId, isImpersonating, impersonatedUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentSetupStatus, setPaymentSetupStatus] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  
  const PROFILE_STORAGE_KEY = 'crums_profile_form';
  
  const [profile, setProfile] = useState(() => {
    // Restore from localStorage on initial render
    const saved = localStorage.getItem('crums_profile_form');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return { first_name: "", last_name: "", phone: "", email: "" };
  });

  // Save profile edits to localStorage
  useEffect(() => {
    if (loading) return;
    const hasData = profile.first_name || profile.last_name || profile.phone;
    if (hasData) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, loading]);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Use effectiveUserId for queries when impersonating
  const currentUserId = effectiveUserId;
  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;

  // Fetch customer record
  const { data: customerRecord } = useQuery({
    queryKey: ['customer-record', currentEmail],
    queryFn: async () => {
      if (!currentEmail) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('email', currentEmail)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentEmail,
  });

  // Fetch customer's trailers
  const { data: trailers = [] } = useQuery({
    queryKey: ['my-trailers', customerRecord?.id],
    queryFn: async () => {
      if (!customerRecord?.id) return [];
      
      const { data, error } = await supabase
        .from('trailers')
        .select('id, vin, trailer_number, type, rental_rate, rental_frequency')
        .eq('customer_id', customerRecord.id)
        .order('trailer_number');
      
      if (error) throw error;
      return (data || []) as TrailerInfo[];
    },
    enabled: !!customerRecord?.id,
  });

  // Fetch subscription/contract info
  const { data: subscription } = useQuery({
    queryKey: ['my-subscription', customerRecord?.id],
    queryFn: async () => {
      if (!customerRecord?.id) return null;
      
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select('id, status, billing_cycle, created_at, end_date, next_billing_date, subscription_type, contract_start_date, docusign_completed_at')
        .eq('customer_id', customerRecord.id)
        .maybeSingle();
      
      if (error) throw error;
      return data ? { ...data, subscription_type: data.subscription_type as SubscriptionType | null } : null;
    },
    enabled: !!customerRecord?.id,
  });

  // Fetch subscription items with lease-to-own info
  const { data: subscriptionItems = [] } = useQuery({
    queryKey: ['my-subscription-items', subscription?.id],
    queryFn: async () => {
      if (!subscription?.id) return [];
      
      const { data, error } = await supabase
        .from('subscription_items')
        .select(`
          id,
          trailer_id,
          monthly_rate,
          lease_to_own,
          ownership_transfer_date,
          trailers (id, vin, trailer_number, type)
        `)
        .eq('subscription_id', subscription.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return (data || []) as SubscriptionItemInfo[];
    },
    enabled: !!subscription?.id,
  });

  useEffect(() => {
    fetchProfile();
    fetchApplicationStatus();
  }, [currentUserId]);

  const fetchApplicationStatus = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from("customer_applications")
      .select("status, payment_setup_status")
      .eq("user_id", currentUserId)
      .maybeSingle();
    
    if (data) {
      setApplicationStatus(data.status);
      setPaymentSetupStatus(data.payment_setup_status);
    }
  };

  const fetchProfile = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile((prev: typeof profile) => ({
          first_name: data.first_name || prev.first_name || "",
          last_name: data.last_name || prev.last_name || "",
          phone: data.phone || prev.phone || "",
          email: data.email || prev.email || "",
        }));
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
        .eq("id", currentUserId);

      if (error) throw error;

      // Track profile completion in outreach status
      if (profile.first_name && profile.last_name && profile.phone) {
        supabase.functions.invoke("update-outreach-status", {
          body: { action: "profile_completed", email: currentEmail },
        }).catch(err => console.error("Failed to update outreach status:", err));
      }

      toast.success("Profile updated successfully");
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      logProfileSaved(["first_name", "last_name", "phone"]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      logProfileSaveFailed(error.message || "Unknown error");
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't allow password changes when impersonating
    if (isImpersonating) {
      toast.error("Cannot change password while viewing as customer");
      return;
    }
    
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
        body: { action: "password_set", email: currentEmail },
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
      {!isImpersonating && <Navigation />}
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

          {loading ? (
            <Card>
              <CardContent className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Contract Details Section */}
              {subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Contract Details
                    </CardTitle>
                    <CardDescription>Your lease agreement information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Subscription Type Badge */}
                      {subscription.subscription_type && (
                        <div className="col-span-full mb-2">
                          {subscription.subscription_type === 'lease_to_own' && (
                            <Badge variant="default" className="bg-primary/90 flex items-center gap-1 w-fit">
                              <KeyRound className="h-3 w-3" />
                              Lease to Own Agreement
                            </Badge>
                          )}
                          {subscription.subscription_type === 'rent_for_storage' && (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <Warehouse className="h-3 w-3" />
                              Rent for Storage
                            </Badge>
                          )}
                          {subscription.subscription_type === 'repayment_plan' && (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <CreditCard className="h-3 w-3" />
                              Repayment Plan
                            </Badge>
                          )}
                          {subscription.subscription_type === 'standard_lease' && (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <FileText className="h-3 w-3" />
                              Standard 12 Month Lease
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Contract Start</p>
                          <p className="font-semibold">
                            {format(new Date(subscription.contract_start_date || subscription.created_at), "MMMM d, yyyy")}
                          </p>
                          {subscription.docusign_completed_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Contract Signed: {format(new Date(subscription.docusign_completed_at), "MMMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {subscription.subscription_type === 'lease_to_own' ? 'Ownership Transfer Date' : 'Contract End'}
                          </p>
                          <p className="font-semibold">
                            {subscription.end_date 
                              ? format(new Date(subscription.end_date), "MMMM d, yyyy")
                              : "Ongoing (No end date)"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                        <div>
                          <p className="text-sm text-muted-foreground">Billing Cycle</p>
                          <p className="font-semibold capitalize">{subscription.billing_cycle}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* My Trailers Section - Uses subscription items for lease-to-own info */}
              {subscriptionItems.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      My Trailers ({subscriptionItems.length})
                    </CardTitle>
                    <CardDescription>Trailers currently leased to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subscriptionItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            item.lease_to_own 
                              ? "bg-primary/5 border-primary/20" 
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-lg">
                                #{item.trailers?.trailer_number || "—"}
                              </span>
                              <Badge variant="outline">{item.trailers?.type || "—"}</Badge>
                              {item.lease_to_own && (
                                <Badge variant="default" className="bg-primary/90 flex items-center gap-1">
                                  <KeyRound className="h-3 w-3" />
                                  Lease to Own
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground font-mono">
                              VIN: {item.trailers?.vin || "—"}
                            </span>
                            {item.lease_to_own && item.ownership_transfer_date && (
                              <span className="text-xs text-primary mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Ownership Transfer: {format(new Date(item.ownership_transfer_date), "MMMM d, yyyy")}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg text-primary">
                              ${item.monthly_rate.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                              /month
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : trailers.length > 0 ? (
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
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    {isImpersonating ? "Editing customer profile as admin" : "Update your profile information"}
                  </CardDescription>
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
                        isImpersonating ? "Save Changes (Admin)" : "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {!isImpersonating && (
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
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
