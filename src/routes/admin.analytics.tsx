import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [daily, setDaily] = useState<{ date: string; count: number; unique: number }[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      const { data } = await supabase.from("visitors").select("page,session_id,created_at").gte("created_at", since.toISOString()).limit(5000);
      const rows = data ?? [];

      const byDay = new Map<string, { c: number; s: Set<string> }>();
      const byPage = new Map<string, number>();
      for (const r of rows) {
        const d = new Date(r.created_at as string).toISOString().slice(0, 10);
        const cur = byDay.get(d) ?? { c: 0, s: new Set() };
        cur.c++; cur.s.add(r.session_id as string);
        byDay.set(d, cur);
        const p = (r.page as string).split("#")[0];
        byPage.set(p, (byPage.get(p) ?? 0) + 1);
      }
      setDaily([...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, count: v.c, unique: v.s.size })));
      setTopPages([...byPage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count })));
    })();
  }, []);

  const max = Math.max(1, ...daily.map((d) => d.count));

  return (
    <div>
      <h1 className="font-display text-4xl font-black mb-8">Analytics — last 7 days</h1>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-display text-xl font-bold mb-6">Daily traffic</h2>
        <div className="flex items-end gap-2 h-48">
          {daily.length === 0 && <div className="text-muted-foreground">No data yet.</div>}
          {daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-primary/20 rounded-t relative group" style={{ height: `${(d.count / max) * 100}%` }}>
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {d.count} views · {d.unique} unique
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary to-secondary rounded-t" style={{ height: `${(d.unique / max) * 100}%`, top: "auto", bottom: 0 }} />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">{d.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-4">Top pages</h2>
        <ul className="space-y-2 text-sm">
          {topPages.map((p) => (
            <li key={p.page} className="flex justify-between border-b border-primary/5 pb-1.5 font-mono">
              <span className="text-primary">{p.page}</span>
              <span>{p.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
