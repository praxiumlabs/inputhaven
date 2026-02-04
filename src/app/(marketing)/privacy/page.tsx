import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: January 2024</p>

      <div className="mt-8 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p className="mt-2">
            We collect information you provide when creating an account (name, email, password) and form submission data
            that your users submit through forms you create. We also collect IP addresses and user agents for rate limiting
            and spam prevention.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p className="mt-2">
            We use your information to provide the InputHaven service: delivering form submissions to your email,
            displaying submissions in your dashboard, and enforcing rate limits. We do not sell your data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Data Storage</h2>
          <p className="mt-2">
            Your data is stored on PostgreSQL databases hosted by Neon and file uploads on Cloudflare R2.
            All data is encrypted in transit (TLS) and at rest.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Data Retention</h2>
          <p className="mt-2">
            Form submission data is retained according to your plan level. Free accounts retain data for 30 days.
            You can delete your data at any time from the dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Third-Party Services</h2>
          <p className="mt-2">
            We use the following third-party services: Lemon Squeezy (payments), Resend (email delivery),
            Upstash (rate limiting), Cloudflare (file storage), and Vercel (hosting).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
          <p className="mt-2">
            If you have questions about this policy, contact us at privacy@inputhaven.com.
          </p>
        </section>
      </div>
    </div>
  );
}
