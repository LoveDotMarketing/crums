import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "customer" | "mechanic";
}

// Sales role can access admin routes
const isAdminLike = (role: string | null) => role === "admin" || role === "sales";

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, isLoading, effectiveRole, isImpersonating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login");
      } else if (requiredRole && !isImpersonating) {
        // Sales can access admin routes
        const hasRole = userRole === requiredRole || 
          (requiredRole === "admin" && isAdminLike(userRole));
        if (!hasRole) {
          if (isAdminLike(userRole)) {
            navigate("/dashboard/admin");
          } else if (userRole === "customer") {
            navigate("/dashboard/customer");
          } else if (userRole === "mechanic") {
            navigate("/dashboard/mechanic");
          }
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
    (requiredRole === "admin" && isAdminLike(userRole)) ||
    (isImpersonating && effectiveRole === requiredRole);

  if (!user || (requiredRole && !hasAccess)) {
    return null;
  }

  return <>{children}</>;
}
