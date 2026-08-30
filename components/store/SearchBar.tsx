"use client";

import { Search, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="search-bar">
      <Search size={18} className="search-bar__icon" />
      <input
        type="search"
        className="search-bar__input"
        placeholder={t("search.placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t("search.placeholder")}
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange("")}
          aria-label={t("search.clear")}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}