import { DayOfWeek } from "@prisma/client";

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
