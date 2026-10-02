"use client";

import Link from "next/link";
import { InstituteMark } from "@/components/shared/institute-mark";
import { useLanguage } from "@/lib/i18n/context";

export function SiteFooter() {
  const { t, locale } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <InstituteMark size={34} />
              <div>
                <p className="text-sm font-semibold text-foreground">{t("brand.name")}</p>
                <p className="text-xs text-muted-foreground">{t("brand.location")}, Bangladesh</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {locale === "bn" ? "দ্রুত লিংক" : "Quick links"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">{t("nav.about")}</Link></li>
              <li><Link href="/departments" className="hover:text-foreground">{t("nav.departments")}</Link></li>
              <li><Link href="/notices" className="hover:text-foreground">{t("nav.notices")}</Link></li>
              <li><Link href="/future" className="hover:text-foreground">{t("nav.futureScope")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("nav.contact")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>{locale === "bn" ? "ভাতশালা, শেরপুর" : "Bhatshala, Sherpur, Bangladesh"}</li>
              <li>info@sgpi.example</li>
              <li>+880-XXX-XXXXXX</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {locale === "bn" ? "পোর্টাল" : "Portal"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">{t("nav.login")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            © {year} {t("brand.name")}. {locale === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>
          <p className="mt-1">
            {locale === "bn"
              ? "এটি একটি EMIS ডেমোনস্ট্রেশন প্রোটোটাইপ। এই সাইটের সকল তথ্য, নোটিশ ও পরিসংখ্যান কাল্পনিক এবং শুধুমাত্র প্রদর্শনের উদ্দেশ্যে ব্যবহৃত।"
              : "This is an EMIS demonstration prototype. All information, notices, and statistics on this site are fictional and for demonstration purposes only."}
          </p>
          <p className="mt-1">
            {locale === "bn" ? "ডেভেলপার: " : "Developed by: "}
            <a
              href="https://www.wahednur.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              Wahed Nur
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
