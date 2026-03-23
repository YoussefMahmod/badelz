import type { Metadata } from "next";
import { getGameForMeta } from "@/lib/queries";
import { formatTime, formatDateShort } from "@/lib/format";
import GamePageClient from "./game-page-client";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const game = await getGameForMeta(code);

  if (!game) {
    return {
      title: "بادلز - Badelz",
      description: "ماتش بادل",
    };
  }

  const venueName = game.booking.venue.nameAr || game.booking.venue.name;
  const spotsLeft = 4 - game.players.length;
  const pricePerPlayer = Math.ceil(Number(game.booking.totalPrice) / 4);
  const date = formatDateShort(game.booking.date, "ar-EG");
  const time = `${formatTime(game.booking.startTime)} - ${formatTime(game.booking.endTime)}`;

  const title = `انضم لماتش بادل في ${venueName}`;
  const description =
    spotsLeft > 0
      ? `${date} | ${time} | ناقصنا ${spotsLeft} | ${pricePerPlayer} جنيه للفرد`
      : `${date} | ${time} | الماتش كامل`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/game/${code}`,
      ...(game.booking.venue.coverPhoto && {
        images: [
          {
            url: game.booking.venue.coverPhoto,
            width: 1200,
            height: 630,
            alt: venueName,
          },
        ],
      }),
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { code } = await params;
  return <GamePageClient code={code} />;
}
