"use client";

import React from "react";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import { signIn } from "next-auth/react";

export default function Home() {
  const handleLoginGoogle = async () => {
    // Memanggil Google login dan setelah sukses diarahkan ke /dashboard
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="w-full min-h-screen bg-background dark text-foreground overflow-x-hidden">
      <PixelHero
        word1="Sweety"
        word2="Bot"
        description="Beri kabar ke orang tersayang cuma dengan sekali klik. Solusi cepat dan aman di saat kamu sakit, istirahat, atau butuh bantuan darurat."
        primaryCta="Login dengan Google"
        primaryCtaMobile="Login Google"
        onPrimaryClick={handleLoginGoogle}
      />
    </main>
  );
}
