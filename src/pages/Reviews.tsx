import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ExternalLink } from "lucide-react";
import { ChatBot } from "@/components/ChatBot";
import { SEO } from "@/components/SEO";
import { 
  generateBreadcrumbSchema, 
  customerReviews, 
  generateReviewSchema 
} from "@/lib/structuredData";
import { trackCtaClick, trackOutboundLink } from "@/lib/analytics";

const Reviews = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "Reviews", url: "https://crumsleasing.com/reviews" }
  ]);

  const reviewSchema = generateReviewSchema(customerReviews);

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "CRUMS Leasing Customer Review",
    "description": "A customer testimonial about their experience with CRUMS Leasing trailer services.",
    "thumbnailUrl": "https://img.youtube.com/vi/Xj7UTGezYfY/maxresdefault.jpg",
    "uploadDate": "2024-12-01",
    "contentUrl": "https://youtu.be/Xj7UTGezYfY",
    "embedUrl": "https://www.youtube.com/embed/Xj7UTGezYfY",
    "duration": "PT1M",
    "publisher": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "logo": {
        "@type": "ImageObject",
        "url": "https://crumsleasing.com/logo.png"
      }
    }
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, reviewSchema, videoSchema]
  };

  const reviewPlatforms = [
    {
      name: "Google Reviews",
      description: "Share your experience on Google to help other carriers find quality trailer leasing services.",
      url: "https://search.google.com/local/writereview?placeid=ChIJv4g00VWHXIYRXgCdneji-DI",
      buttonText: "Write a Google Review",
      bgColor: "from-blue-500/10 to-background",
      iconColor: "text-blue-500"
    },
    {
      name: "Facebook",
      description: "Leave a recommendation on our Facebook page and connect with the CRUMS community.",
      url: "https://www.facebook.com/CRUMSLeasing/",
      buttonText: "Review on Facebook",
      bgColor: "from-indigo-500/10 to-background",
      iconColor: "text-indigo-500"
    },
    {
      name: "Yelp",
      description: "Help local carriers discover CRUMS Leasing by sharing your experience on Yelp.",
      url: "https://www.yelp.com",
      buttonText: "Review on Yelp",
      bgColor: "from-red-500/10 to-background",
      iconColor: "text-red-500"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Customer Reviews — 53' Dry Van & Flatbed Trailer Leasing"
        description="Read what our customers say about CRUMS Leasing. 5-star reviews from trucking professionals across Texas. Quality trailers, exceptional service, and flexible leasing terms."
        canonical="https://crumsleasing.com/reviews"
        structuredData={combinedSchema}
      />
      <Navigation />

      {/* Featured Video Section */}
      <section className="py-12 bg-gradient-to-b from-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Customer Testimonial on CRUMS Trailer Leasing Services
          </h2>
          <div className="max-w-md mx-auto">
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-4 border-secondary/30">
              <iframe
                src="https://www.youtube.com/embed/Xj7UTGezYfY"
                title="CRUMS Leasing Customer Review"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <p className="text-center text-muted-foreground mt-4 text-sm">
              Hear what our customers have to say
            </p>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Customer Reviews — 53' Dry Van & Flatbed Trailer Leasing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            See what trucking professionals across Texas are saying about their experience with CRUMS Leasing.
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            {renderStars(5)}
            <span className="ml-2 text-lg font-semibold text-foreground">5.0</span>
          </div>
          <p className="text-muted-foreground">Based on {customerReviews.length} Google Reviews</p>
        </div>
      </section>

      {/* Featured Google Reviews */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Google Reviews
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real feedback from our valued customers on Google
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {customerReviews.map((review, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/5 to-background">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {review.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{review.author}</h3>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground leading-relaxed italic">
                    "{review.text}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJv4g00VWHXIYRXgCdneji-DI"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundLink('https://search.google.com/local/writereview')}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Write a Google Review
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Segmented Review Links */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Share Your CRUMS Story
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Emergency Jobs</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Did we help you in a pinch? Mention how fast we responded and got you back on the road.
                  </p>
                  <a
                    href="https://search.google.com/local/writereview?placeid=ChIJv4g00VWHXIYRXgCdneji-DI"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackOutboundLink('https://search.google.com/local/writereview')}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Share Your Story
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Long-Term Customers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Leased with us for 6+ months? Share what keeps you with CRUMS and how we've supported your business.
                  </p>
                  <a
                    href="https://search.google.com/local/writereview?placeid=ChIJv4g00VWHXIYRXgCdneji-DI"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackOutboundLink('https://search.google.com/local/writereview')}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Share Your Experience
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-secondary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">New Carriers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Was this your first trailer lease? Help other new owner-operators by sharing your first experience.
                  </p>
                  <a
                    href="https://search.google.com/local/writereview?placeid=ChIJv4g00VWHXIYRXgCdneji-DI"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackOutboundLink('https://search.google.com/local/writereview')}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Help New Carriers
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Keyword-Focused Review Prompts */}
            <Card className="border-2 bg-background">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground text-center mb-4">
                  Not Sure What to Write?
                </h3>
                <p className="text-muted-foreground text-center mb-6 text-sm">
                  Mentioning specific details helps other carriers find us. Here are some ideas:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Mention your trailer type: "I lease a <strong>53-foot dry van</strong> from CRUMS..."</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Include your location: "...for my <strong>Houston to Dallas</strong> routes."</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Share the outcome: "They helped me get rolling within <strong>48 hours</strong>."</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Mention what mattered: "No hidden fees and <strong>real customer support</strong>."</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Other Review Platforms */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Share Your Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your feedback helps other trucking professionals find quality trailer leasing services. Leave a review on your preferred platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviewPlatforms.map((platform, index) => (
              <Card key={index} className={`border-2 hover:shadow-lg transition-shadow bg-gradient-to-br ${platform.bgColor}`}>
                <CardContent className="p-8 text-center">
                  <div className={`h-16 w-16 rounded-full bg-background/80 flex items-center justify-center mb-6 mx-auto`}>
                    <Star className={`h-8 w-8 ${platform.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{platform.name}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {platform.description}
                  </p>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackOutboundLink(platform.url)}
                  >
                    <Button variant="outline" className="w-full">
                      {platform.buttonText}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Learn More About CRUMS Leasing
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/dry-van-trailer-leasing" className="text-primary hover:underline font-medium">
                Trailer leasing services
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/about" className="text-primary hover:underline font-medium">
                Our company story
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/referral-program" className="text-secondary hover:underline font-medium">
                Earn $250 for referrals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the CRUMS Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Join our growing family of satisfied customers and see why carriers across Texas choose CRUMS Leasing.
          </p>
          <Link to="/get-started" onClick={() => trackCtaClick('Get Started Today', 'reviews-cta', '/get-started')}>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      <ChatBot userType="customer" />
    </div>
  );
};

export default Reviews;