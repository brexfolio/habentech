"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, ClipboardList } from "lucide-react";
import HandshakeIcon from "./icons/HandshakeIcon";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/sell-device", label: "Sell", icon: HandshakeIcon },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/orders", label: "Orders", icon: ClipboardList },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav__item ${active ? "bottom-nav__item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={22} />
            {active && <span className="bottom-nav__label">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
