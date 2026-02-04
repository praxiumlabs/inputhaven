import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InputHaven vs Getform — Feature & Pricing Comparison",
  description:
    "Compare InputHaven and Getform side by side. InputHaven offers 10x more free submissions, AI spam filtering, conditional email routing, and lower prices across all plans.",
  alternates: {
    canonical: "https://inputhaven.com/vs/getform",
  },
  openGraph: {
    title: "InputHaven vs Getform — Which Form Backend Is Better?",
    description: "10x more free submissions. AI spam filtering. Email routing. See the full comparison.",
  },
};

const comparisons = [
  { feature: "Free submissions per month", ih: "500", gf: "50", winner: "ih" },
  { feature: "Free forms", ih: "3", gf: "1", winner: "ih" },
  { feature: "Starter plan price", ih: "$5/mo", gf: "$16/mo", winner: "ih" },
  { feature: "Starter plan submissions", ih: "2,500/mo", gf: "1,000/mo", winner: "ih" },
  { feature: "AI spam filtering", ih: true, gf: false, winner: "ih" },
  { feature: "Conditional email routing", ih: true, gf: false, winner: "ih" },
  { feature: "Visual form builder", ih: true, gf: true, winner: "tie" },
  { feature: "REST API on free tier", ih: true, gf: false, winner: "ih" },
  { feature: "Webhooks", ih: "From $5/mo", gf: "From $16/mo", winner: "ih" },
  { feature: "File uploads", ih: "From $5/mo", gf: "From $16/mo", winner: "ih" },
  { feature: "HMAC-signed webhooks", ih: true, gf: false, winner: "ih" },
  { feature: "Custom auto-responder", ih: true, gf: true, winner: "tie" },
  { feature: "Domain allowlists", ih: true, gf: false, winner: "ih" },
  { feature: "OpenAPI specification", ih: true, gf: false, winner: "ih" },
  { feature: "LLM-friendly docs (llms.txt)", ih: true, gf: false, winner: "ih" },
  { feature: "CSV export", ih: true, gf: true, winner: "tie" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-red-400" />;
  }
  return <span>{value}</span>;
}

export default function VsGetformPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          InputHaven vs Getform
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
              More free submissions per month. InputHaven gives you 500 vs Getform&apos;s 50.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">69%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cheaper for comparable features. $5/mo for what costs $16/mo on Getform.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">AI-powered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Spam filtering with Claude AI. Getform only offers basic keyword-based spam protection.
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
              <th className="pb-4 text-center font-medium text-muted-foreground">Getform</th>
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
                  <CellValue value={row.gf} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-bold">Ready to switch from Getform?</h2>
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
