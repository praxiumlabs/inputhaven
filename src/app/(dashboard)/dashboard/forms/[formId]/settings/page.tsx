"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getForm, updateForm, deleteForm } from "@/actions/forms";
import { useToast } from "@/components/ui/toast";
import { EmailRoutingRules, type EmailRoute } from "@/components/dashboard/email-routing-rules";

export default function FormSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;
  const { toast } = useToast();

  const [form, setForm] = useState<Awaited<ReturnType<typeof getForm>>>(null);
  const [name, setName] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [allowedDomains, setAllowedDomains] = useState("");
  const [honeypotField, setHoneypotField] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [autoResponse, setAutoResponse] = useState(false);
  const [autoResponseMsg, setAutoResponseMsg] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [aiSpamFilter, setAiSpamFilter] = useState(false);
  const [emailRoutes, setEmailRoutes] = useState<EmailRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getForm(formId).then((f) => {
      if (!f) {
        router.push("/dashboard/forms");
        return;
      }
      setForm(f);
      setName(f.name);
      setEmailTo(f.emailTo);
      setAllowedDomains(f.allowedDomains.join(", "));
      setHoneypotField(f.honeypotField || "");
      setCustomSubject(f.customSubject || "");
      setWebhookUrl(f.webhookUrl || "");
      setAutoResponse(f.autoResponse);
      setAutoResponseMsg(f.autoResponseMsg || "");
      setIsActive(f.isActive);
      setAiSpamFilter((f as Record<string, unknown>).aiSpamFilter as boolean ?? false);
      setEmailRoutes(((f as Record<string, unknown>).emailRoutes as EmailRoute[]) ?? []);
    });
  }, [formId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateForm(formId, {
      name,
      emailTo,
      allowedDomains,
      honeypotField,
      customSubject,
      webhookUrl,
      autoResponse,
      autoResponseMsg,
      isActive,
      aiSpamFilter,
      emailRoutes,
    });

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this form? All submissions will be permanently deleted.")) return;
    setDeleteLoading(true);
    const result = await deleteForm(formId);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      setDeleteLoading(false);
    } else {
      router.push("/dashboard/forms");
    }
  };

  if (!form) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Settings</h1>
        <p className="text-muted-foreground">{form.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Form Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailTo">Notification Email</Label>
              <Input id="emailTo" type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customSubject">Custom Subject (optional)</Label>
              <Input id="customSubject" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} placeholder="New contact form submission" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowedDomains">Allowed Domains</Label>
              <Input id="allowedDomains" value={allowedDomains} onChange={(e) => setAllowedDomains(e.target.value)} placeholder="example.com, mysite.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="honeypotField">Honeypot Field</Label>
              <Input id="honeypotField" value={honeypotField} onChange={(e) => setHoneypotField(e.target.value)} placeholder="_gotcha" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
              <Input id="webhookUrl" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhook" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-response</Label>
                <p className="text-sm text-muted-foreground">Send an auto-reply to the submitter</p>
              </div>
              <Switch checked={autoResponse} onCheckedChange={setAutoResponse} />
            </div>
            {autoResponse && (
              <div className="space-y-2">
                <Label htmlFor="autoResponseMsg">Auto-response Message</Label>
                <Textarea id="autoResponseMsg" value={autoResponseMsg} onChange={(e) => setAutoResponseMsg(e.target.value)} placeholder="Thank you for your submission..." />
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>AI Spam Filtering</Label>
                <p className="text-sm text-muted-foreground">Use AI to detect spam submissions (Starter+ plans)</p>
              </div>
              <Switch checked={aiSpamFilter} onCheckedChange={setAiSpamFilter} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Accept new submissions</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <EmailRoutingRules routes={emailRoutes} onChange={setEmailRoutes} />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this form and all its submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete Form"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
