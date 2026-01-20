import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { newsArticles, generateNewsListSchema } from "@/lib/news";
import { generateBreadcrumbSchema } from "@/lib/structuredData";
import { trackOutboundLink } from "@/lib/analytics";

const News = () => {
  const breadcrumbItems = [
    { name: "Home", url: "https://crumsleasing.com" },
    { name: "News", url: "https://crumsleasing.com/news" }
  ];

  // Featured article is the newest one
  const featuredArticle = newsArticles[0];
  const remainingArticles = newsArticles.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="News & Updates"
        description="Stay updated with the latest news, announcements, and milestones from CRUMS Leasing. From industry events to company growth, follow our journey in the trucking industry."
        canonical="https://crumsleasing.com/news"
        structuredData={[generateNewsListSchema(), generateBreadcrumbSchema(breadcrumbItems)]}
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            News & Updates
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            The latest announcements, milestones, and stories from CRUMS Leasing
          </p>
        </div>
      </section>

      <Breadcrumbs />

      {/* Featured Article */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-6">Featured Story</h2>
          <Link to={`/news/${featuredArticle.slug}`} className="block group">
            <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-border">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Featured Image */}
                <div className="aspect-video md:aspect-auto md:h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center min-h-[250px] overflow-hidden">
                  {featuredArticle.image ? (
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary/30">CRUMS</span>
                  )}
                </div>
                {/* Content */}
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{featuredArticle.date}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors mb-4">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {featuredArticle.description}
                  </p>
                  <span className="text-secondary font-semibold group-hover:underline">
                    Read Full Story →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* News List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">All News & Updates</h2>
          <div className="divide-y divide-border">
            {remainingArticles.map((article) => (
              <Link 
                key={article.slug} 
                to={`/news/${article.slug}`}
                className="group block py-8 first:pt-0 last:pb-0"
              >
                <article className="flex gap-6 md:gap-8">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 flex items-center justify-center">
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary/20">CRUMS</span>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      {article.date}
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Follow CRUMS Leasing on social media for the latest updates, promotions, and industry insights.
          </p>
          <div className="flex justify-center gap-6">
            <a 
              href="https://www.instagram.com/crumsleasingllc/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackOutboundLink('https://www.instagram.com/crumsleasingllc/')}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Instagram
            </a>
            <a 
              href="https://www.linkedin.com/company/crums-leasing/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackOutboundLink('https://www.linkedin.com/company/crums-leasing/')}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              LinkedIn
            </a>
            <a 
              href="https://www.facebook.com/CRUMSLeasing/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackOutboundLink('https://www.facebook.com/CRUMSLeasing/')}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
