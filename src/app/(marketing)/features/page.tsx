import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Mail, Shield, Code, Webhook, BarChart3, FileUp,
  Key, Globe, Zap, Lock, Download, Bell, Brain, GitFork, Wand2
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features - Form Backend Features",
  description:
    "AI spam filtering, conditional email routing, visual form builder, webhooks, file uploads, CSV export, and more. Everything you need to handle form submissions.",
  alternates: {
    canonical: "https://inputhaven.com/features",
  },
  openGraph: {
    title: "InputHaven Features",
    description: "AI spam filtering, email routing, form builder, webhooks, file uploads, and more.",
  },
};

const features = [
  { icon: Zap, title: "Instant Setup", description: "Create a form endpoint in seconds. No server, no deployment, no configuration. Just a URL and a hidden input field." },
  { icon: Mail, title: "Email Notifications", description: "Get instant email notifications with formatted submission data when someone fills out your form. Custom subjects and auto-responses." },
  { icon: Brain, title: "AI Spam Filtering", description: "Claude-powered spam detection that understands context and intent. Catches sophisticated spam that keyword filters miss. Zero configuration required. Available on Starter plans and above." },
  { icon: GitFork, title: "Conditional Email Routing", description: "Route submissions to different email addresses based on field values. Sales inquiries to sales, support to support. Set up rules in the dashboard. Available on Starter plans and above." },
  { icon: Wand2, title: "Visual Form Builder", description: "Build forms visually with a drag-and-drop interface. Export production-ready HTML, React, or Next.js code. Configure field types, labels, placeholders, and validation." },
  { icon: Shield, title: "Multi-Layer Spam Protection", description: "Five layers of defense: honeypot fields, keyword filtering, AI detection, per-IP rate limiting, and domain allowlists." },
  { icon: Webhook, title: "Webhooks", description: "Forward submissions to Slack, Discord, Zapier, or your own backend with HMAC-SHA256 signed payloads for security." },
  { icon: FileUp, title: "File Uploads", description: "Accept file uploads with your form submissions. Stored securely on Cloudflare R2 with signed download URLs." },
  { icon: Code, title: "Works Everywhere", description: "HTML forms, React, Vue, Svelte, Next.js, Astro, Angular, Remix, Nuxt, Gatsby, Hugo, Jekyll — any frontend." },
  { icon: Key, title: "API Access", description: "Full REST API for programmatic access to forms and submissions. Available on all plans including free. OpenAPI spec included." },
  { icon: Globe, title: "CORS & Domain Control", description: "Per-form domain allowlists ensure submissions only come from your authorized websites. Fine-grained origin control." },
  { icon: BarChart3, title: "Submissions Dashboard", description: "View, search, filter, and manage all your submissions. See spam scores, read status, and metadata." },
  { icon: Lock, title: "Two-Factor Authentication", description: "Secure your account with TOTP-based two-factor authentication. Works with any authenticator app." },
  { icon: Download, title: "CSV Export", description: "Export all your submissions as CSV files for offline analysis, backup, or import into other tools." },
  { icon: Bell, title: "Auto-Responses", description: "Automatically reply to form submitters with a custom message. Acknowledge receipt instantly." },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Features</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything you need to collect, manage, and act on form submissions.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
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

      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">500 submissions/month free. No credit card required.</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/register">Create Free Account</Link>
        </Button>
      </div>
    </div>
  );
}
