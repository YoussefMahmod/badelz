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
  slotTemplate: z.enum(["STANDARD_PADEL", "EVENING_ONLY", "WEEKEND_HEAVY"]).optional(),
  scheduleConfig: z.object({
    slotDuration: z.number().refine((v) => v === 30 || v === 60).default(60),
    weekdays: z.object({
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    }).optional(),
    weekends: z.object({
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    }).optional(),
    all: z.object({
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    }).optional(),
  }).optional(),
});

export const applyTemplateSchema = z.object({
  templateId: z.enum(["STANDARD_PADEL", "EVENING_ONLY", "WEEKEND_HEAVY"]),
  courtIds: z.array(z.string()).min(1),
});

const egyptPhone = z.string().regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number");

export const adminCreatePlayerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: egyptPhone,
  area: z.string().optional(),
  areaAr: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  gamesPlayed: z.number().int().min(0).default(0),
  gamesWon: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(10).default(5),
  tier: z.enum(["BRONZE", "GOLD", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER"]).default("BRONZE"),
  isEarlyAdopter: z.boolean().default(false),
});

export const adminCreateCoachSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: egyptPhone,
  whatsapp: z.string().optional(),
  bio: z.string().max(500).optional(),
  bioAr: z.string().max(500).optional(),
  photo: z.string().url().optional().or(z.literal("")),
  areas: z.array(z.string()).min(1),
  areasAr: z.array(z.string()).optional(),
  pricePerHour: z.number().positive().optional(),
  experience: z.string().optional(),
  isPioneerCoach: z.boolean().default(true),
});

export const adminCreateListingSchema = z.object({
  sellerName: z.string().min(2),
  sellerPhone: egyptPhone,
  title: z.string().min(3).max(100),
  titleAr: z.string().optional(),
  description: z.string().max(1000).optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive(),
  category: z.enum(["RACKETS", "SHOES", "BAGS", "BALLS", "APPAREL", "ACCESSORIES", "OTHER"]),
  condition: z.enum(["NEW", "LIKE_NEW", "USED", "WELL_USED"]).default("USED"),
  photos: z.array(z.string().url()).max(5).optional(),
  area: z.string().min(2),
  areaAr: z.string().optional(),
});
