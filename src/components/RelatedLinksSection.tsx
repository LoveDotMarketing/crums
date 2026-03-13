import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface RelatedLink {
  to: string;
  label: string;
  description: string;
}

interface RelatedLinksSectionProps {
  title?: string;
  subtitle?: string;
  links: RelatedLink[];
}

export const RelatedLinksSection = ({
  title = "Helpful Resources",
  subtitle = "Explore more from CRUMS Leasing",
  links,
}: RelatedLinksSectionProps) => {
  return (
    <section className="bg-muted/50 border-t border-border py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-8">{subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <div className="flex-1">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
