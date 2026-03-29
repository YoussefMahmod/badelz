import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Egyptian week: Saturday=0 through Friday=6
const EGYPT_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const EGYPT_DAY_ABBR = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

// Heatmap time blocks: 10AM, 12PM, 2PM, 4PM, 6PM, 8PM, 10PM
const HEATMAP_BLOCKS = [10, 12, 14, 16, 18, 20, 22];

/**
 * Convert JS Date.getDay() (0=Sun) to Egyptian week index (0=Sat)
 */
function toEgyptDayIndex(jsDay: number): number {
  // JS: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  // Egypt: 0=Sat,1=Sun,2=Mon,3=Tue,4=Wed,5=Thu,6=Fri
  return (jsDay + 1) % 7;
}

/**
 * Parse "HH:MM" string to total minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Determine hourly slots from a ScheduleTemplate, or default 10AM-midnight (14 slots)
 */
function getSlotsPerDay(
  schedules: Array<{ dayGroup: string; startTime: string; endTime: string; slotDuration: number }>,
  dayGroup: "weekdays" | "weekends" | "all"
): number {
  // Find best matching template: exact dayGroup match, then "all" fallback
  const template =
    schedules.find((s) => s.dayGroup === dayGroup) ||
    schedules.find((s) => s.dayGroup === "all");

  if (!template) return 14; // default: 10AM-midnight = 14 hourly slots

  const startMin = parseTimeToMinutes(template.startTime);
  const endMin = parseTimeToMinutes(template.endTime);
  const duration = template.slotDuration || 60;
  return Math.max(0, Math.floor((endMin - startMin) / duration));
}

/**
 * Get operating hours (start/end in minutes) from schedule templates
 */
