import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { trackPhoneClick } from "@/lib/analytics";
import crumsLogo from "@/assets/crums-logo.png";
import { useAuth } from "@/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isImpersonating } = useAuth();

  return (
    <nav className={`${isImpersonating ? 'sticky top-10' : 'sticky top-0'} z-40 bg-background border-b border-border shadow-sm`} role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={crumsLogo} alt="CRUMS Leasing Logo" className="h-12 w-auto" width={144} height={48} />
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-primary">CRUMS Leasing</div>
              <div className="text-xs text-muted-foreground">Equipment Solutions</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/dry-van-trailer-leasing"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Dry Van Leasing</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              53' dry van trailer leasing solutions
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/flatbed-trailer-leasing"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Flatbed Leasing</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Open deck flatbed trailer leasing
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/semi-trailer-leasing"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Semi Trailer Leasing</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Long-term semi trailer leasing
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/services/trailer-rentals"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Trailer Rentals</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Flexible short-term rental options
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/services/fleet-solutions"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Fleet Solutions</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Comprehensive fleet management
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li className="border-t border-border pt-3 mt-1">
                        <span className="text-xs font-semibold text-muted-foreground px-3">Equipment Types</span>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/dry-van-trailers"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Dry Van Trailers</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              53' enclosed cargo trailers
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/flatbed-trailers"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Flatbed Trailers</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Open deck for oversized loads
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/about"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">About Us</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Our story and leadership
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/news"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">News</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Latest updates and announcements
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/mission"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Mission & Values</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              What drives us forward
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/careers"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Careers</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Join our growing team
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/reviews"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Reviews</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              What our customers say
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/industries"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Industries</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Solutions by industry
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/referral-program"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Referral Program</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Earn $250 for each referral
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/resources"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Resources</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Educational guides for carriers
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/locations" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Locations
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <a 
              href="tel:+18885704564"
              onClick={() => {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'phone_click', {
                    phone_number: '+18885704564',
                    page: window.location.pathname,
                  });
                }
              }}
              className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Phone className="mr-1.5 h-4 w-4" />
              1-888-570-4564
            </a>
            <Link to="/login">
              <Button variant="ghost">Customer Login</Button>
            </Link>
            <Link to="/get-started">
              <Button className="bg-secondary hover:bg-secondary/90">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-4 pb-4">
              <Link
                to="/dry-van-trailer-leasing"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dry Van Leasing
              </Link>
              <Link
                to="/flatbed-trailer-leasing"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Flatbed Leasing
              </Link>
              <Link
                to="/semi-trailer-leasing"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Semi Trailer Leasing
              </Link>
              <Link
                to="/services/trailer-rentals"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trailer Rentals
              </Link>
              <Link
                to="/services/fleet-solutions"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fleet Solutions
              </Link>
              <div className="text-xs font-semibold text-muted-foreground pt-2">Equipment Types</div>
              <Link
                to="/dry-van-trailers"
                className="text-sm font-medium text-foreground hover:text-primary pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dry Van Trailers
              </Link>
              <Link
                to="/flatbed-trailers"
                className="text-sm font-medium text-foreground hover:text-primary pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Flatbed Trailers
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/news"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/mission"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mission & Values
              </Link>
              <Link
                to="/careers"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Careers
              </Link>
              <Link
                to="/reviews"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                to="/industries"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Industries
              </Link>
              <Link
                to="/referral-program"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Referral Program
              </Link>
              <Link
                to="/resources"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                to="/locations"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Locations
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-border space-y-3">
                <a 
                  href="tel:+18885704564" 
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'phone_click', {
                        phone_number: '+18885704564',
                        page: window.location.pathname,
                      });
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  <Button className="w-full bg-primary hover:bg-primary/90 text-lg">
                    <Phone className="mr-2 h-5 w-5" />
                    1-888-570-4564
                  </Button>
                </a>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Customer Login</Button>
                </Link>
                <Link to="/get-started" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
