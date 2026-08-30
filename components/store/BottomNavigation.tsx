"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "./icons/HomeIcon";
import SellIcon from "./icons/SellIcon";
import FavoritesIcon from "./icons/FavoritesIcon";
import OrdersIcon from "./icons/OrdersIcon";

const ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/sell-device", label: "Sell", icon: SellIcon },
  { href: "/favorites", label: "Favorites", icon: FavoritesIcon },
  { href: "/orders", label: "Orders", icon: OrdersIcon },
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
