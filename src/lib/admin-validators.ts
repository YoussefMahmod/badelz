import { z } from "zod";

export const quickOnboardSchema = z.object({
  owner: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
  }),
  venue: z.object({
    name: z.string().min(2),
    nameAr: z.string().optional(),
    address: z.string().min(5),
    addressAr: z.string().optional(),
    city: z.string().min(2),
    cityAr: z.string().optional(),
    phone: z.string().min(8),
    whatsapp: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  courts: z
    .array(
      z.object({
        name: z.string().min(1),
        nameAr: z.string().optional(),
        pricePerHour: z.number().positive(),
      })
    )
    .min(1),
  slotTemplate: z.enum(["STANDARD_PADEL", "EVENING_ONLY", "WEEKEND_HEAVY"]),
});

export const applyTemplateSchema = z.object({
  templateId: z.enum(["STANDARD_PADEL", "EVENING_ONLY", "WEEKEND_HEAVY"]),
  courtIds: z.array(z.string()).min(1),
});
