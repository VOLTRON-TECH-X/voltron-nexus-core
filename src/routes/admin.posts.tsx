import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Eye, EyeOff, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/posts")({
  component: AdminPostsPage,
});

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  published: boolean;
  read_minutes: number | null;
  created_at: string;
}

const empty: Partial<Post> = {
  title: "", slug: "", excerpt: "", content: "", cover_image: "",
  category: "Tech", tags: [], published: false, read_minutes: 5,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts((data as Post[]) ?? []);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) return toast.error("Title required");
    setBusy(true);
    const payload = {
      title: editing.title.trim(),
      slug: (editing.slug?.trim() || slugify(editing.title)),
      excerpt: editing.excerpt ?? "",
      content: editing.content ?? "",
      cover_image: editing.cover_image || null,
      category: editing.category || "Tech",
      tags: typeof editing.tags === "string" ? (editing.tags as string).split(",").map((t) => t.trim()).filter(Boolean) : (editing.tags ?? []),
      published: !!editing.published,
      published_at: editing.published ? new Date().toISOString() : null,
      read_minutes: Number(editing.read_minutes) || 5,
    };

    const { error } = editing.id
      ? await supabase.from("posts").update(payload).eq("id", editing.id)
      : await supabase.from("posts").insert(payload);

    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Post updated" : "Post created");
    setEditing(null);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    void load();
  };

  const togglePublish = async (p: Post) => {
    const { error } = await supabase.from("posts")
      .update({ published: !p.published, published_at: !p.published ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    void load();
  };

  const uploadCover = async (file: File) => {
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    setEditing((e) => ({ ...e!, cover_image: data.publicUrl }));
    toast.success("Image uploaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-black">Blog Posts</h1>
        <Button variant="neon" onClick={() => setEditing({ ...empty })}>
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/5 text-xs font-mono uppercase tracking-widest">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No posts yet. Create your first one.</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-primary/5 hover:bg-primary/5">
                <td className="p-4">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">/{p.slug}</div>
                </td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">
                  <button onClick={() => togglePublish(p)} className={`text-xs px-2 py-1 rounded font-mono ${p.published ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.published ? <><Eye className="h-3 w-3 inline mr-1" />PUBLISHED</> : <><EyeOff className="h-3 w-3 inline mr-1" />DRAFT</>}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="glass-strong neon-border rounded-2xl w-full max-w-3xl p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold">{editing.id ? "Edit Post" : "New Post"}</h2>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug</Label>
                  <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
              </div>
              <div>
                <Label>Cover image</Label>
                <div className="flex gap-2 items-center">
                  <Input value={editing.cover_image ?? ""} placeholder="https://… or upload" onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                    <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-primary/10 text-primary text-sm hover:bg-primary/20"><ImageIcon className="h-4 w-4" />Upload</span>
                  </label>
                </div>
                {editing.cover_image && <img src={editing.cover_image} alt="" className="mt-2 h-32 rounded object-cover" />}
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={Array.isArray(editing.tags) ? editing.tags.join(", ") : (editing.tags as unknown as string ?? "")} onChange={(e) => setEditing({ ...editing, tags: e.target.value as unknown as string[] })} />
              </div>
              <div>
                <Label>Content (Markdown)</Label>
                <Textarea rows={12} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="font-mono text-sm" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                  Published
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <Label className="!mb-0">Read time (min)</Label>
                  <Input type="number" className="w-20" value={editing.read_minutes ?? 5} onChange={(e) => setEditing({ ...editing, read_minutes: Number(e.target.value) })} />
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
