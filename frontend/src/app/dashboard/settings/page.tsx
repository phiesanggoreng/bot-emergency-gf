"use client";

import { useSession } from "next-auth/react";
import { Settings2, Bell, Shield, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Pengaturan Bot</h1>
        <p className="text-muted-foreground text-sm">
          Sesuaikan bagaimana bot bekerja, format pesan, dan preferensi notifikasi lainnya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Telegram Bot Connection */}
        <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Koneksi Telegram</h3>
          </div>
          <p className="text-sm text-muted-foreground">Status koneksi bot Sweety dengan akun Telegram milikmu.</p>
          
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-white/5">
            <span className="text-sm">Status Bot</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">Online</span>
          </div>
          
          <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors py-2 border border-primary/20 rounded-lg hover:bg-primary/10 mt-2">
            Test Ping ke Bot
          </button>
        </div>

        {/* Reminder Settings */}
        <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-4 opacity-50 relative pointer-events-none">
          <div className="absolute top-2 right-4 px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold text-white/50">Segera Hadir</div>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold">Auto Reminder</h3>
          </div>
          <p className="text-sm text-muted-foreground">Bot akan menanyakan kabarmu jika kamu belum check-in selama waktu tertentu.</p>
          
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-white/5">
            <span className="text-sm">Ingatkan Jika Kosong</span>
            <span className="text-sm font-medium">12 Jam</span>
          </div>
        </div>

        {/* Message Templates */}
        <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-4 opacity-50 relative pointer-events-none md:col-span-2">
          <div className="absolute top-2 right-4 px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold text-white/50">Segera Hadir</div>
          <div className="flex items-center gap-3 mb-2">
            <Settings2 className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold">Template Pesan</h3>
          </div>
          <p className="text-sm text-muted-foreground">Kustomisasi kalimat yang akan dikirim bot ke grup untuk masing-masing status.</p>
        </div>

      </div>
    </div>
  );
}
