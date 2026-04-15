import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Terms of Service | CRUMS Leasing",
  "description": "CRUMS Leasing terms of service. Read about the terms and conditions governing your use of our trailer leasing and rental services.",
  "url": "https://crumsleasing.com/terms",
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com"
  }
};

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Terms of Service"
        description="CRUMS Leasing terms of service. Read about the terms and conditions governing your use of our trailer leasing and rental services."
        canonical="https://crumsleasing.com/terms"
        structuredData={webPageSchema}
      />
      <Navigation />
      <Breadcrumbs />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground">Last updated: December 2, 2025</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the CRUMS Leasing website and services, you accept and agree 
                to be bound by these Terms of Service. If you do not agree to these terms, please 
                do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Services</h2>
              <p>
                CRUMS Leasing provides trailer leasing and rental services, including 53-foot dry van 
                trailers and flatbed trailers. All leasing agreements are subject to separate contractual 
                terms and conditions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Leasing Terms</h2>
              <p>
                Our minimum leasing term is 12 months. Specific terms, pricing, and conditions will be 
                outlined in individual lease agreements. All lease agreements must be signed by authorized 
                representatives.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Payment Terms & Suspension Policy</h2>
              <p>
                CRUMS Leasing utilizes automatic payment processing for all lease agreements. 
                By entering into a lease agreement, you agree to the following payment terms:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Security Deposit:</strong> A $1,000 security deposit is required before trailer pickup</li>
                <li><strong>First Month's Rent:</strong> Your first monthly lease payment will be automatically charged 15 days after your deposit is paid</li>
                <li><strong>Automatic Payments:</strong> After the first payment, recurring payments are automatically charged on your selected billing cycle (weekly, bi-weekly, or monthly)</li>
                <li><strong>Failed Payment Notifications:</strong> If a payment fails, you will receive email notifications at Day 0, Day 3, and Day 5</li>
                <li><strong>Grace Period:</strong> A 7-day grace period begins after any failed payment attempt</li>
                <li><strong>Account Suspension:</strong> Failure to resolve payment within 7 days will result in account suspension and restricted trailer access</li>
                <li><strong>Service Reinstatement:</strong> Service is automatically reinstated upon receipt of full payment</li>
                <li><strong>Manual Override:</strong> CRUMS Leasing reserves the right to manually override suspension in rare, approved cases at our sole discretion</li>
              </ul>
              <p>
                During suspension, you remain responsible for any toll charges, maintenance fees, or other costs 
                associated with the leased equipment until it is returned to CRUMS Leasing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. User Responsibilities</h2>
              <p>Users of our services agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of account credentials</li>
                <li>Use leased equipment in accordance with all applicable laws and regulations</li>
                <li>Report any damage or issues promptly</li>
                <li>Return equipment in the condition specified in the lease agreement</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
              <p>
                CRUMS Leasing shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages arising out of or relating to your use of our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Refund & Cancellation Policy</h2>
              <p>
                All payments made to Crum's Leasing LLC are subject to standard banking processing timelines:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>ACH Bank Payments:</strong> ACH transactions require 7–10 business days to fully process and settle. During this period, funds are held by the payment processor and cannot be reversed or refunded immediately.</li>
                <li><strong>Credit Card Payments:</strong> Credit card refunds may take 5–10 business days to appear on your statement after processing begins.</li>
                <li><strong>Refund Processing:</strong> If you cancel your lease or request a refund, processing will begin only after the original transaction has fully settled.</li>
                <li><strong>Manual Refund Obligation:</strong> If a manual refund is issued (via any method) and the original payment subsequently fails, is declined, or is reversed by your financial institution, you agree to promptly return the refunded amount within 5 business days of notification.</li>
                <li><strong>Interest on Unreturned Funds:</strong> Failure to return funds within the 5 business day period will result in a daily interest charge of 1.5% on the outstanding balance until fully repaid.</li>
                <li><strong>Legal Remedies:</strong> Crum's Leasing LLC reserves the right to pursue all available legal remedies, including but not limited to collections, court action, and recovery of attorney fees, for any unreturned funds.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting to this website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
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
        title="Related Pages"
        subtitle="More information about CRUMS Leasing and our services"
        links={[
          { to: "/privacy", label: "Privacy Policy", description: "Learn how we collect, use, and protect your information." },
          { to: "/dry-van-trailer-leasing", label: "Dry Van Trailer Leasing", description: "Explore lease options for our 53' dry van trailers." },
          { to: "/flatbed-trailer-leasing", label: "Flatbed Trailer Leasing", description: "Flatbed trailers for heavy haul and specialized freight." },
          { to: "/commercial-dry-van-trailer-for-lease-56171", label: "View a Trailer Profile", description: "See full specs, photos, and inspection details on Unit 56171." },
          { to: "/get-started", label: "Start Your Application", description: "Apply online in minutes with our streamlined process." },
          { to: "/why-choose-crums", label: "Why Choose CRUMS", description: "Family-owned, carrier-focused — see why drivers trust us." },
        ]}
      />

      <Footer />
    </div>
  );
};

export default Terms;
