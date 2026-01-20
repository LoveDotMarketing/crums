import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { newsArticles } from "@/lib/news";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

// Build news article route labels dynamically
const newsRouteLabels: Record<string, string> = {};
newsArticles.forEach(article => {
  newsRouteLabels[`/news/${article.slug}`] = article.title;
});

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/about/mama-crums": "Mama CRUMS",
  "/about/eric": "Eric",
  "/about/ambrosia": "Ambrosia",
  "/about/jr": "Jr",
  "/mission": "Mission",
  "/services": "Services",
  "/services/trailer-leasing": "Trailer Leasing",
  "/services/trailer-rentals": "Trailer Rentals",
  "/services/fleet-solutions": "Fleet Solutions",
  "/dry-van-trailers": "Dry Van Trailers",
  "/flatbed-trailers": "Flatbed Trailers",
  "/commercial-dry-van-trailer-for-lease-56171": "2020 Dry Van Trailer 56171",
  "/locations": "Locations",
  "/contact": "Contact",
  "/partners": "Partners",
  "/careers": "Careers",
  "/careers/trailer-leasing-sales-rep": "Trailer Leasing Sales Representative",
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
  
  "/resources/guides": "Industry Guides",
  "/resources/guides/choosing-trailer": "Choosing the Right Trailer",
  "/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision": "Why Leasing a Dry Van is Smart",
  "/resources/guides/trailer-specifications": "Trailer Specifications",
  "/resources/guides/pre-trip-inspection": "Pre-Trip Inspection Checklist",
  
  "/resources/tools/per-diem-calculator": "Per Diem Calculator",
  
  "/industries": "Industries",
  "/industries/fleet-leasing": "Fleet Leasing",
  "/industries/owner-operators": "Owner Operators",
  "/industries/logistics-companies": "Logistics Companies",
  "/industries/food-distribution": "Food Distribution",
  "/industries/retail-distribution": "Retail Distribution",
  "/industries/manufacturing": "Manufacturing",
  "/industries/seasonal-demand": "Seasonal Demand",
  
  "/news": "News",
  
  "/why-choose-crums": "Why Choose CRUMS",
};

// News article slugs will be handled dynamically

// Define parent routes for pages that should be nested under a different path
const parentRoutes: Record<string, { label: string; href: string }[]> = {
  "/services/trailer-leasing": [
    { label: "Services", href: "/services" }
  ],
  "/services/trailer-rentals": [
    { label: "Services", href: "/services" }
  ],
  "/services/fleet-solutions": [
    { label: "Services", href: "/services" }
  ],
  "/dry-van-trailers": [
    { label: "Services", href: "/services" },
    { label: "Trailer Leasing", href: "/services/trailer-leasing" }
  ],
  "/flatbed-trailers": [
    { label: "Services", href: "/services" },
    { label: "Trailer Leasing", href: "/services/trailer-leasing" }
  ],
  "/commercial-dry-van-trailer-for-lease-56171": [
    { label: "Services", href: "/services" },
    { label: "Trailer Leasing", href: "/services/trailer-leasing" }
  ],
  "/resources/guides": [
    { label: "Resources", href: "/resources" }
  ],
  "/resources/guides/choosing-trailer": [
    { label: "Resources", href: "/resources" },
    { label: "Industry Guides", href: "/resources/guides" }
  ],
  "/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision": [
    { label: "Resources", href: "/resources" },
    { label: "Industry Guides", href: "/resources/guides" }
  ],
  "/resources/guides/trailer-specifications": [
    { label: "Resources", href: "/resources" },
    { label: "Industry Guides", href: "/resources/guides" }
  ],
  "/resources/guides/pre-trip-inspection": [
    { label: "Resources", href: "/resources" },
    { label: "Industry Guides", href: "/resources/guides" }
  ],
  "/resources/tools/per-diem-calculator": [
    { label: "Resources", href: "/resources" },
    { label: "Financial Tools", href: "/resources/tools" }
  ],
  "/about/mama-crums": [
    { label: "About", href: "/about" }
  ],
  "/about/eric": [
    { label: "About", href: "/about" }
  ],
  "/about/ambrosia": [
    { label: "About", href: "/about" }
  ],
  "/about/jr": [
    { label: "About", href: "/about" }
  ],
  "/industries/fleet-leasing": [
    { label: "Industries", href: "/industries" }
  ],
  "/industries/owner-operators": [
    { label: "Industries", href: "/industries" }
  ],
  "/industries/logistics-companies": [
    { label: "Industries", href: "/industries" }
  ],
  "/industries/food-distribution": [
    { label: "Industries", href: "/industries" }
  ],
  "/industries/retail-distribution": [
    { label: "Industries", href: "/industries" }
  ],
  "/industries/manufacturing": [
    { label: "Industries", href: "/industries" }
  ],
  "/industries/seasonal-demand": [
    { label: "Industries", href: "/industries" }
  ],
  "/careers/trailer-leasing-sales-rep": [
    { label: "Careers", href: "/careers" }
  ],
};

// Build news article parent routes dynamically
const newsParentRoutes: Record<string, { label: string; href: string }[]> = {};
newsArticles.forEach(article => {
  newsParentRoutes[`/news/${article.slug}`] = [
    { label: "News", href: "/news" }
  ];
});

// Merge all parent routes
const allParentRoutes = { ...parentRoutes, ...newsParentRoutes };

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const location = useLocation();

  // Merge all route labels
  const allRouteLabels = { ...routeLabels, ...newsRouteLabels };

  // Generate breadcrumbs from route if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
    
    // Check if current path has parent routes defined
    const parents = allParentRoutes[location.pathname];
    if (parents) {
      // Add parent breadcrumbs
      parents.forEach((parent) => {
        crumbs.push(parent);
      });
      // Add current page
      const label = allRouteLabels[location.pathname] || location.pathname.split("/").pop()?.replace(/-/g, " ") || "";
      crumbs.push({ label, href: location.pathname });
    } else {
      // Default behavior: build from path segments
      const pathSegments = location.pathname.split("/").filter(Boolean);
      let currentPath = "";
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;
        const label = allRouteLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
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
