"use client";

import { useLanguage } from "@/lib/i18n";

export default function PromoBanner() {
  const { t } = useLanguage();

  return (
    <section className="promo-banner" aria-label="Promotion">
      <div className="promo-banner__image" role="img" aria-label="Promotion image" />
      <div className="promo-banner__content">
        <h2 className="promo-banner__title">{t("home.heroTitle")}</h2>
        <p className="promo-banner__subtitle">{t("home.heroSubtitle")}</p>
      </div>
    </section>
  );
}
