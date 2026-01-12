import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Truck, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CustomerNav } from "@/components/customer/CustomerNav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ChatBot } from "@/components/ChatBot";
import { ApplicationAlert } from "@/components/customer/ApplicationAlert";
import { SEO } from "@/components/SEO";
import { ReferralCard } from "@/components/customer/ReferralCard";
import { ApplicationStatusTracker } from "@/components/customer/ApplicationStatusTracker";


export default function CustomerDashboard() {
  const { user, signOut } = useAuth();
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    checkApplicationStatus();
  }, [user]);

  const checkApplicationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setApplicationStatus(data.status);
        
        const requiredFields = [
          data.phone_number,
          data.trailer_type,
          data.drivers_license_url,
          data.drivers_license_back_url,
          data.insurance_docs_url,
        ];
        
        const completed = requiredFields.filter(field => field && field.length > 0).length;
        setApplicationProgress(Math.round((completed / requiredFields.length) * 100));
      } else {
        setApplicationProgress(0);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const stats = [
    {
      title: "Outstanding Tolls",
      value: "$0.00",
      icon: Receipt,
      color: "text-muted-foreground"
    },
    {
      title: "Assigned Trailers",
      value: "0",
      icon: Truck,
      color: "text-muted-foreground"
    },
    {
      title: "Paid This Month",
      value: "$0.00",
      icon: CheckCircle,
      color: "text-green-600"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Customer Dashboard"
        description="Manage your CRUMS Leasing account, view tolls, and access your trailer information."
        noindex
      />
      <Navigation />
      <CustomerNav />

      <main className="flex-1 bg-gradient-to-b from-muted to-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.email}</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>

          {/* Application Status Tracker */}
          {user && (
            <div className="mb-8">
              <ApplicationStatusTracker userId={user.id} />
            </div>
          )}

          {/* Application Status Alert */}
          {user && (
            <div className="mb-8">
              <ApplicationAlert userId={user.id} />
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Tolls Message */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Tolls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No tolls on your account</p>
                <p className="text-sm">Any toll charges will appear here</p>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Message */}
          <Card className="border-primary/30 bg-primary/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                Welcome to CRUMS Leasing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Complete your application to get started with trailer leasing. We'll be in touch soon!
              </p>
            </CardContent>
          </Card>

          {/* Referral Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Referral Program</h2>
            <ReferralCard />
          </div>
        </div>
      </main>

      <Footer />
      <ChatBot userType="customer" />
    </div>
  );
}
