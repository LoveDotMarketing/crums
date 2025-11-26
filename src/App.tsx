import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Mission from "./pages/Mission";
import About from "./pages/About";
import TrailerLeasing from "./pages/TrailerLeasing";
import TrailerRentals from "./pages/TrailerRentals";
import FleetSolutions from "./pages/FleetSolutions";
import Locations from "./pages/Locations";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Login from "./pages/Login";
import GetStarted from "./pages/GetStarted";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Fleet from "./pages/admin/Fleet";
import Customers from "./pages/admin/Customers";
import Mechanics from "./pages/admin/Mechanics";
import Tolls from "./pages/admin/Tolls";
import Billing from "./pages/admin/Billing";
import Support from "./pages/admin/Support";
import Reports from "./pages/admin/Reports";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Profile from "./pages/customer/Profile";
import Rentals from "./pages/customer/Rentals";
import RentalRequest from "./pages/customer/RentalRequest";
import Application from "./pages/customer/Application";
import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
import NotFound from "./pages/NotFound";
import Review from "./pages/Review";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
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
            <Route path="/qr" element={<Navigate to="/review" replace />} />
            <Route path="/review" element={<Review />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
