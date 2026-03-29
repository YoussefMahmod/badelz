import { BookingEmailData } from "./email";
import { buildWhatsAppDirectLink } from "./whatsapp";

export function ownerBookingNotificationTemplate(
  data: BookingEmailData
): string {
  const whatsappLink = buildWhatsAppDirectLink(
    data.playerPhone,
    `مرحبا ${data.playerName}، حجزك في بادلز يوم ${data.date} الساعة ${data.startTime} متأكد. نستناك!`
  );

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Arial,Tahoma,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://badelz.app/icons/icon-192.png" alt="Badelz" width="56" height="56" style="border-radius:12px;margin-bottom:8px;" />
      <h1 style="color:#c8ff00;font-size:24px;margin:0;">بادلز</h1>
      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:4px 0 0;">حجز جديد!</p>
    </div>

    <!-- Booking Card -->
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;">
      <h2 style="color:rgba(255,255,255,0.9);font-size:18px;margin:0 0 16px;">تفاصيل الحجز</h2>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;width:100px;">اللاعب</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;">${data.playerName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">التليفون</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.9);font-size:14px;" dir="ltr">${data.playerPhone}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">الكورت</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.9);font-size:14px;">${data.courtName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">التاريخ</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.9);font-size:14px;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">الوقت</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.9);font-size:14px;" dir="ltr">${data.startTime} - ${data.endTime}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">السعر</td>
          <td style="padding:8px 0;color:#c8ff00;font-size:16px;font-weight:700;">${data.totalPrice} جنيه</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">كود التأكيد</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.9);font-size:16px;font-weight:700;letter-spacing:2px;">${data.confirmationCode}</td>
        </tr>
      </table>
    </div>

    <!-- WhatsApp CTA -->
    <a href="${whatsappLink}" target="_blank" style="display:block;text-align:center;background:#25D366;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 24px;border-radius:12px;margin-top:16px;">
      تواصل مع اللاعب على واتساب
    </a>

    <!-- Dashboard Link -->
    <a href="https://badelz.app/bookings" style="display:block;text-align:center;color:rgba(255,255,255,0.5);font-size:12px;text-decoration:underline;margin-top:12px;">
      افتح لوحة التحكم
    </a>

    <!-- Footer -->
    <p style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;margin-top:24px;">
      badelz.app
    </p>
  </div>
</body>
</html>`;
}

export function passwordResetTemplate(params: {
  resetLink: string;
}): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Arial,Tahoma,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://badelz.app/icons/icon-192.png" alt="Badelz" width="56" height="56" style="border-radius:12px;margin-bottom:8px;" />
      <h1 style="color:#c8ff00;font-size:24px;margin:0;">بادلز</h1>
      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:4px 0 0;">إعادة تعيين كلمة المرور</p>
    </div>

    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;">
      <p style="color:rgba(255,255,255,0.9);font-size:14px;line-height:1.6;margin:0 0 16px;">
        طلبت إعادة تعيين كلمة المرور. اضغط على الزرار ده عشان تعمل كلمة مرور جديدة:
      </p>

      <a href="${params.resetLink}" target="_blank" style="display:block;text-align:center;background:linear-gradient(to right,#10b981,#14b8a6);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 24px;border-radius:12px;">
        إعادة تعيين كلمة المرور
      </a>

      <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:16px 0 0;">
        اللينك ده صالح لمدة ساعة واحدة. لو مطلبتش إعادة تعيين كلمة المرور، تجاهل الإيميل ده.
      </p>
    </div>

    <p style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;margin-top:24px;">
      badelz.app
    </p>
  </div>
</body>
</html>`;
}
