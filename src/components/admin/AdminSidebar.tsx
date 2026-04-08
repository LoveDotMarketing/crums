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
  CreditCard,
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
import { useStaffPermissions, SectionKey } from "@/hooks/useStaffPermissions";
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
  sectionKey: SectionKey;
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
      { title: "Applications", url: "/dashboard/admin/applications", icon: FileText, sectionKey: "applications" },
      { title: "Fleet", url: "/dashboard/admin/fleet", icon: Truck, sectionKey: "fleet" },
      { title: "Archived Trailers", url: "/dashboard/admin/archived-trailers", icon: Truck, sectionKey: "archived_trailers" },
      { title: "DOT Inspections", url: "/dashboard/admin/dot-inspections", icon: ClipboardCheck, sectionKey: "dot_inspections" },
      { title: "Work Orders", url: "/dashboard/admin/work-orders", icon: ScrollText, sectionKey: "work_orders" },
      { title: "Tolls", url: "/dashboard/admin/tolls", icon: Receipt, sectionKey: "tolls" },
    ]
  },
  {
    title: "People",
    icon: UsersRound,
    items: [
      { title: "Customers", url: "/dashboard/admin/customers", icon: Users, sectionKey: "customers" },
      { title: "Staff", url: "/dashboard/admin/staff", icon: UserCog, sectionKey: "staff" },
      { title: "Employee Dashboard", url: "/dashboard/admin/employee", icon: TrendingUp, sectionKey: "employee" },
      { title: "Mechanics", url: "/dashboard/admin/mechanics", icon: Wrench, sectionKey: "mechanics" },
      { title: "Referrals", url: "/dashboard/admin/referrals", icon: Users, sectionKey: "referrals" },
    ]
  },
  {
    title: "Finance",
    icon: DollarSign,
    items: [
      { title: "Billing", url: "/dashboard/admin/billing", icon: DollarSign, sectionKey: "billing" },
      { title: "Payments", url: "/dashboard/admin/payments", icon: CreditCard, sectionKey: "payments" },
    ]
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [
      { title: "Support", url: "/dashboard/admin/support", icon: HelpCircle, sectionKey: "support" },
      { title: "Outreach", url: "/dashboard/admin/outreach", icon: Send, sectionKey: "outreach" },
      { title: "Call Logs", url: "/dashboard/admin/call-logs", icon: Phone, sectionKey: "call_logs" },
      { title: "Lead Sources", url: "/dashboard/admin/lead-sources", icon: Target, sectionKey: "lead_sources" },
      { title: "Phone Leads", url: "/dashboard/admin/phone-leads", icon: Phone, sectionKey: "phone_leads" },
    ]
  },
  {
    title: "Insights",
    icon: TrendingUp,
    items: [
      { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3, sectionKey: "analytics" },
      { title: "Logs", url: "/dashboard/admin/logs", icon: ScrollText, sectionKey: "logs" },
    ]
  },
  {
    title: "SEO Tools",
    icon: Search,
    items: [
      { title: "Content Schedule", url: "/dashboard/admin/content-schedule", icon: Calendar, sectionKey: "content_schedule" },
      { title: "Sitemap", url: "/dashboard/admin/sitemap-generator", icon: FileCode, sectionKey: "sitemap" },
      { title: "IndexNow", url: "/dashboard/admin/indexnow", icon: Zap, sectionKey: "indexnow" },
    ]
  },
];

export function AdminSidebar() {
  const { signOut } = useAuth();
  const { hasAccess, isFullAdmin } = useStaffPermissions();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Filter groups based on permissions
  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAccess(item.sectionKey)),
    }))
    .filter((group) => group.items.length > 0);

  // Auto-expand group containing active page
  useEffect(() => {
    const currentPath = location.pathname;
    visibleGroups.forEach(group => {
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
              {/* Dashboard - always visible */}
              {hasAccess("dashboard") && (
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
              )}

              {/* Collapsible groups */}
              {visibleGroups.map((group) => (
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
              {hasAccess("reports") && (
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
              )}
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
