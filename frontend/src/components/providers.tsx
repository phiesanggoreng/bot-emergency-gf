"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered"))
        .catch((err) => console.error("Service Worker error", err));
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
