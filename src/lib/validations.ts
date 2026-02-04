import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  code: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  emailTo: z.string().email("Invalid email address"),
  allowedDomains: z.string().optional(),
  honeypotField: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, "Honeypot field name can only contain letters, numbers, underscores, and hyphens")
    .max(50)
    .optional(),
  customSubject: z.string().max(200).optional(),
});

export const emailRouteSchema = z.object({
  id: z.string(),
  field: z.string().min(1).max(100),
  operator: z.enum(["equals", "contains", "startsWith", "endsWith"]),
  value: z.string().min(1).max(500),
  emailTo: z.string().email(),
});

export const updateFormSchema = createFormSchema.extend({
  webhookUrl: z
    .string()
    .url("Invalid URL")
    .refine(
      (url) => {
        if (!url) return true;
        try {
          const parsed = new URL(url);
          if (process.env.NODE_ENV === "production") {
            return parsed.protocol === "https:";
          }
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: "Webhook URL must use HTTPS" }
    )
    .optional()
    .or(z.literal("")),
  autoResponse: z.boolean().optional(),
  autoResponseMsg: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
  aiSpamFilter: z.boolean().optional(),
  emailRoutes: z.array(emailRouteSchema).max(20).optional(),
});

export const builderFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "textarea", "select", "checkbox", "radio", "hidden"]),
  name: z.string().min(1).max(100),
  label: z.string().max(200),
  placeholder: z.string().max(200).optional(),
  required: z.boolean(),
  options: z.array(z.string().max(200)).optional(),
  defaultValue: z.string().max(500).optional(),
});

export const builderConfigSchema = z.object({
  fields: z.array(builderFieldSchema).max(50),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
