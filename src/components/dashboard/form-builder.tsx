"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Trash2, Copy, Save } from "lucide-react";
import { updateBuilderConfig } from "@/actions/forms";
import { useToast } from "@/components/ui/toast";

interface BuilderField {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox" | "radio" | "hidden";
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "hidden", label: "Hidden" },
] as const;

interface FormBuilderProps {
  formId: string;
  formName: string;
  accessKey: string;
  honeypotField: string | null;
  initialConfig: { fields: unknown[] } | null;
}

export function FormBuilder({
  formId,
  formName,
  accessKey,
  honeypotField,
  initialConfig,
}: FormBuilderProps) {
  const { toast } = useToast();
  const [fields, setFields] = useState<BuilderField[]>(
    (initialConfig?.fields as BuilderField[]) || []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedField = fields.find((f) => f.id === selectedId) || null;

  const addField = (type: BuilderField["type"]) => {
    const id = crypto.randomUUID();
    const newField: BuilderField = {
      id,
      type,
      name: type === "email" ? "email" : `field_${fields.length + 1}`,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      placeholder: "",
      required: false,
      options: type === "select" || type === "radio" ? ["Option 1", "Option 2"] : undefined,
      defaultValue: type === "hidden" ? "" : undefined,
    };
    setFields([...fields, newField]);
    setSelectedId(id);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const updateField = (id: string, updates: Partial<BuilderField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateBuilderConfig(formId, { fields });
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Builder config saved" });
    }
    setSaving(false);
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const submitUrl = `${appUrl}/api/v1/submit`;

  const htmlCode = generateHTML(fields, accessKey, honeypotField, submitUrl);
  const reactCode = generateReact(fields, accessKey, honeypotField, submitUrl, formName);
  const nextjsCode = generateNextJS(fields, accessKey, honeypotField, submitUrl, formName);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left column: Field list */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fields</span>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No fields yet. Add a field to get started.
              </p>
            )}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors ${
                  selectedId === field.id ? "border-primary bg-accent" : "hover:bg-accent/50"
                }`}
                onClick={() => setSelectedId(field.id)}
              >
                <span className="flex-1 text-sm font-medium truncate">
                  {field.label || field.name}
                  <span className="ml-2 text-xs text-muted-foreground">{field.type}</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); moveField(index, -1); }}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); moveField(index, 1); }}
                  disabled={index === fields.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="pt-2">
              <Select onValueChange={(v) => addField(v as BuilderField["type"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Add field..." />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Field config panel */}
        {selectedField && (
          <Card>
            <CardHeader>
              <CardTitle>Field Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name (attribute)</Label>
                <Input
                  value={selectedField.name}
                  onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                />
              </div>
              {selectedField.type !== "hidden" && selectedField.type !== "checkbox" && (
                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  <Input
                    value={selectedField.placeholder || ""}
                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  />
                </div>
              )}
              {selectedField.type === "hidden" && (
                <div className="space-y-2">
                  <Label>Default Value</Label>
                  <Input
                    value={selectedField.defaultValue || ""}
                    onChange={(e) => updateField(selectedField.id, { defaultValue: e.target.value })}
                  />
                </div>
              )}
              {(selectedField.type === "select" || selectedField.type === "radio") && (
                <div className="space-y-2">
                  <Label>Options (one per line)</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={(selectedField.options || []).join("\n")}
                    onChange={(e) =>
                      updateField(selectedField.id, {
                        options: e.target.value.split("\n"),
                      })
                    }
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Required</Label>
                <Switch
                  checked={selectedField.required}
                  onCheckedChange={(v) => updateField(selectedField.id, { required: v })}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right column: Code preview */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html">
            <TabsList className="mb-4">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
            </TabsList>
            <TabsContent value="html">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => copyCode(htmlCode)}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
                  <code>{htmlCode}</code>
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="react">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => copyCode(reactCode)}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
                  <code>{reactCode}</code>
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="nextjs">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => copyCode(nextjsCode)}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
                  <code>{nextjsCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function generateHTML(
  fields: BuilderField[],
  accessKey: string,
  honeypotField: string | null,
  submitUrl: string
): string {
  const lines: string[] = [];
  lines.push(`<form action="${submitUrl}" method="POST">`);
  lines.push(`  <input type="hidden" name="_form_id" value="${accessKey}" />`);
  if (honeypotField) {
    lines.push(`  <input type="hidden" name="${honeypotField}" style="display:none" />`);
  }

  for (const field of fields) {
    if (field.type === "hidden") {
      lines.push(`  <input type="hidden" name="${field.name}" value="${field.defaultValue || ""}" />`);
      continue;
    }

    lines.push("");
    lines.push(`  <div>`);
    if (field.type !== "checkbox") {
      lines.push(`    <label for="${field.name}">${field.label}</label>`);
    }

    if (field.type === "textarea") {
      lines.push(
        `    <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}"${field.required ? " required" : ""}></textarea>`
      );
    } else if (field.type === "select") {
      lines.push(`    <select id="${field.name}" name="${field.name}"${field.required ? " required" : ""}>`);
      lines.push(`      <option value="">Select...</option>`);
      for (const opt of field.options || []) {
        lines.push(`      <option value="${opt}">${opt}</option>`);
      }
      lines.push(`    </select>`);
    } else if (field.type === "radio") {
      for (const opt of field.options || []) {
        lines.push(`    <label><input type="radio" name="${field.name}" value="${opt}"${field.required ? " required" : ""} /> ${opt}</label>`);
      }
    } else if (field.type === "checkbox") {
      lines.push(`    <label><input type="checkbox" id="${field.name}" name="${field.name}" value="true"${field.required ? " required" : ""} /> ${field.label}</label>`);
    } else {
      lines.push(
        `    <input type="${field.type}" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}"${field.required ? " required" : ""} />`
      );
    }
    lines.push(`  </div>`);
  }

  lines.push("");
  lines.push(`  <button type="submit">Submit</button>`);
  lines.push(`</form>`);
  return lines.join("\n");
}

