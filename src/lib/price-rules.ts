import { timeToMinutes, endTimeToMinutes, minutesToTime } from "./slot-templates";

export interface PriceRule {
  dayGroup: string; // "all" | "weekdays" | "weekends"
  startTime: string; // "09:00"
  endTime: string; // "15:00"
  pricePerHour: number;
}

/**
 * Resolve the correct price for a single time slot.
 * Specific dayGroup ("weekdays"/"weekends") wins over "all".
 * Falls back to basePricePerHour if no rule matches.
 */
export function resolveSlotPrice(
  dayGroup: string,
  slotStart: string,
  slotEnd: string,
  rules: PriceRule[],
  basePricePerHour: number
): number {
  const slotStartMin = timeToMinutes(slotStart);
  const slotEndMin = timeToMinutes(slotEnd);

  // Find matching rules: slot must be fully contained within the rule's range
  const matching = rules.filter((r) => {
    const ruleStart = timeToMinutes(r.startTime);
    const ruleEnd = endTimeToMinutes(r.endTime);
    const dayMatch = r.dayGroup === dayGroup || r.dayGroup === "all";
    return dayMatch && ruleStart <= slotStartMin && ruleEnd >= slotEndMin;
  });

  if (matching.length === 0) return basePricePerHour;

  // Prefer specific dayGroup over "all"
  const specific = matching.find((r) => r.dayGroup === dayGroup);
  return specific ? specific.pricePerHour : matching[0].pricePerHour;
}

/**
 * Calculate total price for a booking that may span multiple price tiers.
 * Breaks the booking into slot-sized chunks and sums per-chunk prices.
 */
export function calculateTotalPrice(
  dayGroup: string,
  startTime: string,
  endTime: string,
  slotDuration: number,
  rules: PriceRule[],
  basePricePerHour: number
): number {
  const startMin = timeToMinutes(startTime);
  const endMin = endTimeToMinutes(endTime);
  const durationHoursPerSlot = slotDuration / 60;

  let total = 0;
  for (let m = startMin; m < endMin; m += slotDuration) {
    const chunkEnd = Math.min(m + slotDuration, endMin);
    const chunkStart = minutesToTime(m);
    const chunkEndTime = minutesToTime(chunkEnd);
    const price = resolveSlotPrice(dayGroup, chunkStart, chunkEndTime, rules, basePricePerHour);
    total += price * ((chunkEnd - m) / 60);
  }

  return total;
}
