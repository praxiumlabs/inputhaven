import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Affordable Form Backend Plans",
  description:
    "Start free with 500 submissions/month. Upgrade to Starter ($5/mo) for AI spam filtering, email routing, and file uploads. The most affordable Formspree alternative.",
  alternates: {
    canonical: "https://inputhaven.com/pricing",
  },
  openGraph: {
    title: "InputHaven Pricing",
    description: "Free tier with 500 submissions/month. Paid plans from $5/mo. 80% cheaper than Formspree.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "InputHaven Pricing",
  description: "Form backend pricing. Free tier with 500 submissions/month. Paid plans from $5/mo.",
  url: "https://inputhaven.com/pricing",
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more. Cancel anytime. No surprises.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                    ${plan.yearlyPrice}/year (save ${plan.price * 12 - plan.yearlyPrice})
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

        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How we compare</h2>
          <p className="mt-2 text-center text-muted-foreground">
            InputHaven offers more features at lower prices than any competitor.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium">Feature</th>
                  <th className="pb-3 text-center font-bold text-primary">InputHaven</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Formspree</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Web3Forms</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Getform</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { feature: "Free submissions/mo", ih: "500", fs: "50", wf: "250", gf: "50" },
                  { feature: "Price for 2,500 subs", ih: "$5/mo", fs: "$25/mo", wf: "$8/mo", gf: "$16/mo" },
                  { feature: "File uploads", ih: "From $5/mo", fs: "From $25/mo", wf: "From $8/mo", gf: "From $16/mo" },
                  { feature: "API on free tier", ih: "Yes", fs: "No", wf: "Yes", gf: "No" },
                  { feature: "AI spam filtering", ih: "Yes", fs: "No", wf: "No", gf: "No" },
                  { feature: "Email routing rules", ih: "Yes", fs: "No", wf: "No", gf: "No" },
                  { feature: "Visual form builder", ih: "Yes", fs: "No", wf: "No", gf: "Yes" },
                  { feature: "Webhooks", ih: "From $5/mo", fs: "From $25/mo", wf: "No", gf: "From $16/mo" },
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
        </div>
      </div>
    </>
  );
}
