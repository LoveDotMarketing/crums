import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

interface ApplicationAlertProps {
  userId: string;
}

export function ApplicationAlert({ userId }: ApplicationAlertProps) {
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [hasBankingInfo, setHasBankingInfo] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      const { data, error } = await supabase
        .from('customer_applications')
        .select('status, bank_name, drivers_license_url, ssn_card_url, insurance_docs_url')
        .eq('user_id', userId)
        .single();

      if (error || !data) return;

      setApplicationStatus(data.status);
      setHasBankingInfo(!!data.bank_name);
      setHasDocuments(!!(data.drivers_license_url && data.ssn_card_url && data.insurance_docs_url));
    };

    fetchApplicationStatus();
  }, [userId]);

  if (!applicationStatus) return null;

  // If application is incomplete
  if (applicationStatus === 'incomplete') {
    const missingItems = [];
    if (!hasBankingInfo) missingItems.push('Banking Information');
    if (!hasDocuments) missingItems.push('Required Documents');

    return (
      <Alert variant="default" className="border-secondary bg-secondary/10">
        <AlertCircle className="h-4 w-4 text-secondary" />
        <AlertTitle>Complete Your Application</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Your application is incomplete. Please complete the following to get approved faster:</p>
          <ul className="list-disc list-inside ml-2">
            {missingItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
  if (applicationStatus === 'pending' || applicationStatus === 'new') {
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

  // If application is approved
  if (applicationStatus === 'approved') {
    return (
      <Alert className="border-primary bg-primary/10">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertTitle>Application Approved</AlertTitle>
        <AlertDescription>
          Congratulations! Your application has been approved. You can now request trailers.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
