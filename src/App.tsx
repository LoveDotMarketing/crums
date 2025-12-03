import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";

// Lazy load all other pages
const Mission = lazy(() => import("./pages/Mission"));
const About = lazy(() => import("./pages/About"));
const TrailerLeasing = lazy(() => import("./pages/TrailerLeasing"));
const TrailerRentals = lazy(() => import("./pages/TrailerRentals"));
const FleetSolutions = lazy(() => import("./pages/FleetSolutions"));
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/about" element={<About />} />
            <Route path="/services/trailer-leasing" element={<TrailerLeasing />} />
            <Route path="/services/trailer-rentals" element={<TrailerRentals />} />
            <Route path="/services/fleet-solutions" element={<FleetSolutions />} />
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
            <Route path="/referral-program" element={<ReferralProgram />} />
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
