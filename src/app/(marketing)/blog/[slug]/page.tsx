import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import type { Metadata } from "next";

// ─── Blog post data ─────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  author: string;
  category: string;
  excerpt: string;
  readingTime: string;
  tags: string[];
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "why-form-backends",
    title: "Why You Should Use a Form Backend Instead of Building Your Own",
    date: "2025-01-15",
    author: "InputHaven Team",
    category: "Guide",
    excerpt: "Building a form handler sounds simple until you need spam filtering, email notifications, file uploads, rate limiting, and a dashboard. Here's why a form backend saves you weeks.",
    readingTime: "8 min read",
    tags: ["form backend", "developer tools", "productivity"],
    content: `## The deceptive simplicity of form handling

Every developer has thought it at some point: "I'll just build my own form handler. How hard can it be?"

The answer: it starts easy and gets complicated fast.

A basic form handler is maybe 20 lines of code. Receive POST data, validate it, store it, send an email. You could build that in an afternoon.

But then reality sets in.

## What you actually need

Here's what a production-ready form handler requires:

### Spam protection (week 1)
Your contact form goes live. Within 48 hours, you're getting submissions for cheap pharmaceuticals and cryptocurrency schemes. Now you need:

- **Honeypot fields** — invisible inputs that only bots fill in
- **Keyword filtering** — blocking common spam phrases
- **Rate limiting** — preventing brute-force spam attacks
- **Domain validation** — checking that the referring domain is legitimate
- **AI classification** — catching sophisticated spam that passes keyword filters

Each layer blocks different types of spam. You need all of them.

### Email delivery (week 2)
You set up SMTP or an email API. Now you need:

- **HTML email templates** — because plain text looks unprofessional
- **Custom subjects** — including form data in the subject line
- **Auto-responses** — confirming receipt to the person who submitted
- **Email routing** — sending sales inquiries to sales, support to support
- **Retry logic** — handling transient email delivery failures
- **Bounce handling** — managing invalid email addresses

### File uploads (week 3)
A client wants to accept resume uploads. Now you need:

- **File validation** — checking types and sizes
- **Secure storage** — S3, R2, or similar object storage
- **Signed URLs** — time-limited download links
- **Virus scanning** — if you're handling user uploads at scale

### Dashboard and API (week 4+)
You need to actually see and manage submissions:

- **Submissions list** — with search, filter, and pagination
- **Read/unread status** — tracking which submissions you've seen
- **CSV export** — for stakeholders who live in spreadsheets
- **REST API** — for programmatic access and integrations
- **Webhooks** — forwarding data to Slack, Zapier, your CRM

### Security and infrastructure (ongoing)
- **Authentication** — login, registration, password reset
- **Authorization** — team access controls
- **CORS configuration** — per-form domain allowlists
- **SSL/TLS** — end-to-end encryption
- **Monitoring** — uptime checks, error tracking
- **Backups** — database backup and recovery
- **Scaling** — handling traffic spikes

## The real cost

If you bill your time at $100/hour (a modest rate for a senior developer), building all of this costs:

| Component | Estimate |
|-----------|----------|
| Basic form handler | 4 hours |
| Spam protection | 16 hours |
| Email system | 12 hours |
| File uploads | 8 hours |
| Dashboard | 40 hours |
| API & webhooks | 20 hours |
| Auth & security | 24 hours |
| Testing & deployment | 16 hours |
| **Total** | **140 hours = $14,000** |

And that's before ongoing maintenance: dependency updates, security patches, infrastructure costs, and the opportunity cost of not building your actual product.

## The alternative

A form backend service like InputHaven handles all of this for $0–$29/month.

You get spam protection, email notifications, file uploads, a dashboard, REST API, webhooks, and team access — all maintained and updated by someone else.

The integration is one line of HTML:

\`\`\`html
<input type="hidden" name="_form_id" value="your-form-id" />
\`\`\`

That's the entire integration. Your form submits to our API, and everything else is handled.

## When to build your own

There are valid reasons to build a custom form handler:

- **Highly custom business logic** — like multi-step approval workflows
- **Tight database integration** — where form data maps directly to your domain models
- **Regulatory requirements** — where data must stay on specific infrastructure

For everything else — contact forms, feedback widgets, newsletter signups, lead capture, job applications — a form backend is the pragmatic choice.

## Getting started

InputHaven's free tier includes 500 submissions/month, 3 forms, email notifications, spam protection, and API access. No credit card required.

Create an account, get your form ID, add one line to your HTML form, and you're done.`,
  },
  {
    slug: "ai-spam-filtering",
    title: "How AI Spam Filtering Works in InputHaven",
    date: "2025-01-10",
    author: "InputHaven Team",
    category: "Feature",
    excerpt: "Traditional spam filters use keyword lists. InputHaven uses Claude to understand context and intent. Learn how our AI spam filtering catches what rule-based filters miss.",
    readingTime: "6 min read",
    tags: ["AI", "spam filtering", "Claude", "machine learning"],
    content: `## The problem with keyword-based spam filtering

Traditional spam filters work by matching keywords: "buy now", "click here", "free money". This approach has two fundamental problems:

1. **False positives** — A legitimate message saying "click here to see our pricing" gets flagged
2. **Easy to bypass** — Spammers use Unicode lookalikes, misspellings, and creative phrasing to dodge keyword lists

Spam has evolved. Spam filtering needs to evolve too.

## How InputHaven's spam protection works

InputHaven uses five layers of protection, each catching different types of spam:

### Layer 1: Honeypot fields
We generate an invisible form field. Real users never see it, but automated bots fill it in. If the honeypot field has a value, the submission is spam. This catches the majority of basic bots with zero impact on legitimate users.

### Layer 2: Rate limiting
Each form endpoint has per-IP rate limits. If someone submits 50 times in a minute, that's not a human. Rate limiting prevents brute-force spam attacks and protects your submission quota.

### Layer 3: Domain allowlists
You can configure which domains are allowed to submit to your form. If a submission comes from an unauthorized domain, it's rejected. This prevents form hijacking and unauthorized embedding.

### Layer 4: Keyword filtering
We maintain a curated list of common spam phrases and patterns. This catches low-effort spam that uses known spam terminology. The keyword filter is fast and runs on every submission at no cost.

### Layer 5: AI classification (Starter+ plans)
This is where it gets interesting. On Starter plans and above, submissions that pass the first four layers are analyzed by Claude — Anthropic's AI model.

## How the AI layer works

When a submission reaches the AI layer, here's what happens:

1. **Data preparation** — We extract all form field values and truncate to 2,000 characters (enough for classification, small enough for fast processing)

2. **Context-aware analysis** — Claude analyzes the submission considering:
   - Is this coherent human language or generated gibberish?
   - Does the content match what a legitimate form submission would contain?
   - Are there subtle spam indicators like excessive URLs, promotional language, or social engineering?
   - Does the "email" field contain a disposable email service?

3. **Confidence scoring** — The AI returns a spam confidence score from 0–100 and a human-readable reason explaining why it made that decision

4. **Decision** — Submissions scoring above the threshold are marked as spam. The threshold is tuned to minimize false positives — we'd rather let one spam through than block a real submission.

## What makes AI filtering different

Consider these real examples:

**Example 1: Sophisticated spam**
> "Hi, I noticed your website and thought you might be interested in our SEO services. We've helped companies like yours increase traffic by 300%. Let me know if you'd like a free consultation."

A keyword filter might not catch this — there are no obvious spam words. But Claude recognizes the pattern: unsolicited commercial outreach with inflated claims and a sales pitch.

**Example 2: Legitimate message that looks like spam**
> "I want to buy your product. Can you send me pricing for 100 units? I need them delivered free to our warehouse by Friday."

A keyword filter might flag "buy" and "free". But Claude understands context: this is a genuine purchase inquiry.

**Example 3: Unicode evasion**
> "Ⅽheck out this аmazing оffer — frеe сryрto!"

Spammers use Cyrillic lookalikes to bypass keyword filters. Claude reads the rendered text and catches the spam regardless of character encoding tricks.

## Graceful degradation

The AI layer is designed to fail safely:

- If the Anthropic API is unavailable, the submission passes through (we don't block legitimate users due to third-party downtime)
- If the AI takes too long, we fall back to keyword-only filtering
- AI results are logged but never the sole reason for rejection — the other four layers provide baseline protection

## The numbers

In our testing:

- **Honeypot alone** catches ~70% of spam
- **Honeypot + keywords** catches ~85% of spam
- **All five layers** catch ~98% of spam
- **False positive rate** with AI: <0.1%

## How to enable it

AI spam filtering is available on Starter plans ($5/mo) and above. To enable it:

1. Go to your form settings in the dashboard
2. Toggle on "AI Spam Filtering"
3. That's it — no configuration needed

Every submission will show its spam score and classification reason in the dashboard, so you can audit the AI's decisions.

## Cost

AI spam filtering uses Claude Haiku — Anthropic's fastest, most affordable model. The cost per classification is approximately $0.0003 (three hundredths of a cent). Even at 10,000 submissions/month, AI spam filtering costs less than $3 in API calls. This is absorbed into your plan price — there's no per-submission charge.`,
  },
  {
    slug: "react-contact-form",
    title: "Build a Contact Form in React with InputHaven",
    date: "2025-01-05",
    author: "InputHaven Team",
    category: "Tutorial",
    excerpt: "A step-by-step guide to building a production-ready contact form in React. Includes form validation, loading states, error handling, and spam protection.",
    readingTime: "10 min read",
    tags: ["React", "tutorial", "contact form", "JavaScript"],
    content: `## What we're building

A production-ready contact form with:

- Client-side validation
- Loading states and error handling
- Honeypot spam protection
- Success confirmation
- Accessible markup

No backend code required. InputHaven handles everything server-side.

## Prerequisites

- A React project (Create React App, Vite, or similar)
- An InputHaven account (free tier is fine)
- A form created in the InputHaven dashboard

## Step 1: Basic form structure

Start with a simple form that posts to InputHaven:

\`\`\`jsx
function ContactForm() {
  return (
    <form
      action="https://inputhaven.com/api/v1/submit"
      method="POST"
    >
      <input type="hidden" name="_form_id" value="your-form-id" />

      <label htmlFor="name">Name</label>
      <input type="text" id="name" name="name" required />

      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" required />

      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required />

      <button type="submit">Send Message</button>
    </form>
  );
}
\`\`\`

This works as-is — the form submits via standard HTML form submission. But for a better user experience, let's handle submission with JavaScript.

## Step 2: JavaScript submission with fetch

\`\`\`jsx
import { useState } from "react";

function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch(
        "https://inputhaven.com/api/v1/submit",
        {
          method: "POST",
          body: new FormData(e.target),
          headers: { Accept: "application/json" },
        }
      );

      if (response.ok) {
        setStatus("success");
        e.target.reset();
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="alert">
        <h3>Message sent!</h3>
        <p>Thank you for reaching out. We'll get back to you soon.</p>
        <button onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_form_id" value="your-form-id" />

      <label htmlFor="name">Name</label>
      <input type="text" id="name" name="name" required />

      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" required />

      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required />

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
\`\`\`

Key points:

- **\`Accept: application/json\`** tells InputHaven to return JSON instead of redirecting
- **\`FormData\`** automatically serializes all form fields
- **Loading state** disables the button to prevent double submission
- **Error handling** shows server errors and network errors

## Step 3: Add honeypot spam protection

Add an invisible field that bots will fill in but humans won't:

\`\`\`jsx
{/* Add this inside your form */}
<div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
  <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
</div>
\`\`\`

InputHaven checks the \`_gotcha\` field. If it has a value, the submission is rejected as spam.

## Step 4: Client-side validation

Add validation before submitting:

\`\`\`jsx
function validateForm(formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || name.length < 2) return "Please enter your name.";
  if (!email || !email.includes("@")) return "Please enter a valid email.";
  if (!message || message.length < 10) return "Please enter a message (at least 10 characters).";

  return null;
}

// In handleSubmit, before the fetch call:
const validationError = validateForm(new FormData(e.target));
if (validationError) {
  setError(validationError);
  setStatus("error");
  return;
}
\`\`\`

## Step 5: Accessibility

Make the form accessible:

- **Labels** — every input has an associated \`<label>\`
- **Required fields** — use the \`required\` attribute and \`aria-required="true"\`
- **Error messages** — use \`role="alert"\` so screen readers announce errors
- **Focus management** — on error, focus the first invalid field
- **Disabled state** — use \`aria-disabled\` alongside \`disabled\`

## Complete example

Here's the full production-ready component:

\`\`\`jsx
import { useState, useRef } from "react";

export function ContactForm({ formId }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const formData = new FormData(e.target);

    // Client-side validation
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    if (!name || name.length < 2) {
      setError("Please enter your name.");
      setStatus("error");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    if (!message || message.length < 10) {
      setError("Please enter a message (at least 10 characters).");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch(
        "https://inputhaven.com/api/v1/submit",
        {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        }
      );

      if (response.ok) {
        setStatus("success");
        e.target.reset();
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Failed to send. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="alert">
        <h3>Message sent!</h3>
        <p>Thank you. We'll respond within 24 hours.</p>
        <button onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="_form_id" value={formId} />

      {/* Honeypot */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          aria-required="true"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          aria-required="true"
          placeholder="jane@example.com"
        />
      </div>

      <div>
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          required
          aria-required="true"
          rows={5}
          placeholder="How can we help?"
        />
      </div>

      {error && (
        <p role="alert" style={{ color: "red" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
\`\`\`

Usage: \`<ContactForm formId="your-form-id" />\`

## Using @inputhaven/react

For an even simpler integration, use our React package:

\`\`\`bash
npm install @inputhaven/react
\`\`\`

\`\`\`jsx
import { InputHavenForm } from "@inputhaven/react";

function ContactPage() {
  return (
    <InputHavenForm formId="your-form-id">
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send</button>
    </InputHavenForm>
  );
}
\`\`\`

The package handles submission, loading states, error handling, and honeypot fields automatically.

## Next steps

- **Webhooks** — forward submissions to Slack or your CRM
- **Auto-responses** — send a confirmation email to the submitter
- **File uploads** — accept attachments (Starter plan and above)
- **AI spam filtering** — enable Claude-powered spam detection`,
  },
  {
    slug: "nextjs-form-handling",
    title: "Form Handling in Next.js: Server Actions vs API Routes vs Form Backend",
    date: "2024-12-20",
    author: "InputHaven Team",
    category: "Guide",
    excerpt: "Compare three approaches to handling forms in Next.js. When to use server actions, when to use API routes, and when to use a form backend service.",
    readingTime: "9 min read",
    tags: ["Next.js", "server actions", "API routes", "forms"],
    content: `## Three ways to handle forms in Next.js

Next.js gives you multiple ways to handle form submissions. Each has trade-offs. Let's compare them honestly.

## Option 1: Server Actions

Next.js 14+ introduced server actions — functions that run on the server and can be called directly from client components.

\`\`\`tsx
"use server";

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Validate
  if (!name || !email || !message) {
    return { error: "All fields are required" };
  }

  // Store in database
  await db.submission.create({
    data: { name, email, message },
  });

  // Send notification email
  await sendEmail({
    to: "you@example.com",
    subject: \`New contact from \${name}\`,
    body: message,
  });

  return { success: true };
}
\`\`\`

**Pros:**
- No API route needed — less boilerplate
- Type-safe end-to-end with TypeScript
- Progressive enhancement — works without JavaScript
- Built into Next.js — no extra dependencies

**Cons:**
- You still need to write the email sending logic
- You still need to set up spam protection
- You still need a database for storing submissions
- No dashboard for viewing submissions
- Tightly coupled to your Next.js app

**Best for:** Forms where submission data maps directly to your database models and you already have email infrastructure set up.

## Option 2: API Routes

The traditional approach — create a POST endpoint in \`app/api/\`:

\`\`\`tsx
// app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "All fields required" },
      { status: 400 }
    );
  }

  // Store, send email, etc.
  await db.submission.create({ data: { name, email, message } });
  await sendEmail({ /* ... */ });

  return NextResponse.json({ success: true });
}
\`\`\`

**Pros:**
- Standard REST pattern — works with any frontend
- Easy to test independently
- Can be consumed by mobile apps, other services
- Full control over request/response

**Cons:**
- Same as server actions: you own all the infrastructure
- More boilerplate than server actions
- Need to handle CORS if used cross-origin

**Best for:** Forms that need to be consumed by multiple frontends, or when you want a REST API for other integrations.

## Option 3: Form backend service (InputHaven)

Point your form directly at a third-party endpoint:

\`\`\`tsx
"use client";
import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("https://inputhaven.com/api/v1/submit", {
      method: "POST",
      body: new FormData(e.currentTarget),
      headers: { Accept: "application/json" },
    });

    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") return <p>Thank you! We'll be in touch.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_form_id" value="your-form-id" />
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
\`\`\`

**Pros:**
- Zero backend code — no server action, no API route
- Spam protection built in (honeypot, keywords, AI, rate limiting)
- Email notifications configured in dashboard
- Submissions dashboard with search and export
- File uploads, webhooks, auto-responses included
- Works if you move away from Next.js

**Cons:**
- Third-party dependency
- Monthly cost at scale (though free tier covers most use cases)
- Less control over server-side processing logic

**Best for:** Contact forms, feedback widgets, lead capture, newsletter signups, and any form where you don't need custom server-side business logic.

## Decision framework

| Question | Server Action | API Route | Form Backend |
|----------|--------------|-----------|--------------|
| Need custom business logic? | Yes | Yes | No |
| Need email notifications? | Build it | Build it | Included |
| Need spam protection? | Build it | Build it | Included |
| Need a submissions dashboard? | Build it | Build it | Included |
| Need file uploads? | Build it | Build it | Included |
| Need webhooks? | Build it | Build it | Included |
| Works without Next.js? | No | Maybe | Yes |
| Time to implement? | Hours–days | Hours–days | Minutes |

## The hybrid approach

You can combine approaches. Use server actions for forms tightly integrated with your app (like profile settings), and use InputHaven for standalone forms (like contact pages and feedback widgets).

This gives you the best of both worlds: custom logic where you need it, and zero maintenance where you don't.

## Getting started with InputHaven + Next.js

1. Create a free InputHaven account
2. Create a form in the dashboard
3. Copy the form ID
4. Use the code example above

The entire integration is one \`fetch\` call with a form ID. No API keys, no backend code, no database setup.`,
  },
  {
    slug: "conditional-email-routing",
    title: "Route Form Submissions to the Right Team with Email Routing Rules",
    date: "2024-12-15",
    author: "InputHaven Team",
    category: "Feature",
    excerpt: "Send sales inquiries to your sales team and support requests to support. Learn how to set up conditional email routing in InputHaven.",
    readingTime: "5 min read",
    tags: ["email routing", "automation", "workflow"],
    content: `## The problem

You have one contact form on your website. People use it for everything: sales inquiries, support requests, partnership proposals, job applications.

All of these go to one email inbox. Someone has to manually sort and forward each submission to the right person. That's a waste of time.

## The solution: conditional email routing

InputHaven's email routing rules let you automatically send submissions to different email addresses based on field values. No code changes required — configure it entirely in the dashboard.

## How it works

Each routing rule has four parts:

1. **Field** — which form field to check (e.g., "department", "inquiry_type", "subject")
2. **Operator** — how to match: equals, contains, starts with, or ends with
3. **Value** — the value to match against (case-insensitive)
4. **Email** — where to send matching submissions

When a submission comes in, InputHaven evaluates each rule in order. All matching rules fire — so a submission can go to multiple recipients if it matches multiple rules.

If no rules match, the submission goes to your form's default notification email.

## Example setup

Say your contact form has a "department" dropdown:

\`\`\`html
<select name="department" required>
  <option value="sales">Sales</option>
  <option value="support">Technical Support</option>
  <option value="billing">Billing</option>
  <option value="partnership">Partnerships</option>
</select>
\`\`\`

In the InputHaven dashboard, you'd set up these rules:

| Field | Operator | Value | Send to |
|-------|----------|-------|---------|
| department | equals | sales | sales@yourcompany.com |
| department | equals | support | support@yourcompany.com |
| department | equals | billing | billing@yourcompany.com |
| department | equals | partnership | partnerships@yourcompany.com |

Now each department automatically gets the inquiries meant for them.

## Advanced patterns

### Route by content keywords
If users don't select a category, you can route based on message content:

| Field | Operator | Value | Send to |
|-------|----------|-------|---------|
| message | contains | pricing | sales@yourcompany.com |
| message | contains | bug | support@yourcompany.com |
| message | contains | invoice | billing@yourcompany.com |

### Route by email domain
For B2B forms, route based on the submitter's email:

| Field | Operator | Value | Send to |
|-------|----------|-------|---------|
| email | ends with | @bigclient.com | vip-support@yourcompany.com |
| email | ends with | .edu | academic-sales@yourcompany.com |

### Multi-recipient routing
A submission can match multiple rules. If someone from bigclient.com submits a support request, it could go to both vip-support@ and support@ — ensuring VIP clients get fast attention.

## Setting it up

1. Go to **Dashboard → Forms → [Your Form] → Settings**
2. Scroll to **Email Routing Rules**
3. Click **Add Rule**
4. Configure field, operator, value, and email
5. Click **Save**

You can add up to 20 rules per form. Rules are evaluated in order, and all matching rules fire.

## Plan requirements

Email routing is available on **Starter** ($5/mo) plans and above. Free tier forms always send to a single notification email.

## Tips

- **Test your rules** by submitting test data through your form
- **Use specific operators** — "equals" is more precise than "contains"
- **Set a fallback** — your form's default email catches anything that doesn't match a rule
- **Keep it simple** — 3–5 rules covers most use cases. If you need more complex logic, consider using webhooks to forward to a custom backend.`,
  },
  {
    slug: "formspree-alternative",
    title: "InputHaven vs Formspree: A Detailed Comparison for 2025",
    date: "2024-12-10",
    author: "InputHaven Team",
    category: "Comparison",
    excerpt: "A detailed comparison of InputHaven and Formspree. See how InputHaven offers 10x more free submissions and 80% lower prices with more features.",
    readingTime: "7 min read",
    tags: ["Formspree", "comparison", "form backend", "pricing"],
    content: `## Why compare InputHaven and Formspree?

Formspree is one of the most well-known form backend services. It's been around since 2014 and has a solid product. But pricing and features have evolved since then, and newer alternatives offer more for less.

This is an honest comparison. We'll note where Formspree has advantages too.

## Pricing comparison

### Free tier

| | InputHaven | Formspree |
|--|-----------|-----------|
| Submissions/month | 500 | 50 |
| Forms | 3 | 1 |
| API access | Yes | No |
| File uploads | No | No |
| Webhooks | No | No |

InputHaven's free tier offers **10x more submissions** and **3x more forms**, plus API access that Formspree restricts to paid plans.

### Paid plans

| | InputHaven Starter | Formspree Starter |
|--|-------------------|-------------------|
| Price | $5/mo | $10/mo |
| Submissions | 2,500/mo | 1,000/mo |
| Forms | 25 | 10 |
| File uploads | Yes | Yes |
| Webhooks | Yes | Yes |

For half the price, InputHaven gives you 2.5x more submissions and 2.5x more forms.

### At scale

| | InputHaven Pro | Formspree Business |
|--|---------------|-------------------|
| Price | $12/mo | $25/mo |
| Submissions | 10,000/mo | 5,000/mo |
| Forms | Unlimited | Unlimited |

InputHaven Pro costs 52% less than Formspree Business and delivers 2x more submissions.

## Feature comparison

### Features InputHaven has that Formspree doesn't

1. **AI spam filtering** — Claude-powered spam detection that understands context and intent. Catches sophisticated spam that keyword filters miss. Available on Starter+.

2. **Conditional email routing** — Route submissions to different email addresses based on field values. Send sales inquiries to sales, support to support. Available on Starter+.

3. **Visual form builder** — Build forms visually in the dashboard and export production-ready HTML, React, or Next.js code.

4. **API on free tier** — Programmatic access to forms and submissions on the free plan. Formspree restricts API access to paid plans.

5. **OpenAPI specification** — Full API spec at /openapi.yaml. Generate typed clients in any language.

6. **LLM-friendly docs** — Machine-readable docs at /llms.txt for AI coding assistants.

### Features both services have

- Email notifications
- Custom auto-responders
- Spam protection (honeypot, keywords)
- File uploads (paid)
- Webhooks (paid)
- HMAC-signed webhooks
- Domain allowlists
- CSV export
- REST API (paid on Formspree)
- Submissions dashboard
- Custom redirect URLs
- reCAPTCHA support

### Features Formspree has that InputHaven doesn't

- **Longer track record** — Formspree has been around since 2014
- **Formspree CLI** — command-line tool for managing forms
- **React library** — @formspree/react (InputHaven also has @inputhaven/react)

## Migration guide

Switching from Formspree to InputHaven is straightforward:

1. Create an InputHaven account (free)
2. Create a form in the dashboard
3. Replace your form's \`action\` URL:

\`\`\`html
<!-- Before (Formspree) -->
<form action="https://formspree.io/f/xxxxxxx" method="POST">

<!-- After (InputHaven) -->
<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="your-form-id" />
\`\`\`

4. Configure email notifications in the InputHaven dashboard
5. That's it

Existing submissions stay in Formspree. New submissions go to InputHaven.

## Bottom line

If you're currently on Formspree or evaluating form backends, InputHaven offers:

- **10x more free submissions** (500 vs 50)
- **80% lower paid plan prices** ($5/mo vs $25/mo for comparable features)
- **AI spam filtering** that Formspree doesn't offer
- **Email routing** that Formspree doesn't offer
- **Free API access** that Formspree restricts to paid plans

The switch takes about 5 minutes.`,
  },
  {
    slug: "static-site-forms",
    title: "How to Add Forms to Static Sites (Astro, Hugo, Jekyll, 11ty)",
    date: "2024-12-05",
    author: "InputHaven Team",
    category: "Tutorial",
    excerpt: "Static sites can't process form submissions. Here's how to add working contact forms to Astro, Hugo, Jekyll, Eleventy, and other static site generators.",
    readingTime: "6 min read",
    tags: ["static sites", "Astro", "Hugo", "Jekyll", "Eleventy"],
    content: `## The static site form problem

Static site generators (Astro, Hugo, Jekyll, 11ty, Gatsby) produce plain HTML files. There's no server to process form submissions. When a user clicks "Submit", the data has nowhere to go.

You have three options:

1. Add a server-side component (defeats the purpose of static)
2. Use a serverless function (AWS Lambda, Vercel Functions, etc.)
3. Use a form backend service

Option 3 is the simplest. Here's how to do it with InputHaven.

## The universal approach: plain HTML

This works with every static site generator because it's just HTML:

\`\`\`html
<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="your-form-id" />

  <!-- Honeypot spam protection -->
  <div style="position: absolute; left: -9999px;" aria-hidden="true">
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
  </div>

  <label for="name">Name</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
\`\`\`

After submission, the user is redirected to a thank-you page. You can customize this with a \`_redirect\` field:

\`\`\`html
<input type="hidden" name="_redirect" value="https://yoursite.com/thank-you" />
\`\`\`

## Astro

Astro supports both static HTML and client-side JavaScript. For a static form:

\`\`\`astro
---
// src/pages/contact.astro
import Layout from "../layouts/Layout.astro";
---

<Layout title="Contact">
  <form action="https://inputhaven.com/api/v1/submit" method="POST">
    <input type="hidden" name="_form_id" value="your-form-id" />
    <input type="hidden" name="_redirect" value="/thank-you" />

    <label for="name">Name</label>
    <input type="text" id="name" name="name" required />

    <label for="email">Email</label>
    <input type="email" id="email" name="email" required />

    <label for="message">Message</label>
    <textarea id="message" name="message" required></textarea>

    <button type="submit">Send</button>
  </form>
</Layout>
\`\`\`

For a JavaScript-enhanced version with loading states, use an Astro island with React or Vue.

## Hugo

In Hugo, create a partial template:

\`\`\`html
<!-- layouts/partials/contact-form.html -->
<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="{{ .Site.Params.inputhavenFormId }}" />
  <input type="hidden" name="_redirect" value="{{ .Site.BaseURL }}thank-you/" />

  <div style="position: absolute; left: -9999px;" aria-hidden="true">
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
  </div>

  <label for="name">Name</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
\`\`\`

Add your form ID to \`config.toml\`:

\`\`\`toml
[params]
  inputhavenFormId = "your-form-id"
\`\`\`

## Jekyll

In Jekyll, create an include:

\`\`\`html
<!-- _includes/contact-form.html -->
<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="{{ site.inputhaven_form_id }}" />
  <input type="hidden" name="_redirect" value="{{ site.url }}/thank-you/" />

  <label for="name">Name</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
\`\`\`

## Eleventy (11ty)

Same HTML approach. In a Nunjucks template:

\`\`\`html
<!-- src/contact.njk -->
---
layout: base.njk
title: Contact
---

<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="{{ inputhavenFormId }}" />
  <input type="hidden" name="_redirect" value="/thank-you/" />

  <label for="name">Name</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
\`\`\`

## Key takeaway

The beauty of a form backend is that it works with **every** static site generator the same way: a standard HTML form with an action URL and a hidden form ID field. No plugins, no build steps, no server-side configuration.

Whether you're using Astro, Hugo, Jekyll, 11ty, Gatsby, or even hand-coded HTML — the integration is identical.`,
  },
  {
    slug: "form-security-best-practices",
    title: "Form Security Best Practices: Protecting Your Web Forms from Abuse",
    date: "2024-11-28",
    author: "InputHaven Team",
    category: "Guide",
    excerpt: "Web forms are one of the most attacked surfaces on the internet. Here are the security measures every form should have, and how InputHaven implements them.",
    readingTime: "8 min read",
    tags: ["security", "spam", "CSRF", "XSS", "best practices"],
    content: `## Why form security matters

Web forms are an open invitation for abuse. Any form on the public internet will receive:

- **Spam submissions** — automated and semi-automated junk
- **Injection attacks** — SQL injection, XSS payloads, command injection
- **Brute force attacks** — high-volume submissions to overwhelm your system
- **Phishing attempts** — using your form to send malicious emails
- **Data harvesting** — bots probing your form to find vulnerabilities

Here's how to defend against each.

## 1. Honeypot fields

A honeypot is an invisible form field that only bots can see. Real users never fill it in because it's hidden with CSS. If the field has a value, the submission is from a bot.

\`\`\`html
<div style="position: absolute; left: -9999px;" aria-hidden="true">
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
</div>
\`\`\`

This catches approximately 70% of spam bots with zero impact on user experience. No CAPTCHAs, no friction.

InputHaven supports honeypot fields natively — name any field \`_gotcha\` and submissions with a value in that field are automatically rejected.

## 2. Rate limiting

Every form endpoint should have rate limits:

- **Per-IP limits** — prevent a single source from flooding your form
- **Per-form limits** — prevent total submission volume from exceeding capacity
- **Sliding windows** — use time-based windows rather than hard resets

InputHaven enforces rate limits at the API level. Excessive submissions from a single IP are throttled with a 429 response.

## 3. Input validation

Never trust client-side validation alone. Always validate on the server:

- **Type checking** — ensure email fields contain valid emails
- **Length limits** — prevent oversized payloads (InputHaven caps submissions at 100KB)
- **Required fields** — reject submissions missing required data
- **Content sanitization** — strip HTML tags and script content from text fields

## 4. Domain allowlists (CORS)

Configure which domains can submit to your form. If a submission originates from an unauthorized domain, reject it.

\`\`\`
Allowed domains: yoursite.com, www.yoursite.com
\`\`\`

This prevents form hijacking — where someone embeds your form endpoint in their site to send spam through your account.

InputHaven lets you configure domain allowlists per form in the dashboard.

## 5. CSRF protection

Cross-Site Request Forgery (CSRF) attacks trick users into submitting forms they didn't intend to. Standard HTML forms are vulnerable because browsers automatically include cookies with form submissions.

For API-based submissions (using \`fetch\`), CSRF is less of a concern because you're not relying on cookies for authentication. The form ID itself is a public identifier — it's not a secret.

For additional protection, InputHaven verifies the \`Origin\` and \`Referer\` headers against your domain allowlist.

## 6. Content Security Policy

If your form sends email notifications, submitted data gets rendered in emails. This creates an XSS vector if you're not careful.

InputHaven sanitizes all submission data before including it in email notifications. HTML tags are escaped, and URLs are rendered as plain text rather than clickable links.

## 7. File upload security

If your form accepts file uploads:

- **Restrict file types** — only allow expected extensions (.pdf, .jpg, .png)
- **Check MIME types** — verify the actual file type matches the extension
- **Limit file sizes** — InputHaven caps uploads at 10MB per file
- **Store securely** — use signed URLs with expiration for downloads
- **Scan for malware** — at scale, consider virus scanning uploaded files

InputHaven stores uploads on Cloudflare R2 and generates time-limited signed download URLs. Files are never served directly from a public URL.

## 8. Webhook security

If you forward submissions to external services via webhooks, sign the payloads:

- **HMAC-SHA256** — cryptographically sign the webhook body with a shared secret
- **Timestamp validation** — include a timestamp and reject old payloads to prevent replay attacks
- **HTTPS only** — never send webhooks to HTTP endpoints

InputHaven signs all webhook payloads with HMAC-SHA256. Your webhook receiver can verify the signature to ensure the payload hasn't been tampered with.

## 9. AI-powered detection

Rule-based security catches known patterns. AI catches novel attacks:

- **Sophisticated spam** — grammatically correct but still unsolicited
- **Social engineering** — messages designed to trick humans into taking action
- **Obfuscated content** — Unicode tricks, invisible characters, encoded payloads

InputHaven's AI spam filtering analyzes submission content for these patterns using Claude. It's available on Starter plans and above.

## Checklist

Before launching any form into production:

- [ ] Honeypot field added
- [ ] Rate limiting configured
- [ ] Server-side input validation in place
- [ ] Domain allowlist configured
- [ ] File uploads restricted by type and size (if applicable)
- [ ] Webhook signatures verified (if applicable)
- [ ] Email content sanitized
- [ ] HTTPS enforced
- [ ] Monitoring and alerting set up

If you use InputHaven, all of these are handled automatically — except monitoring, which you can set up via webhooks to your own alerting system.`,
  },
  {
    slug: "webhook-integration-guide",
    title: "How to Set Up Webhooks: Forward Form Submissions to Slack, Zapier, and More",
    date: "2024-11-20",
    author: "InputHaven Team",
    category: "Tutorial",
    excerpt: "Connect your forms to Slack, Discord, Zapier, Make, n8n, or your own backend using InputHaven webhooks with HMAC-SHA256 verification.",
    readingTime: "7 min read",
    tags: ["webhooks", "Slack", "Zapier", "integrations", "automation"],
    content: `## What are webhooks?

Webhooks are HTTP callbacks. When an event happens (like a form submission), InputHaven sends a POST request to a URL you specify. The request body contains the submission data as JSON.

This lets you connect form submissions to virtually any service without writing polling logic.

## Setting up a webhook

1. Go to **Dashboard → Forms → [Your Form] → Settings**
2. In the **Webhook URL** field, enter the URL that should receive submissions
3. Save

That's it. Every new submission will now trigger a POST request to your webhook URL.

## Webhook payload

The webhook sends a JSON payload like this:

\`\`\`json
{
  "event": "submission.created",
  "form_id": "clx1234567890",
  "form_name": "Contact Form",
  "submission_id": "clx0987654321",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "I'd like to learn more about your enterprise plan."
  },
  "metadata": {
    "ip": "203.0.113.42",
    "user_agent": "Mozilla/5.0...",
    "referer": "https://yoursite.com/contact"
  }
}
\`\`\`

## Verifying webhook signatures

InputHaven signs every webhook payload with HMAC-SHA256. This lets you verify that the payload was sent by InputHaven and hasn't been tampered with.

The signature is included in the \`X-InputHaven-Signature\` header.

To verify in Node.js:

\`\`\`javascript
import crypto from "crypto";

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook handler:
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-inputhaven-signature"];
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process the submission...
  console.log("New submission:", req.body.data);
  res.json({ ok: true });
});
\`\`\`

## Integration: Slack

To send form submissions to a Slack channel:

1. Create a Slack Incoming Webhook at [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)
2. Copy the webhook URL (looks like \`https://hooks.slack.com/services/T.../B.../...\`)
3. Paste it as your InputHaven webhook URL

InputHaven formats the submission data as a readable Slack message automatically.

For custom formatting, use Zapier or a small serverless function as middleware.

## Integration: Discord

Discord supports Slack-compatible webhooks:

1. Go to your Discord channel → Edit Channel → Integrations → Webhooks
2. Create a new webhook and copy the URL
3. Append \`/slack\` to the URL (Discord's Slack compatibility endpoint)
4. Paste as your InputHaven webhook URL

## Integration: Zapier

Zapier can receive webhooks and connect to 5,000+ services:

1. Create a new Zap with "Webhooks by Zapier" as the trigger
2. Choose "Catch Hook"
3. Copy the webhook URL Zapier provides
4. Paste as your InputHaven webhook URL
5. Submit a test form to trigger the webhook
6. In Zapier, add an action (send email, add to Google Sheet, create CRM contact, etc.)

Common Zapier workflows:

- **Form → Google Sheets** — log all submissions in a spreadsheet
- **Form → Mailchimp** — add email to a mailing list
- **Form → HubSpot** — create a CRM contact
- **Form → Notion** — add a database entry

## Integration: Make (Integromat)

Similar to Zapier:

1. Create a new scenario with "Webhooks" module
2. Choose "Custom webhook"
3. Copy the URL and paste as your InputHaven webhook URL
4. Add processing modules for your desired workflow

## Integration: n8n (self-hosted)

If you're self-hosting n8n:

1. Add a Webhook node as the trigger
2. Set method to POST
3. Copy the production webhook URL
4. Paste as your InputHaven webhook URL

## Building your own webhook receiver

For a custom Node.js receiver:

\`\`\`javascript
import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook/inputhaven", (req, res) => {
  const { event, data, form_name } = req.body;

  if (event === "submission.created") {
    console.log(\`New submission on "\${form_name}":\`);
    console.log(data);

    // Your custom logic here:
    // - Save to your database
    // - Trigger a notification
    // - Update a CRM record
    // - Send a custom email
  }

  res.json({ received: true });
});

app.listen(3001, () => console.log("Webhook receiver running on :3001"));
\`\`\`

## Retry policy

If your webhook endpoint returns a non-2xx status code, InputHaven retries:

- 1st retry: 1 minute later
- 2nd retry: 5 minutes later
- 3rd retry: 30 minutes later

After 3 failed attempts, the webhook is marked as failed. You can view failed webhooks in the dashboard.

## Plan requirements

Webhooks are available on **Starter** ($5/mo) plans and above.`,
  },
  {
    slug: "visual-form-builder-guide",
    title: "Build Forms Visually and Export Production-Ready Code",
    date: "2024-11-15",
    author: "InputHaven Team",
    category: "Feature",
    excerpt: "InputHaven's visual form builder lets you drag, configure, and export forms as HTML, React, or Next.js code. No more writing form markup by hand.",
    readingTime: "5 min read",
    tags: ["form builder", "code generation", "React", "Next.js"],
    content: `## Why a visual form builder?

Writing form HTML is tedious. Not hard — just repetitive. Labels, inputs, validation attributes, placeholders, accessible markup. For a 10-field form, that's easily 100 lines of boilerplate.

InputHaven's form builder lets you configure fields visually and export production-ready code in HTML, React, or Next.js.

## How it works

### 1. Add fields

In the form builder (Dashboard → Forms → [Form] → Builder), click "Add Field" and choose from:

- **Text** — single-line text input
- **Email** — email input with validation
- **Textarea** — multi-line text
- **Select** — dropdown menu
- **Checkbox** — single checkbox (yes/no)
- **Radio** — radio button group
- **Hidden** — invisible field with a preset value

### 2. Configure each field

For each field, you can set:

- **Name** — the field's \`name\` attribute (used as the key in submission data)
- **Label** — human-readable label displayed to users
- **Placeholder** — hint text inside the input
- **Required** — whether the field must be filled in
- **Options** — for select and radio fields, the list of choices
- **Default value** — for hidden fields

### 3. Reorder fields

Use the up/down arrows to reorder fields. The order in the builder matches the order in the generated code.

### 4. Export code

Switch between three output formats:

**HTML** — standard \`<form>\` with action and method:

\`\`\`html
<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="your-form-id" />
  <label for="name">Name</label>
  <input type="text" id="name" name="name" placeholder="Jane Doe" required />
  <label for="email">Email</label>
  <input type="email" id="email" name="email" placeholder="jane@example.com" required />
  <button type="submit">Submit</button>
</form>
\`\`\`

**React** — functional component with fetch:

\`\`\`jsx
import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("https://inputhaven.com/api/v1/submit", {
      method: "POST",
      body: new FormData(e.target),
      headers: { Accept: "application/json" },
    });
    setStatus(res.ok ? "success" : "error");
  }

  // ... rendered form with all configured fields
}
\`\`\`

**Next.js** — client component with TypeScript and full state management:

\`\`\`tsx
"use client";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  // ... TypeScript component with error handling
}
\`\`\`

### 5. Copy and paste

Click the copy button next to any code output. Paste it into your project. Done.

## Features included automatically

The generated code includes:

- **Your form ID** — pre-filled with the correct value
- **Honeypot field** — if you've configured a honeypot field name
- **All validation** — required attributes, input types, placeholders
- **Accessible markup** — labels linked to inputs with \`for\`/\`id\`

## Saving your configuration

Click "Save" to persist your builder configuration. When you come back later, all your fields and settings are preserved. This is especially useful if you need to tweak a field and re-export the code.

## Tips

- **Start simple** — you can always add more fields later
- **Use meaningful names** — field names like "name", "email", "company" are clearer than "field1", "field2"
- **Test the output** — paste the generated code into your project and submit a test form
- **Iterate** — the builder is for prototyping. Once exported, you can customize the code further

## Limitations

The builder generates clean, standard code. It does not include:

- **Styling** — you'll apply your own CSS or component library styles
- **Multi-step forms** — the builder generates single-page forms
- **Conditional logic** — all fields are always visible (use JavaScript for show/hide logic)

For complex forms with custom styling and conditional logic, use the builder to generate the skeleton and customize from there.`,
  },
  {
    slug: "vue-svelte-form-integration",
    title: "Form Integration Guide for Vue and Svelte",
    date: "2024-11-08",
    author: "InputHaven Team",
    category: "Tutorial",
    excerpt: "Complete integration examples for Vue 3 (Composition API) and Svelte/SvelteKit with InputHaven. Loading states, error handling, and TypeScript included.",
    readingTime: "7 min read",
    tags: ["Vue", "Svelte", "SvelteKit", "integration", "tutorial"],
    content: `## Vue 3 (Composition API)

### Basic integration

\`\`\`vue
<script setup>
import { ref } from "vue";

const status = ref("idle"); // idle | submitting | success | error
const errorMsg = ref("");

async function handleSubmit(event) {
  status.value = "submitting";
  errorMsg.value = "";

  try {
    const response = await fetch("https://inputhaven.com/api/v1/submit", {
      method: "POST",
      body: new FormData(event.target),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      status.value = "success";
      event.target.reset();
    } else {
      const data = await response.json().catch(() => null);
      errorMsg.value = data?.error || "Something went wrong.";
      status.value = "error";
    }
  } catch {
    errorMsg.value = "Network error. Please try again.";
    status.value = "error";
  }
}
</script>

<template>
  <div v-if="status === 'success'">
    <h3>Message sent!</h3>
    <p>Thank you. We'll respond soon.</p>
    <button @click="status = 'idle'">Send another</button>
  </div>

  <form v-else @submit.prevent="handleSubmit">
    <input type="hidden" name="_form_id" value="your-form-id" />

    <!-- Honeypot -->
    <div style="position: absolute; left: -9999px" aria-hidden="true">
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
    </div>

    <div>
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required />
    </div>

    <div>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required />
    </div>

    <div>
      <label for="message">Message</label>
      <textarea id="message" name="message" required rows="4" />
    </div>

    <p v-if="errorMsg" role="alert" class="error">{{ errorMsg }}</p>

    <button type="submit" :disabled="status === 'submitting'">
      {{ status === "submitting" ? "Sending..." : "Send Message" }}
    </button>
  </form>
</template>
\`\`\`

### Nuxt 3

In Nuxt, the same component works as-is. Place it in \`components/ContactForm.vue\` and use it anywhere:

\`\`\`vue
<template>
  <ContactForm />
</template>
\`\`\`

No server middleware or API routes needed.

## Svelte

### Basic integration

\`\`\`svelte
<script>
  let status = "idle"; // idle | submitting | success | error
  let errorMsg = "";

  async function handleSubmit(event) {
    status = "submitting";
    errorMsg = "";

    try {
      const response = await fetch("https://inputhaven.com/api/v1/submit", {
        method: "POST",
        body: new FormData(event.target),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        status = "success";
        event.target.reset();
      } else {
        const data = await response.json().catch(() => null);
        errorMsg = data?.error || "Something went wrong.";
        status = "error";
      }
    } catch {
      errorMsg = "Network error. Please try again.";
      status = "error";
    }
  }
</script>

{#if status === "success"}
  <div>
    <h3>Message sent!</h3>
    <p>Thank you. We'll respond soon.</p>
    <button on:click={() => (status = "idle")}>Send another</button>
  </div>
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    <input type="hidden" name="_form_id" value="your-form-id" />

    <!-- Honeypot -->
    <div style="position: absolute; left: -9999px;" aria-hidden="true">
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
    </div>

    <div>
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required />
    </div>

    <div>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required />
    </div>

    <div>
      <label for="message">Message</label>
      <textarea id="message" name="message" required rows="4" />
    </div>

    {#if errorMsg}
      <p role="alert" class="error">{errorMsg}</p>
    {/if}

    <button type="submit" disabled={status === "submitting"}>
      {status === "submitting" ? "Sending..." : "Send Message"}
    </button>
  </form>
{/if}
\`\`\`

### SvelteKit

In SvelteKit, you can also use progressive enhancement with SvelteKit's \`use:enhance\`:

\`\`\`svelte
<script>
  // Same as above — SvelteKit doesn't require any special handling
  // for client-side form submission to external APIs
</script>
\`\`\`

SvelteKit's form actions are for server-side processing within your app. For external form backends like InputHaven, use client-side fetch as shown above.

## TypeScript support

Both Vue and Svelte support TypeScript. The form data types are simple:

\`\`\`typescript
interface SubmissionResponse {
  success: boolean;
  message?: string;
  submissionId?: string;
}

interface ErrorResponse {
  error: string;
}
\`\`\`

For full type safety with InputHaven's API, generate a typed client from our OpenAPI specification at \`/openapi.yaml\`.

## Using @inputhaven/js

For framework-agnostic integration, use our JavaScript package:

\`\`\`bash
npm install @inputhaven/js
\`\`\`

\`\`\`javascript
import { InputHaven } from "@inputhaven/js";

const client = new InputHaven("your-form-id");

const result = await client.submit({
  name: "Jane Doe",
  email: "jane@example.com",
  message: "Hello from Vue/Svelte!",
});

if (result.success) {
  // Submission successful
} else {
  // Handle error: result.error
}
\`\`\`

This works in Vue, Svelte, or any JavaScript environment.`,
  },
];

