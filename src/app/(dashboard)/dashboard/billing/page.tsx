"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { getBillingInfo, createCheckoutSession, createPortalSession } from "@/actions/billing";
import { Plan } from "@prisma/client";
import { Check } from "lucide-react";

type BillingInfo = Awaited<ReturnType<typeof getBillingInfo>>;

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    getBillingInfo().then(setBilling);
  }, []);

  const handleUpgrade = async (plan: Plan, yearly = false) => {
    setLoading(plan);
    const result = await createCheckoutSession(plan, yearly);
    if (result.url) {
      window.location.href = result.url;
    }
    setLoading(null);
  };

  const handleManage = async () => {
    setLoading("manage");
    const result = await createPortalSession();
    if (result.url) {
      window.location.href = result.url;
    }
    setLoading(null);
  };

  if (!billing) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{billing.planConfig.name}</h3>
                <Badge>{billing.plan}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {billing.submissionCount.toLocaleString()} / {billing.planConfig.submissionsPerMonth.toLocaleString()} submissions this month
              </p>
              <div className="mt-2 h-2 w-64 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min((billing.submissionCount / billing.planConfig.submissionsPerMonth) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            {billing.subscription && (
              <Button variant="outline" onClick={handleManage} disabled={loading === "manage"}>
                {loading === "manage" ? "Loading..." : "Manage Subscription"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.values(PLANS) as typeof PLANS[keyof typeof PLANS][]).map((planConfig) => {
          const isCurrent = billing.plan === planConfig.plan;
          return (
            <Card key={planConfig.plan} className={isCurrent ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{planConfig.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">${planConfig.price}</span>
                  {planConfig.price > 0 && <span className="text-muted-foreground">/mo</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {planConfig.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : planConfig.price === 0 ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(planConfig.plan)}
                      disabled={loading === planConfig.plan}
                    >
                      {loading === planConfig.plan ? "Loading..." : "Upgrade"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
