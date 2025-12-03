import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gift, Copy, Share2, Users, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ReferralCode {
  id: string;
  code: string;
  is_active: boolean;
}

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  credit_amount: number;
  created_at: string;
}

export function ReferralCard() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      // Get user's profile to find email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user?.id)
        .single();

      if (!profile?.email) {
        setLoading(false);
        return;
      }

      // Find customer by email
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", profile.email)
        .maybeSingle();

      if (!customer) {
        setLoading(false);
        return;
      }

      // Get referral code
      const { data: codeData } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("customer_id", customer.id)
        .maybeSingle();

      if (codeData) {
        setReferralCode(codeData);

        // Get referrals made with this code
        const { data: referralsData } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_code_id", codeData.id)
          .order("created_at", { ascending: false });

        if (referralsData) {
          setReferrals(referralsData);
        }
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const shareCode = async () => {
    if (referralCode && navigator.share) {
      try {
        await navigator.share({
          title: "CRUMS Leasing Referral",
          text: `Use my referral code ${referralCode.code} when you sign up for CRUMS Leasing and we both save $250!`,
          url: `https://crumsleasing.com/login?ref=${referralCode.code}`
        });
      } catch (err) {
        // User cancelled or share not supported
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === "pending").length,
    approved: referrals.filter(r => r.status === "approved" || r.status === "credited").length,
    credited: referrals.filter(r => r.status === "credited").reduce((sum, r) => sum + (r.credit_amount || 250), 0)
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Your referral code will be generated once your account is fully set up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/referral-program">
            <Button variant="outline" className="w-full">
              Learn About Referrals
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Referral Code Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your code and earn $250 for each referral who signs a lease
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-background border-2 border-primary/30 rounded-lg px-4 py-3">
              <code className="text-2xl font-bold tracking-wider text-primary">{referralCode.code}</code>
            </div>
            <Button size="icon" variant="outline" onClick={copyCode} title="Copy code">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={shareCode} title="Share code">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {!referralCode.is_active && (
            <Badge variant="destructive">Code Inactive</Badge>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Credits Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${stats.credited}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {referral.referred_email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      referral.status === "credited" ? "bg-green-100 text-green-700 border-green-300" :
                      referral.status === "approved" ? "bg-blue-100 text-blue-700 border-blue-300" :
                      referral.status === "rejected" ? "bg-red-100 text-red-700 border-red-300" :
                      "bg-yellow-100 text-yellow-700 border-yellow-300"
                    }
                  >
                    {referral.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learn More Link */}
      <div className="text-center">
        <Link to="/referral-program" className="text-sm text-primary hover:underline">
          Learn more about our referral program →
        </Link>
      </div>
    </div>
  );
}