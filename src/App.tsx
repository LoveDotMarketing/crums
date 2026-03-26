import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { trackPageView } from "@/lib/analytics";
import { captureLeadSource } from "@/lib/leadSourceTracking";
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
const LeaseToOwnPage = lazy(() => import("./pages/LeaseToOwn"));
const RentForStorage = lazy(() => import("./pages/RentForStorage"));
const DryVanTrailers = lazy(() => import("./pages/DryVanTrailers"));
const FlatbedTrailers = lazy(() => import("./pages/FlatbedTrailers"));
const DryVanTrailerLeasing = lazy(() => import("./pages/DryVanTrailerLeasing"));
const FlatbedTrailerLeasing = lazy(() => import("./pages/FlatbedTrailerLeasing"));
const SemiTrailerLeasing = lazy(() => import("./pages/SemiTrailerLeasing"));
const TrailerProfile56171 = lazy(() => import("./pages/TrailerProfile56171"));
const TrailerProfile2027GreatDane = lazy(() => import("./pages/TrailerProfile2027GreatDane"));
const TrailerProfile2027GreatDaneFlatbed = lazy(() => import("./pages/TrailerProfile2027GreatDaneFlatbed"));
const Locations = lazy(() => import("./pages/Locations"));
const CityLocationPage = lazy(() => import("./pages/locations/CityLocationPage"));
const Contact = lazy(() => import("./pages/Contact"));
const Careers = lazy(() => import("./pages/Careers"));
const TrailerLeasingSalesRep = lazy(() => import("./pages/careers/TrailerLeasingSalesRep"));
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
const PerDiemCalculator = lazy(() => import("./pages/resources/PerDiemCalculator"));
const Tools = lazy(() => import("./pages/resources/Tools"));
const Guides = lazy(() => import("./pages/resources/Guides"));
const ChoosingTrailer = lazy(() => import("./pages/resources/guides/ChoosingTrailer"));
const WhyLeasingDryVan = lazy(() => import("./pages/resources/guides/WhyLeasingDryVan"));
const TrailerSpecifications = lazy(() => import("./pages/resources/guides/TrailerSpecifications"));
const PreTripInspection = lazy(() => import("./pages/resources/guides/PreTripInspection"));
const WinterDriving = lazy(() => import("./pages/resources/guides/WinterDriving"));
const MaintenanceSchedules = lazy(() => import("./pages/resources/guides/MaintenanceSchedules"));
const TireCare = lazy(() => import("./pages/resources/guides/TireCare"));
const GettingYourCDL = lazy(() => import("./pages/resources/guides/GettingYourCDL"));
const LoadBoardsGuide = lazy(() => import("./pages/resources/guides/LoadBoardsGuide"));
const FindingFirstLoads = lazy(() => import("./pages/resources/guides/FindingFirstLoads"));
const LeaseFirstTrailer = lazy(() => import("./pages/resources/guides/LeaseFirstTrailer"));
const OwnerOperatorBasics = lazy(() => import("./pages/resources/guides/OwnerOperatorBasics"));
const BreakdownSafety = lazy(() => import("./pages/resources/guides/BreakdownSafety"));
const RoadComfort = lazy(() => import("./pages/resources/guides/RoadComfort"));
const Budgeting = lazy(() => import("./pages/resources/guides/Budgeting"));
const TruckCooking = lazy(() => import("./pages/resources/guides/TruckCooking"));
const WorkLifeBalance = lazy(() => import("./pages/resources/guides/WorkLifeBalance"));
const MaximizeLease = lazy(() => import("./pages/resources/guides/MaximizeLease"));
const FuelEfficiency = lazy(() => import("./pages/resources/guides/FuelEfficiency"));
const TruckingCareer = lazy(() => import("./pages/resources/guides/TruckingCareer"));
const MentalHealth = lazy(() => import("./pages/resources/guides/MentalHealth"));
const WhyChooseCrums = lazy(() => import("./pages/WhyChooseCrums"));
const EmergencyTrailerRental = lazy(() => import("./pages/EmergencyTrailerRental"));
const VeteransMilitaryDiscount = lazy(() => import("./pages/VeteransMilitaryDiscount"));
const CrumsStory = lazy(() => import("./pages/CrumsStory"));

