import type { Metadata } from "next";
import { getLobbyForMeta } from "@/lib/queries";
import { formatDateShort, formatTime } from "@/lib/format";
import LobbyPageClient from "./lobby-page-client";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const lobby = await getLobbyForMeta(code);

  if (!lobby) {
    return {
      title: "\u0628\u0627\u062F\u0644\u0632 - Badelz",
      description: "\u0644\u0648\u0628\u064A \u0628\u0627\u062F\u0644",
    };
  }

  const area = lobby.areaAr || lobby.area;
  const spotsLeft = 4 - lobby.players.length;
  const date = formatDateShort(lobby.date, "ar-EG");

  const title = `\u0627\u0646\u0636\u0645 \u0644\u0645\u0627\u062A\u0634 \u0628\u0627\u062F\u0644 \u0641\u064A ${area}`;
  const description = `${date}${lobby.startTime ? ` | ${formatTime(lobby.startTime)}` : ""} | \u0646\u0627\u0642\u0635\u0646\u0627 ${spotsLeft}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/lobby/${code}`,
    },
  };
}

export default async function LobbyPage({ params }: Props) {
  const { code } = await params;
  return <LobbyPageClient code={code} />;
}
