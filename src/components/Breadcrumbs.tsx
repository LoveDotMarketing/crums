import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/mission": "Mission",
  "/services/trailer-leasing": "Trailer Leasing",
  "/services/trailer-rentals": "Trailer Rentals",
  "/services/fleet-solutions": "Fleet Solutions",
  "/dry-van-trailers": "Dry Van Trailers",
  "/refrigerated-trailers": "Refrigerated Trailers",
  "/flatbed-trailers": "Flatbed Trailers",
  "/locations": "Locations",
  "/contact": "Contact",
  "/careers": "Careers",
  "/get-started": "Get Started",
  "/login": "Login",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  
  "/resources": "Resources",
  "/resources/tools": "Financial Tools",
  "/resources/tools/cost-per-mile": "Cost Per Mile Calculator",
  "/resources/tools/lease-vs-buy": "Lease vs Buy Calculator",
  "/resources/tools/profit-calculator": "Profit Per Load Calculator",
  "/resources/tools/ifta-calculator": "IFTA Tax Estimator",
  "/resources/tools/fuel-calculator": "Fuel Cost Calculator",
  "/resources/tools/tax-deductions": "Tax Deduction Guide",
  
  "/guides": "Industry Guides",
  "/guides/choosing-trailer": "Choosing the Right Trailer",
};

// Define parent routes for pages that should be nested under a different path
const parentRoutes: Record<string, { label: string; href: string }[]> = {
  "/dry-van-trailers": [
    { label: "Services", href: "/services/trailer-leasing" },
    { label: "Trailer Leasing", href: "/services/trailer-leasing" }
  ],
  "/refrigerated-trailers": [
    { label: "Services", href: "/services/trailer-leasing" },
    { label: "Trailer Leasing", href: "/services/trailer-leasing" }
  ],
  "/flatbed-trailers": [
    { label: "Services", href: "/services/trailer-leasing" },
    { label: "Trailer Leasing", href: "/services/trailer-leasing" }
  ],
  "/guides/choosing-trailer": [
    { label: "Resources", href: "/resources" },
    { label: "Industry Guides", href: "/guides" }
  ],
};

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const location = useLocation();

  // Generate breadcrumbs from route if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
    
    // Check if current path has parent routes defined
    const parents = parentRoutes[location.pathname];
    if (parents) {
      // Add parent breadcrumbs
      parents.forEach((parent) => {
        crumbs.push(parent);
      });
      // Add current page
      const label = routeLabels[location.pathname] || location.pathname.split("/").pop()?.replace(/-/g, " ") || "";
      crumbs.push({ label, href: location.pathname });
    } else {
      // Default behavior: build from path segments
      const pathSegments = location.pathname.split("/").filter(Boolean);
      let currentPath = "";
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;
        const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        crumbs.push({ label, href: currentPath });
      });
    }

    return crumbs;
  })();

  // Don't render on homepage
  if (location.pathname === "/" && !items) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="bg-muted/50 border-b border-border"
    >
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center flex-wrap gap-1 text-sm">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                )}
                {isLast ? (
                  <span 
                    className="text-foreground font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {isFirst && <Home className="h-4 w-4" />}
                    <span className={isFirst ? "sr-only sm:not-sr-only" : ""}>
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