function generateReact(
  fields: BuilderField[],
  accessKey: string,
  honeypotField: string | null,
  submitUrl: string,
  formName: string
): string {
  const componentName = formName.replace(/[^a-zA-Z0-9]/g, "") + "Form";
  const lines: string[] = [];
  lines.push(`export function ${componentName}() {`);
  lines.push(`  return (`);
  lines.push(`    <form action="${submitUrl}" method="POST">`);
  lines.push(`      <input type="hidden" name="_form_id" value="${accessKey}" />`);
  if (honeypotField) {
    lines.push(`      <input type="hidden" name="${honeypotField}" style={{ display: "none" }} />`);
  }

  for (const field of fields) {
    if (field.type === "hidden") {
      lines.push(`      <input type="hidden" name="${field.name}" value="${field.defaultValue || ""}" />`);
      continue;
    }

    lines.push("");
    lines.push(`      <div>`);
    if (field.type !== "checkbox") {
      lines.push(`        <label htmlFor="${field.name}">${field.label}</label>`);
    }

    if (field.type === "textarea") {
      lines.push(`        <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}"${field.required ? " required" : ""} />`);
    } else if (field.type === "select") {
      lines.push(`        <select id="${field.name}" name="${field.name}"${field.required ? " required" : ""}>`);
      lines.push(`          <option value="">Select...</option>`);
      for (const opt of field.options || []) {
        lines.push(`          <option value="${opt}">${opt}</option>`);
      }
      lines.push(`        </select>`);
    } else if (field.type === "radio") {
      for (const opt of field.options || []) {
        lines.push(`        <label><input type="radio" name="${field.name}" value="${opt}"${field.required ? " required" : ""} /> ${opt}</label>`);
      }
    } else if (field.type === "checkbox") {
      lines.push(`        <label><input type="checkbox" id="${field.name}" name="${field.name}" value="true"${field.required ? " required" : ""} /> ${field.label}</label>`);
    } else {
      lines.push(`        <input type="${field.type}" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}"${field.required ? " required" : ""} />`);
    }
    lines.push(`      </div>`);
  }

  lines.push("");
  lines.push(`      <button type="submit">Submit</button>`);
  lines.push(`    </form>`);
  lines.push(`  );`);
  lines.push(`}`);
  return lines.join("\n");
}

