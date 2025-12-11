import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, FileText, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ApplicationStatusTrackerProps {
  userId: string;
}

type StatusStep = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
};

const statusSteps: StatusStep[] = [
  { id: "new", label: "Application Started", description: "Begin your application", icon: FileText },
  { id: "pending_review", label: "Under Review", description: "Our team is reviewing", icon: Clock },
  { id: "approved", label: "Approved", description: "Application approved", icon: CheckCircle2 },
];

export function ApplicationStatusTracker({ userId }: ApplicationStatusTrackerProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [hasApplication, setHasApplication] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [reviewedAt, setReviewedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchApplicationStatus();
  }, [userId]);

  const fetchApplicationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("status, created_at, reviewed_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHasApplication(true);
        setStatus(data.status);
        setCreatedAt(data.created_at);
        setReviewedAt(data.reviewed_at);
      } else {
        setHasApplication(false);
      }
    } catch (error) {
      console.error("Error fetching application status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!status) return -1;
    if (status === "rejected") return 2; // Show at review step but with rejection styling
    const index = statusSteps.findIndex(step => step.id === status);
    return index >= 0 ? index : 0;
  };

  const isStepComplete = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    return stepIndex < currentIndex || (stepIndex === currentIndex && status === "approved");
  };

  const isCurrentStep = (stepIndex: number) => {
    return stepIndex === getCurrentStepIndex() && status !== "approved";
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!hasApplication) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">You haven't started an application yet.</p>
            <Button asChild>
              <Link to="/get-started">Start Application</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isRejected = status === "rejected";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Application Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                isRejected ? "bg-destructive" : "bg-primary"
              )}
              style={{ 
                width: `${Math.min(100, ((getCurrentStepIndex() + (status === "approved" ? 1 : 0.5)) / (statusSteps.length - 1)) * 100)}%` 
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isComplete = isStepComplete(index);
              const isCurrent = isCurrentStep(index);
              const showRejected = isRejected && index === 2;

              return (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 bg-background transition-all",
                      isComplete && !showRejected && "border-primary bg-primary text-primary-foreground",
                      isCurrent && !showRejected && "border-primary text-primary",
                      showRejected && "border-destructive bg-destructive text-destructive-foreground",
                      !isComplete && !isCurrent && !showRejected && "border-muted text-muted-foreground"
                    )}
                  >
                    {showRejected ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium",
                      (isComplete || isCurrent) && !showRejected && "text-foreground",
                      showRejected && "text-destructive",
                      !isComplete && !isCurrent && !showRejected && "text-muted-foreground"
                    )}
                  >
                    {showRejected ? "Rejected" : step.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 max-w-[100px]">
                    {showRejected ? "Contact us for details" : step.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Details */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-4 text-sm">
            {createdAt && (
              <div>
                <span className="text-muted-foreground">Submitted: </span>
                <span className="font-medium">{formatDate(createdAt)}</span>
              </div>
            )}
            {reviewedAt && (
              <div>
                <span className="text-muted-foreground">Reviewed: </span>
                <span className="font-medium">{formatDate(reviewedAt)}</span>
              </div>
            )}
          </div>

          {/* Status Message */}
          {status === "new" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Your application is being prepared. Complete all sections to submit for review.
            </p>
          )}
          {status === "pending_review" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Our team is reviewing your application. This typically takes 1-2 business days.
            </p>
          )}
          {status === "approved" && (
            <p className="mt-3 text-sm text-green-600 dark:text-green-400">
              Congratulations! Your application has been approved. Welcome to CRUMS Leasing!
            </p>
          )}
          {status === "rejected" && (
            <p className="mt-3 text-sm text-destructive">
              Your application was not approved. Please contact us at (888) 570-4564 for more information.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