// News pages
const News = lazy(() => import("./pages/News"));
const NewsArticlePage = lazy(() => import("./pages/news/NewsArticlePage"));

// Landing pages (ad campaigns)
const LinkedInLanding = lazy(() => import("./pages/LinkedInLanding"));
const LinkedInThankYou = lazy(() => import("./pages/LinkedInThankYou"));
const FacebookLanding = lazy(() => import("./pages/FacebookLanding"));
const FacebookThankYou = lazy(() => import("./pages/FacebookThankYou"));
const GoogleLanding = lazy(() => import("./pages/GoogleLanding"));
const GoogleThankYou = lazy(() => import("./pages/GoogleThankYou"));
const MATS2026 = lazy(() => import("./pages/MATS2026"));
const MATS2026ThankYou = lazy(() => import("./pages/MATS2026ThankYou"));
const MATS2026QR = lazy(() => import("./pages/MATS2026QR"));
const PriceSheet = lazy(() => import("./pages/PriceSheet"));

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
const Applications = lazy(() => import("./pages/admin/Applications"));
const Fleet = lazy(() => import("./pages/admin/Fleet"));
const TrailerDetail = lazy(() => import("./pages/admin/TrailerDetail"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const CustomerDetail = lazy(() => import("./pages/admin/CustomerDetail"));
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
const Logs = lazy(() => import("./pages/admin/Logs"));
const LeadSources = lazy(() => import("./pages/admin/LeadSources"));
const IndexNow = lazy(() => import("./pages/admin/IndexNow"));
const DOTInspections = lazy(() => import("./pages/admin/DOTInspections"));
const CallLogs = lazy(() => import("./pages/admin/CallLogs"));
const ContentSchedule = lazy(() => import("./pages/admin/ContentSchedule"));
const AdminWorkOrders = lazy(() => import("./pages/admin/WorkOrders"));
const AdminArchivedTrailers = lazy(() => import("./pages/admin/AdminArchivedTrailers"));
const StaffDetail = lazy(() => import("./pages/admin/StaffDetail"));
const EmployeeDashboard = lazy(() => import("./pages/admin/EmployeeDashboard"));
const PhoneLeads = lazy(() => import("./pages/admin/PhoneLeads"));

// Public pages
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));
const Partners = lazy(() => import("./pages/Partners"));

// Customer pages
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const Profile = lazy(() => import("./pages/customer/Profile"));
const Rentals = lazy(() => import("./pages/customer/Rentals"));
const RentalRequest = lazy(() => import("./pages/customer/RentalRequest"));
const Application = lazy(() => import("./pages/customer/Application"));
const PaymentSetup = lazy(() => import("./pages/customer/PaymentSetup"));
const TrailerCheckout = lazy(() => import("./pages/customer/TrailerCheckout"));
const CheckoutComplete = lazy(() => import("./pages/customer/CheckoutComplete"));
const CustomerBilling = lazy(() => import("./pages/customer/Billing"));
const LeaseToOwn = lazy(() => import("./pages/customer/LeaseToOwn"));
const CustomerStatements = lazy(() => import("./pages/customer/Statements"));

// Mechanic pages
const MechanicDashboard = lazy(() => import("./pages/mechanic/MechanicDashboard"));
const DOTInspectionForm = lazy(() => import("./pages/mechanic/DOTInspectionForm"));
const MechanicWorkOrders = lazy(() => import("./pages/mechanic/WorkOrders"));
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
    // Capture lead source on first page load (before any navigation)
    captureLeadSource();
  }, []);
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null;
};

