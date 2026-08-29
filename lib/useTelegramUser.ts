"use client";

import { useEffect, useState } from "react";
import {
  initTelegramApp,
  getTelegramUser,
  getColorScheme,
  isTelegramEnvironment,
  type TelegramUser,
} from "./telegram";

export function useTelegramUser() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [inTelegram, setInTelegram] = useState(false);

  useEffect(() => {
    initTelegramApp();
    setUser(getTelegramUser());
    setInTelegram(isTelegramEnvironment());
    setIsReady(true);

    const theme = getColorScheme();
    document.documentElement.setAttribute("data-tg-theme", theme);
  }, []);

  return { user, isReady, inTelegram };
}
