"use client";

import { ArrowLeft, ShieldCheck } from "lucide-react";

interface AdminNavigationProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function AdminNavigation({ title, subtitle, onBack }: AdminNavigationProps) {
  return (
    <div className="admin-topnav">
      <div className="admin-topnav__left">
        {onBack && (
          <button type="button" className="admin-topnav__back" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={19} />
          </button>
        )}
        <div>
          <h1 className="admin-topnav__title">{title}</h1>
          {subtitle && <p className="admin-topnav__subtitle">{subtitle}</p>}
        </div>
      </div>
      {!onBack && (
        <div className="admin-topnav__badge" aria-hidden="true">
          <ShieldCheck size={20} />
        </div>
      )}
    </div>
  );
}
