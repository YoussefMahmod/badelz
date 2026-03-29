import { DayOfWeek } from "@prisma/client";

// ─── Legacy Templates (kept as UI presets) ───────────────

export interface SlotTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  slots: {
    days: DayOfWeek[];
    startHour: number;
    endHour: number;
  }[];
}

const ALL_DAYS: DayOfWeek[] = [
  "SATURDAY", "SUNDAY", "MONDAY", "TUESDAY",
  "WEDNESDAY", "THURSDAY", "FRIDAY",
];

const WEEKDAYS: DayOfWeek[] = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
];

const WEEKENDS: DayOfWeek[] = ["FRIDAY", "SATURDAY"];

export const SLOT_TEMPLATES: SlotTemplate[] = [
  {
    id: "STANDARD_PADEL",
    name: "Standard Padel",
    nameAr: "بادل عادي",
    description: "10 AM – 11 PM, hourly, all week",
    descriptionAr: "١٠ صباحاً – ١١ مساءً، كل ساعة، كل الأسبوع",
    slots: [{ days: ALL_DAYS, startHour: 10, endHour: 23 }],
  },
  {
    id: "EVENING_ONLY",
    name: "Evening Only",
    nameAr: "مسائي فقط",
    description: "5 PM – 11 PM, hourly, all week",
    descriptionAr: "٥ مساءً – ١١ مساءً، كل ساعة، كل الأسبوع",
    slots: [{ days: ALL_DAYS, startHour: 17, endHour: 23 }],
  },
  {
    id: "WEEKEND_HEAVY",
    name: "Weekend Heavy",
    nameAr: "ويكند مكثف",
    description: "Weekdays 5–11 PM, Weekends 8 AM – 11 PM",
    descriptionAr: "أيام الأسبوع ٥–١١ مساءً، الويكند ٨ صباحاً – ١١ مساءً",
    slots: [
      { days: WEEKDAYS, startHour: 17, endHour: 23 },
      { days: WEEKENDS, startHour: 8, endHour: 23 },
    ],
  },
];

/** Legacy: expand a template into individual TimeSlot rows */
export function expandTemplate(
  templateId: string,
  courtIds: string[]
): { courtId: string; dayOfWeek: DayOfWeek; startTime: string; endTime: string }[] {
  const template = SLOT_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return [];

  const results: { courtId: string; dayOfWeek: DayOfWeek; startTime: string; endTime: string }[] = [];

  for (const courtId of courtIds) {
    for (const slotDef of template.slots) {
      for (const day of slotDef.days) {
        for (let hour = slotDef.startHour; hour < slotDef.endHour; hour++) {
          results.push({
            courtId,
            dayOfWeek: day,
            startTime: `${hour.toString().padStart(2, "0")}:00`,
            endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
          });
        }
      }
    }
  }

  return results;
}

// ─── New Schedule Template System ────────────────────────

// Egypt: weekdays = Sun-Thu, weekends = Fri-Sat
const WEEKDAY_NUMBERS = [0, 1, 2, 3, 4]; // Sun=0 ... Thu=4
const WEEKEND_NUMBERS = [5, 6]; // Fri=5, Sat=6

// DayOfWeek enum to JS day number (getDay() adjusted for Egypt week starting Saturday)
const DAY_TO_NUMBER: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
  THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

export function dayOfWeekToNumber(day: DayOfWeek): number {
  return DAY_TO_NUMBER[day] ?? 0;
}

export function getDayGroup(dayOfWeek: DayOfWeek): "weekdays" | "weekends" {
  const num = dayOfWeekToNumber(dayOfWeek);
  return WEEKEND_NUMBERS.includes(num) ? "weekends" : "weekdays";
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
  availableBlocks: number; // 1-3 consecutive blocks available from this start
}

export interface TemplateConfig {
  startTime: string;
  endTime: string;
  slotDuration: number; // 30 or 60
}

export function generateSlotsFromTemplate(
  template: TemplateConfig,
  bookings: { startTime: string; endTime: string }[],
  maxBlocks: number = 3
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  const startMin = timeToMinutes(template.startTime);
  const endMin = timeToMinutes(template.endTime);
  const dur = template.slotDuration;

  // Build a set of booked minutes for O(1) conflict check
  const bookedMinutes = new Set<number>();
  for (const b of bookings) {
    const bs = timeToMinutes(b.startTime);
    const be = timeToMinutes(b.endTime);
    for (let m = bs; m < be; m++) bookedMinutes.add(m);
  }

  for (let m = startMin; m + dur <= endMin; m += dur) {
    let availableBlocks = 0;
    for (let b = 0; b < maxBlocks; b++) {
      const blockStart = m + b * dur;
      const blockEnd = blockStart + dur;
      if (blockEnd > endMin) break;
      let blocked = false;
      for (let min = blockStart; min < blockEnd; min++) {
        if (bookedMinutes.has(min)) { blocked = true; break; }
      }
      if (blocked) break;
      availableBlocks++;
    }

    if (availableBlocks > 0) {
      slots.push({
        startTime: minutesToTime(m),
        endTime: minutesToTime(m + dur),
        availableBlocks,
      });
    }
  }

  return slots;
}

/** Convert a legacy template preset to ScheduleTemplate config objects */
export function presetToScheduleConfig(
  presetId: string
): { dayGroup: string; startTime: string; endTime: string; slotDuration: number }[] {
  const preset = SLOT_TEMPLATES.find((t) => t.id === presetId);
  if (!preset) return [];

  if (preset.slots.length === 1) {
    return [{
      dayGroup: "all",
      startTime: `${preset.slots[0].startHour.toString().padStart(2, "0")}:00`,
      endTime: `${preset.slots[0].endHour.toString().padStart(2, "0")}:00`,
      slotDuration: 60,
    }];
  }

  // Multi-slot templates (e.g., WEEKEND_HEAVY) split into weekdays/weekends
  return preset.slots.map((slotDef) => {
    const isWeekend = slotDef.days.includes("FRIDAY" as DayOfWeek);
    return {
      dayGroup: isWeekend ? "weekends" : "weekdays",
      startTime: `${slotDef.startHour.toString().padStart(2, "0")}:00`,
      endTime: `${slotDef.endHour.toString().padStart(2, "0")}:00`,
      slotDuration: 60,
    };
  });
}
