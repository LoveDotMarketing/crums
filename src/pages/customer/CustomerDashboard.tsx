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
          data.secondary_contact_name,
          data.secondary_contact_phone,
          data.ssn_card_url,
          data.drivers_license_url,
          data.insurance_docs_url,
          data.contract_url,
          data.bank_name,
          data.account_holder_name,
          data.account_number,
          data.routing_number,
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
      value: "$845.50",
      icon: Receipt,
      color: "text-yellow-600"
    },
    {
      title: "Assigned Trailers",
      value: "3",
      icon: Truck,
      color: "text-blue-600"
    },
    {
      title: "Paid This Month",
      value: "$1,245.00",
      icon: CheckCircle,
      color: "text-green-600"
    },
  ];

  const recentTolls = [
    { id: 1, location: "I-95 North", amount: "$12.50", date: "2024-11-15", status: "pending" },
    { id: 2, location: "Turnpike Plaza", amount: "$45.00", date: "2024-11-14", status: "pending" },
    { id: 3, location: "I-90 West", amount: "$8.75", date: "2024-11-12", status: "paid" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
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

          {/* Recent Tolls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Tolls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTolls.map((toll) => (
                  <div key={toll.id} className="flex items-center justify-between py-3 border-b last:border-0 border-border">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{toll.location}</p>
                      <p className="text-sm text-muted-foreground">{toll.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-foreground">{toll.amount}</span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        toll.status === "paid" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {toll.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert */}
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                You have 2 pending tolls totaling $57.50 that require payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <ChatBot userType="customer" />
    </div>
  );
}
