"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";
import Modal from "@/components/ui/Modal";
import { hapticImpact } from "@/lib/telegram";

const OPTIONS: { value: Language; label: string; code: string }[] = [
  { value: "en", label: "English", code: "Eng" },
  { value: "am", label: "አማርኛ", code: "አማ" },
];

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="store-header__lang-btn"
        onClick={() => {
          hapticImpact("light");
          setIsOpen(true);
        }}
        aria-label={t("language.title")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {OPTIONS.find((option) => option.value === lang)?.code}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("language.title")}
      >
        <div className="select-sheet-list">
          {OPTIONS.map((option) => {
            const active = lang === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`select-sheet-option ${
                  active ? "select-sheet-option--active" : ""
                }`}
                onClick={() => {
                  setLang(option.value);
                  setIsOpen(false);
                }}
              >
                <span>
                  {option.label}
                  <span className="select-sheet-option__code">
                    {option.code}
                  </span>
                </span>
                {active && <Check size={18} />}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}