const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://badelz.app";

export function buildBookingShareLink(booking: {
  confirmationCode: string;
  venueName: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const text = `احجزت كورت بادل في ${booking.venueName} - ${booking.courtName}
${booking.date} من ${booking.startTime} لـ ${booking.endTime}
كود التأكيد: ${booking.confirmationCode}

احجز انت كمان من بادلز
https://badelz.app`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildVenueShareLink(venue: {
  name: string;
  id: string;
}) {
  const text = `شوف ملعب ${venue.name} على بادلز واحجز كورت بادل اونلاين
https://badelz.app/venues/${venue.id}`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

const LEVEL_LABELS_AR: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
  PRO: "محترف",
};

export function buildGameShareLink(game: {
  gameCode: string;
  venueName: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  pricePerPlayer: number;
  spotsLeft: number;
  level?: string;
}) {
  const levelLine = game.level
    ? `\n🎯 المستوى: ${LEVEL_LABELS_AR[game.level] ?? game.level}`
    : "";
  const text = `حجزت كورت بادل في ${game.venueName} - ${game.courtName}
${game.date} من ${game.startTime} لـ ${game.endTime}
${game.pricePerPlayer} جنيه للفرد${levelLine}
ناقصنا ${game.spotsLeft} — أكد مكانك:
https://badelz.app/game/${game.gameCode}`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppDirectLink(phone: string, message?: string) {
  const cleaned = phone.replace(/\D/g, "");
  const international = cleaned.startsWith("0")
    ? `2${cleaned}`
    : cleaned.startsWith("2")
      ? cleaned
      : `20${cleaned}`;
  const url = `https://wa.me/${international}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function buildLobbyShareLink(params: {
  lobbyCode: string;
  area: string;
  date: string;
  startTime?: string;
  priceRange?: string;
  level?: string;
  spotsLeft: number;
}) {
  const lines = [
    "ناقصنا لاعبين بادل! 🏸",
    `📍 ${params.area}`,
    `📅 ${params.date}${params.startTime ? ` - ${params.startTime}` : ""}`,
    params.priceRange ? `💰 ~${params.priceRange} جنيه للفرد` : "",
    params.level ? `🎯 المستوى: ${LEVEL_LABELS_AR[params.level] ?? params.level}` : "",
    `ناقصنا ${params.spotsLeft}!`,
    "",
    `انضم من هنا: ${BASE_URL}/lobby/${params.lobbyCode}`,
  ].filter(Boolean);
  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildOwnerToPlayerLink(params: {
  playerName: string;
  playerPhone: string;
  date: string;
  startTime: string;
}) {
  const message = `مرحبا ${params.playerName}، حجزك في بادلز يوم ${params.date} الساعة ${params.startTime} متأكد. نستناك!`;
  return buildWhatsAppDirectLink(params.playerPhone, message);
}

export function buildCoachContactLink(params: {
  coachName: string;
  phone: string;
}) {
  const message = `مرحبا يا كابتن ${params.coachName}! أنا لقيتك على بادلز وعايز أعرف أكتر عن تدريبات البادل`;
  return buildWhatsAppDirectLink(params.phone, message);
}

export function buildSellerContactLink(params: {
  title: string;
  phone: string;
}) {
  const message = `مرحبا، شايف ${params.title} بتاعك على بادلز وعايز أعرف تفاصيل أكتر`;
  return buildWhatsAppDirectLink(params.phone, message);
}

export function buildPlayerShareLink(params: {
  id: string;
  name: string;
  tier: string;
  gamesPlayed: number;
}) {
  const lines = [
    `شوف كارت البادل بتاعي على بادلز! 🏸`,
    `${params.tier} - ${params.gamesPlayed} ماتش`,
    `${BASE_URL}/players/${params.id}`,
  ];
  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildListingShareLink(params: {
  id: string;
  title: string;
  price: number;
  area: string;
}) {
  const lines = [
    `شوف ${params.title} على سوق بادلز`,
    `💰 ${params.price} جنيه`,
    `📍 ${params.area}`,
    `${BASE_URL}/market/${params.id}`,
  ];
  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
}
