import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";

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

const posts = [
  {
    slug: "how-vpn-works",
    title: "How a VPN Actually Works (and Why You Need One in 2026)",
    excerpt: "We break down the cryptographic handshake, tunnel routing, and why your ISP can no longer see what you do online.",
    date: "May 1, 2026", read: "8 min", category: "Privacy",
    gradient: "from-primary/40 to-secondary/40",
  },
  {
    slug: "internet-security-2026",
    title: "Internet Security Tips for 2026: A No-Nonsense Guide",
    excerpt: "Quantum-resistant encryption, passkeys, and the rise of zero-knowledge clouds. Here's what matters now.",
    date: "Apr 24, 2026", read: "12 min", category: "Security",
    gradient: "from-secondary/40 to-primary/30",
  },
  {
    slug: "dedicated-ip-explained",
    title: "Dedicated vs Shared IP: Which One Is Right for You?",
    excerpt: "From e-commerce whitelisting to gaming servers, dedicated IPs solve problems shared ones can't.",
    date: "Apr 18, 2026", read: "6 min", category: "Network",
    gradient: "from-primary/30 to-purple/40",
  },
  {
    slug: "ddos-survival",
    title: "We Survived a 200Gbps DDoS — Here's the Playbook",
    excerpt: "A post-mortem from our SOC team on how layered mitigation kept the platform online during a major attack.",
    date: "Apr 10, 2026", read: "15 min", category: "Security",
    gradient: "from-secondary/30 to-primary/40",
  },
  {
    slug: "encrypted-cloud-deepdive",
    title: "Zero-Knowledge Cloud: What It Is and Why It Matters",
    excerpt: "If your cloud provider can read your files, it's not really private. Here's the math behind true E2EE storage.",
    date: "Apr 03, 2026", read: "10 min", category: "Storage",
    gradient: "from-primary/40 to-secondary/30",
  },
  {
    slug: "voltron-v2-launch",
    title: "Introducing Voltron 2.0: A Complete Platform Refresh",
    excerpt: "New dashboard, faster servers, and three new server locations. Here's everything that ships this quarter.",
    date: "Mar 28, 2026", read: "5 min", category: "Product News",
    gradient: "from-purple/40 to-primary/40",
  },
];

function BlogPage() {
  return (
    <div>
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-4">
            ◆ FIELD NOTES ◆
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black">
            Blog & <span className="text-gradient-neon">Resources</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Tutorials, deep dives and product news from the engineers building Voltron Tech.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="group glass rounded-2xl overflow-hidden flex flex-col neon-glow-hover"
            >
              <div className={`h-44 bg-gradient-to-br ${p.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="font-display text-4xl font-black text-foreground/20 group-hover:text-foreground/40 transition">
                    {p.category.toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-mono tracking-widest bg-background/70 backdrop-blur px-2 py-1 rounded">
                  <Tag className="h-3 w-3" /> {p.category}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-mono">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{p.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.read}</span>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug mb-3 group-hover:text-primary transition">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.excerpt}</p>
                <Link
                  to="/blog"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all"
                >
                  Read more <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
