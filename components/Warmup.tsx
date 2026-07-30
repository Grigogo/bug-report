"use client";

import { useEffect } from "react";

// Будит базу при открытии сайта и возврате на вкладку (не чаще раза в 4 минуты),
// чтобы первый клик после паузы не ждал пробуждения Neon
export function Warmup() {
  useEffect(() => {
    let last = 0;
    const ping = () => {
      if (Date.now() - last < 4 * 60_000) return;
      last = Date.now();
      fetch("/api/warm").catch(() => {});
    };
    ping();
    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return null;
}
