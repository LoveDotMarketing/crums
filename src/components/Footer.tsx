import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-4">
              CL<span className="text-secondary">.</span>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Building trust, family, and opportunity in trailer leasing and logistics nationwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
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
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-secondary transition-colors">
                  About Us
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
                <Link to="/contact" className="hover:text-secondary transition-colors">
                  Contact
                </Link>
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
            <p>&copy; {new Date().getFullYear()} Crums Leasing. All rights reserved.</p>
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
