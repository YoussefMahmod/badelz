import { Resend } from "resend";
import {
  ownerBookingNotificationTemplate,
  passwordResetTemplate,
} from "./email-templates";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Badelz <bookings@badelz.app>";

export interface BookingEmailData {
  playerName: string;
  playerPhone: string;
  courtName: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  confirmationCode: string;
}

export async function sendBookingNotification(
  ownerEmail: string,
  data: BookingEmailData
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email notification");
    return;
  }

  const html = ownerBookingNotificationTemplate(data);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ownerEmail,
    subject: `حجز جديد - ${data.playerName} | ${data.courtName}`,
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  data: { resetLink: string }
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping password reset email");
    return;
  }

  const html = passwordResetTemplate(data);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "إعادة تعيين كلمة المرور - بادلز",
    html,
  });
}
