import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InputHaven vs Formspree — Feature & Pricing Comparison",
  description:
    "Compare InputHaven and Formspree side by side. InputHaven offers 10x more free submissions, 80% lower prices, AI spam filtering, and email routing that Formspree doesn't have.",
  alternates: {
    canonical: "https://inputhaven.com/vs/formspree",
  },
  openGraph: {
    title: "InputHaven vs Formspree — Which Form Backend Is Better?",
    description: "10x more free submissions. 80% cheaper paid plans. AI spam filtering. See the full comparison.",
  },
};

const comparisons = [
  { feature: "Free submissions per month", ih: "500", fs: "50", winner: "ih" },
  { feature: "Free forms", ih: "3", fs: "1", winner: "ih" },
  { feature: "Starter plan price", ih: "$5/mo", fs: "$25/mo", winner: "ih" },
  { feature: "Starter plan submissions", ih: "2,500/mo", fs: "1,000/mo", winner: "ih" },
  { feature: "AI spam filtering", ih: true, fs: false, winner: "ih" },
  { feature: "Conditional email routing", ih: true, fs: false, winner: "ih" },
  { feature: "Visual form builder", ih: true, fs: false, winner: "ih" },
  { feature: "REST API on free tier", ih: true, fs: false, winner: "ih" },
  { feature: "Webhooks", ih: "From $5/mo", fs: "From $25/mo", winner: "ih" },
  { feature: "File uploads", ih: "From $5/mo", fs: "From $25/mo", winner: "ih" },
  { feature: "HMAC-signed webhooks", ih: true, fs: true, winner: "tie" },
  { feature: "Custom auto-responder", ih: true, fs: true, winner: "tie" },
  { feature: "Domain allowlists", ih: true, fs: true, winner: "tie" },
  { feature: "OpenAPI specification", ih: true, fs: false, winner: "ih" },
  { feature: "LLM-friendly docs (llms.txt)", ih: true, fs: false, winner: "ih" },
  { feature: "CSV export", ih: true, fs: true, winner: "tie" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-red-400" />;
  }
  return <span>{value}</span>;
}

export default function VsFormspreePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          InputHaven vs Formspree
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A detailed comparison of features, pricing, and capabilities.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">10x</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              More free submissions per month. InputHaven gives you 500 vs Formspree&apos;s 50.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">80%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cheaper for comparable features. $5/mo for what costs $25/mo on Formspree.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">3 features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              That Formspree doesn&apos;t offer: AI spam filtering, email routing, and a visual form builder.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Full comparison table */}
      <div className="mt-16 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-4 text-left font-medium">Feature</th>
              <th className="pb-4 text-center font-bold text-primary">InputHaven</th>
              <th className="pb-4 text-center font-medium text-muted-foreground">Formspree</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {comparisons.map((row) => (
              <tr key={row.feature} className={row.winner === "ih" ? "bg-primary/5" : ""}>
                <td className="py-3 font-medium">{row.feature}</td>
                <td className="py-3 text-center font-semibold text-primary">
                  <CellValue value={row.ih} />
                </td>
                <td className="py-3 text-center text-muted-foreground">
                  <CellValue value={row.fs} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-bold">Ready to switch from Formspree?</h2>
        <p className="mt-2 text-muted-foreground">
          Migration is simple — just change your form&apos;s action URL and add a <code className="rounded bg-muted px-1">_form_id</code> field.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/register">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
