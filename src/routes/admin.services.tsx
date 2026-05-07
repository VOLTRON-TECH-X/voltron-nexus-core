import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({
  component: AdminServicesPage,
});

interface Service {
  id: string;
  title: string;
  tag: string | null;
  description: string;
  icon: string | null;
  features: string[];
  cover_image: string | null;
  is_active: boolean;
  sort_order: number;
}

const empty: Partial<Service> = {
  title: "", tag: "", description: "", icon: "Shield", features: [], cover_image: "", is_active: true, sort_order: 0,
};

function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [busy, setBusy] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("services").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setItems((data as Service[]) ?? []);
  };

  useEffect(() => { void load(); }, []);

  const openEdit = (s?: Service) => {
    const item = s ?? { ...empty };
    setEditing(item);
    setFeaturesText((item.features ?? []).join("\n"));
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) return toast.error("Title required");
    setBusy(true);
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
    const payload = {
      title: editing.title.trim(),
      tag: editing.tag || null,
      description: editing.description ?? "",
      icon: editing.icon || "Shield",
      features,
      cover_image: editing.cover_image || null,
      is_active: !!editing.is_active,
      sort_order: Number(editing.sort_order) || 0,
    };
    const { error } = editing.id
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Service updated" : "Service added");
    setEditing(null);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    void load();
  };

  const toggle = async (s: Service) => {
    await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
    void load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-black">Services</h1>
          <p className="text-muted-foreground mt-1">Manage public service offerings.</p>
        </div>
        <Button variant="neon" onClick={() => openEdit()}>
          <Plus className="h-4 w-4 mr-2" /> New Service
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.length === 0 && <div className="text-muted-foreground col-span-2 text-center py-12 glass rounded-2xl">No services yet.</div>}
        {items.map((s) => (
          <div key={s.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                {s.tag && <div className="text-xs font-mono text-secondary tracking-widest">{s.tag}</div>}
                <h3 className="font-display text-lg font-bold mt-1">{s.title}</h3>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggle(s)} title={s.is_active ? "Hide" : "Show"}>
                  <Power className={`h-4 w-4 ${s.is_active ? "text-primary" : "text-muted-foreground"}`} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
            <div className="text-[10px] font-mono text-muted-foreground mt-3">icon: {s.icon} · {s.features.length} features · sort {s.sort_order}</div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="glass-strong neon-border rounded-2xl w-full max-w-2xl p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold">{editing.id ? "Edit Service" : "New Service"}</h2>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <Label>Tag (e.g. PRIVACY)</Label>
                  <Input value={editing.tag ?? ""} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon (lucide name)</Label>
                  <Input value={editing.icon ?? ""} placeholder="Shield, Cloud, Globe…" onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label>Cover image URL</Label>
                <Input value={editing.cover_image ?? ""} placeholder="https://…/image.jpg" onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} />
                {editing.cover_image && <img src={editing.cover_image} alt="" className="mt-2 h-32 rounded object-cover" />}
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <Textarea rows={5} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Visible to public
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="neon" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
