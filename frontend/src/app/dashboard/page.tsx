"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ShieldCheck, HeartPulse, Bed, AlertTriangle, Info, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type CheckinStatus = "SAFE" | "SICK_BUT_SAFE" | "RESTING" | "EMERGENCY";

export default function Dashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<CheckinStatus | null>(null);
  const [success, setSuccess] = useState<CheckinStatus | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<{ delivered: number; failed: number } | null>(null);
  const [contacts, setContacts] = useState<{ id: string; group_name: string; group_chat_id: string }[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("ALL");

  useEffect(() => {
    if (session?.user?.email) {
      apiFetch("/contacts")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setContacts(data);
            if (data.length > 0) {
              setSelectedChatId("ALL");
            }
          } else {
            console.error("Invalid response for contacts:", data);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  if (!session) return null;

  const handleCheckin = async (status: CheckinStatus) => {
    if (loading) return;
    
    if (status === "EMERGENCY") {
      const confirmed = window.confirm("Kirim alert Emergency sekarang? Pesan akan ditandai dengan prioritas tinggi!");
      if (!confirmed) return;
    }

    setLoading(status);
    setSuccess(null);

    try {
      const res = await apiFetch("/checkin", {
        method: "POST",
        body: JSON.stringify({
          chatId: selectedChatId,
          status,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengirim");
      }

      const result = await res.json();
      setDeliveryInfo({ delivered: result.delivered || 0, failed: result.failed || 0 });
      setSuccess(status);
      setTimeout(() => { setSuccess(null); setDeliveryInfo(null); }, 4000);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      alert(error.message || "Gagal mengirim pesan ke Telegram.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-8 font-sans max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
          Halo, {session.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Bagaimana kondisimu hari ini? Pilih status untuk memberi kabar ke Telegram.
        </p>
      </div>

      {/* Success Toast */}
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 text-sm font-medium">Pesan berhasil dikirim ke Telegram! ✨</p>
          </div>
          {deliveryInfo && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400">{deliveryInfo.delivered} terkirim</span>
              {deliveryInfo.failed > 0 && (
                <span className="text-red-400">{deliveryInfo.failed} gagal</span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Info Section - Telegram Target Selector */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <h3 className="font-semibold text-primary text-sm">Tujuan Pengiriman</h3>
            <p className="text-primary/70 text-xs mt-1 leading-relaxed">
              Pilih kemana bot harus mengirim pesan statusmu.
            </p>
          </div>
        </div>
        <select 
          value={selectedChatId}
          onChange={(e) => setSelectedChatId(e.target.value)}
          className="bg-background border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary w-full md:w-auto min-w-[200px]"
        >
          <option value="ALL">Kirim ke Semua ({contacts.length} Kontak)</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.group_chat_id}>{c.group_name}</option>
          ))}
        </select>
      </div>

      {/* Check-in Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <ActionButton 
          icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
          title="Aku Aman"
          description="Kirim sinyal bahwa kamu baik-baik saja dan sedang beraktivitas normal."
          gradient="from-emerald-500/10 to-emerald-500/0"
          ringColor="ring-emerald-500/20"
          isLoading={loading === "SAFE"}
          isSuccess={success === "SAFE"}
          onClick={() => handleCheckin("SAFE")}
        />
        <ActionButton 
          icon={<HeartPulse className="w-6 h-6 text-amber-400" />}
          title="Sakit tapi Aman"
          description="Lagi kurang sehat, butuh waktu pemulihan tapi belum butuh bantuan darurat."
          gradient="from-amber-500/10 to-amber-500/0"
          ringColor="ring-amber-500/20"
          isLoading={loading === "SICK_BUT_SAFE"}
          isSuccess={success === "SICK_BUT_SAFE"}
          onClick={() => handleCheckin("SICK_BUT_SAFE")}
        />
        <ActionButton 
          icon={<Bed className="w-6 h-6 text-sky-400" />}
          title="Istirahat Dulu"
          description="Lagi pengen tidur atau butuh waktu menjauh dari HP sebentar."
          gradient="from-sky-500/10 to-sky-500/0"
          ringColor="ring-sky-500/20"
          isLoading={loading === "RESTING"}
          isSuccess={success === "RESTING"}
          onClick={() => handleCheckin("RESTING")}
        />
        
        {/* Emergency Button - Special styling */}
        <div className="sm:col-span-2 relative group mt-2">
           <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
           <button 
             onClick={() => handleCheckin("EMERGENCY")}
             disabled={!!loading}
             className="relative flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-card border border-red-500/30 transition-all duration-300 w-full active:scale-[0.98] overflow-hidden text-center hover:bg-red-500/5 backdrop-blur-sm disabled:opacity-50"
           >
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
             
             <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-3 ring-1 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform duration-300">
                {loading === "EMERGENCY" ? (
                  <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
                ) : success === "EMERGENCY" ? (
                  <Check className="w-7 h-7 text-red-500" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-red-500 drop-shadow-md" />
                )}
             </div>
             <h3 className="text-xl font-bold mb-2 text-foreground">Darurat / Emergency</h3>
             <p className="text-xs text-muted-foreground max-w-sm mx-auto">
               Gunakan HANYA jika kamu butuh bantuan dari orang terdekat sekarang juga.
             </p>
           </button>
        </div>
      </div>

    </div>
  );
}

function ActionButton({ 
  icon, 
  title, 
  description, 
  onClick, 
  gradient,
  ringColor,
  isLoading,
  isSuccess,
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  onClick: () => void, 
  gradient: string,
  ringColor: string,
  isLoading?: boolean,
  isSuccess?: boolean,
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { width, height, left, top } = rect;
    const xPct = (e.clientX - left) / width - 0.5;
    const yPct = (e.clientY - top) / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div style={{ perspective: "1000px" }} className="w-full h-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={isLoading ? undefined : onClick}
        whileTap={isLoading ? undefined : { scale: 0.95 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn("group relative cursor-pointer h-full", isLoading && "pointer-events-none opacity-70")}
      >
        <div
          style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
          className={cn(
            "relative flex flex-col items-start p-6 rounded-2xl bg-card border border-white/5 transition-all duration-300 text-left w-full h-full",
            "hover:border-white/10 hover:shadow-xl",
            isSuccess && "border-emerald-500/30 bg-emerald-500/5"
          )}
        >
          {/* Glass Gradient */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none", gradient)} />
          
          <div 
            style={{ transform: "translateZ(20px)" }}
            className={cn("w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-4 ring-1 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10", ringColor)}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white/50" /> : isSuccess ? <Check className="w-6 h-6 text-emerald-400" /> : icon}
          </div>
          
          <motion.h3 style={{ transform: "translateZ(15px)" }} className="text-lg font-bold mb-1.5 relative z-10">{title}</motion.h3>
          <motion.p style={{ transform: "translateZ(10px)" }} className="text-xs text-muted-foreground relative z-10 leading-relaxed">{description}</motion.p>
        </div>
      </motion.div>
    </div>
  );
}
