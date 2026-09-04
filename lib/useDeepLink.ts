"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function extractStartParam(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Telegram WebApp object
  const webApp = (window as { Telegram?: { WebApp?: { initDataUnsafe?: { start_param?: string }; initData?: string } } }).Telegram?.WebApp;
  if (typeof webApp?.initDataUnsafe?.start_param === "string" && webApp.initDataUnsafe.start_param) {
    return webApp.initDataUnsafe.start_param;
  }

  // 2. Telegram WebApp initData query string
  if (typeof webApp?.initData === "string" && webApp.initData) {
    try {
      const initParams = new URLSearchParams(webApp.initData);
      const param = initParams.get("tgWebAppStartParam") || initParams.get("start_param") || initParams.get("startapp");
      if (param) return param;
    } catch {}
  }

  // 3. URL search params (window.location.search)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("tgWebAppStartParam") || urlParams.get("startapp") || urlParams.get("start_param");
    if (param) return param;
  } catch {}

  // 4. URL hash (window.location.hash)
  try {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const param = hashParams.get("tgWebAppStartParam") || hashParams.get("startapp") || hashParams.get("start_param");
      if (param) return param;
    }
  } catch {}

  return null;
}

export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    let checkCount = 0;

    function checkAndRedirect(): boolean {
      const rawParam = extractStartParam();
      if (!rawParam) return false;

      const match = /^product_(.+)$/.exec(rawParam);
      if (!match || !match[1]) return false;

      const productId = match[1];
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath === `/products/${productId}`) return true;

      router.replace(`/products/${productId}`);
      return true;
    }

    if (checkAndRedirect()) return;

    const interval = setInterval(() => {
      checkCount++;
      if (checkAndRedirect() || checkCount > 10) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [router]);
}
