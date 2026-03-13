import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Calculator } from "lucide-react";
import { getGuideBySlug, getGuideHref } from "@/lib/guides";
import { getToolBySlug } from "@/lib/tools";

// Cross-linking map: each guide slug → related guide slugs + related tool slugs
const crossLinks: Record<string, { guides: string[]; tools: string[] }> = {
  "getting-your-cdl": {
    guides: ["owner-operator-basics", "lease-first-trailer", "finding-first-loads"],
    tools: ["cost-per-mile", "profit-calculator"],
  },
  "load-boards-guide": {
    guides: ["finding-first-loads", "owner-operator-basics", "choosing-trailer"],
    tools: ["profit-calculator", "fuel-calculator"],
  },
  "finding-first-loads": {
    guides: ["load-boards-guide", "owner-operator-basics", "lease-first-trailer"],
    tools: ["profit-calculator", "cost-per-mile"],
  },
  "lease-first-trailer": {
    guides: ["why-leasing-a-dry-van-trailer-is-a-smart-business-decision", "choosing-trailer", "owner-operator-basics"],
    tools: ["lease-vs-buy", "cost-per-mile"],
  },
  "owner-operator-basics": {
    guides: ["getting-your-cdl", "finding-first-loads", "lease-first-trailer"],
    tools: ["cost-per-mile", "tax-deductions"],
  },
  "choosing-trailer": {
    guides: ["trailer-specifications", "why-leasing-a-dry-van-trailer-is-a-smart-business-decision", "lease-first-trailer"],
    tools: ["lease-vs-buy", "profit-calculator"],
  },
  "why-leasing-a-dry-van-trailer-is-a-smart-business-decision": {
    guides: ["lease-first-trailer", "choosing-trailer", "trailer-specifications"],
    tools: ["lease-vs-buy", "cost-per-mile"],
  },
  "trailer-specifications": {
    guides: ["choosing-trailer", "pre-trip-inspection", "maintenance-schedules"],
    tools: ["lease-vs-buy", "cost-per-mile"],
  },
  "maintenance-schedules": {
    guides: ["tire-care", "pre-trip-inspection", "breakdown-safety"],
    tools: ["cost-per-mile", "fuel-calculator"],
  },
  "tire-care": {
    guides: ["maintenance-schedules", "pre-trip-inspection", "fuel-efficiency"],
    tools: ["cost-per-mile", "fuel-calculator"],
  },
  "pre-trip-inspection": {
    guides: ["maintenance-schedules", "tire-care", "breakdown-safety"],
    tools: ["cost-per-mile", "fuel-calculator"],
  },
  "road-comfort": {
    guides: ["work-life-balance", "mental-health", "truck-cooking"],
    tools: ["per-diem-calculator", "fuel-calculator"],
  },
  "winter-driving": {
    guides: ["breakdown-safety", "tire-care", "pre-trip-inspection"],
    tools: ["fuel-calculator", "cost-per-mile"],
  },
  "breakdown-safety": {
    guides: ["winter-driving", "pre-trip-inspection", "maintenance-schedules"],
    tools: ["cost-per-mile", "fuel-calculator"],
  },
  "budgeting": {
    guides: ["owner-operator-basics", "fuel-efficiency", "maximize-lease"],
    tools: ["cost-per-mile", "per-diem-calculator"],
  },
  "truck-cooking": {
    guides: ["road-comfort", "budgeting", "work-life-balance"],
    tools: ["per-diem-calculator", "fuel-calculator"],
  },
  "work-life-balance": {
    guides: ["mental-health", "road-comfort", "truck-cooking"],
    tools: ["per-diem-calculator", "profit-calculator"],
  },
  "maximize-lease": {
    guides: ["maintenance-schedules", "why-leasing-a-dry-van-trailer-is-a-smart-business-decision", "tire-care"],
    tools: ["lease-vs-buy", "cost-per-mile"],
  },
  "fuel-efficiency": {
    guides: ["tire-care", "maintenance-schedules", "budgeting"],
    tools: ["fuel-calculator", "cost-per-mile"],
  },
  "trucking-career": {
    guides: ["getting-your-cdl", "owner-operator-basics", "finding-first-loads"],
    tools: ["profit-calculator", "cost-per-mile"],
  },
  "mental-health": {
    guides: ["work-life-balance", "road-comfort", "breakdown-safety"],
    tools: ["per-diem-calculator", "profit-calculator"],
  },
};

const toolRouteMap: Record<string, string> = {
  "cost-per-mile": "/resources/tools/cost-per-mile",
  "lease-vs-buy": "/resources/tools/lease-vs-buy",
  "profit-calculator": "/resources/tools/profit-calculator",
  "ifta-calculator": "/resources/tools/ifta-calculator",
  "fuel-calculator": "/resources/tools/fuel-calculator",
  "tax-deductions": "/resources/tools/tax-deductions",
  "per-diem-calculator": "/resources/tools/per-diem-calculator",
};

interface GuideRelatedContentProps {
  currentSlug: string;
}

export const GuideRelatedContent = ({ currentSlug }: GuideRelatedContentProps) => {
  const links = crossLinks[currentSlug];
  if (!links) return null;

  const relatedGuides = links.guides
    .map((slug) => {
      const guide = getGuideBySlug(slug);
      return guide ? { ...guide, href: getGuideHref(slug) } : null;
    })
    .filter(Boolean) as Array<{ title: string; description: string; href: string }>;

  const relatedTools = links.tools
    .map((slug) => {
      const tool = getToolBySlug(slug);
      return tool ? { ...tool, href: toolRouteMap[slug] } : null;
    })
    .filter(Boolean) as Array<{ title: string; description: string; href: string }>;

  if (relatedGuides.length === 0 && relatedTools.length === 0) return null;

  return (
    <section className="border-t border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-6">Continue Reading</h2>

        {relatedGuides.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Related Guides
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  to={guide.href}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {guide.title}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{guide.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {relatedTools.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Helpful Tools
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {tool.title}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
