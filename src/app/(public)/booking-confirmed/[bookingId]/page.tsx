import type { Metadata } from "next";
import { getBookingForMeta } from "@/lib/queries";
import { formatTime, formatDateShort } from "@/lib/format";
import BookingConfirmedClient from "./booking-confirmed-client";

type Props = { params: Promise<{ bookingId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookingId } = await params;

  if (bookingId === "demo") {
    return {
      title: "حجز مؤكد - بادلز",
      description: "حجز تجريبي",
    };
  }

  const booking = await getBookingForMeta(bookingId);

  if (!booking) {
    return {
      title: "بادلز - Badelz",
      description: "تفاصيل الحجز",
    };
  }

  const venueName = booking.venue.nameAr || booking.venue.name;
  const courtName = booking.court.nameAr || booking.court.name;
  const date = formatDateShort(booking.date, "ar-EG");
  const time = `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`;

  const title = `حجز مؤكد - ${venueName}`;
  const description = `${date} | ${time} | ${courtName}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/booking-confirmed/${bookingId}`,
      ...(booking.venue.coverPhoto && {
        images: [
          {
            url: booking.venue.coverPhoto,
            width: 1200,
            height: 630,
            alt: venueName,
          },
        ],
      }),
    },
  };
}

export default async function BookingConfirmedPage({ params }: Props) {
  const { bookingId } = await params;
  return <BookingConfirmedClient bookingId={bookingId} />;
}
