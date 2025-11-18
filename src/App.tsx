import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
