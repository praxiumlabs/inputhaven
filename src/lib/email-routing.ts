export interface EmailRoute {
  id: string;
  field: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith";
  value: string;
  emailTo: string;
}

export function evaluateRoutes(
  data: Record<string, unknown>,
  routes: EmailRoute[],
  defaultEmail: string
): string[] {
  const matchedEmails: Set<string> = new Set();

  for (const route of routes) {
    const fieldValue = String(data[route.field] ?? "").toLowerCase();
    const routeValue = route.value.toLowerCase();

    let matches = false;
    switch (route.operator) {
      case "equals":
        matches = fieldValue === routeValue;
        break;
      case "contains":
        matches = fieldValue.includes(routeValue);
        break;
      case "startsWith":
        matches = fieldValue.startsWith(routeValue);
        break;
      case "endsWith":
        matches = fieldValue.endsWith(routeValue);
        break;
    }

    if (matches) {
      matchedEmails.add(route.emailTo);
    }
  }

  if (matchedEmails.size === 0) {
    return [defaultEmail];
  }

  return Array.from(matchedEmails);
}
