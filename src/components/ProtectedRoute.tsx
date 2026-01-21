import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "customer" | "mechanic";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, isLoading, effectiveRole, isImpersonating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login");
      } else if (requiredRole && !isImpersonating && userRole !== requiredRole) {
        // Only redirect if NOT impersonating - when impersonating, we use effectiveRole
        // Redirect to appropriate dashboard based on actual role
        if (userRole === "admin") {
          navigate("/dashboard/admin");
        } else if (userRole === "customer") {
          navigate("/dashboard/customer");
        } else if (userRole === "mechanic") {
          navigate("/dashboard/mechanic");
        }
      }
    }
  }, [user, userRole, isLoading, requiredRole, navigate, isImpersonating]);

  // Show loading state while auth is initializing OR while we're waiting for the role to load
  if (isLoading || (user && requiredRole && userRole === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access if:
  // 1. No role required, or
  // 2. User's actual role matches required role, or
  // 3. Admin is impersonating and the effective role matches the required role
  const hasAccess = !requiredRole || 
    userRole === requiredRole || 
    (isImpersonating && effectiveRole === requiredRole);

  if (!user || (requiredRole && !hasAccess)) {
    return null;
  }

  return <>{children}</>;
}
