"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface AdminActionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  tone?: "primary" | "accent" | "success" | "warning";
}

const ICON_TONE_CLASS: Record<string, string> = {
  primary: "",
  accent: "admin-action-card__icon--accent",
  success: "admin-action-card__icon--success",
  warning: "admin-action-card__icon--warning",
};

export default function AdminActionCard({
  icon: Icon,
  label,
  description,
  onClick,
  tone = "primary",
}: AdminActionCardProps) {
  return (
    <button type="button" className="admin-action-card" onClick={onClick}>
      <div className={`admin-action-card__icon ${ICON_TONE_CLASS[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="admin-action-card__label">{label}</p>
        <p className="admin-action-card__desc">{description}</p>
      </div>
      <ChevronRight size={16} style={{ alignSelf: "flex-end", color: "var(--admin-text-muted)" }} />
    </button>
  );
}
