"use client";

import { useSession } from "next-auth/react";
import { Users, Plus, Trash2, HelpCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export default function ContactsPage() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [groupChatId, setGroupChatId] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchContacts();
    }
  }, [session]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/contacts?email=${session?.user?.email}`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!groupName || !groupChatId) return;
    setAdding(true);
    try {
      await fetch(`${BACKEND_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          name: session?.user?.name,
          groupName,
          groupChatId,
        }),
      });
      setGroupName("");
      setGroupChatId("");
      fetchContacts();
    } catch (err) {
      alert("Gagal menambahkan kontak");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kontak ini?")) return;
    try {
      await fetch(`${BACKEND_URL}/contacts/${id}`, { method: "DELETE" });
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) return null;

  return (
    <div className="p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Kontak Telegram</h1>
        <p className="text-muted-foreground text-sm">
          Atur ke mana Sweety Bot harus mengirim pesan. Kamu bisa mendaftarkan ID Grup Telegram di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Add Contact */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-card border border-white/5 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Kontak / Grup</label>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Misal: Grup Kita Berdua"
                className="mt-1.5 w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chat ID Telegram</label>
              <input 
                type="text" 
                value={groupChatId}
                onChange={(e) => setGroupChatId(e.target.value)}
                placeholder="Misal: -100123456789"
                className="mt-1.5 w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white"
              />
            </div>
            <button 
              onClick={handleAdd}
              disabled={adding || !groupName || !groupChatId}
              className="w-full flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold transition-colors mt-2 disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Tambah Kontak
            </button>
          </div>
        </div>

        {/* List Contacts */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white/80">Kontak Tersimpan ({contacts.length})</h3>
          
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-card border border-white/5 border-dashed">
              <Users className="w-12 h-12 text-white/10 mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Belum ada kontak atau grup yang diatur.<br/>
                Tambahkan kontak di sebelah kiri.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {contact.group_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{contact.group_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{contact.group_chat_id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
