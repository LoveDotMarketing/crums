import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Phone, MapPin, FileText, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("NotFound component loaded for path:", location.pathname);
    
    // Log 404 error to database
    const logError = async () => {
      console.log("Attempting to log 404 error to database...");
      try {
        const { data, error } = await (supabase as any).from("error_logs").insert({
          url: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        }).select();
        
        if (error) {
          console.error("Supabase insert error:", error);
        } else {
          console.log("404 error logged successfully:", data);
        }
      } catch (error) {
        console.error("Failed to log 404 error:", error);
      }
    };
    
    logError();
  }, [location.pathname]);

  const helpfulLinks = [
    { to: "/", icon: Home, label: "Home", description: "Return to our homepage" },
    { to: "/services/trailer-leasing", icon: FileText, label: "Trailer Leasing", description: "Explore our leasing options" },
    { to: "/locations", icon: MapPin, label: "Locations", description: "Find a location near you" },
    { to: "/contact", icon: Phone, label: "Contact Us", description: "Get in touch with our team" },
  ];

  return (
    <>
      <Helmet>
        <title>Page Not Found | CRUMS Leasing</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              {/* 404 Illustration */}
              <div className="mb-8">
                <div className="text-[120px] md:text-[180px] font-bold text-primary/10 leading-none select-none">
                  404
                </div>
                <div className="relative -mt-16 md:-mt-24">
                  <Search className="h-16 w-16 md:h-24 md:w-24 mx-auto text-primary/60" />
                </div>
              </div>
              
              {/* Message */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Page Not Found
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Sorry, the page you're looking for doesn't exist or has been moved. 
                Let us help you find what you need.
              </p>
              
              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/">
                  <Button size="lg" className="gap-2">
                    <Home className="h-4 w-4" />
                    Go to Homepage
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
              
              {/* Helpful Links Grid */}
              <div className="border-t border-border pt-8">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                  Helpful Links
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {helpfulLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="group p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <link.icon className="h-6 w-6 text-primary mb-2 mx-auto group-hover:scale-110 transition-transform" />
                      <div className="font-medium text-sm text-foreground">{link.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{link.description}</div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="mt-12 p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Need immediate assistance?
                </p>
                <a 
                  href="tel:+18885704564" 
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  Call us at (888) 570-4564
                </a>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NotFound;