import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check, Zap, Shield, Code, Mail, Webhook, BarChart3,
  ArrowRight, Brain, GitFork, Wand2, FileUp, Globe, Download,
} from "lucide-react";
import { PLANS } from "@/lib/plans";
import { CodeTabs } from "@/components/shared/code-tabs";
import { MobileNav } from "@/components/shared/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LiveDemoForm } from "@/components/shared/live-demo-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InputHaven - The Most Affordable Form Backend as a Service",
  description:
    "Collect HTML form submissions without a backend. 500 free submissions/month, AI spam filtering, email routing, visual form builder. Works with React, Vue, Svelte, Next.js. Starting at $0.",
  keywords: [
    "form backend", "form API", "form endpoint", "HTML form backend",
    "form submission handler", "Formspree alternative", "Getform alternative",
    "contact form backend", "form as a service", "serverless forms",
    "form backend API", "form backend service", "form handler",
  ],
  alternates: {
    canonical: "https://inputhaven.com",
  },
  openGraph: {
    title: "InputHaven - The Most Affordable Form Backend",
    description: "Collect form submissions without a backend. 500 free/month. AI spam filtering. Works with any frontend.",
    url: "https://inputhaven.com",
    siteName: "InputHaven",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InputHaven - Form Backend as a Service",
    description: "500 free submissions/month. AI spam filtering. Works with HTML, React, Vue, Next.js. Starts at $0.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "InputHaven",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "Form backend as a service. Collect HTML form submissions, get email notifications, fight spam with AI, and manage everything from a dashboard.",
  url: "https://inputhaven.com",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "500 submissions/month, 3 forms, email notifications, spam protection, API access",
    },
    {
      "@type": "Offer",
      name: "Starter",
      price: "5",
      priceCurrency: "USD",
      billingPeriod: "month",
      description: "2,500 submissions/month, 25 forms, file uploads, webhooks, AI spam filtering, email routing",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "12",
      priceCurrency: "USD",
      billingPeriod: "month",
      description: "10,000 submissions/month, unlimited forms, remove branding, priority support",
    },
    {
      "@type": "Offer",
      name: "Enterprise",
      price: "29",
      priceCurrency: "USD",
      billingPeriod: "month",
      description: "50,000 submissions/month, unlimited forms, unlimited team members, forever retention",
    },
  ],
  featureList: [
    "Email notifications",
    "AI spam filtering",
    "Conditional email routing",
    "Visual form builder",
    "Webhooks with HMAC signatures",
    "File uploads",
    "CSV export",
    "Domain allowlists",
    "Two-factor authentication",
    "REST API",
  ],
};

