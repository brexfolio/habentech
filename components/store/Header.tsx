"use client";

import Link from "next/link";
import { Zap, Heart } from "lucide-react";
import { useTelegramUser } from "@/lib/useTelegramUser";

export default function Header({ storeName = "Habentech Electronics" }: { storeName?: string }) {
  const { user } = useTelegramUser();

  return (
    <header className="store-header">
      <div className="store-header__brand">
        <div className="store-header__logo">
          <Zap size={20} fill="currentColor" />
        </div>
        <div className="store-header__text">
          <p className="store-header__name">{storeName}</p>
          {user?.first_name && (
            <p className="store-header__greeting">Hey, {user.first_name} 👋</p>
          )}
        </div>
      </div>
      <Link href="/favorites" className="store-header__favorite-btn" aria-label="View favorites">
        <Heart size={19} />
      </Link>
    </header>
  );
}
