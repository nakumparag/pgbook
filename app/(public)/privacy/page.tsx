export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <h1 className="text-4xl font-heading font-black mb-8 text-foreground">
          Privacy Policy
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
          <p className="lead font-medium text-foreground">Last updated: October 2026</p>
          
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">1. Information We Collect</h2>
          <p>
            When you use PGBook, we collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Authentication Data:</strong> Your name, email address, and authentication tokens provided by Supabase or Google Auth.</li>
            <li><strong>Profile Data:</strong> Information you choose to add to your profile, such as phone numbers, avatar images, and preferences.</li>
            <li><strong>Property Data:</strong> For PG Owners, we collect property addresses, images, pricing, and amenities.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">2. How We Use Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide, maintain, and improve our discovery platform.</li>
            <li>Verify properties and user identities to ensure safety.</li>
            <li>Communicate with you regarding owner inquiries and platform updates.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">3. Cookies</h2>
          <p>
            We use cookies to maintain your authentication session and save your preferences. For more details, please read our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">4. Third Party Services</h2>
          <p>
            PGBook utilizes third-party services to function:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Supabase:</strong> Used for database storage and secure user authentication.</li>
            <li><strong>Google Authentication:</strong> Provides secure OAuth login options.</li>
          </ul>
          <p>
            These services have their own privacy policies governing how they handle your data.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">6. Data Retention and User Rights</h2>
          <p>
            We retain your data as long as your account is active. You have the right to request access to, modification of, or deletion of your personal data at any time by contacting our support team.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">7. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please use the contact options on our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