const frameworks = [
  "HTML", "React", "Next.js", "Vue", "Svelte", "Astro",
  "Remix", "Nuxt", "Angular", "Gatsby", "Hugo", "Jekyll",
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="text-xl font-bold">
              Input<span className="text-primary">Haven</span>
            </span>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
              </div>
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-4xl">
              <p className="text-sm font-medium text-primary">Form backend as a service</p>
              <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Stop building form backends.{" "}
                <span className="text-primary">Start shipping.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Point your HTML form to InputHaven and get instant submissions, email
                notifications, AI spam filtering, and a full dashboard. No server
                code. Works with every framework.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/register">
                    Start Free — 500 submissions/month
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <Link href="/docs">Read the Docs</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required. Free tier is free forever.
              </p>
            </div>
          </section>

          {/* Code example with interactive tabs */}
          <section className="animate-on-scroll border-y bg-muted/30 py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Add to any HTML form in 30 seconds
              </h2>
              <p className="mt-4 text-center text-muted-foreground">
                One hidden field. That&apos;s the entire integration. Pick your framework:
              </p>
              <div className="mt-8">
                <CodeTabs />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {frameworks.map((fw) => (
                  <span
                    key={fw}
                    className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Social proof */}
          <section className="animate-on-scroll py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-4 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary">500+</div>
                  <p className="mt-1 text-sm text-muted-foreground">Free submissions/month</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">5 layers</div>
                  <p className="mt-1 text-sm text-muted-foreground">Spam protection</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">12+</div>
                  <p className="mt-1 text-sm text-muted-foreground">Frameworks supported</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">80%</div>
                  <p className="mt-1 text-sm text-muted-foreground">Cheaper than Formspree</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key features grid */}
          <section className="animate-on-scroll py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Everything you need for form handling
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  From simple contact forms to complex multi-step workflows.
                </p>
              </div>
              <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: Zap,
                    title: "Instant Setup",
                    description: "Create a form endpoint in seconds. No server, no deployment, no configuration files. Just a URL.",
                  },
                  {
                    icon: Mail,
                    title: "Email Notifications",
                    description: "Get notified instantly when someone submits your form. Custom subjects, auto-responses, and HTML formatting.",
                  },
                  {
                    icon: Brain,
                    title: "AI Spam Filtering",
                    description: "Claude-powered spam detection that understands context, not just keywords. Blocks sophisticated spam that rule-based filters miss.",
                  },
                  {
                    icon: GitFork,
                    title: "Conditional Email Routing",
                    description: "Route submissions to different team members based on field values. Sales inquiries to sales, support to support.",
                  },
                  {
                    icon: Wand2,
                    title: "Visual Form Builder",
                    description: "Build forms visually and export production-ready HTML, React, or Next.js code. Copy, paste, done.",
                  },
                  {
                    icon: Shield,
                    title: "Multi-Layer Spam Protection",
                    description: "Honeypot fields, keyword filtering, AI detection, rate limiting, and domain allowlists. Five layers of defense.",
                  },
                  {
                    icon: Webhook,
                    title: "Webhooks",
                    description: "Forward submissions to Slack, Discord, Zapier, or your own backend. HMAC-SHA256 signed for security.",
                  },
                  {
                    icon: FileUp,
                    title: "File Uploads",
                    description: "Accept file uploads with submissions. Stored securely on Cloudflare R2 with signed download URLs.",
                  },
                  {
                    icon: Code,
                    title: "Works Everywhere",
                    description: "HTML forms, React, Vue, Svelte, Next.js, Astro, Angular — if it can make an HTTP request, it works.",
                  },
                  {
                    icon: BarChart3,
                    title: "Submissions Dashboard",
                    description: "View, search, filter, and manage all submissions. See spam scores, read status, and submission metadata.",
                  },
                  {
                    icon: Globe,
                    title: "CORS & Domain Control",
                    description: "Per-form domain allowlists ensure submissions only come from your authorized websites.",
                  },
                  {
                    icon: Download,
                    title: "CSV Export & API",
                    description: "Export submissions as CSV. Full REST API for programmatic access. Available on all plans including free.",
                  },
                ].map((feature) => (
                  <Card key={feature.title} className="border bg-card transition-shadow hover:shadow-md">
                    <CardHeader>
                      <feature.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="mt-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="animate-on-scroll border-y bg-muted/30 py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                How it works
              </h2>
              <div className="mt-16 grid gap-12 md:grid-cols-3">
                {[
                  { step: "1", title: "Create a form", description: "Sign up free and create a form endpoint in the dashboard. Get your unique form ID." },
                  { step: "2", title: "Add one line of HTML", description: "Add a hidden input with your form ID. Point your form action to our API. That's it." },
                  { step: "3", title: "Receive submissions", description: "Get email notifications, view submissions in the dashboard, forward via webhooks." },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Live demo form */}
          <section className="animate-on-scroll py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Try it right now
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  This form is powered by InputHaven. Fill it out and see how submissions work.
                </p>
              </div>
              <div className="mt-10">
                <LiveDemoForm />
              </div>
            </div>
          </section>

          {/* Competitor comparison */}
          <section className="animate-on-scroll border-y bg-muted/30 py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  More submissions. Less money. Better features.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  See how InputHaven compares to other form backends.
                </p>
              </div>
              <div className="mt-12 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-4 text-left font-medium">Feature</th>
                      <th className="pb-4 text-center font-bold text-primary">InputHaven</th>
                      <th className="pb-4 text-center font-medium text-muted-foreground">Formspree</th>
                      <th className="pb-4 text-center font-medium text-muted-foreground">Web3Forms</th>
                      <th className="pb-4 text-center font-medium text-muted-foreground">Getform</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { feature: "Free submissions/mo", ih: "500", fs: "50", wf: "250", gf: "50" },
                      { feature: "Price for 2,500 subs", ih: "$5/mo", fs: "$25/mo", wf: "$8/mo", gf: "$16/mo" },
                      { feature: "API on free tier", ih: "Yes", fs: "No", wf: "Yes", gf: "No" },
                      { feature: "AI spam filtering", ih: "Yes", fs: "No", wf: "No", gf: "No" },
                      { feature: "Email routing rules", ih: "Yes", fs: "No", wf: "No", gf: "No" },
                      { feature: "Visual form builder", ih: "Yes", fs: "No", wf: "No", gf: "Yes" },
                      { feature: "Webhooks", ih: "From $5/mo", fs: "From $25/mo", wf: "No", gf: "From $16/mo" },
                      { feature: "File uploads", ih: "From $5/mo", fs: "From $25/mo", wf: "From $8/mo", gf: "From $16/mo" },
                      { feature: "Open API spec", ih: "Yes", fs: "No", wf: "No", gf: "No" },
                    ].map((row) => (
                      <tr key={row.feature}>
                        <td className="py-3 font-medium">{row.feature}</td>
                        <td className="py-3 text-center font-semibold text-primary">{row.ih}</td>
                        <td className="py-3 text-center text-muted-foreground">{row.fs}</td>
                        <td className="py-3 text-center text-muted-foreground">{row.wf}</td>
                        <td className="py-3 text-center text-muted-foreground">{row.gf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/vs/formspree">InputHaven vs Formspree</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/vs/getform">InputHaven vs Getform</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="animate-on-scroll py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Simple, transparent pricing
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Start free. Upgrade when you need more. Cancel anytime.
                </p>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Object.values(PLANS).map((plan) => (
                  <Card key={plan.name} className={plan.name === "Pro" ? "border-primary shadow-lg relative" : ""}>
                    {plan.name === "Pro" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <div>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        {plan.price > 0 && <span className="text-muted-foreground">/mo</span>}
                      </div>
                      {plan.yearlyPrice > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ${plan.yearlyPrice}/yr (save ${plan.price * 12 - plan.yearlyPrice})
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="mt-6 w-full" variant={plan.name === "Pro" ? "default" : "outline"} asChild>
                        <Link href="/register">{plan.price === 0 ? "Start Free" : "Get Started"}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Use cases */}
          <section className="animate-on-scroll border-y bg-muted/30 py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Built for every use case
              </h2>
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "Contact Forms", description: "The classic use case. Add a contact form to your marketing site in under a minute." },
                  { title: "Feedback Widgets", description: "Collect user feedback from your app. Use the JSON API for seamless integration." },
                  { title: "Newsletter Signups", description: "Collect email addresses and forward to your email marketing tool via webhooks." },
                  { title: "Job Applications", description: "Accept resumes and cover letters with file uploads. Route to the right hiring manager." },
                  { title: "Event Registration", description: "Registration forms with conditional routing. Sales team to sales, technical to engineering." },
                  { title: "Lead Generation", description: "Capture leads from landing pages. Auto-respond instantly. Forward to your CRM via webhook." },
                ].map((uc) => (
                  <div key={uc.title} className="rounded-lg border p-6">
                    <h3 className="font-semibold">{uc.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{uc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Developer experience */}
          <section className="animate-on-scroll py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Developer-first design
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Everything a developer expects from a form backend.
                </p>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {[
                  { title: "REST API on every plan", description: "Programmatic access to forms and submissions, even on the free tier. No upgrade required." },
                  { title: "OpenAPI specification", description: "Full API spec at /openapi.yaml. Generate typed clients in any language." },
                  { title: "npm packages", description: "@inputhaven/react for React apps, @inputhaven/js for vanilla JavaScript. Type-safe." },
                  { title: "HMAC-signed webhooks", description: "Verify webhook authenticity with SHA-256 HMAC signatures. No guessing if it's real." },
                  { title: "LLM-friendly docs", description: "Machine-readable docs at /llms.txt and /llms-full.txt for AI coding assistants." },
                  { title: "CSV export & API keys", description: "Export all data as CSV. Create API keys for CI/CD and automation workflows." },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border bg-background p-6">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="animate-on-scroll border-y bg-muted/30 py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                Frequently asked questions
              </h2>
              <div className="mt-12 space-y-8">
                {[
                  {
                    q: "Is the free tier really free forever?",
                    a: "Yes. The free tier includes 500 submissions per month, 3 forms, email notifications, spam protection, and API access. No credit card required. No time limit.",
                  },
                  {
                    q: "How does InputHaven compare to Formspree?",
                    a: "InputHaven offers 10x more free submissions (500 vs 50), costs 80% less for paid plans ($5/mo vs $25/mo for similar features), and includes AI spam filtering and conditional email routing that Formspree doesn't offer.",
                  },
                  {
                    q: "Is the form ID safe to put in my HTML?",
                    a: "Yes. The form ID is a public identifier, not a secret key. It only allows submitting data to your form. Protection comes from CORS domain allowlists, rate limiting, spam filtering, and honeypot fields.",
                  },
                  {
                    q: "What frameworks does InputHaven work with?",
                    a: "Any framework that can render HTML or make HTTP requests: React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Astro, Angular, Remix, Gatsby, Hugo, Jekyll, plain HTML, and more.",
                  },
                  {
                    q: "How does AI spam filtering work?",
                    a: "On Starter plans and above, submissions pass through Claude-powered classification that understands context and intent. It catches sophisticated spam that keyword filters miss, with zero configuration required.",
                  },
                  {
                    q: "Can I self-host InputHaven?",
                    a: "InputHaven is a hosted service. For self-hosting, you'd need to run the full stack (PostgreSQL, Redis, R2, Resend). The hosted version handles all infrastructure so you can focus on building.",
                  },
                ].map((faq) => (
                  <div key={faq.q}>
                    <h3 className="text-lg font-semibold">{faq.q}</h3>
                    <p className="mt-2 text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-24">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready to stop building form backends?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Create your free account and start collecting form submissions in under a minute.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <Link href="/pricing">Compare Plans</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                500 submissions/month free. No credit card. No lock-in.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <span className="text-xl font-bold">
                  Input<span className="text-primary">Haven</span>
                </span>
                <p className="mt-4 text-sm text-muted-foreground">
                  The most affordable form backend for developers. Collect submissions, fight spam, route emails.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Product</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                  <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                  <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link></li>
                  <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Developers</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">API Reference</Link></li>
                  <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">Integration Guides</Link></li>
                  <li><a href="/openapi.yaml" className="text-sm text-muted-foreground hover:text-foreground">OpenAPI Spec</a></li>
                  <li><a href="/llms.txt" className="text-sm text-muted-foreground hover:text-foreground">LLM Reference</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Compare</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/vs/formspree" className="text-sm text-muted-foreground hover:text-foreground">vs Formspree</Link></li>
                  <li><Link href="/vs/getform" className="text-sm text-muted-foreground hover:text-foreground">vs Getform</Link></li>
                  <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} InputHaven. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
