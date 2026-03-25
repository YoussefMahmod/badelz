"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { MainLayout } from "@/components/main-layout";

export default function PrivacyPage() {
  const { t } = useTranslation();
  const { dir } = useLocale();

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 mb-6 transition-colors"
        >
          <ArrowRight size={14} className={dir === "ltr" ? "rotate-180" : ""} />
          {t("common.back")}
        </Link>

        <h1 className="text-2xl font-bold text-white/90 mb-8">
          {t("legal.privacyTitle")}
        </h1>

        <div className="space-y-6 text-sm text-white/60 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">البيانات اللي بنجمعها</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>الاسم ورقم التليفون (عند الحجز أو التسجيل)</li>
              <li>البريد الإلكتروني (لأصحاب الملاعب والمدربين)</li>
              <li>بيانات الحجوزات والألعاب</li>
              <li>الصور المرفوعة (صور الملاعب والمنتجات)</li>
              <li>بيانات الاستخدام والتصفح (عبر PostHog analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">إزاي بنستخدم بياناتك</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>إتمام عمليات الحجز والتواصل مع الملاعب</li>
              <li>إرسال إشعارات الحجوزات عبر البريد الإلكتروني</li>
              <li>تحسين تجربة المنصة وتحليل الاستخدام</li>
              <li>عرض الملف الشخصي للاعبين والمدربين</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">الأطراف الخارجية</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>PostHog</strong> — تحليل الاستخدام (مجهول الهوية)</li>
              <li><strong>Resend</strong> — إرسال البريد الإلكتروني</li>
              <li><strong>Cloudinary</strong> — تخزين الصور</li>
              <li><strong>Neon</strong> — استضافة قاعدة البيانات</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">حماية البيانات</h2>
            <p>
              نستخدم تشفير HTTPS لحماية البيانات أثناء النقل. كلمات المرور مشفرة ولا يمكن الوصول إليها.
              لا نبيع أو نشارك بياناتك الشخصية مع أي طرف خارجي لأغراض تسويقية.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">حقوقك</h2>
            <p>
              يمكنك طلب حذف حسابك وبياناتك في أي وقت عبر التواصل معنا.
              يمكنك أيضاً طلب نسخة من بياناتك المخزنة.
            </p>
          </section>

          <hr className="border-white/10 my-8" />

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">Data We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Name and phone number (when booking or registering)</li>
              <li>Email address (for venue owners and coaches)</li>
              <li>Booking and game data</li>
              <li>Uploaded photos (venues and products)</li>
              <li>Usage and browsing data (via PostHog analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Processing bookings and communicating with venues</li>
              <li>Sending booking notification emails</li>
              <li>Improving the platform and analyzing usage</li>
              <li>Displaying player and coach profiles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/80 mb-2">Your Rights</h2>
            <p>
              You can request deletion of your account and data at any time by contacting us.
              You can also request a copy of your stored data.
            </p>
          </section>

          <p className="text-white/30 text-xs mt-8">
            Last updated: March 2026
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
