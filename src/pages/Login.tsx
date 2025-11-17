import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent, role: "customer" | "admin") => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome! Logging in as ${role}...`);
      
      // Navigate to dashboard (to be created in next iteration)
      if (role === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/customer");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="flex-1 bg-gradient-to-b from-muted to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground">
                Access your Crums Leasing customer portal
              </p>
            </div>

            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="customer">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Customer Portal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => handleLogin(e, "customer")} className="space-y-4">
                      <div>
                        <Label htmlFor="customer-email">Email</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="your.email@company.com"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-password">Password</Label>
                        <Input
                          id="customer-password"
                          type="password"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-muted-foreground">Remember me</span>
                        </label>
                        <a href="#" className="text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Sign In"}
                      </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <a href="/contact" className="text-primary hover:underline">
                        Contact us
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Admin Portal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => handleLogin(e, "admin")} className="space-y-4">
                      <div>
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@crumsleasing.com"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-muted-foreground">Remember me</span>
                        </label>
                        <a href="#" className="text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-secondary hover:bg-secondary/90"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Admin Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                For security purposes, all login attempts are monitored and logged.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
