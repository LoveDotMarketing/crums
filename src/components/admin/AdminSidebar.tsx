import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Truck, 
  HelpCircle,
  LogOut,
  Wrench,
  DollarSign,
  BarChart3,
  Send
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Fleet", url: "/dashboard/admin/fleet", icon: Truck },
  { title: "Customers", url: "/dashboard/admin/customers", icon: Users },
  { title: "Mechanics", url: "/dashboard/admin/mechanics", icon: Wrench },
  { title: "Tolls", url: "/dashboard/admin/tolls", icon: Receipt },
  { title: "Billing", url: "/dashboard/admin/billing", icon: DollarSign },
  { title: "Support", url: "/dashboard/admin/support", icon: HelpCircle },
  { title: "Outreach", url: "/dashboard/admin/outreach", icon: Send },
  { title: "Reports", url: "/dashboard/admin/reports", icon: Receipt },
  { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <div>
            <p className="font-semibold text-sm">CRUMS Leasing</p>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard/admin"}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
