import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Privacy Policy | CRUMS Leasing",
  "description": "CRUMS Leasing privacy policy. Learn how we collect, use, and protect your personal information when you use our trailer leasing services.",
  "url": "https://crumsleasing.com/privacy",
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com"
  }
};

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy"
        description="CRUMS Leasing privacy policy. Learn how we collect, use, and protect your personal information when you use our trailer leasing services."
        canonical="https://crumsleasing.com/privacy"
        structuredData={webPageSchema}
      />
      <Navigation />
      <Breadcrumbs />

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
                7450 Prue Rd #2<br />
                San Antonio, TX 78249<br />
                Phone: (888) 570-4564
              </p>
              <p className="pt-4">
                <a href="/contact" className="text-primary hover:underline font-medium">
                  Visit our Contact Page →
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <RelatedLinksSection
        title="Explore CRUMS Leasing"
        subtitle="Learn more about our services and commitment to carriers"
        links={[
          { to: "/terms", label: "Terms of Service", description: "Review the terms governing our trailer leasing services." },
          { to: "/dry-van-trailer-leasing", label: "Dry Van Trailer Leasing", description: "53' dry van trailers with flexible lease terms." },
          { to: "/get-started", label: "Apply Now", description: "Start your lease application — fast and easy online process." },
          { to: "/commercial-dry-van-trailer-for-lease-56171", label: "Browse Available Trailers", description: "See our 2020 Great Dane dry van with full inspection details." },
          { to: "/contact", label: "Contact Us", description: "Questions about our privacy practices? Reach out anytime." },
          { to: "/mission", label: "Our Mission & Values", description: "People-first values that guide everything we do." },
        ]}
      />

      <Footer />
    </div>
  );
};

export default Privacy;
