import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Copy, Wifi, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/configs")({
  head: () => ({
    meta: [
      { title: "VPN Configs — HTTP Custom, SSH, Injector | Voltron Tech" },
      { name: "description", content: "Download free working VPN config files: HTTP Custom, SSH Custom, and HTTP Injector — with step-by-step setup instructions." },
      { property: "og:title", content: "VPN Configs — Voltron Tech" },
      { property: "og:description", content: "Working HTTP Custom, SSH Custom and HTTP Injector configs with setup guides." },
    ],
  }),
  component: ConfigsPage,
});

type VpnType = "HTTP_CUSTOM" | "SSH_CUSTOM" | "HTTP_INJECTOR";
interface VpnConfig { id: string; name: string; type: VpnType; description: string; config_text: string | null; file_url: string | null; file_name: string | null; download_count: number; }

const TYPE_LABELS: Record<VpnType, string> = {
  HTTP_CUSTOM: "HTTP Custom",
  SSH_CUSTOM: "SSH Custom",
  HTTP_INJECTOR: "HTTP Injector",
};

function ConfigsPage() {
  const [items, setItems] = useState<VpnConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | VpnType>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("vpn_configs").select("*").eq("is_active", true).order("sort_order").order("created_at", { ascending: false });
      setItems((data as VpnConfig[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const copy = async (c: VpnConfig) => {
    if (!c.config_text) return;
    await navigator.clipboard.writeText(c.config_text);
    setCopiedId(c.id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const download = async (c: VpnConfig) => {
    if (!c.file_url) return;
    await supabase.from("vpn_configs").update({ download_count: c.download_count + 1 }).eq("id", c.id);
    window.open(c.file_url, "_blank");
  };

  const filtered = filter === "ALL" ? items : items.filter((c) => c.type === filter);

  return (
    <div>
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-4">◆ CONFIG VAULT ◆</div>
          <h1 className="font-display text-5xl md:text-7xl font-black">
            VPN <span className="text-gradient-neon">Configs</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Working HTTP Custom, SSH Custom & HTTP Injector files with step-by-step setup instructions.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {(["ALL", "HTTP_CUSTOM", "SSH_CUSTOM", "HTTP_INJECTOR"] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-widest transition ${filter === t ? "bg-primary text-background" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
              {t === "ALL" ? "ALL" : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground font-mono">◆ LOADING ◆</div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">No configs available yet. Check back soon.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((c) => (
              <div key={c.id} className="glass rounded-2xl p-6 neon-glow-hover">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center shrink-0">
                    <Wifi className="h-5 w-5 text-background" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-secondary tracking-widest">{TYPE_LABELS[c.type]}</div>
                    <h3 className="font-display text-xl font-bold">{c.name}</h3>
                  </div>
                </div>
                <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mb-4">{c.description}</div>
                {c.config_text && (
                  <pre className="bg-background/50 border border-primary/10 rounded-lg p-3 text-xs font-mono overflow-x-auto mb-3 max-h-32">{c.config_text}</pre>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {c.file_url && (
                    <Button variant="neon" size="sm" onClick={() => download(c)}>
                      <Download className="h-4 w-4 mr-2" /> Download {c.file_name ?? "file"}
                    </Button>
                  )}
                  {c.config_text && (
                    <Button variant="neonOutline" size="sm" onClick={() => copy(c)}>
                      {copiedId === c.id ? <><Check className="h-4 w-4 mr-2" />Copied</> : <><Copy className="h-4 w-4 mr-2" />Copy text</>}
                    </Button>
                  )}
                  <span className="ml-auto text-xs font-mono text-muted-foreground self-center">↓ {c.download_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
