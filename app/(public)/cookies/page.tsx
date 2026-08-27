export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <h1 className="text-4xl font-heading font-black mb-8 text-foreground">
          Cookie Policy
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
          <p className="lead font-medium text-foreground">Last updated: August 2026</p>
          
          <p className="mb-6">
            This Cookie Policy explains how PGBook uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">1. What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">2. Essential Cookies</h2>
          <p>
            These cookies are strictly necessary to provide you with services available through our Website and to use some of its features.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Authentication Sessions:</strong> We use Supabase secure cookies to keep you logged in as you navigate between pages.</li>
            <li><strong>Security:</strong> Cookies help us detect malicious activities and violations of our Terms of Service.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">3. Preferences Cookies</h2>
          <p>
            These cookies allow our website to remember choices you make (such as your UI theme preference - light or dark mode) and provide enhanced, more personal features.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">4. Analytics (Future)</h2>
          <p>
            We plan to implement analytics cookies in the future to collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">5. Third Party Services</h2>
          <p>
            When you use Google Authentication to sign in to PGBook, Google may set cookies on your browser. We have no control over these third-party cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
