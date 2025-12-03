import { SEO } from "@/components/SEO";
import qrCode from "@/assets/crums-g-review.svg";

const Review = () => {
  return (
    <>
      <SEO
        title="Write a Google Review"
        description="Share your experience with CRUMS Leasing. Scan the QR code to leave us a Google review and help other carriers find quality trailer leasing services."
        canonical="https://crumsleasing.com/review"
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-foreground">
            Write Google Review
          </h1>
          <div className="flex justify-center">
            <img 
              src={qrCode} 
              alt="Google Review QR Code for CRUMS Leasing" 
              className="w-64 h-64"
              width={256}
              height={256}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Review;
