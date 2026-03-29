"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { MainLayout } from "@/components/main-layout";

export default function TermsPage() {
  const { t } = useTranslation();
  const { dir } = useLocale();

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-[#666] hover:text-[#999] mb-6 transition-colors"
        >
          <ArrowRight size={14} className={dir === "ltr" ? "rotate-180" : ""} />
          {t("common.back")}
        </Link>

        <h1 className="text-2xl font-bold text-white mb-8">
          {t("legal.termsTitle")}
        </h1>

        <div className="space-y-6 text-sm text-[#999] leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">1. الخدمة</h2>
            <p>
              بادلز (badelz.app) هي منصة إلكترونية لحجز ملاعب البادل في مصر. المنصة تربط اللاعبين بأصحاب الملاعب
              وتوفر خدمات الحجز، البحث عن لاعبين، دليل المدربين، وسوق المعدات.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">2. الحجز والدفع</h2>
            <p>
              الحجز عبر المنصة مجاني. الدفع يتم مباشرة في الملعب عند الحضور.
              المنصة لا تتحمل مسؤولية أي خلافات مالية بين اللاعب وصاحب الملعب.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">3. الإلغاء وعدم الحضور</h2>
            <p>
              يمكنك إلغاء الحجز في أي وقت قبل الموعد. عدم الحضور بدون إلغاء مسبق
              قد يؤثر على تجربتك في المنصة. نحتفظ بالحق في تقييد الحسابات التي تتكرر منها حالات عدم الحضور.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">4. أصحاب الملاعب</h2>
            <p>
              أصحاب الملاعب مسؤولون عن دقة المعلومات المعروضة (الأسعار، المواعيد، التوفر).
              بادلز لا تضمن توفر الملعب أو جودة الخدمة المقدمة.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">5. السلوك</h2>
            <p>
              يجب على المستخدمين التعامل باحترام مع جميع أطراف المنصة.
              يُمنع نشر محتوى مسيء أو مضلل أو إساءة استخدام المنصة بأي شكل.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">6. السوق (Marketplace)</h2>
            <p>
              بادلز توفر منصة لعرض وبيع المعدات بين المستخدمين. المنصة ليست طرفاً في أي عملية بيع أو شراء
              ولا تتحمل مسؤولية حالة المنتجات أو إتمام الصفقات.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">7. التعديلات</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك للمنصة يعني موافقتك على الشروط المحدثة.
            </p>
          </section>

          <hr className="border-[#333] my-8" />

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">1. Service</h2>
            <p>
              Badelz (badelz.app) is an online platform for booking padel courts in Egypt.
              The platform connects players with venue owners and provides booking, player matching,
              coach directory, and equipment marketplace services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">2. Booking & Payment</h2>
            <p>
              Booking through the platform is free. Payment is made directly at the venue upon arrival.
              The platform is not responsible for any financial disputes between players and venue owners.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">3. Cancellation & No-Show</h2>
            <p>
              You may cancel a booking at any time before the scheduled time. Failure to show up without
              prior cancellation may affect your platform experience. We reserve the right to restrict
              accounts with repeated no-shows.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#999] mb-2">4. Venue Owners</h2>
            <p>
              Venue owners are responsible for the accuracy of displayed information (prices, times, availability).
              Badelz does not guarantee court availability or quality of service provided.
            </p>
          </section>

          <p className="text-[#666] text-xs mt-8">
            Last updated: March 2026
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