// ─── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://inputhaven.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

// ─── Markdown-ish renderer ──────────────────────────────────────────────────

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeader: string[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  function flushList() {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 space-y-1 pl-6 list-disc text-muted-foreground">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  }

  function flushTable() {
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {tableHeader.map((h, i) => (
                  <th key={i} className="pb-2 pr-4 text-left font-medium">{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {tableRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 pr-4 text-muted-foreground">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      tableHeader = [];
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${elements.length}`} className="my-6 overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100">
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Table rows
    if (line.startsWith("|") && line.endsWith("|")) {
      flushList();
      const cells = line.split("|").filter(Boolean);
      // Check if separator row
      if (cells.every((c) => c.trim().match(/^[-:]+$/))) continue;
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // List items
    if (line.startsWith("- ") || line.match(/^\d+\. /)) {
      flushTable();
      inList = true;
      const text = line.replace(/^- /, "").replace(/^\d+\. /, "");
      listItems.push(<li key={`li-${i}`}>{renderInline(text)}</li>);
      continue;
    } else if (inList && line.trim() === "") {
      // Blank line might end the list, or might not
      continue;
    } else if (inList) {
      flushList();
    }

    // Headings
    if (line.startsWith("## ")) {
      flushList();
      flushTable();
      elements.push(<h2 key={`h2-${i}`} className="mt-10 mb-4 text-2xl font-bold">{line.replace("## ", "")}</h2>);
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      flushTable();
      elements.push(<h3 key={`h3-${i}`} className="mt-8 mb-3 text-xl font-semibold">{line.replace("### ", "")}</h3>);
      continue;
    }

    // Checkbox list items
    if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const checked = line.startsWith("- [x] ");
      const text = line.replace(/^- \[.\] /, "");
      elements.push(
        <div key={`check-${i}`} className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={checked} readOnly className="h-4 w-4" />
          {text}
        </div>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === "") continue;

    // Paragraphs
    elements.push(<p key={`p-${i}`} className="my-3 leading-relaxed text-muted-foreground">{renderInline(line)}</p>);
  }

  flushList();
  flushTable();

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle inline code, bold, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(renderInlineFormatting(codeMatch[1], key++));
      parts.push(<code key={`ic-${key++}`} className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{codeMatch[2]}</code>);
      remaining = codeMatch[3];
      continue;
    }

    parts.push(renderInlineFormatting(remaining, key++));
    break;
  }

  return parts.length === 1 ? parts[0] : parts;
}

function renderInlineFormatting(text: string, baseKey: number): React.ReactNode {
  // Handle bold and links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = baseKey * 100;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*([\s\S]*)/);
    // Links
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)([\s\S]*)/);

    if (boldMatch && (!linkMatch || boldMatch.index! <= linkMatch.index!)) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(<strong key={`b-${key++}`} className="font-semibold text-foreground">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }

    if (linkMatch) {
      if (linkMatch[1]) parts.push(linkMatch[1]);
      parts.push(<a key={`a-${key++}`} href={linkMatch[3]} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">{linkMatch[2]}</a>);
      remaining = linkMatch[4];
      continue;
    }

    parts.push(remaining);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ─── Page component ─────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog" className="mt-4 inline-block text-primary hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  const postIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = postIndex > 0 ? posts[postIndex - 1] : null;
  const nextPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "InputHaven",
      url: "https://inputhaven.com",
    },
    url: `https://inputhaven.com/blog/${post.slug}`,
    keywords: post.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://inputhaven.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Back to blog
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {post.category}
            </span>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
        </header>

        <div className="mt-10">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
          <h3 className="text-xl font-bold">Ready to try InputHaven?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            500 free submissions/month. No credit card required.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Prev / Next navigation */}
        <nav className="mt-12 grid gap-4 sm:grid-cols-2">
          {prevPost && (
            <Link href={`/blog/${prevPost.slug}`} className="group rounded-lg border p-4 transition-colors hover:border-primary">
              <span className="text-xs text-muted-foreground">Previous</span>
              <p className="mt-1 text-sm font-medium group-hover:text-primary">{prevPost.title}</p>
            </Link>
          )}
          {nextPost && (
            <Link href={`/blog/${nextPost.slug}`} className="group rounded-lg border p-4 text-right transition-colors hover:border-primary sm:col-start-2">
              <span className="text-xs text-muted-foreground">Next</span>
              <p className="mt-1 text-sm font-medium group-hover:text-primary">{nextPost.title}</p>
            </Link>
          )}
        </nav>
      </article>
    </>
  );
}
