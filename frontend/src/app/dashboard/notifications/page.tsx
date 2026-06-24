"use client";

import { useSession } from "next-auth/react";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  User,
  Loader2,
  Send,
  Filter,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

// Map notification type to display info
const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  CHECKIN: { label: "Check-in", color: "text-primary" },
  EMERGENCY: { label: "Emergency", color: "text-red-500" },
  REMINDER: { label: "Reminder", color: "text-amber-400" },
};

// Map status to display info
const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }> = {
  SUCCESS: { icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-500/10", label: "Terkirim" },
  FAILED: { icon: XCircle, color: "text-red-400", bgColor: "bg-red-500/10", label: "Gagal" },
};

type FilterType = "ALL" | "SUCCESS" | "FAILED";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<{ id: string; status: string; message: string; sent_at: string; target_type: string; type: string; target_chat_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const fetchLogs = useCallback(async () => {
    try {
      const res = await apiFetch("/checkin/notifications");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchLogs();
    }
  }, [session, fetchLogs]);

  if (!session) return null;

  const filteredLogs = filter === "ALL" ? logs : logs.filter((l) => l.status === filter);
  const successCount = logs.filter((l) => l.status === "SUCCESS").length;
  const failedCount = logs.filter((l) => l.status === "FAILED").length;

  return (
    <div className="p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Log Notifikasi
        </h1>
        <p className="text-muted-foreground text-sm">
          Pantau setiap pesan yang dikirim bot ke Telegram. Lihat mana yang sukses dan mana yang gagal.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-card border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground font-medium">Sukses</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{successCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-muted-foreground font-medium">Gagal</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{failedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["ALL", "SUCCESS", "FAILED"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-card border border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
            }`}
          >
            {f === "ALL" ? "Semua" : f === "SUCCESS" ? "Sukses" : "Gagal"}
            <span className="ml-1.5 opacity-60">
              {f === "ALL" ? logs.length : f === "SUCCESS" ? successCount : failedCount}
            </span>
          </button>
        ))}
      </div>

      {/* Log List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-card border border-white/5 border-dashed">
          <Bell className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            {filter !== "ALL"
              ? `Tidak ada notifikasi dengan status "${filter === "SUCCESS" ? "Sukses" : "Gagal"}".`
              : "Belum ada log notifikasi."}
            <br />
            Log akan muncul di sini setelah kamu mengirim check-in dari Dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const dateObj = new Date(log.sent_at);
            const dateStr = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.SUCCESS;
            const typeConfig = TYPE_CONFIG[log.type] || TYPE_CONFIG.CHECKIN;
            const StatusIcon = statusConfig.icon;
            const isGroup = log.target_type === "GROUP";

            return (
              <div
                key={log.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-colors group"
              >
                {/* Status Icon */}
                <div
                  className={`w-10 h-10 rounded-full ${statusConfig.bgColor} flex items-center justify-center shrink-0`}
                >
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                </div>

                {/* Message & Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">
                      {log.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {/* Target Type */}
                    <span className="flex items-center gap-1">
                      {isGroup ? (
                        <Users className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {isGroup ? "Grup" : "Personal"}
                    </span>
                    {/* Type Badge */}
                    <span className={`${typeConfig.color} font-medium`}>
                      {typeConfig.label}
                    </span>
                    {/* Chat ID */}
                    <span className="font-mono opacity-50 truncate max-w-[120px]">
                      {log.target_chat_id}
                    </span>
                  </div>
                </div>

                {/* Timestamp & Status */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateStr}, {timeStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
