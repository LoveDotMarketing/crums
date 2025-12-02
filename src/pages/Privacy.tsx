import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy"
        description="CRUMS Leasing privacy policy. Learn how we collect, use, and protect your personal information when you use our trailer leasing services."
        canonical="https://crumsleasing.com/privacy"
      />
      <Navigation />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground">Last updated: December 2, 2025</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                CRUMS Leasing collects information you provide directly to us, including your name, 
                email address, phone number, company information, and any other information you choose 
                to provide when requesting quotes, applying for leasing services, or contacting us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and respond to your inquiries and requests</li>
                <li>Provide, maintain, and improve our trailer leasing services</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to outside parties 
                except to trusted third parties who assist us in operating our website, conducting our 
                business, or servicing you, so long as those parties agree to keep this information confidential.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                <strong>CRUMS Leasing</strong><br />
                4070 FM1863<br />
                Bulverde, TX 78163<br />
                Phone: (480) 749-8996<br />
                Email: info@crumsleasing.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
