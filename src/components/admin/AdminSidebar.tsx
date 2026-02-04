import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  Send,
  UserCog,
  FileCode,
  FileText,
  ScrollText,
  Target,
  Zap,
  ClipboardCheck,
  Phone,
  ChevronRight,
  Settings,
  UsersRound,
  TrendingUp,
  Megaphone,
  Search,
  Calendar,
  LucideIcon
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface MenuGroup {
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Operations",
    icon: Settings,
    items: [
      { title: "Applications", url: "/dashboard/admin/applications", icon: FileText },
      { title: "Fleet", url: "/dashboard/admin/fleet", icon: Truck },
      { title: "DOT Inspections", url: "/dashboard/admin/dot-inspections", icon: ClipboardCheck },
      { title: "Tolls", url: "/dashboard/admin/tolls", icon: Receipt },
    ]
  },
  {
    title: "People",
    icon: UsersRound,
    items: [
      { title: "Customers", url: "/dashboard/admin/customers", icon: Users },
      { title: "Staff", url: "/dashboard/admin/staff", icon: UserCog },
      { title: "Mechanics", url: "/dashboard/admin/mechanics", icon: Wrench },
      { title: "Referrals", url: "/dashboard/admin/referrals", icon: Users },
    ]
  },
  {
    title: "Finance",
    icon: DollarSign,
    items: [
      { title: "Billing", url: "/dashboard/admin/billing", icon: DollarSign },
    ]
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [
      { title: "Support", url: "/dashboard/admin/support", icon: HelpCircle },
      { title: "Outreach", url: "/dashboard/admin/outreach", icon: Send },
      { title: "Call Logs", url: "/dashboard/admin/call-logs", icon: Phone },
      { title: "Lead Sources", url: "/dashboard/admin/lead-sources", icon: Target },
    ]
  },
  {
    title: "Insights",
    icon: TrendingUp,
    items: [
      { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
      { title: "Logs", url: "/dashboard/admin/logs", icon: ScrollText },
    ]
  },
  {
    title: "SEO Tools",
    icon: Search,
    items: [
      { title: "Content Schedule", url: "/dashboard/admin/content-schedule", icon: Calendar },
      { title: "Sitemap", url: "/dashboard/admin/sitemap-generator", icon: FileCode },
      { title: "IndexNow", url: "/dashboard/admin/indexnow", icon: Zap },
    ]
  },
];

export function AdminSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Auto-expand group containing active page
  useEffect(() => {
    const currentPath = location.pathname;
    menuGroups.forEach(group => {
      const hasActiveItem = group.items.some(item => currentPath.startsWith(item.url));
      if (hasActiveItem) {
        setOpenGroups(prev => new Set([...prev, group.title]));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupTitle)) {
        next.delete(groupTitle);
      } else {
        next.add(groupTitle);
      }
      return next;
    });
  };

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
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - standalone item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/dashboard/admin" 
                    end
                    className="flex items-center gap-3"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Collapsible groups */}
              {menuGroups.map((group) => (
                <Collapsible
                  key={group.title}
                  open={openGroups.has(group.title)}
                  onOpenChange={() => toggleGroup(group.title)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <span className="flex items-center gap-3">
                          <group.icon className="h-4 w-4" />
                          <span>{group.title}</span>
                        </span>
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            openGroups.has(group.title) ? "rotate-90" : ""
                          }`} 
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink 
                                to={item.url}
                                className="flex items-center gap-3"
                                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}

              {/* Reports - standalone item at bottom */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/dashboard/admin/reports"
                    className="flex items-center gap-3"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Reports</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
