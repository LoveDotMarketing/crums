import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  title?: string;
  className?: string;
}

export const PrintButton = ({ title = "Print / Save as PDF", className = "" }: PrintButtonProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className={`print:hidden ${className}`}
    >
      <Printer className="h-4 w-4 mr-2" />
      {title}
    </Button>
  );
};