function generateNextJS(
  fields: BuilderField[],
  accessKey: string,
  honeypotField: string | null,
  submitUrl: string,
  formName: string
): string {
  const componentName = formName.replace(/[^a-zA-Z0-9]/g, "") + "Form";
  const lines: string[] = [];
  lines.push(`"use client";`);
  lines.push(``);
  lines.push(`import { useState, type FormEvent } from "react";`);
  lines.push(``);
  lines.push(`export function ${componentName}() {`);
  lines.push(`  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");`);
  lines.push(``);
  lines.push(`  async function handleSubmit(e: FormEvent<HTMLFormElement>) {`);
  lines.push(`    e.preventDefault();`);
  lines.push(`    setStatus("loading");`);
  lines.push(`    const formData = new FormData(e.currentTarget);`);
  lines.push(`    try {`);
  lines.push(`      const res = await fetch("${submitUrl}", {`);
  lines.push(`        method: "POST",`);
  lines.push(`        body: formData,`);
  lines.push(`        headers: { Accept: "application/json" },`);
  lines.push(`      });`);
  lines.push(`      if (res.ok) setStatus("success");`);
  lines.push(`      else setStatus("error");`);
  lines.push(`    } catch {`);
  lines.push(`      setStatus("error");`);
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  if (status === "success") return <p>Thank you! Your submission has been received.</p>;`);
  lines.push(``);
  lines.push(`  return (`);
  lines.push(`    <form onSubmit={handleSubmit}>`);
  lines.push(`      <input type="hidden" name="_form_id" value="${accessKey}" />`);
  if (honeypotField) {
    lines.push(`      <input type="hidden" name="${honeypotField}" style={{ display: "none" }} />`);
  }

  for (const field of fields) {
    if (field.type === "hidden") {
      lines.push(`      <input type="hidden" name="${field.name}" value="${field.defaultValue || ""}" />`);
      continue;
    }

    lines.push(``);
    lines.push(`      <div>`);
    if (field.type !== "checkbox") {
      lines.push(`        <label htmlFor="${field.name}">${field.label}</label>`);
    }

    if (field.type === "textarea") {
      lines.push(`        <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}"${field.required ? " required" : ""} />`);
    } else if (field.type === "select") {
      lines.push(`        <select id="${field.name}" name="${field.name}"${field.required ? " required" : ""}>`);
      lines.push(`          <option value="">Select...</option>`);
      for (const opt of field.options || []) {
        lines.push(`          <option value="${opt}">${opt}</option>`);
      }
      lines.push(`        </select>`);
    } else if (field.type === "radio") {
      for (const opt of field.options || []) {
        lines.push(`        <label><input type="radio" name="${field.name}" value="${opt}"${field.required ? " required" : ""} /> ${opt}</label>`);
      }
    } else if (field.type === "checkbox") {
      lines.push(`        <label><input type="checkbox" id="${field.name}" name="${field.name}" value="true"${field.required ? " required" : ""} /> ${field.label}</label>`);
    } else {
      lines.push(`        <input type="${field.type}" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}"${field.required ? " required" : ""} />`);
    }
    lines.push(`      </div>`);
  }

  lines.push(``);
  lines.push(`      {status === "error" && <p style={{ color: "red" }}>Something went wrong. Please try again.</p>}`);
  lines.push(`      <button type="submit" disabled={status === "loading"}>`);
  lines.push(`        {status === "loading" ? "Submitting..." : "Submit"}`);
  lines.push(`      </button>`);
  lines.push(`    </form>`);
  lines.push(`  );`);
  lines.push(`}`);
  return lines.join("\n");
}
