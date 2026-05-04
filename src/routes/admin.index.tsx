import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, FileText, Wifi, Eye, Activity, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string | number; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-6 neon-glow-hover">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg grid place-items-center ${accent ?? "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="font-display text-3xl font-black">{value}</div>
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function DashboardPage() {
  const [online, setOnline] = useState(0);
  const [today, setToday] = useState(0);
  const [posts, setPosts] = useState(0);
  const [configs, setConfigs] = useState(0);
  const [total, setTotal] = useState(0);
  const [recent, setRecent] = useState<{ page: string; created_at: string }[]>([]);

  const refresh = async () => {
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);

    const [onlineRes, todayRes, totalRes, postsRes, cfgRes, recentRes] = await Promise.all([
      supabase.from("visitors").select("session_id", { count: "exact", head: false }).gte("created_at", since),
      supabase.from("visitors").select("id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
      supabase.from("visitors").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("vpn_configs").select("id", { count: "exact", head: true }),
      supabase.from("visitors").select("page,created_at").order("created_at", { ascending: false }).limit(8),
    ]);

    const uniqueOnline = new Set((onlineRes.data ?? []).map((r) => r.session_id)).size;
    setOnline(uniqueOnline);
    setToday(todayRes.count ?? 0);
    setTotal(totalRes.count ?? 0);
    setPosts(postsRes.count ?? 0);
    setConfigs(cfgRes.count ?? 0);
    setRecent(recentRes.data ?? []);
  };

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 15_000);
    const ch = supabase.channel("dash-visitors").on(
      "postgres_changes", { event: "INSERT", schema: "public", table: "visitors" },
      () => void refresh(),
    ).subscribe();
    return () => { clearInterval(t); void supabase.removeChannel(ch); };
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-black">Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of the Voltron network</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Activity} label="Online now" value={online} accent="bg-secondary/15 text-secondary" />
        <StatCard icon={Eye} label="Today" value={today} />
        <StatCard icon={TrendingUp} label="All time" value={total} />
        <StatCard icon={FileText} label="Posts" value={posts} />
        <StatCard icon={Wifi} label="VPN Configs" value={configs} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-4">Recent activity</h2>
        <ul className="space-y-2 font-mono text-sm">
          {recent.length === 0 && <li className="text-muted-foreground">No traffic yet.</li>}
          {recent.map((r, i) => (
            <li key={i} className="flex justify-between border-b border-primary/5 pb-1.5">
              <span className="text-primary">{r.page}</span>
              <span className="text-muted-foreground text-xs">{new Date(r.created_at).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
