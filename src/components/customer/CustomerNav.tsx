import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, User, Truck, FileText, CreditCard, Receipt, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CustomerNavProps {
  showLeaseToOwn?: boolean;
}

export function CustomerNav({ showLeaseToOwn }: CustomerNavProps = {}) {
  const location = useLocation();
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const currentEmail = isImpersonating && impersonatedUser ? impersonatedUser.email : user?.email;
  const [hasLeaseToOwn, setHasLeaseToOwn] = useState(showLeaseToOwn ?? false);

  useEffect(() => {
    if (showLeaseToOwn !== undefined) return; // controlled via prop
    if (!currentEmail) return;

    const checkLeaseToOwn = async () => {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", currentEmail)
        .maybeSingle();
      if (!customer) return;

      const { data: sub } = await supabase
        .from("customer_subscriptions")
        .select("id")
        .eq("customer_id", customer.id)
        .eq("subscription_type", "lease_to_own")
        .in("status", ["active", "paused"])
        .maybeSingle();

      setHasLeaseToOwn(!!sub);
    };

    checkLeaseToOwn();
  }, [currentEmail, showLeaseToOwn]);

  const navItems = [
    { 
      title: "Dashboard", 
      href: "/dashboard/customer", 
      icon: Home 
    },
    { 
      title: "Application", 
      href: "/dashboard/customer/application", 
      icon: FileText 
    },
    { 
      title: "Payment Setup", 
      href: "/dashboard/customer/payment-setup", 
      icon: CreditCard 
    },
    { 
      title: "Billing", 
      href: "/dashboard/customer/billing", 
      icon: Receipt 
    },
    { 
      title: "My Profile", 
      href: "/dashboard/customer/profile", 
      icon: User 
    },
    { 
      title: "My Rentals", 
      href: "/dashboard/customer/rentals", 
      icon: Truck 
    },
  ];

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
          {hasLeaseToOwn && (
            <Link
              to="/dashboard/customer/lease-to-own"
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
                location.pathname === "/dashboard/customer/lease-to-own"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              <KeyRound className="h-4 w-4" />
              Lease to Own
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
