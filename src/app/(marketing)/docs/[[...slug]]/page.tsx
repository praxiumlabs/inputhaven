import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to integrate InputHaven with your website or application.",
};

const htmlExample = `<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="YOUR_FORM_ID" />
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>`;

const reactExample = `import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch("https://inputhaven.com/api/v1/submit", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setStatus("Message sent!");
      e.target.reset();
    } else {
      setStatus("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_form_id" value="YOUR_FORM_ID" />
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send</button>
      {status && <p>{status}</p>}
    </form>
  );
}`;

const ajaxExample = `const data = {
  _form_id: "YOUR_FORM_ID",
  name: "John Doe",
  email: "john@example.com",
  message: "Hello!"
};

const response = await fetch("https://inputhaven.com/api/v1/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

const result = await response.json();
// { success: true, submissionId: "..." }`;

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Documentation</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Learn how to integrate InputHaven with your website or application.
      </p>

      <nav className="mt-8 rounded-lg border p-4">
        <h2 className="font-semibold">On this page</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li><a href="#quick-start" className="text-primary hover:underline">Quick Start</a></li>
          <li><a href="#html-form" className="text-primary hover:underline">HTML Form</a></li>
          <li><a href="#react" className="text-primary hover:underline">React / Next.js</a></li>
          <li><a href="#ajax" className="text-primary hover:underline">AJAX / Fetch</a></li>
          <li><a href="#special-fields" className="text-primary hover:underline">Special Fields</a></li>
          <li><a href="#spam-protection" className="text-primary hover:underline">Spam Protection</a></li>
          <li><a href="#webhooks" className="text-primary hover:underline">Webhooks</a></li>
          <li><a href="#api" className="text-primary hover:underline">API Reference</a></li>
        </ul>
      </nav>

      <section id="quick-start" className="mt-12">
        <h2 className="text-2xl font-bold">Quick Start</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
          <li><Link href="/register" className="text-primary hover:underline">Create a free account</Link></li>
          <li>Create a new form in the dashboard</li>
          <li>Copy your form ID</li>
          <li>Add the form to your website</li>
          <li>Start receiving submissions</li>
        </ol>
      </section>

      <section id="html-form" className="mt-12">
        <h2 className="text-2xl font-bold">HTML Form</h2>
        <p className="mt-2 text-muted-foreground">
          The simplest integration. Works with any static site.
        </p>
        <Card className="mt-4">
          <CardContent className="relative p-0">
            <div className="absolute right-2 top-2">
              <CopyButton text={htmlExample} />
            </div>
            <pre className="overflow-x-auto p-4 text-sm"><code>{htmlExample}</code></pre>
          </CardContent>
        </Card>
      </section>

      <section id="react" className="mt-12">
        <h2 className="text-2xl font-bold">React / Next.js</h2>
        <p className="mt-2 text-muted-foreground">
          Use fetch to submit forms from React applications.
        </p>
        <Card className="mt-4">
          <CardContent className="relative p-0">
            <div className="absolute right-2 top-2">
              <CopyButton text={reactExample} />
            </div>
            <pre className="overflow-x-auto p-4 text-sm"><code>{reactExample}</code></pre>
          </CardContent>
        </Card>
      </section>

      <section id="ajax" className="mt-12">
        <h2 className="text-2xl font-bold">AJAX / Fetch</h2>
        <p className="mt-2 text-muted-foreground">
          Submit via JSON for full control over the request and response.
        </p>
        <Card className="mt-4">
          <CardContent className="relative p-0">
            <div className="absolute right-2 top-2">
              <CopyButton text={ajaxExample} />
            </div>
            <pre className="overflow-x-auto p-4 text-sm"><code>{ajaxExample}</code></pre>
          </CardContent>
        </Card>
      </section>

      <section id="special-fields" className="mt-12">
        <h2 className="text-2xl font-bold">Special Fields</h2>
        <div className="mt-4 space-y-4">
          <div>
            <code className="rounded bg-muted px-2 py-1 text-sm">_form_id</code>
            <span className="ml-2 text-muted-foreground">(required) Your form&apos;s unique ID</span>
          </div>
          <div>
            <code className="rounded bg-muted px-2 py-1 text-sm">_redirect</code>
            <span className="ml-2 text-muted-foreground">URL to redirect after submission</span>
          </div>
          <div>
            <code className="rounded bg-muted px-2 py-1 text-sm">_gotcha</code>
            <span className="ml-2 text-muted-foreground">Honeypot field for spam detection (should be hidden and empty)</span>
          </div>
        </div>
      </section>

      <section id="spam-protection" className="mt-12">
        <h2 className="text-2xl font-bold">Spam Protection</h2>
        <p className="mt-2 text-muted-foreground">InputHaven includes multiple layers of spam protection:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li><strong>Honeypot fields</strong> - Add a hidden field that bots will fill but humans won&apos;t</li>
          <li><strong>Keyword filtering</strong> - Automatic detection of common spam keywords</li>
          <li><strong>AI spam filtering</strong> - Claude-powered spam classification (Starter+ plans)</li>
          <li><strong>Rate limiting</strong> - Per-IP and per-form rate limits prevent abuse</li>
          <li><strong>Domain allowlist</strong> - Restrict which domains can submit to your form</li>
        </ul>
      </section>

      <section id="webhooks" className="mt-12">
        <h2 className="text-2xl font-bold">Webhooks</h2>
        <p className="mt-2 text-muted-foreground">
          Configure a webhook URL in your form settings to receive submissions via HTTP POST.
          Webhooks are signed with HMAC-SHA256 for verification.
        </p>
        <p className="mt-2 text-muted-foreground">
          The signature is sent in the <code className="rounded bg-muted px-2 py-1 text-sm">X-InputHaven-Signature</code> header.
        </p>
      </section>

      <section id="api" className="mt-12">
        <h2 className="text-2xl font-bold">API Reference</h2>
        <p className="mt-2 text-muted-foreground">
          Full API documentation is available at{" "}
          <code className="rounded bg-muted px-2 py-1 text-sm">/openapi.yaml</code>
        </p>
        <h3 className="mt-6 text-lg font-semibold">Submit a form</h3>
        <p className="mt-1 text-muted-foreground">
          <code className="rounded bg-muted px-2 py-1 text-sm">POST /api/v1/submit</code>
        </p>
        <p className="mt-2 text-muted-foreground">
          Accepts JSON, form-encoded, or multipart form data.
          Include <code className="rounded bg-muted px-2 py-1 text-sm">_form_id</code> in the body
          or <code className="rounded bg-muted px-2 py-1 text-sm">X-Form-Id</code> header.
        </p>
      </section>
    </div>
  );
}
