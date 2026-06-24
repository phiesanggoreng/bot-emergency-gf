"use client";

import { useSession } from "next-auth/react";
import {
  Settings2,
  Bell,
  Smartphone,
  Save,
  RotateCcw,
  Loader2,
  Check,
  ShieldCheck,
  HeartPulse,
  Bed,
  AlertTriangle,
  Pencil,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface Template {
  status: string;
  emoji: string;
  label: string;
  message: string;
  isCustom: boolean;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SAFE: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  SICK_BUT_SAFE: <HeartPulse className="w-5 h-5 text-amber-400" />,
  RESTING: <Bed className="w-5 h-5 text-sky-400" />,
  EMERGENCY: <AlertTriangle className="w-5 h-5 text-red-500" />,
};

const STATUS_COLORS: Record<string, string> = {
  SAFE: "border-emerald-500/20 hover:border-emerald-500/40",
  SICK_BUT_SAFE: "border-amber-500/20 hover:border-amber-500/40",
  RESTING: "border-sky-500/20 hover:border-sky-500/40",
  EMERGENCY: "border-red-500/20 hover:border-red-500/40",
};

const STATUS_NAMES: Record<string, string> = {
  SAFE: "Aman",
  SICK_BUT_SAFE: "Sakit tapi Aman",
  RESTING: "Istirahat",
  EMERGENCY: "Emergency",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ emoji: "", label: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await apiFetch("/templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTemplates();
    }
  }, [session, fetchTemplates]);

  const startEditing = (template: Template) => {
    setEditingStatus(template.status);
    setEditForm({
      emoji: template.emoji,
      label: template.label,
      message: template.message,
    });
  };

  const cancelEditing = () => {
    setEditingStatus(null);
    setEditForm({ emoji: "", label: "", message: "" });
  };

  const handleSave = async (status: string) => {
    setSaving(true);
    try {
      await apiFetch(`/templates/${status}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setSaveSuccess(status);
      setTimeout(() => setSaveSuccess(null), 2000);
      setEditingStatus(null);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan template");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (status: string) => {
    if (!confirm("Reset template ini ke default?")) return;
    setResetting(status);
    try {
      await apiFetch(`/templates/${status}`, { method: "DELETE" });
      fetchTemplates();
    } catch (err) {
      console.error(err);
      alert("Gagal mereset template");
    } finally {
      setResetting(null);
    }
  };

  if (!session) return null;

  return (
    <div className="p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
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

        {/* Reminder Settings — Still Placeholder */}
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
      </div>

      {/* Message Templates — NOW FUNCTIONAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-sky-400" />
          <div>
            <h3 className="font-semibold text-white">Template Pesan</h3>
            <p className="text-sm text-muted-foreground">
              Kustomisasi kalimat yang akan dikirim bot ke Telegram untuk setiap status. Gunakan variabel yang tersedia untuk personalisasi.
            </p>
          </div>
        </div>

        {/* Variable Help */}
        <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 text-xs text-sky-300/80">
          <strong className="text-sky-300">💡 Tips:</strong> Field &ldquo;Pesan&rdquo; akan ditampilkan setelah nama kamu di Telegram.
          Contoh: jika pesannya &ldquo;sedang baik-baik saja&rdquo;, maka yang terkirim adalah &ldquo;{session.user?.name?.split(" ")[0]} sedang baik-baik saja&rdquo;.
        </div>

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => {
              const isEditing = editingStatus === template.status;
              const justSaved = saveSuccess === template.status;

              return (
                <div
                  key={template.status}
                  className={`p-5 rounded-2xl bg-card border transition-all duration-300 ${
                    isEditing ? "border-primary/40 ring-1 ring-primary/20" : STATUS_COLORS[template.status] || "border-white/5"
                  }`}
                >
                  {/* Template Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {STATUS_ICONS[template.status]}
                      <div>
                        <h4 className="font-semibold text-sm text-white">{STATUS_NAMES[template.status]}</h4>
                        {template.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            Kustom
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {justSaved && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Tersimpan
                        </span>
                      )}
                      {!isEditing ? (
                        <button
                          onClick={() => startEditing(template)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                          title="Edit template"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={cancelEditing}
                          className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                          title="Batal edit"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="grid grid-cols-[80px_1fr] gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Emoji</label>
                          <input
                            type="text"
                            value={editForm.emoji}
                            onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                            className="mt-1 w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-primary/50 transition-colors text-white"
                            maxLength={4}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Label Status</label>
                          <input
                            type="text"
                            value={editForm.label}
                            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                            placeholder="contoh: Aman"
                            className="mt-1 w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pesan (akan muncul setelah nama)</label>
                        <textarea
                          value={editForm.message}
                          onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                          placeholder="contoh: sedang baik-baik saja dan beraktivitas normal."
                          rows={2}
                          className="mt-1 w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white resize-none"
                        />
                      </div>

                      {/* Preview */}
                      <div className="p-3 rounded-lg bg-background/50 border border-white/5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Preview Telegram:</p>
                        <p className="text-sm text-white/80">
                          {editForm.emoji} Check-in: {editForm.label}
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          {session.user?.name?.split(" ")[0] || "Kamu"} {editForm.message}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSave(template.status)}
                          disabled={saving || !editForm.emoji || !editForm.label || !editForm.message}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Simpan
                        </button>
                        {template.isCustom && (
                          <button
                            onClick={() => handleReset(template.status)}
                            disabled={resetting === template.status}
                            className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
                          >
                            {resetting === template.status ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            Reset Default
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{template.emoji}</span>
                        <span className="font-medium text-white/90">{template.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                        &ldquo;{session.user?.name?.split(" ")[0] || "Kamu"} {template.message}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
