
# Admin Sidebar Navigation Reorganization

## Overview
Reorganize the 19 flat menu items into logical, collapsible groups to improve navigation and reduce visual clutter. This will use the existing sidebar components (`Collapsible`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`) that are already available in the UI library.

## Proposed Navigation Structure

```text
+---------------------------+
| Dashboard                 |  (standalone - always visible)
+---------------------------+
| Operations           [v]  |  (collapsible group)
|   Applications            |
|   Fleet                   |
|   DOT Inspections         |
|   Tolls                   |
+---------------------------+
| People                [v]  |  (collapsible group)
|   Customers               |
|   Staff                   |
|   Mechanics               |
|   Referrals               |
+---------------------------+
| Finance               [v]  |  (collapsible group)
|   Billing                 |
|   Reports                 |
+---------------------------+
| Marketing             [v]  |  (collapsible group)
|   Support                 |
|   Outreach                |
|   Call Logs               |
|   Lead Sources            |
+---------------------------+
| Insights              [v]  |  (collapsible group)
|   Analytics               |
|   Logs                    |
+---------------------------+
| SEO Tools             [v]  |  (collapsible group)
|   Sitemap                 |
|   IndexNow                |
+---------------------------+
```

## Technical Implementation

### File Changes
**`src/components/admin/AdminSidebar.tsx`**

1. **Add imports**: Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from the collapsible component, plus `ChevronRight` icon for the expand/collapse indicator

2. **Restructure data**: Replace the flat `menuItems` array with a grouped structure:
   ```typescript
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
         // ...
       ]
     },
     // ... other groups
   ];
   ```

3. **Add state management**: Use `useState` or track open groups via URL matching to auto-expand the group containing the current page

4. **Render collapsible groups**: For each group, render:
   - A `Collapsible` wrapper with open state
   - A `SidebarMenuItem` with `CollapsibleTrigger` as the header (shows group name + chevron)
   - A `CollapsibleContent` containing `SidebarMenuSub` with all child items

5. **Keep Dashboard standalone**: Dashboard remains a top-level item, not nested in any group

### Visual Behavior
- Groups collapse/expand on click
- Chevron icon rotates to indicate open/closed state
- Active page's parent group auto-expands on page load
- Groups remember their state during the session

### Benefits
- Reduces visible items from 19 to 7 (Dashboard + 6 groups)
- Logical grouping makes navigation intuitive
- Collapsible behavior keeps the sidebar clean while maintaining quick access
- Uses existing UI components with no new dependencies
