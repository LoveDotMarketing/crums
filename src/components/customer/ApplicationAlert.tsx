import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle, CreditCard } from "lucide-react";

interface ApplicationAlertProps {
  userId: string;
}

export function ApplicationAlert({ userId }: ApplicationAlertProps) {
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [paymentSetupStatus, setPaymentSetupStatus] = useState<string | null>(null);
  const [hasDocuments, setHasDocuments] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      const { data, error } = await supabase
        .from('customer_applications')
        .select('status, payment_setup_status, drivers_license_url, drivers_license_back_url, insurance_docs_url')
        .eq('user_id', userId)
        .single();

      if (error || !data) return;

      setApplicationStatus(data.status);
      setPaymentSetupStatus(data.payment_setup_status);
      setHasDocuments(!!(data.drivers_license_url && data.drivers_license_back_url && data.insurance_docs_url));
    };

    fetchApplicationStatus();
  }, [userId]);

  if (!applicationStatus) return null;

  // If application is incomplete
  if (applicationStatus === 'incomplete') {
    return (
      <Alert variant="default" className="border-secondary bg-secondary/10">
        <AlertCircle className="h-4 w-4 text-secondary" />
        <AlertTitle>Complete Your Application</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Your application is incomplete. Please upload required documents to get approved faster.</p>
          <Button 
            onClick={() => navigate('/customer/application')}
            size="sm"
            className="mt-2"
          >
            Complete Application
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // If application is pending review
  if (applicationStatus === 'pending' || applicationStatus === 'new' || applicationStatus === 'pending_review') {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Application Under Review</AlertTitle>
        <AlertDescription>
          Your application is being reviewed. We'll notify you once it's approved.
        </AlertDescription>
      </Alert>
    );
  }

  // Approved states are handled by ApplicationStatusTracker - no duplicate alerts needed
  return null;
}