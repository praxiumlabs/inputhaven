"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export function LiveDemoForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/v1/submit", {
        method: "POST",
        body: new FormData(e.currentTarget),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Submission received! Check the dashboard to see it.");
      } else {
        const data = await res.json().catch(() => null);
        setStatus("error");
        setMessage(data?.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-semibold">Submission received!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          That&apos;s how it works. This form submission was processed by InputHaven in real time.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => { setStatus("idle"); setMessage(""); }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="demo-name" className="text-sm font-medium">Name</label>
          <input
            id="demo-name"
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="demo-email" className="text-sm font-medium">Email</label>
          <input
            id="demo-email"
            name="email"
            type="email"
            required
            placeholder="jane@example.com"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="demo-message" className="text-sm font-medium">Message</label>
        <textarea
          id="demo-message"
          name="message"
          required
          rows={3}
          placeholder="Type anything — this is a live demo."
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {/* Honeypot */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
      {status === "error" && (
        <p className="mt-3 text-sm text-destructive">{message}</p>
      )}
      <Button type="submit" className="mt-6 w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Submit Demo Form"
        )}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        This form posts to <code className="rounded bg-muted px-1">/api/v1/submit</code> — the same endpoint you&apos;d use in production.
      </p>
    </form>
  );
}
