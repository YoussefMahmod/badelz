import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^01[0125]\d{8}$/, "رقم الموبايل غير صحيح");

export const bookingSchema = z.object({
  courtId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  playerName: z.string().min(2, "الاسم مطلوب"),
  playerPhone: phoneSchema,
  notes: z.string().optional(),
});

export const ownerBookingSchema = z.object({
  courtId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  playerName: z.string().min(2, "الاسم مطلوب"),
  playerPhone: z.string().regex(/^01[0125]\d{8}$/).optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة السر لازم تكون 6 حروف على الأقل"),
  phone: phoneSchema,
  role: z.enum(["PLAYER", "COACH", "VENUE_OWNER"]).default("PLAYER"),
});

export const playerProfileUpdateSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب").optional(),
  nameAr: z.string().optional(),
  area: z.string().optional(),
  areaAr: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const coachProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  bio: z.string().max(500).optional(),
  bioAr: z.string().max(500).optional(),
  photo: z.string().url().optional(),
  areas: z.array(z.string()).min(1).optional(),
  areasAr: z.array(z.string()).optional(),
  pricePerHour: z.number().positive().optional(),
  experience: z.string().optional(),
  whatsapp: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const venueSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  phone: z.string().min(8),
  whatsapp: z.string().optional(),
  address: z.string().min(5),
  addressAr: z.string().optional(),
  city: z.string().min(2),
  cityAr: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  coverPhoto: z.string().url().optional(),
});

export const courtSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  pricePerHour: z.number().positive(),
});

export const slotSchema = z.object({
  dayOfWeek: z.enum([
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const joinGameSchema = z.object({
  playerName: z.string().min(2, "الاسم مطلوب"),
  playerPhone: phoneSchema,
});

export const lobbySchema = z.object({
  hostName: z.string().min(2, "الاسم مطلوب"),
  hostPhone: phoneSchema,
  area: z.string().min(2),
  areaAr: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  priceRange: z.string().optional(),
  note: z.string().max(200).optional(),
});

export const joinLobbySchema = z.object({
  playerName: z.string().min(2, "الاسم مطلوب"),
  playerPhone: phoneSchema,
});

export const coachSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  phone: phoneSchema,
  whatsapp: z.string().optional(),
  bio: z.string().max(500).optional(),
  bioAr: z.string().max(500).optional(),
  areas: z.array(z.string()).min(1),
  areasAr: z.array(z.string()).optional(),
  pricePerHour: z.number().positive().optional(),
  experience: z.string().optional(),
});

export const listingSchema = z.object({
  sellerName: z.string().min(2),
  sellerPhone: phoneSchema,
  title: z.string().min(3).max(100),
  titleAr: z.string().optional(),
  description: z.string().max(1000).optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive(),
  category: z.enum(["RACKETS", "SHOES", "BAGS", "BALLS", "APPAREL", "ACCESSORIES", "OTHER"]),
  condition: z.enum(["NEW", "LIKE_NEW", "USED", "WELL_USED"]).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  area: z.string().min(2),
  areaAr: z.string().optional(),
});

export const listingUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  titleAr: z.string().optional(),
  description: z.string().max(1000).optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.enum(["RACKETS", "SHOES", "BAGS", "BALLS", "APPAREL", "ACCESSORIES", "OTHER"]).optional(),
  condition: z.enum(["NEW", "LIKE_NEW", "USED", "WELL_USED"]).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  area: z.string().min(2).optional(),
  areaAr: z.string().optional(),
  status: z.enum(["ACTIVE", "SOLD", "REMOVED"]).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
export type CourtInput = z.infer<typeof courtSchema>;
export type SlotInput = z.infer<typeof slotSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
export type LobbyInput = z.infer<typeof lobbySchema>;
export type JoinLobbyInput = z.infer<typeof joinLobbySchema>;
export type CoachInput = z.infer<typeof coachSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
export type PlayerProfileUpdateInput = z.infer<typeof playerProfileUpdateSchema>;
export type CoachProfileUpdateInput = z.infer<typeof coachProfileUpdateSchema>;
