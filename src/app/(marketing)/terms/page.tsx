import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-muted-foreground">Last updated: January 2024</p>

      <div className="mt-8 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By using InputHaven, you agree to these terms. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Service Description</h2>
          <p className="mt-2">
            InputHaven provides a form backend service that collects form submissions, sends email notifications,
            and provides a dashboard for managing submissions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Acceptable Use</h2>
          <p className="mt-2">
            You may not use InputHaven for spam, phishing, or any illegal activity. We reserve the right to
            terminate accounts that violate this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Account Responsibility</h2>
          <p className="mt-2">
            You are responsible for maintaining the security of your account credentials and access keys.
            Do not share your API keys publicly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Billing</h2>
          <p className="mt-2">
            Paid plans are billed monthly or yearly. You can cancel at any time. Refunds are handled on a
            case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
          <p className="mt-2">
            InputHaven is provided &quot;as is&quot; without warranty. We are not liable for data loss, downtime,
            or any damages resulting from use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Contact us at legal@inputhaven.com.
          </p>
        </section>
      </div>
    </div>
  );
}
