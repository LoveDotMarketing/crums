import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { trackPageView } from "@/lib/analytics";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";

// Lazy load all other pages
const Mission = lazy(() => import("./pages/Mission"));
const About = lazy(() => import("./pages/About"));
const TeamMemberPage = lazy(() => import("./pages/about/TeamMemberPage"));
const Services = lazy(() => import("./pages/Services"));
const TrailerLeasing = lazy(() => import("./pages/TrailerLeasing"));
const TrailerRentals = lazy(() => import("./pages/TrailerRentals"));
const FleetSolutions = lazy(() => import("./pages/FleetSolutions"));
const DryVanTrailers = lazy(() => import("./pages/DryVanTrailers"));
const RefrigeratedTrailers = lazy(() => import("./pages/RefrigeratedTrailers"));
const FlatbedTrailers = lazy(() => import("./pages/FlatbedTrailers"));
const TrailerProfile56171 = lazy(() => import("./pages/TrailerProfile56171"));
const Locations = lazy(() => import("./pages/Locations"));
const Contact = lazy(() => import("./pages/Contact"));
const Careers = lazy(() => import("./pages/Careers"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const Review = lazy(() => import("./pages/Review"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Resources = lazy(() => import("./pages/Resources"));
const CostPerMileCalculator = lazy(() => import("./pages/resources/CostPerMileCalculator"));
const LeasevsBuyCalculator = lazy(() => import("./pages/resources/LeasevsBuyCalculator"));
const ProfitPerLoadCalculator = lazy(() => import("./pages/resources/ProfitPerLoadCalculator"));
const IFTACalculator = lazy(() => import("./pages/resources/IFTACalculator"));
const FuelCostCalculator = lazy(() => import("./pages/resources/FuelCostCalculator"));
const TaxDeductionGuide = lazy(() => import("./pages/resources/TaxDeductionGuide"));
const Tools = lazy(() => import("./pages/resources/Tools"));
const Guides = lazy(() => import("./pages/resources/Guides"));
const ChoosingTrailer = lazy(() => import("./pages/resources/guides/ChoosingTrailer"));

// News pages
const News = lazy(() => import("./pages/News"));
const NewsArticlePage = lazy(() => import("./pages/news/NewsArticlePage"));

// Industries pages
const Industries = lazy(() => import("./pages/Industries"));
const FleetLeasing = lazy(() => import("./pages/industries/FleetLeasing"));
const OwnerOperators = lazy(() => import("./pages/industries/OwnerOperators"));
const LogisticsCompanies = lazy(() => import("./pages/industries/LogisticsCompanies"));
const FoodDistribution = lazy(() => import("./pages/industries/FoodDistribution"));
const RetailDistribution = lazy(() => import("./pages/industries/RetailDistribution"));
const Manufacturing = lazy(() => import("./pages/industries/Manufacturing"));
const SeasonalDemand = lazy(() => import("./pages/industries/SeasonalDemand"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Fleet = lazy(() => import("./pages/admin/Fleet"));
const TrailerDetail = lazy(() => import("./pages/admin/TrailerDetail"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const Mechanics = lazy(() => import("./pages/admin/Mechanics"));
const Tolls = lazy(() => import("./pages/admin/Tolls"));
const Billing = lazy(() => import("./pages/admin/Billing"));
const Support = lazy(() => import("./pages/admin/Support"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Outreach = lazy(() => import("./pages/admin/Outreach"));
const Referrals = lazy(() => import("./pages/admin/Referrals"));
const Staff = lazy(() => import("./pages/admin/Staff"));
const SitemapGenerator = lazy(() => import("./pages/admin/SitemapGenerator"));

// Public pages
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));

// Customer pages
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const Profile = lazy(() => import("./pages/customer/Profile"));
const Rentals = lazy(() => import("./pages/customer/Rentals"));
const RentalRequest = lazy(() => import("./pages/customer/RentalRequest"));
const Application = lazy(() => import("./pages/customer/Application"));

// Mechanic pages
const MechanicDashboard = lazy(() => import("./pages/mechanic/MechanicDashboard"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Analytics tracker component for SPA navigation
const AnalyticsTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AnalyticsTracker />
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/:slug" element={<TeamMemberPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/trailer-leasing" element={<TrailerLeasing />} />
            <Route path="/services/trailer-rentals" element={<TrailerRentals />} />
            <Route path="/services/fleet-solutions" element={<FleetSolutions />} />
            <Route path="/dry-van-trailers" element={<DryVanTrailers />} />
            <Route path="/refrigerated-trailers" element={<RefrigeratedTrailers />} />
            <Route path="/flatbed-trailers" element={<FlatbedTrailers />} />
            <Route path="/commercial-dry-van-trailer-for-lease-56171" element={<TrailerProfile56171 />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/fleet-leasing" element={<FleetLeasing />} />
            <Route path="/industries/owner-operators" element={<OwnerOperators />} />
            <Route path="/industries/logistics-companies" element={<LogisticsCompanies />} />
            <Route path="/industries/food-distribution" element={<FoodDistribution />} />
            <Route path="/industries/retail-distribution" element={<RetailDistribution />} />
            <Route path="/industries/manufacturing" element={<Manufacturing />} />
            <Route path="/industries/seasonal-demand" element={<SeasonalDemand />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/fleet" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Fleet />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/fleet/:trailerId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TrailerDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/customers" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Customers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/mechanics" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Mechanics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/tolls" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Tolls />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/billing" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Billing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/support" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Support />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/reports" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/analytics" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/outreach" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Outreach />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/referrals" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Referrals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/staff" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Staff />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/sitemap-generator" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <SitemapGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/application"
              element={
                <ProtectedRoute requiredRole="customer">
                  <Application />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/profile" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/rentals" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <Rentals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/request" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <RentalRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/mechanic"
              element={
                <ProtectedRoute requiredRole="mechanic">
                  <MechanicDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/guides" element={<Guides />} />
            <Route path="/resources/guides/choosing-trailer" element={<ChoosingTrailer />} />
            {/* Redirects for old guide URLs */}
            <Route path="/guides" element={<Navigate to="/resources/guides" replace />} />
            <Route path="/guides/choosing-trailer" element={<Navigate to="/resources/guides/choosing-trailer" replace />} />
            <Route path="/resources/tools" element={<Tools />} />
<Route path="/resources/tools/cost-per-mile" element={<CostPerMileCalculator />} />
<Route path="/resources/tools/lease-vs-buy" element={<LeasevsBuyCalculator />} />
<Route path="/resources/tools/profit-calculator" element={<ProfitPerLoadCalculator />} />
<Route path="/resources/tools/ifta-calculator" element={<IFTACalculator />} />
<Route path="/resources/tools/fuel-calculator" element={<FuelCostCalculator />} />
<Route path="/resources/tools/tax-deductions" element={<TaxDeductionGuide />} />
            <Route path="/referral-program" element={<ReferralProgram />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsArticlePage />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/qr" element={<Navigate to="/review" replace />} />
            <Route path="/review" element={<Review />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
