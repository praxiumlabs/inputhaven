import { Plan } from "@prisma/client";

export interface PlanConfig {
  name: string;
  plan: Plan;
  price: number;
  yearlyPrice: number;
  submissionsPerMonth: number;
  maxForms: number;
  features: string[];
  fileUploads: boolean;
  webhooks: boolean;
  aiSpamFilter: boolean;
  emailRouting: boolean;
  removeBranding: boolean;
  prioritySupport: boolean;
  dataRetentionDays: number;
  maxTeamMembers: number;
  stripePriceId?: string;
  stripeYearlyPriceId?: string;
}

export const PLANS: Record<Plan, PlanConfig> = {
  FREE: {
    name: "Free",
    plan: Plan.FREE,
    price: 0,
    yearlyPrice: 0,
    submissionsPerMonth: 500,
    maxForms: 3,
    features: [
      "500 submissions/month",
      "3 forms",
      "Email notifications",
      "Spam protection",
      "API access",
    ],
    fileUploads: false,
    webhooks: false,
    aiSpamFilter: false,
    emailRouting: false,
    removeBranding: false,
    prioritySupport: false,
    dataRetentionDays: 30,
    maxTeamMembers: 1,
  },
  STARTER: {
    name: "Starter",
    plan: Plan.STARTER,
    price: 5,
    yearlyPrice: 48,
    submissionsPerMonth: 2500,
    maxForms: 25,
    features: [
      "2,500 submissions/month",
      "25 forms",
      "File uploads",
      "Webhooks",
      "Data export (CSV)",
      "AI spam filtering",
      "Conditional email routing",
      "90-day retention",
    ],
    fileUploads: true,
    webhooks: true,
    aiSpamFilter: true,
    emailRouting: true,
    removeBranding: false,
    prioritySupport: false,
    dataRetentionDays: 90,
    maxTeamMembers: 3,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  },
  PRO: {
    name: "Pro",
    plan: Plan.PRO,
    price: 12,
    yearlyPrice: 108,
    submissionsPerMonth: 10000,
    maxForms: Infinity,
    features: [
      "10,000 submissions/month",
      "Unlimited forms",
      "Remove branding",
      "Priority support",
      "365-day retention",
      "Everything in Starter",
    ],
    fileUploads: true,
    webhooks: true,
    aiSpamFilter: true,
    emailRouting: true,
    removeBranding: true,
    prioritySupport: true,
    dataRetentionDays: 365,
    maxTeamMembers: 10,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  ENTERPRISE: {
    name: "Enterprise",
    plan: Plan.ENTERPRISE,
    price: 29,
    yearlyPrice: 276,
    submissionsPerMonth: 50000,
    maxForms: Infinity,
    features: [
      "50,000 submissions/month",
      "Unlimited forms",
      "Unlimited team members",
      "Forever retention",
      "Everything in Pro",
    ],
    fileUploads: true,
    webhooks: true,
    aiSpamFilter: true,
    emailRouting: true,
    removeBranding: true,
    prioritySupport: true,
    dataRetentionDays: Infinity,
    maxTeamMembers: Infinity,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
  },
};

export function getPlanConfig(plan: Plan): PlanConfig {
  return PLANS[plan];
}

export function canCreateForm(plan: Plan, currentFormCount: number): boolean {
  const config = PLANS[plan];
  return currentFormCount < config.maxForms;
}

export function isWithinSubmissionLimit(
  plan: Plan,
  currentMonthCount: number
): boolean {
  const config = PLANS[plan];
  return currentMonthCount < config.submissionsPerMonth;
}
