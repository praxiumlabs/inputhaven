"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export interface EmailRoute {
  id: string;
  field: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith";
  value: string;
  emailTo: string;
}

interface EmailRoutingRulesProps {
  routes: EmailRoute[];
  onChange: (routes: EmailRoute[]) => void;
}

export function EmailRoutingRules({ routes, onChange }: EmailRoutingRulesProps) {
  const addRule = () => {
    if (routes.length >= 20) return;
    onChange([
      ...routes,
      {
        id: crypto.randomUUID(),
        field: "",
        operator: "equals",
        value: "",
        emailTo: "",
      },
    ]);
  };

  const removeRule = (id: string) => {
    onChange(routes.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<EmailRoute>) => {
    onChange(routes.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditional Email Routing</CardTitle>
        <CardDescription>
          Route submissions to different email addresses based on field values (Starter+ plans).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {routes.map((route) => (
          <div key={route.id} className="flex items-start gap-2">
            <Input
              placeholder="Field name"
              value={route.field}
              onChange={(e) => updateRule(route.id, { field: e.target.value })}
              className="w-32"
            />
            <Select
              value={route.operator}
              onValueChange={(v) =>
                updateRule(route.id, { operator: v as EmailRoute["operator"] })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">equals</SelectItem>
                <SelectItem value="contains">contains</SelectItem>
                <SelectItem value="startsWith">starts with</SelectItem>
                <SelectItem value="endsWith">ends with</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Value"
              value={route.value}
              onChange={(e) => updateRule(route.id, { value: e.target.value })}
              className="w-36"
            />
            <Input
              placeholder="Send to email"
              type="email"
              value={route.emailTo}
              onChange={(e) => updateRule(route.id, { emailTo: e.target.value })}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeRule(route.id)}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addRule}
          type="button"
          disabled={routes.length >= 20}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
        {routes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No routing rules configured. All submissions will be sent to the default notification email.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
