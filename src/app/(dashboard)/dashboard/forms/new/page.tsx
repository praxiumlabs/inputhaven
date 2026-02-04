"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createForm } from "@/actions/forms";

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [allowedDomains, setAllowedDomains] = useState("");
  const [honeypotField, setHoneypotField] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createForm({
      name,
      emailTo,
      allowedDomains: allowedDomains || undefined,
      honeypotField: honeypotField || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/forms/${result.formId}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Form</h1>
        <p className="text-muted-foreground">
          Set up a new form endpoint to collect submissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
          <CardDescription>
            Configure your form settings. You can change these later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Form Name</Label>
              <Input
                id="name"
                placeholder="Contact Form"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailTo">Notification Email</Label>
              <Input
                id="emailTo"
                type="email"
                placeholder="you@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Submissions will be sent to this email.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowedDomains">
                Allowed Domains (optional)
              </Label>
              <Input
                id="allowedDomains"
                placeholder="example.com, mysite.com"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Leave empty to allow all domains.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="honeypotField">Honeypot Field (optional)</Label>
              <Input
                id="honeypotField"
                placeholder="_gotcha"
                value={honeypotField}
                onChange={(e) => setHoneypotField(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Hidden field name for spam detection. Submissions with this field filled will be marked as spam.
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Form"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
