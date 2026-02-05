import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateAccessKey() {
  const { randomBytes } = require("crypto") as typeof import("crypto");
  return randomBytes(16).toString("hex");
}

/**
 * Extract the real client IP from request headers.
 * Prefers x-vercel-forwarded-for (set by Vercel infra, not spoofable by clients),
 * then x-real-ip, then x-forwarded-for as last resort.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
