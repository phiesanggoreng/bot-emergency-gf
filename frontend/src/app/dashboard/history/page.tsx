"use client";

import { useSession } from "next-auth/react";
import { Clock, ShieldCheck, HeartPulse, Bed, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SAFE: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
  SICK_BUT_SAFE: <HeartPulse className="w-4 h-4 text-amber-400" />,
  RESTING: <Bed className="w-4 h-4 text-sky-400" />,
  EMERGENCY: <AlertTriangle className="w-4 h-4 text-red-500" />
};

const STATUS_COLORS: Record<string, string> = {
  SAFE: "text-emerald-400",
  SICK_BUT_SAFE: "text-amber-400",
  RESTING: "text-sky-400",
  EMERGENCY: "text-red-500"
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<{ id: string; status: string; message: string; created_at: string; source: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiFetch("/checkin/history");
      if (!res.ok) throw new Error("Gagal mengambil history");
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        console.error("Invalid response for history:", data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchHistory();
    }
  }, [session, fetchHistory]);

  if (!session) return null;

  return (
    <div className="p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Riwayat Check-in</h1>
        <p className="text-muted-foreground text-sm">
          Jejak histori statusmu. Berguna agar pasangan tahu kapan terakhir kali kamu memberi kabar.
        </p>
      </div>

      <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-8 pb-8">
        
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : history.length === 0 ? (
           <div className="pl-6 md:pl-8">
             <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-card border border-white/5 border-dashed">
               <Clock className="w-10 h-10 text-white/10 mb-3" />
               <p className="text-sm text-muted-foreground text-center">
                 Belum ada riwayat check-in.<br/>
                 Riwayat akan muncul di sini setelah kamu mengirim status dari Dashboard.
               </p>
             </div>
           </div>
        ) : (
          history.map((item) => {
            const dateObj = new Date(item.created_at);
            const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={item.id} className="relative pl-6 md:pl-8">
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center">
                  {STATUS_ICONS[item.status] || <Clock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="bg-card border border-white/5 rounded-xl p-4 shadow-sm hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold ${STATUS_COLORS[item.status] || "text-white"}`}>{item.message || item.status}</h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {dateStr}, {timeStr}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Status terkirim sukses via {item.source}.</p>
                </div>
              </div>
            );
          })
        )}
        
      </div>
    </div>
  );
}
