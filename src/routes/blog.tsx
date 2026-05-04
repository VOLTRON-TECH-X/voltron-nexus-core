import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Resources — Voltron Tech" },
      { name: "description", content: "Tech insights, security tips, tutorials and product news from the Voltron Tech team." },
      { property: "og:title", content: "Blog — Voltron Tech" },
      { property: "og:description", content: "Insights on VPN, cybersecurity, cloud, and the modern internet." },
    ],
  }),
  component: BlogPage,
});

interface Post {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_image: string | null; category: string | null; published_at: string | null;
  read_minutes: number | null; created_at: string;
}

function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("posts")
        .select("id,slug,title,excerpt,cover_image,category,published_at,read_minutes,created_at")
        .eq("published", true).order("published_at", { ascending: false });
      setPosts((data as Post[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-4">◆ FIELD NOTES ◆</div>
          <h1 className="font-display text-5xl md:text-7xl font-black">
            Blog & <span className="text-gradient-neon">Resources</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Tutorials, deep dives and product news from the engineers building Voltron Tech.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center text-muted-foreground font-mono">◆ LOADING ◆</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground glass rounded-2xl p-12">No articles published yet. Check back soon.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <article key={p.id} className="group glass rounded-2xl overflow-hidden flex flex-col neon-glow-hover">
                <div className="h-44 bg-gradient-to-br from-primary/40 to-secondary/40 relative overflow-hidden">
                  {p.cover_image
                    ? <img src={p.cover_image} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                    : <div className="absolute inset-0 grid-bg opacity-50" />}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-mono tracking-widest bg-background/70 backdrop-blur px-2 py-1 rounded">
                    <Tag className="h-3 w-3" /> {p.category ?? "Tech"}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-mono">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(p.published_at ?? p.created_at).toLocaleDateString()}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.read_minutes ?? 5} min</span>
                  </div>
                  <h3 className="font-display text-lg font-bold leading-snug mb-3 group-hover:text-primary transition">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">{p.excerpt}</p>
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
