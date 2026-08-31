"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Handles Telegram Mini App deep links. When a customer taps a
 * channel "View Product" button, Telegram opens the Mini App with
 * `startapp=product_<id>`, which Telegram surfaces on the client as
 * `initDataUnsafe.start_param`. This hook reads it once on mount and
 * routes the customer straight to that product.
 *
 * Only triggers when there is a `product_` start parameter and we are
 * not already on that product page (e.g. a refresh of the deep link).
 */
export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const webApp = (window as { Telegram?: any }).Telegram?.WebApp;
    const startParam: unknown = webApp?.initDataUnsafe?.start_param;
    if (typeof startParam !== "string") return;

    const match = /^product_(.+)$/.exec(startParam);
    if (!match) return;

    const productId = match[1];
    if (!productId) return;

    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath === `/products/${productId}`) return;

    router.replace(`/products/${productId}`);
  }, [router]);
}
