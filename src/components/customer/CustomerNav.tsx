import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, User, Truck, FileText } from "lucide-react";

export function CustomerNav() {
  const location = useLocation();

  const navItems = [
    { 
      title: "Dashboard", 
      href: "/dashboard/customer", 
      icon: Home 
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
    { 
      title: "Request Rental", 
      href: "/dashboard/customer/request", 
      icon: FileText 
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
        </div>
      </div>
    </nav>
  );
}
