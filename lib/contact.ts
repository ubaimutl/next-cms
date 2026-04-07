import { z } from "zod";

export function normalizeWebsiteInput(value: string) {
  return /^[a-z]+:\/\//i.test(value) ? value : `https://${value}`;
}

export const contactServiceOptions = [
  "General Inquiry",
  "Project or Collaboration",
  "Product or Service Question",
  "Partnership or Press",
  "Support",
] as const;

export const contactBudgetOptions = [
  "Under EUR 1K",
  "EUR 1K - 5K",
  "EUR 5K+",
  "Not sure yet",
] as const;

export const contactTimelineOptions = [
  "ASAP",
  "This month",
  "Next 1 - 2 months",
  "Later on",
  "Flexible",
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalTextSchema = z
  .string()
  .trim()
  .max(160)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

const optionalWebsiteSchema = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine((value) => !value || URL.canParse(normalizeWebsiteInput(value)), {
    message: "Enter a valid website.",
  })
  .transform((value) => (value ? normalizeWebsiteInput(value) : null));

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(180)
    .refine((value) => emailPattern.test(value), {
      message: "Enter a valid email.",
    }),
  company: optionalTextSchema,
  website: optionalWebsiteSchema,
  services: z
    .array(z.enum(contactServiceOptions))
    .min(1, "Select at least one topic."),
  budget: z
    .enum(contactBudgetOptions)
    .optional()
    .transform((value) => value ?? null),
  timeline: z
    .enum(contactTimelineOptions)
    .optional()
    .transform((value) => value ?? null),
  message: z.string().trim().min(20, "Tell me a bit more about your message."),
  honeypot: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
});

export type ContactSubmissionInput = z.input<typeof contactSubmissionSchema>;
export type ContactSubmission = Omit<
  z.output<typeof contactSubmissionSchema>,
  "honeypot"
>;
