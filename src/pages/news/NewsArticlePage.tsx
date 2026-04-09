import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, ExternalLink, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { newsArticles, getArticleBySlug, generateNewsArticleSchema, generateMats2026EventSchema } from "@/lib/news";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

// MATS 2026 assets - served from public folder for stable sitemap URLs
const matsFloorPlan = "/images/news/mats-2026-floor-plan.webp";
const matsBoothArea = "/images/news/mats-2026-booth-area.webp";
const matsBoothDetail = "/images/news/mats-2026-booth-detail.webp";
const matsLogo = "/images/news/mats-logo.webp";

// San Antonio Chamber of Commerce
const chamberLogo = "/images/news/san-antonio-chamber-logo.png";

const NewsArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return <Navigate to="/news" replace />;
  }

  // Find previous and next articles
  const currentIndex = newsArticles.findIndex(a => a.slug === slug);
  const prevArticle = currentIndex < newsArticles.length - 1 ? newsArticles[currentIndex + 1] : null;
  const nextArticle = currentIndex > 0 ? newsArticles[currentIndex - 1] : null;

  const breadcrumbItems = [
    { name: "Home", url: "https://crumsleasing.com" },
    { name: "News", url: "https://crumsleasing.com/news" },
    { name: article.title, url: `https://crumsleasing.com/news/${article.slug}` }
  ];

  // Build structured data array
  const structuredData = [
    generateNewsArticleSchema(article), 
    generateBreadcrumbSchema(breadcrumbItems)
  ];

  // Add Event schema for MATS 2026 article
  if (slug === "mats-2026-crums-leasing-booth-38024") {
    structuredData.push(generateMats2026EventSchema());
  }

  // Determine OG image - use article image if available
  const ogImage = article.image || "/og-image.jpg";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={article.title}
        description={article.description}
        canonical={`https://crumsleasing.com/news/${article.slug}`}
        ogImage={ogImage}
        structuredData={structuredData}
        article={{
          publishedTime: article.sortDate,
          modifiedTime: article.lastModified,
          section: article.articleSection || "Company News",
          author: "CRUMS Leasing"
        }}
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-brand-teal-dark py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary-foreground/80">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.sortDate}>{article.date}</time>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link 
              to="/news" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>

            {/* Featured Image */}
            {article.image && (
              <div className="mb-8 rounded-xl overflow-hidden border border-border">
                <img 
                  src={article.image}
                  alt={`${article.title} - ${article.articleSection || 'CRUMS Leasing News'}`}
                  className="w-full h-auto"
                  width="1200"
                  height="630"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.description}
              </p>
              
              {/* MATS 2026 Walkthrough specific content */}
              {slug === "mats-2026-expo-floor-walkthrough" ? (
                <div className="mt-8 space-y-6">
                  <a
                    href="https://youtu.be/i2N3mUtS2wU?si=Z29sp09Bq_TCAn1T"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video rounded-xl overflow-hidden border border-border group"
                  >
                    <img
                      src="/images/news/mats-2026-video-thumbnail.png"
                      alt="MATS 2026 - 360 Video Walkthrough of Expo Floor - Watch on YouTube"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                  <div className="p-6 bg-muted/30 rounded-lg border border-border">
                    <p className="text-foreground mb-4">
                      The Mid-America Trucking Show 2026 was an incredible experience for the CRUMS Leasing team. 
                      We spent three days at Booth #38024 in the South Wing, connecting with owner-operators, fleet 
                      managers, and industry professionals from across the country.
                    </p>
                    <p className="text-foreground">
                      Check out the full 360° walkthrough of the expo floor above. From the latest truck models to 
                      innovative trailer technology, MATS 2026 showcased the best the trucking industry has to offer. 
                      Thank you to everyone who stopped by our booth — we can't wait to see you next year!
                    </p>
                  </div>
                </div>
              ) : slug === "crums-leasing-joins-greater-san-antonio-chamber-of-commerce" ? (
                <div className="mt-8 space-y-6">
                  <div className="p-6 bg-muted/30 rounded-lg border border-border">
                    <p className="text-foreground mb-4">
                      CRUMS Leasing is excited to announce our membership in The Greater San Antonio Chamber of Commerce, 
                      the leading business organization serving the San Antonio region. This partnership reflects our 
                      commitment to investing in our local community and supporting the growth of businesses throughout 
                      South Texas.
                    </p>
                    <p className="text-foreground">
                      As a member of the Chamber, CRUMS Leasing joins a network of over 1,800 businesses working together 
                      to create jobs, drive economic development, and build a stronger San Antonio. Our headquarters at 
                      7450 Prue Rd serves as our home base for operations across Texas, and this membership strengthens 
                      our ties to the community that has supported our growth.
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-center p-6 bg-secondary/10 rounded-xl border border-border">
                    <a 
                      href="https://www.sachamber.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src={chamberLogo} 
                        alt="The Greater San Antonio Chamber of Commerce"
                        className="h-32 w-auto"
                      />
                    </a>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">About The Greater San Antonio Chamber</h3>
                      <p className="text-muted-foreground text-sm">
                        The Greater San Antonio Chamber is the voice of business in San Antonio, advocating for policies 
                        that support economic growth, workforce development, and a thriving business environment. The 
                        Chamber connects businesses of all sizes to resources, networking opportunities, and the support 
                        they need to succeed.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border">
                  <p className="text-foreground">
                    This milestone represents an important moment in CRUMS Leasing's journey to 
                    empower carriers across the United States with reliable, affordable trailer 
                    leasing solutions. Founded on the values of family, hard work, and dedication 
                    passed down from "CRUMS" herself, the company continues to grow while 
                    maintaining its people-first approach.
                  </p>
                </div>
              )}
            </div>

            {/* Booth Location Section - MATS 2026 specific */}
            {slug === "mats-2026-crums-leasing-booth-38024" && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-6 w-6 text-secondary" />
                  <h2 className="text-2xl font-bold text-foreground">Booth Location</h2>
                </div>
                
                <div className="bg-muted/30 rounded-xl p-6 border border-border mb-6">
                  {/* Event Logo & Venue Info */}
                  <div className="text-center mb-6 pb-6 border-b border-border">
                    <a 
                      href="https://truckingshow.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mb-4 hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src={matsLogo} 
                        alt="Mid-America Trucking Show"
                        className="h-24 mx-auto"
                      />
                    </a>
                    <p className="text-lg font-semibold text-foreground mb-1">March 26–28, 2026</p>
                    <p className="text-xl font-bold text-primary mb-2">Kentucky Expo Center</p>
                    <p className="text-muted-foreground">
                      937 Phillips Lane<br />
                      Louisville, KY 40209
                    </p>
                  </div>

                  {/* Event Info Highlights */}
                  <div className="mb-6 pb-6 border-b border-border">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-secondary font-bold">•</span>
                        <span className="text-muted-foreground">Attendee Registration opens <strong className="text-foreground">December 1, 2025</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-secondary font-bold">•</span>
                        <span className="text-muted-foreground">Free Attendee Registration closes <strong className="text-foreground">February 26, 2026</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-secondary font-bold">•</span>
                        <span className="text-muted-foreground">Call for Speakers: <strong className="text-foreground">October 1, 2025 – February 1, 2026</strong></span>
                      </li>
                    </ul>
                  </div>

                  {/* Booth Details */}
                  <div className="grid md:grid-cols-3 gap-4 text-center mb-6">
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground">Booth Number</p>
                      <p className="text-3xl font-bold text-primary">38024</p>
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground">Booth Size</p>
                      <p className="text-3xl font-bold text-primary">20 x 10</p>
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="text-3xl font-bold text-primary">200 sq ft</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-center">
                    Located in the <strong className="text-foreground">South Wing</strong> near the Maintenance & Repair Pavilion
                  </p>
                </div>

                {/* Floor Plan Images */}
                <div className="space-y-6">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img 
                      src={matsFloorPlan} 
                      alt="MATS 2026 Floor Plan - CRUMS Leasing Booth 38024 Location Overview"
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img 
                        src={matsBoothArea} 
                        alt="MATS 2026 South Wing Area - Booth 38024"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img 
                        src={matsBoothDetail} 
                        alt="MATS 2026 Booth 38024 Detail View"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* External Sources */}
            {article.externalLinks.length > 0 && (
              <div className="mb-12 p-6 bg-muted/50 rounded-lg border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Sources & Related Links</h2>
                <ul className="space-y-3">
                  {article.externalLinks.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 hover:underline break-all"
                      >
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{link}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="bg-secondary/10 rounded-xl p-8 text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Get Started with CRUMS Leasing?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of carriers who trust CRUMS Leasing for reliable, affordable trailer solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/get-started">
                  <Button className="bg-secondary hover:bg-secondary/90">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-border">
              {prevArticle ? (
                <Link 
                  to={`/news/${prevArticle.slug}`}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group flex-1"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Previous</span>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {prevArticle.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              
              {nextArticle ? (
                <Link 
                  to={`/news/${nextArticle.slug}`}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group flex-1 justify-end text-right"
                >
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Next</span>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {nextArticle.title}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </nav>
          </div>
        </div>
      </article>

      <RelatedLinksSection
        title="You May Also Like"
        subtitle="Resources and services for trucking professionals"
        links={[
          { to: "/dry-van-trailer-leasing", label: "Dry Van Trailer Leasing", description: "Flexible lease terms on 53' dry van trailers." },
          { to: "/commercial-dry-van-trailer-for-lease-56171", label: "Browse Available Trailers", description: "View our 2020 Great Dane 53' dry van with full specs." },
          { to: "/resources/guides/lease-first-trailer", label: "Why Lease Your First Trailer", description: "Compare leasing vs buying for new owner-operators." },
          { to: "/resources/tools/profit-calculator", label: "Profit Per Load Calculator", description: "Estimate your profit margin on each load after expenses." },
          { to: "/why-choose-crums", label: "Why Choose CRUMS", description: "See what sets our family-owned leasing company apart." },
          { to: "/locations", label: "Service Locations", description: "Find pickup and delivery options near you nationwide." },
        ]}
      />

      <Footer />
    </div>
  );
};

export default NewsArticlePage;
