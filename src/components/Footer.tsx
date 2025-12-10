import { Facebook, Linkedin, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import crumsLogo from "@/assets/crums-logo.png";
import { trackPhoneClick } from "@/lib/analytics"; // GA4 tracking

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <Link to="/">
              <img src={crumsLogo} alt="CRUMS Leasing Logo" className="h-10 w-auto mb-4 brightness-0 invert" width={120} height={40} decoding="async" loading="lazy" />
            </Link>
            <p className="text-sm text-primary-foreground mb-4">
              Building trust, family, and opportunity in trailer leasing and logistics nationwide.
            </p>
            
            <div className="text-sm text-primary-foreground/90 mb-4 space-y-1">
              <p className="font-semibold">CRUMS Leasing</p>
              <a 
                href="https://maps.app.goo.gl/Ua1WNSa48j2ujnYg9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors block"
              >
                4070 FM1863<br />
                Bulverde, TX 78163
              </a>
              <a 
                href="tel:+18885704564"
                className="hover:text-secondary transition-colors block"
                onClick={() => trackPhoneClick('footer')}
              >
                (888) 570-4564
              </a>
              <a 
                href="https://crumsleasing.com" 
                className="hover:text-secondary transition-colors block"
              >
                crumsleasing.com
              </a>
            </div>
            
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/people/CRUMS-Leasing/100090574399864/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/crumsleasingllc/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/crums-leasing/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                aria-label="Visit our LinkedIn page"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://www.youtube.com/@CRUMSLeasing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                aria-label="Visit our YouTube channel"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <Link to="/services" className="hover:text-secondary transition-colors">
              <h3 className="font-semibold text-lg mb-4">Services</h3>
            </Link>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services/trailer-leasing" className="hover:text-secondary transition-colors">
                  Trailer Leasing
                </Link>
              </li>
              <li>
                <Link to="/services/trailer-rentals" className="hover:text-secondary transition-colors">
                  Trailer Rentals
                </Link>
              </li>
              <li>
                <Link to="/services/fleet-solutions" className="hover:text-secondary transition-colors">
                  Fleet Solutions
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-secondary transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link to="/get-started" className="hover:text-secondary transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <Link to="/about" className="hover:text-secondary transition-colors">
              <h3 className="font-semibold text-lg mb-4">Company</h3>
            </Link>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-secondary transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-secondary transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/mission" className="hover:text-secondary transition-colors">
                  Mission & Values
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-secondary transition-colors">
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-secondary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/referral-program" className="hover:text-secondary transition-colors">
                  Referral Program
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-secondary transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-secondary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours of Operation */}
          <div>
            <Link to="/contact" className="hover:text-secondary transition-colors">
              <h3 className="font-semibold text-lg mb-4">Hours of Operation</h3>
            </Link>
            <ul className="space-y-2 text-sm text-primary-foreground">
              <li>Monday - Friday: 9:00 AM - 5:30 PM</li>
              <li>Saturday: 9:00 AM - 12:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
            <p className="text-xs text-primary-foreground/80 mt-3">
              24/7 Emergency Support Available
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/80">
            <p>&copy; {new Date().getFullYear()} CRUMS Leasing. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-secondary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
