import { Facebook, Linkedin, Instagram } from "lucide-react";
import crumsLogo from "@/assets/crums-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <a href="https://crumsleasing.com/" target="_blank" rel="noopener noreferrer">
              <img src={crumsLogo} alt="CRUMS Leasing Logo" className="h-10 w-auto mb-4 brightness-0 invert" />
            </a>
            <p className="text-sm text-primary-foreground/80 mb-4">
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
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/services/trailer-leasing" className="hover:text-secondary transition-colors">
                  Trailer Leasing
                </a>
              </li>
              <li>
                <a href="/services/trailer-rentals" className="hover:text-secondary transition-colors">
                  Trailer Rentals
                </a>
              </li>
              <li>
                <a href="/services/fleet-solutions" className="hover:text-secondary transition-colors">
                  Fleet Solutions
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-secondary transition-colors">
                  Customer Login
                </a>
              </li>
              <li>
                <a href="/get-started" className="hover:text-secondary transition-colors">
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="hover:text-secondary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/reviews" className="hover:text-secondary transition-colors">
                  Reviews
                </a>
              </li>
              <li>
                <a href="/mission" className="hover:text-secondary transition-colors">
                  Mission & Values
                </a>
              </li>
              <li>
                <a href="/locations" className="hover:text-secondary transition-colors">
                  Locations
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:text-secondary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="/referral-program" className="hover:text-secondary transition-colors">
                  Referral Program
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-secondary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Core Values */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Values</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>• Family First</li>
              <li>• Hard Work & Dedication</li>
              <li>• Quality You Can Count On</li>
              <li>• Integrity in Every Mile</li>
              <li>• Relationships Fuel Success</li>
              <li>• Keep Moving Forward</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/60">
            <p>&copy; {new Date().getFullYear()} CRUMS Leasing. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="hover:text-secondary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-secondary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