function getOperatingHours(
  schedules: Array<{ startTime: string; endTime: string; dayGroup: string }>,
  dayGroup: "weekdays" | "weekends" | "all"
): { startMin: number; endMin: number } {
  const template =
    schedules.find((s) => s.dayGroup === dayGroup) ||
    schedules.find((s) => s.dayGroup === "all");

  if (!template) return { startMin: 600, endMin: 1440 }; // 10AM-midnight
  return {
    startMin: parseTimeToMinutes(template.startTime),
    endMin: parseTimeToMinutes(template.endTime),
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    // Get the owner's first venue (MVP: one venue per owner)
    const venue = await prisma.venue.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true, name: true, nameAr: true },
    });

    if (!venue) {
      return NextResponse.json(
        { statusCode: 404, message: "لم يتم العثور على ملعب", data: null },
        { status: 404 }
      );
    }

    // Calculate date boundaries in Egypt timezone (Africa/Cairo = UTC+2)
    const now = new Date();
    const cairoOffset = 2 * 60; // minutes
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const cairoNow = new Date(utcMs + cairoOffset * 60000);

    const todayStart = new Date(
      cairoNow.getFullYear(),
      cairoNow.getMonth(),
      cairoNow.getDate()
    );

    // Week start = most recent Saturday (Egyptian week starts Saturday)
    const daysSinceSaturday = (cairoNow.getDay() + 1) % 7; // Sat=0, Sun=1, ...
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - daysSinceSaturday);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // 4 weeks ago for heatmap data
    const fourWeeksAgo = new Date(todayStart);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const cairoHour = cairoNow.getHours();
    const cairoMinute = cairoNow.getMinutes();
    const cairoCurrentMinutes = cairoHour * 60 + cairoMinute;

    // ── Parallel batch 1: Existing stats + new data ──────────────────
    const [
      todayBookings,
      weekBookings,
      totalBookings,
      revenueResult,
      upcomingBookings,
      activeCourts,
      todayAllBookings,
      weekAllBookings,
      lastWeekRevenue,
      pendingCount,
      newTodayCount,
      allVenueBookings,
      heatmapBookings,
    ] = await Promise.all([
      // [0] Today's bookings count
      prisma.booking.count({
        where: {
          venueId: venue.id,
          date: todayStart,
          status: { not: "CANCELLED" },
        },
      }),

      // [1] This week's bookings count
      prisma.booking.count({
        where: {
          venueId: venue.id,
          date: { gte: weekStart },
          status: { not: "CANCELLED" },
        },
      }),

      // [2] Total bookings (all time)
      prisma.booking.count({
        where: { venueId: venue.id },
      }),

      // [3] Total revenue (CONFIRMED + COMPLETED only)
      prisma.booking.aggregate({
        where: {
          venueId: venue.id,
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalPrice: true },
      }),

      // [4] Next 5 upcoming bookings
      prisma.booking.findMany({
        where: {
          venueId: venue.id,
          date: { gte: todayStart },
          status: { not: "CANCELLED" },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 5,
        include: {
          court: { select: { name: true, nameAr: true } },
        },
      }),

      // [5] Active courts with schedule templates
      prisma.court.findMany({
        where: { venueId: venue.id, isActive: true },
        select: {
          id: true,
          name: true,
          nameAr: true,
          schedules: {
            where: { isActive: true },
            select: { dayGroup: true, startTime: true, endTime: true, slotDuration: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),

      // [6] Today's bookings (full data for schedule)
      prisma.booking.findMany({
        where: {
          venueId: venue.id,
          date: todayStart,
          status: { not: "CANCELLED" },
        },
        select: {
          courtId: true,
          startTime: true,
          endTime: true,
          status: true,
          playerName: true,
        },
        orderBy: { startTime: "asc" },
      }),

      // [7] This week's bookings (full data for insights)
      prisma.booking.findMany({
        where: {
          venueId: venue.id,
          date: { gte: weekStart },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        select: {
          date: true,
          startTime: true,
          totalPrice: true,
        },
      }),

      // [8] Last week's revenue
      prisma.booking.aggregate({
        where: {
          venueId: venue.id,
          date: { gte: lastWeekStart, lt: weekStart },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalPrice: true },
      }),

      // [9] Pending bookings count
      prisma.booking.count({
        where: {
          venueId: venue.id,
          status: "PENDING",
        },
      }),

      // [10] New bookings created today
      prisma.booking.count({
        where: {
          venueId: venue.id,
          createdAt: { gte: todayStart },
        },
      }),

      // [11] All venue bookings for player stats (exclude cancelled)
      prisma.booking.findMany({
        where: {
          venueId: venue.id,
          status: { not: "CANCELLED" },
          playerPhone: { not: "" },
        },
        select: {
          playerName: true,
          playerPhone: true,
          date: true,
        },
        orderBy: { date: "desc" },
      }),

      // [12] Last 4 weeks bookings for heatmap
      prisma.booking.findMany({
        where: {
          venueId: venue.id,
          date: { gte: fourWeeksAgo },
          status: { not: "CANCELLED" },
        },
        select: {
          date: true,
          startTime: true,
        },
      }),
    ]);

    // ── 1. Today's Schedule ──────────────────────────────────

    // Build per-court bookings
    const courtBookingsMap = new Map<
      string,
      Array<{ startTime: string; endTime: string; status: string; playerName: string }>
    >();
    for (const b of todayAllBookings) {
      if (!courtBookingsMap.has(b.courtId)) {
        courtBookingsMap.set(b.courtId, []);
      }
      courtBookingsMap.get(b.courtId)!.push({
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        playerName: b.playerName,
      });
    }

    const todayScheduleCourts = activeCourts.map((court) => ({
      courtId: court.id,
      courtName: court.name,
      bookings: courtBookingsMap.get(court.id) ?? [],
    }));

    // Next booking: first booking today where startTime > current Cairo time
    let nextBooking: {
      playerName: string;
      courtName: string;
      startTime: string;
      endTime: string;
      minutesUntil: number;
    } | null = null;

    for (const b of todayAllBookings) {
      const bookingMinutes = parseTimeToMinutes(b.startTime);
      if (bookingMinutes > cairoCurrentMinutes) {
        const court = activeCourts.find((c) => c.id === b.courtId);
        nextBooking = {
          playerName: b.playerName,
          courtName: court?.name ?? "Unknown",
          startTime: b.startTime,
          endTime: b.endTime,
          minutesUntil: bookingMinutes - cairoCurrentMinutes,
        };
        break; // already sorted by startTime
      }
    }

    // Remaining slots: for each court, count total remaining hourly slots today minus booked
    const todayIsWeekend = cairoNow.getDay() === 5 || cairoNow.getDay() === 6; // Fri=5, Sat=6
    const todayDayGroup: "weekdays" | "weekends" = todayIsWeekend ? "weekends" : "weekdays";

    let remainingSlots = 0;
    for (const court of activeCourts) {
      const { startMin, endMin } = getOperatingHours(court.schedules, todayDayGroup);
      const slotDuration =
        court.schedules.find((s) => s.dayGroup === todayDayGroup)?.slotDuration ??
        court.schedules.find((s) => s.dayGroup === "all")?.slotDuration ??
        60;

      // Count remaining slots from now until close
      const effectiveStart = Math.max(startMin, cairoCurrentMinutes);
      // Round up to next slot boundary
      const slotsFromNow = Math.max(0, Math.floor((endMin - effectiveStart) / slotDuration));

      // Count booked slots for this court from now onwards
      const courtBookings = courtBookingsMap.get(court.id) ?? [];
      const bookedFromNow = courtBookings.filter(
        (b) => parseTimeToMinutes(b.startTime) >= effectiveStart
      ).length;

      remainingSlots += Math.max(0, slotsFromNow - bookedFromNow);
    }

    const todaySchedule = {
      courts: todayScheduleCourts,
      nextBooking,
      remainingSlots,
    };

    // ── 2. Insights ──────────────────────────────────────────

    const weekRevenueNum = weekAllBookings.reduce(
      (sum, b) => sum + Number(b.totalPrice),
      0
    );
    const lastWeekRevenueNum = lastWeekRevenue._sum.totalPrice?.toNumber() ?? 0;
    const revenueChangePercent =
      lastWeekRevenueNum === 0 ? 0 : ((weekRevenueNum - lastWeekRevenueNum) / lastWeekRevenueNum) * 100;

    // Utilization: booked slots / total available slots this week
    let totalAvailableSlots = 0;
    for (const court of activeCourts) {
      // 7 days: weekdays (Mon-Thu = 4 days in Egyptian calendar: Sun-Thu),
      // weekends (Fri-Sat = 2 days), but simpler: compute per day type
      const weekdaySlots = getSlotsPerDay(court.schedules, "weekdays");
      const weekendSlots = getSlotsPerDay(court.schedules, "weekends");
      // Egyptian week: Sat(weekend), Sun-Thu(weekdays), Fri(weekend)
      totalAvailableSlots += weekendSlots * 2 + weekdaySlots * 5;
    }
    const bookedSlotsThisWeek = weekAllBookings.length;
    const utilizationPercent =
      totalAvailableSlots === 0
        ? 0
        : Math.round((bookedSlotsThisWeek / totalAvailableSlots) * 100);

    // Busiest day: group this week's bookings by day of week
    const dayCountMap = new Map<number, number>(); // egyptDayIndex -> count
    const hourCountMap = new Map<number, number>(); // hour -> count
    for (const b of weekAllBookings) {
      const bookingDate = new Date(b.date);
      const egyptIdx = toEgyptDayIndex(bookingDate.getDay());
      dayCountMap.set(egyptIdx, (dayCountMap.get(egyptIdx) ?? 0) + 1);

      const hour = parseInt(b.startTime.split(":")[0], 10);
      hourCountMap.set(hour, (hourCountMap.get(hour) ?? 0) + 1);
    }

    let busiestDay = "Saturday";
    let busiestDayCount = 0;
    Array.from(dayCountMap.entries()).forEach(([idx, count]) => {
      if (count > busiestDayCount) {
        busiestDayCount = count;
        busiestDay = EGYPT_DAYS[idx];
      }
    });

    let peakHour = 18; // default 6PM
    let peakHourCount = 0;
    Array.from(hourCountMap.entries()).forEach(([hour, count]) => {
      if (count > peakHourCount) {
        peakHourCount = count;
        peakHour = hour;
      }
    });

    // Daily revenue: Sat through Fri
    const dailyRevenueMap = new Map<number, number>(); // egyptDayIndex -> revenue
    for (let i = 0; i < 7; i++) dailyRevenueMap.set(i, 0);
    for (const b of weekAllBookings) {
      const bookingDate = new Date(b.date);
      const egyptIdx = toEgyptDayIndex(bookingDate.getDay());
      dailyRevenueMap.set(egyptIdx, (dailyRevenueMap.get(egyptIdx) ?? 0) + Number(b.totalPrice));
    }
    const dailyRevenue = EGYPT_DAY_ABBR.map((day, i) => ({
      day,
      revenue: Math.round(dailyRevenueMap.get(i) ?? 0),
    }));

    const insights = {
      weekRevenue: Math.round(weekRevenueNum),
      lastWeekRevenue: Math.round(lastWeekRevenueNum),
      revenueChangePercent: Math.round(revenueChangePercent * 10) / 10,
      utilizationPercent,
      busiestDay,
      busiestDayCount,
      peakHour,
      dailyRevenue,
    };

    // ── 3. Actions ───────────────────────────────────────────

    const actions = {
      pendingCount,
      newTodayCount,
    };

    // ── 4. Players ───────────────────────────────────────────

    // Group bookings by playerPhone
    const playerMap = new Map<
      string,
      { name: string; phone: string; count: number; lastVisit: Date }
    >();
    for (const b of allVenueBookings) {
      if (!b.playerPhone) continue;
      const existing = playerMap.get(b.playerPhone);
      if (existing) {
        existing.count++;
        if (new Date(b.date) > existing.lastVisit) {
          existing.lastVisit = new Date(b.date);
          existing.name = b.playerName; // use most recent name
        }
      } else {
        playerMap.set(b.playerPhone, {
          name: b.playerName,
          phone: b.playerPhone,
          count: 1,
          lastVisit: new Date(b.date),
        });
      }
    }

    let repeatCount = 0;
    let newCount = 0;
    const playerEntries: Array<{ name: string; phone: string; bookingCount: number; lastVisit: string }> = [];

    for (const p of Array.from(playerMap.values())) {
      if (p.count >= 2) repeatCount++;
      else newCount++;
      playerEntries.push({
        name: p.name,
        phone: p.phone,
        bookingCount: p.count,
        lastVisit: p.lastVisit.toISOString().split("T")[0],
      });
    }

    // Sort by booking count desc, take top 5
    playerEntries.sort((a, b) => b.bookingCount - a.bookingCount);
    const topPlayers = playerEntries.slice(0, 5);

    const players = {
      repeatCount,
      newCount,
      topPlayers,
    };

    // ── 5. Occupancy Heatmap ─────────────────────────────────

    // 7 rows (time blocks) x 7 cols (days Sat-Fri)
    const heatmapRaw: number[][] = Array.from({ length: 7 }, () => Array(7).fill(0));

    for (const b of heatmapBookings) {
      const bookingDate = new Date(b.date);
      const colIdx = toEgyptDayIndex(bookingDate.getDay());
      const hour = parseInt(b.startTime.split(":")[0], 10);

      // Find which 2-hour block this falls into
      for (let rowIdx = 0; rowIdx < HEATMAP_BLOCKS.length; rowIdx++) {
        const blockStart = HEATMAP_BLOCKS[rowIdx];
        const blockEnd = blockStart + 2;
        if (hour >= blockStart && hour < blockEnd) {
          heatmapRaw[rowIdx][colIdx]++;
          break;
        }
      }
    }

    // Find max for normalization
    let heatmapMax = 0;
    for (const row of heatmapRaw) {
      for (const val of row) {
        if (val > heatmapMax) heatmapMax = val;
      }
    }

    // Normalize to 0-4 intensity
    const heatmap = heatmapRaw.map((row) =>
      row.map((val) => (heatmapMax === 0 ? 0 : Math.floor((val / heatmapMax) * 4)))
    );

    const occupancy = { heatmap };

    // ── Response ─────────────────────────────────────────────

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب بيانات لوحة التحكم",
      data: {
        venue: {
          id: venue.id,
          name: venue.name,
          nameAr: venue.nameAr,
        },
        stats: {
          todayBookings,
          weekBookings,
          totalBookings,
          totalRevenue: revenueResult._sum.totalPrice?.toNumber() ?? 0,
          currency: "EGP",
        },
        upcomingBookings,
        todaySchedule,
        insights,
        actions,
        players,
        occupancy,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
