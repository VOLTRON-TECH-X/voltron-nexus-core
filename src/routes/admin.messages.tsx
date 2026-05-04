import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesPage,
});

interface Msg { id: string; name: string; email: string; subject: string | null; message: string; read: boolean; created_at: string; }

function MessagesPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const load = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMsgs((data as Msg[]) ?? []);
  };

  useEffect(() => { void load(); }, []);

  const toggleRead = async (m: Msg) => { await supabase.from("contact_messages").update({ read: !m.read }).eq("id", m.id); void load(); };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("contact_messages").delete().eq("id", id); toast.success("Deleted"); void load(); };

  return (
    <div>
      <h1 className="font-display text-4xl font-black mb-8">Inbox</h1>
      <div className="space-y-3">
        {msgs.length === 0 && <div className="glass rounded-2xl p-12 text-center text-muted-foreground">No messages.</div>}
        {msgs.map((m) => (
          <div key={m.id} className={`glass rounded-2xl p-5 ${m.read ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{m.name}</h3>
                  <span className="text-xs text-muted-foreground font-mono">{m.email}</span>
                </div>
                {m.subject && <div className="text-sm text-primary font-mono">{m.subject}</div>}
                <p className="text-sm mt-2 whitespace-pre-wrap">{m.message}</p>
                <div className="text-[10px] text-muted-foreground mt-2 font-mono">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggleRead(m)}>{m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
