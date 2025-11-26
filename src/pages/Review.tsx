import qrCode from "@/assets/crums-g-review.svg";

const Review = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          Write Google Review
        </h1>
        <div className="flex justify-center">
          <img 
            src={qrCode} 
            alt="Google Review QR Code" 
            className="w-64 h-64"
          />
        </div>
      </div>
    </div>
  );
};

export default Review;
