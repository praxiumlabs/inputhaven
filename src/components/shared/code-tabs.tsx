"use client";

import { useState } from "react";

const htmlCode = `<form action="https://inputhaven.com/api/v1/submit" method="POST">
  <input type="hidden" name="_form_id" value="your-form-id" />
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>`;

const reactCode = `import { useState } from "react";

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

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_form_id" value="your-form-id" />
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}`;

const nextjsCode = `"use client";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("https://inputhaven.com/api/v1/submit", {
        method: "POST",
        body: new FormData(e.currentTarget),
        headers: { Accept: "application/json" },
      });
      setStatus(res.ok ? "success" : "error");
    } catch { setStatus("error"); }
  }

  if (status === "success") return <p>Thank you!</p>;

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
}`;

const tabs = [
  { id: "html", label: "HTML", code: htmlCode },
  { id: "react", label: "React", code: reactCode },
  { id: "nextjs", label: "Next.js", code: nextjsCode },
] as const;

export function CodeTabs() {
  const [active, setActive] = useState<string>("html");
  const activeTab = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <div>
      <div className="flex gap-1 rounded-t-xl border border-b-0 bg-zinc-900 px-4 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              active === tab.id
                ? "bg-zinc-950 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto rounded-b-xl rounded-tr-xl border bg-zinc-950 p-6 text-sm leading-relaxed text-zinc-100 shadow-2xl">
        <code>{activeTab.code}</code>
      </pre>
    </div>
  );
}