// Redirect /customer/* to /dashboard/customer/*
const CustomerRedirect = () => {
  const location = useLocation();
  const subpath = location.pathname.replace(/^\/customer/, '');
  return <Navigate to={`/dashboard/customer${subpath}`} replace />;
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
          <ImpersonationBanner />
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
            <Route path="/services/lease-to-own" element={<LeaseToOwnPage />} />
            <Route path="/services/rent-for-storage" element={<RentForStorage />} />
            <Route path="/dry-van-trailers" element={<DryVanTrailers />} />
            <Route path="/flatbed-trailers" element={<FlatbedTrailers />} />
            <Route path="/dry-van-trailer-leasing" element={<DryVanTrailerLeasing />} />
            <Route path="/flatbed-trailer-leasing" element={<FlatbedTrailerLeasing />} />
            <Route path="/semi-trailer-leasing" element={<SemiTrailerLeasing />} />
            {/* Redirect old refrigerated trailers page */}
            <Route path="/refrigerated-trailers" element={<Navigate to="/dry-van-trailer-leasing" replace />} />
            <Route path="/commercial-dry-van-trailer-for-lease-56171" element={<TrailerProfile56171 />} />
            <Route path="/2027-great-dane-dry-van-trailer-for-lease" element={<TrailerProfile2027GreatDane />} />
            <Route path="/2027-great-dane-flatbed-trailer-for-lease" element={<TrailerProfile2027GreatDaneFlatbed />} />
            <Route path="/why-choose-crums" element={<WhyChooseCrums />} />
            <Route path="/emergency-trailer-rental" element={<EmergencyTrailerRental />} />
            <Route path="/veterans-military-discount" element={<VeteransMilitaryDiscount />} />
            <Route path="/crums-story" element={<CrumsStory />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/fleet-leasing" element={<FleetLeasing />} />
            <Route path="/industries/owner-operators" element={<OwnerOperators />} />
            <Route path="/industries/logistics-companies" element={<LogisticsCompanies />} />
            <Route path="/industries/food-distribution" element={<FoodDistribution />} />
            <Route path="/industries/retail-distribution" element={<RetailDistribution />} />
            <Route path="/industries/manufacturing" element={<Manufacturing />} />
            <Route path="/industries/seasonal-demand" element={<SeasonalDemand />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/locations/:citySlug" element={<CityLocationPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/trailer-leasing-sales-rep" element={<TrailerLeasingSalesRep />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/get-started" element={<GetStarted />} />
            {/* Landing pages (ad campaigns) — no-index */}
            <Route path="/lp/linkedin" element={<LinkedInLanding />} />
            <Route path="/lp/linkedin/thank-you" element={<LinkedInThankYou />} />
            <Route path="/lp/facebook" element={<FacebookLanding />} />
            <Route path="/lp/facebook/thank-you" element={<FacebookThankYou />} />
            <Route path="/lp/google" element={<GoogleLanding />} />
            <Route path="/lp/google/thank-you" element={<GoogleThankYou />} />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/applications" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Applications />
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
              path="/dashboard/admin/archived-trailers" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminArchivedTrailers />
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
              path="/dashboard/admin/customers/:customerId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <CustomerDetail />
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
              path="/dashboard/admin/staff/:id" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <StaffDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/employee" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <EmployeeDashboard />
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
              path="/dashboard/admin/logs" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Logs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/lead-sources" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <LeadSources />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/indexnow" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <IndexNow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/dot-inspections" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <DOTInspections />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/content-schedule" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ContentSchedule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/call-logs" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <CallLogs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/phone-leads" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <PhoneLeads />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/work-orders" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminWorkOrders />
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
              path="/dashboard/customer/payment-setup"
              element={
                <ProtectedRoute requiredRole="customer">
                  <PaymentSetup />
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
              path="/dashboard/customer/checkout/:inspectionId" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <TrailerCheckout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/checkout/:inspectionId/complete" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CheckoutComplete />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/billing" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerBilling />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/statements" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerStatements />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/customer/lease-to-own" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <LeaseToOwn />
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
            <Route 
              path="/dashboard/mechanic/inspection"
              element={
                <ProtectedRoute requiredRole="mechanic">
                  <DOTInspectionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/mechanic/work-orders"
              element={
                <ProtectedRoute requiredRole="mechanic">
                  <MechanicWorkOrders />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/guides" element={<Guides />} />
            <Route path="/resources/guides/choosing-trailer" element={<ChoosingTrailer />} />
            <Route path="/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision" element={<WhyLeasingDryVan />} />
            <Route path="/resources/guides/trailer-specifications" element={<TrailerSpecifications />} />
            <Route path="/resources/guides/pre-trip-inspection" element={<PreTripInspection />} />
            <Route path="/resources/guides/winter-driving" element={<WinterDriving />} />
            <Route path="/resources/guides/maintenance-schedules" element={<MaintenanceSchedules />} />
            <Route path="/resources/guides/tire-care" element={<TireCare />} />
            {/* Redirects for old guide URLs */}
            <Route path="/insights/f/why-leasing-a-dry-van-trailer-is-a-smart-business-decision" element={<Navigate to="/resources/guides/why-leasing-a-dry-van-trailer-is-a-smart-business-decision" replace />} />
            <Route path="/guides" element={<Navigate to="/resources/guides" replace />} />
            <Route path="/guides/choosing-trailer" element={<Navigate to="/resources/guides/choosing-trailer" replace />} />
            <Route path="/resources/tools" element={<Tools />} />
<Route path="/resources/tools/cost-per-mile" element={<CostPerMileCalculator />} />
<Route path="/resources/tools/lease-vs-buy" element={<LeasevsBuyCalculator />} />
<Route path="/resources/tools/profit-calculator" element={<ProfitPerLoadCalculator />} />
<Route path="/resources/tools/ifta-calculator" element={<IFTACalculator />} />
<Route path="/resources/tools/fuel-calculator" element={<FuelCostCalculator />} />
<Route path="/resources/tools/tax-deductions" element={<TaxDeductionGuide />} />
<Route path="/resources/tools/per-diem-calculator" element={<PerDiemCalculator />} />
            <Route path="/resources/guides/getting-your-cdl" element={<GettingYourCDL />} />
            <Route path="/resources/guides/load-boards-guide" element={<LoadBoardsGuide />} />
            <Route path="/resources/guides/finding-first-loads" element={<FindingFirstLoads />} />
            <Route path="/resources/guides/lease-first-trailer" element={<LeaseFirstTrailer />} />
            <Route path="/resources/guides/owner-operator-basics" element={<OwnerOperatorBasics />} />
            <Route path="/resources/guides/breakdown-safety" element={<BreakdownSafety />} />
            <Route path="/resources/guides/road-comfort" element={<RoadComfort />} />
            <Route path="/resources/guides/budgeting" element={<Budgeting />} />
            <Route path="/resources/guides/truck-cooking" element={<TruckCooking />} />
            <Route path="/resources/guides/work-life-balance" element={<WorkLifeBalance />} />
            <Route path="/resources/guides/maximize-lease" element={<MaximizeLease />} />
            <Route path="/resources/guides/fuel-efficiency" element={<FuelEfficiency />} />
            <Route path="/resources/guides/trucking-career" element={<TruckingCareer />} />
            <Route path="/resources/guides/mental-health" element={<MentalHealth />} />
            <Route path="/referral-program" element={<ReferralProgram />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsArticlePage />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/qr" element={<Navigate to="/review" replace />} />
            <Route path="/review" element={<Review />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/mats2026" element={<MATS2026 />} />
            <Route path="/mats2026-thank-you" element={<MATS2026ThankYou />} />
            <Route path="/mats2026-qr" element={<MATS2026QR />} />
            {/* Redirect old /customer/* URLs to /dashboard/customer/* */}
            <Route path="/customer/*" element={<CustomerRedirect />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
