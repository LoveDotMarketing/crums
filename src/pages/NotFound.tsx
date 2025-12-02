import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Log 404 error to database
    const logError = async () => {
      try {
        await supabase.from("error_logs").insert({
          url: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error("Failed to log 404 error:", error);
      }
    };
    
    logError();
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | CRUMS Leasing</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
