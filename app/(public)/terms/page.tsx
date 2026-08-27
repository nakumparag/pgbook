export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <h1 className="text-4xl font-heading font-black mb-8 text-foreground">
          Terms & Conditions
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
          <p className="lead font-medium text-foreground">Last updated: August 2026</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">1. Acceptance</h2>
          <p>
            By accessing or using PGBook, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our platform.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">2. User Accounts</h2>
          <p>
            You are responsible for safeguarding the password that you use to access the platform and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">3. PG Listings & Platform Limitations</h2>
          <p>
            PGBook acts strictly as a discovery platform connecting potential tenants with property owners. <strong>We do not guarantee the condition, safety, or absolute accuracy of third-party property listings unless explicitly verified with a &quot;Verified&quot; badge.</strong>
          </p>
          <p>
            Any rental agreements, financial transactions, or disputes are solely between the tenant and the property owner.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">4. Owner Responsibilities</h2>
          <p>
            If you list a property on PGBook, you agree to provide accurate, current, and complete information. You must not list properties you do not have the legal right to rent out.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">5. User Responsibilities & Reviews</h2>
          <p>
            Users agree to use the platform respectfully. Any reviews or ratings submitted must be based on actual experiences and must not contain offensive, defamatory, or prohibited content.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">6. Listing Verification</h2>
          <p>
            While PGBook attempts to verify listings for authenticity, we cannot be held liable for any discrepancies or issues that arise post-booking. Users are advised to visit the property in person before making financial commitments.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">7. Third Party Services & Intellectual Property</h2>
          <p>
            Our service may contain links to third-party web sites or services that are not owned or controlled by PGBook. All platform design, code, and original content is the intellectual property of PGBook.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">8. Termination</h2>
          <p>
            We may terminate or suspend access to our platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">9. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at <a href="mailto:legal@pgbook.com" className="text-primary hover:underline">legal@pgbook.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
