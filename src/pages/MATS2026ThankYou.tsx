import { CheckCircle, Facebook, Instagram, Linkedin, Youtube, Truck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MATS2026ThankYou() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Thank You | CRUMS Leasing at MATS 2026"
        description="Thanks for visiting CRUMS Leasing at MATS 2026. We'll follow up with you shortly."
      />
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full space-y-8 text-center">
          <CheckCircle className="h-20 w-20 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Thank You!</h1>
          <p className="text-muted-foreground text-lg">
            We've got your info. A member of our team will follow up with you shortly. Enjoy MATS 2026!
          </p>

          {/* Social Links */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="font-semibold text-foreground">Follow Us</p>
              <div className="flex justify-center gap-4">
                <a href="https://www.facebook.com/CRUMSLeasing/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com/crumsleasingllc/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/company/crums-leasing/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://www.youtube.com/@CRUMSLeasing" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/dry-van-trailer-leasing">
                <Truck className="h-4 w-4 mr-2" />
                View Our Trailers
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/get-started">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
