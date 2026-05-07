import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Upload, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/vpn")({
  component: AdminVpnPage,
});

type VpnType = "HTTP_CUSTOM" | "SSH_CUSTOM" | "HTTP_INJECTOR";
interface VpnConfig {
  id: string;
  name: string;
  type: VpnType;
  description: string;
  config_text: string | null;
  file_url: string | null;
  file_name: string | null;
  cover_image: string | null;
  is_active: boolean;
  download_count: number;
  sort_order: number;
}

const empty: Partial<VpnConfig> = {
  name: "", type: "HTTP_CUSTOM", description: "", config_text: "",
  file_url: "", file_name: "", cover_image: "", is_active: true, sort_order: 0,
};

function AdminVpnPage() {
  const [items, setItems] = useState<VpnConfig[]>([]);
  const [editing, setEditing] = useState<Partial<VpnConfig> | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("vpn_configs").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as VpnConfig[]) ?? []);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) return toast.error("Name required");
    setBusy(true);
    const payload = {
      name: editing.name.trim(),
      type: editing.type as VpnType,
      description: editing.description ?? "",
      config_text: editing.config_text || null,
      file_url: editing.file_url || null,
      file_name: editing.file_name || null,
      cover_image: editing.cover_image || null,
      is_active: !!editing.is_active,
      sort_order: Number(editing.sort_order) || 0,
    };
    const { error } = editing.id
      ? await supabase.from("vpn_configs").update(payload).eq("id", editing.id)
      : await supabase.from("vpn_configs").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Config updated" : "Config added");
    setEditing(null);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this config?")) return;
    const { error } = await supabase.from("vpn_configs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    void load();
  };

  const toggle = async (c: VpnConfig) => {
    await supabase.from("vpn_configs").update({ is_active: !c.is_active }).eq("id", c.id);
    void load();
  };

  const uploadFile = async (file: File) => {
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("vpn-files").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("vpn-files").getPublicUrl(path);
    setEditing((e) => ({ ...e!, file_url: data.publicUrl, file_name: file.name }));
    toast.success("File uploaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-black">VPN Configs</h1>
          <p className="text-muted-foreground mt-1">HTTP Custom · SSH Custom · HTTP Injector files & instructions</p>
        </div>
        <Button variant="neon" onClick={() => setEditing({ ...empty })}>
          <Plus className="h-4 w-4 mr-2" /> New Config
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.length === 0 && <div className="text-muted-foreground col-span-2 text-center py-12 glass rounded-2xl">No configs yet.</div>}
        {items.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-mono text-secondary tracking-widest">{c.type.replace("_", " ")}</div>
                <h3 className="font-display text-lg font-bold mt-1">{c.name}</h3>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggle(c)} title={c.is_active ? "Hide" : "Show"}>
                  <Power className={`h-4 w-4 ${c.is_active ? "text-primary" : "text-muted-foreground"}`} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Edit2 className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
            <div className="flex gap-3 mt-3 text-xs font-mono text-muted-foreground">
              {c.file_url && <span>📁 {c.file_name}</span>}
              {c.config_text && <span>📋 text snippet</span>}
              <span>↓ {c.download_count}</span>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="glass-strong neon-border rounded-2xl w-full max-w-2xl p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold">{editing.id ? "Edit Config" : "New Config"}</h2>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>Type</Label>
                  <select className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm" value={editing.type ?? "HTTP_CUSTOM"} onChange={(e) => setEditing({ ...editing, type: e.target.value as VpnType })}>
                    <option value="HTTP_CUSTOM">HTTP Custom</option>
                    <option value="SSH_CUSTOM">SSH Custom</option>
                    <option value="HTTP_INJECTOR">HTTP Injector</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Description / Maelekezo (Markdown supported)</Label>
                <Textarea rows={6} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label>Copyable config text (optional)</Label>
                <Textarea rows={4} className="font-mono text-xs" value={editing.config_text ?? ""} onChange={(e) => setEditing({ ...editing, config_text: e.target.value })} />
              </div>
              <div>
                <Label>Config file (.ehi, .hc, .json, etc.)</Label>
                <div className="flex gap-2 items-center">
                  <Input value={editing.file_url ?? ""} placeholder="URL or upload" onChange={(e) => setEditing({ ...editing, file_url: e.target.value })} />
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                    <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-primary/10 text-primary text-sm hover:bg-primary/20"><Upload className="h-4 w-4" />Upload</span>
                  </label>
                </div>
                {editing.file_name && <p className="text-xs text-muted-foreground mt-1 font-mono">📁 {editing.file_name}</p>}
              </div>
              <div>
                <Label>Cover image URL</Label>
                <Input value={editing.cover_image ?? ""} placeholder="https://…/image.jpg" onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} />
                {editing.cover_image && <img src={editing.cover_image} alt="" className="mt-2 h-32 rounded object-cover" />}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                  Visible to public
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <Label className="!mb-0">Sort</Label>
                  <Input type="number" className="w-20" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
              </div>
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
