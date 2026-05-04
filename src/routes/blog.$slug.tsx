import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-black">Article not found</h1>
      <Link to="/blog" className="text-primary mt-4 inline-block">← Back to blog</Link>
    </div>
  ),
});

interface Post { id: string; title: string; content: string; excerpt: string | null; cover_image: string | null; category: string | null; published_at: string | null; read_minutes: number | null; tags: string[] | null; created_at: string; }

function BlogPostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (!data) setMissing(true);
      else setPost(data as Post);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-24 text-center font-mono text-muted-foreground">◆ LOADING ◆</div>;
  if (missing || !post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-black">Article not found</h1>
        <Link to="/blog" className="text-primary mt-4 inline-block">← Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-16 max-w-3xl">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary mb-6 hover:gap-2 transition-all">
        <ArrowLeft className="h-4 w-4" /> All articles
      </Link>
      {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8 neon-border" />}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground mb-4">
        {post.category && <span className="inline-flex items-center gap-1 text-primary"><Tag className="h-3 w-3" />{post.category}</span>}
        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.published_at ?? post.created_at).toLocaleDateString()}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_minutes ?? 5} min read</span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight">{post.title}</h1>
      {post.excerpt && <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>}
      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">{post.content}</div>
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-primary/10 flex flex-wrap gap-2">
          {post.tags.map((t) => <span key={t} className="text-xs font-mono px-2 py-1 rounded bg-primary/10 text-primary">#{t}</span>)}
        </div>
      )}
    </article>
  );
}
