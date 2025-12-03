import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Terms of Service"
        description="CRUMS Leasing terms of service. Read about the terms and conditions governing your use of our trailer leasing and rental services."
        canonical="https://crumsleasing.com/terms"
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
              <h2 className="text-2xl font-semibold text-foreground">4. User Responsibilities</h2>
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
              <h2 className="text-2xl font-semibold text-foreground">5. Limitation of Liability</h2>
              <p>
                CRUMS Leasing shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages arising out of or relating to your use of our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting to this website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <p>
                <strong>CRUMS Leasing</strong><br />
                4070 FM1863<br />
                Bulverde, TX 78163<br />
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

      <Footer />
    </div>
  );
};

export default Terms;
