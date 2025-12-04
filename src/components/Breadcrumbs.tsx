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
  "/locations": "Locations",
  "/contact": "Contact",
  "/careers": "Careers",
  "/get-started": "Get Started",
  "/login": "Login",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/trailers": "Trailers",
  "/resources": "Resources",
  "/resources/cost-per-mile": "Cost Per Mile Calculator",
  "/resources/lease-vs-buy": "Lease vs Buy Calculator",
};

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const location = useLocation();

  // Generate breadcrumbs from route if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      crumbs.push({ label, href: currentPath });
    });

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
