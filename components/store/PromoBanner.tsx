import { ArrowRight, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function PromoBanner() {
  const { t } = useLanguage();

  return (
    <section className="promo-banner" aria-label="Promotion">
      <div className="promo-banner__content">
        <h2 className="promo-banner__title">{t("home.heroTitle")}</h2>
        <p className="promo-banner__subtitle">{t("home.heroSubtitle")}</p>
        <div className="promo-banner__actions">
          <button type="button" className="promo-banner__cta">
            {t("home.shopNow")}
          </button>
          <button
            type="button"
            className="promo-banner__arrow"
            aria-label={t("home.browseProducts")}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <span className="promo-banner__visual" aria-hidden="true">
        <Zap size={40} fill="currentColor" />
      </span>
    </section>
  );
}
