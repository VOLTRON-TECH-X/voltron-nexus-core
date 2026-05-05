import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Shield, Cloud, Globe, Download, Server, Lock,
  ArrowRight, Zap, Star, Quote, ChevronRight, Activity, Users, Cpu,
  Calendar, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voltron Tech — Next-Gen Internet Solutions" },
      { name: "description", content: "Premium VPN, encrypted cloud storage, dedicated IPs, hosting and cybersecurity. Beyond the connection." },
      { property: "og:title", content: "Voltron Tech — Beyond the Connection" },
      { property: "og:description", content: "Secure, fast, limitless internet infrastructure." },
    ],
  }),
  component: HomePage,
});

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function Counter({ to, suffix, label, Icon }: { to: number; suffix: string; label: string; Icon: React.ElementType }) {
  const { value, ref } = useCountUp(to);
  return (
    <div className="glass rounded-xl p-6 text-center neon-glow-hover">
      <Icon className="h-7 w-7 mx-auto mb-3 text-primary" />
      <div className="font-display text-4xl md:text-5xl font-black text-gradient-neon">
        <span ref={ref}>{value.toLocaleString()}</span>{suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

const features = [
  { Icon: Shield, title: "Military-Grade VPN", desc: "AES-256 encryption across 50+ global servers with strict no-logs policy." },
  { Icon: Cloud, title: "Encrypted Cloud", desc: "End-to-end encrypted storage. Your files, your keys, zero compromise." },
  { Icon: Globe, title: "Dedicated IPs", desc: "Residential & datacenter IPs for absolute control and performance." },
  { Icon: Download, title: "Turbo Downloader", desc: "Multi-threaded downloads up to 10x faster with built-in resume." },
  { Icon: Server, title: "Cloud Hosting", desc: "Auto-scaling web hosting with free SSL and 99.99% uptime SLA." },
  { Icon: Lock, title: "DDoS Shield", desc: "Always-on DDoS protection and quarterly security audits included." },
];

const testimonials = [
  { name: "Amani K.", role: "CTO, FintechAfrica", text: "Voltron's infrastructure powers our entire stack. Latency dropped 60%, and the dashboard is gorgeous.", rating: 5 },
  { name: "Sarah Chen", role: "Indie Developer", text: "The encrypted cloud changed how my team ships. Zero-knowledge sharing just works.", rating: 5 },
  { name: "Marcus T.", role: "Security Lead", text: "Their DDoS shield absorbed a 200Gbps attack without a hiccup. These folks are the real deal.", rating: 5 },
  { name: "Lina R.", role: "Content Creator", text: "Dedicated IPs + VPN combo means I never get geo-blocked. Streaming workflow finally smooth.", rating: 5 },
];

interface RecentPost { id: string; slug: string; title: string; excerpt: string | null; cover_image: string | null; category: string | null; published_at: string | null; created_at: string; }
interface RecentService { id: string; title: string; tag: string | null; description: string; icon: string | null; }

function HomePage() {
  const [tIndex, setTIndex] = useState(0);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [visitorTotal, setVisitorTotal] = useState<number | null>(null);

  useEffect(() => {
    const i = setInterval(() => setTIndex((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    (async () => {
      const [posts, services, visitors] = await Promise.all([
        supabase.from("posts").select("id,slug,title,excerpt,cover_image,category,published_at,created_at")
          .eq("published", true).order("published_at", { ascending: false }).limit(3),
        supabase.from("services").select("id,title,tag,description,icon")
          .eq("is_active", true).order("sort_order").limit(3),
        supabase.from("visitors").select("session_id"),
      ]);
      setRecentPosts((posts.data as RecentPost[]) ?? []);
      setRecentServices((services.data as RecentService[]) ?? []);
      const unique = new Set((visitors.data ?? []).map((v: any) => v.session_id));
      setVisitorTotal(unique.size);
    })();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0 grid-bg animate-grid opacity-60" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl animate-pulse-neon" />

        {/* floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/60 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          />
        ))}

        <div className="container relative mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-mono tracking-wider mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            SYSTEM ONLINE · 50+ NODES ACTIVE
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
            BEYOND THE
            <br />
            <span className="text-gradient-neon">CONNECTION</span>
          </h1>
          <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Next-gen internet infrastructure. VPN, encrypted cloud, dedicated IPs and DDoS-grade security — engineered for builders who refuse to compromise.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="neon" size="xl">
              <Link to="/pricing">
                Launch Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="neonOutline" size="xl">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Counter to={10000} suffix="+" label="Active Users" Icon={Users} />
            <Counter to={50} suffix="+" label="Global Servers" Icon={Server} />
            <Counter to={5000} suffix="+" label="Happy Clients" Icon={Star} />
            <Counter to={99} suffix=".99%" label="Uptime SLA" Icon={Activity} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-4">
            <Cpu className="h-4 w-4" /> CORE STACK
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black">
            Built for the <span className="text-gradient-neon">next decade</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six modules. One unified platform. Zero compromises on speed, privacy, or scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl p-px overflow-hidden neon-glow-hover"
              style={{ background: "linear-gradient(145deg, oklch(0.85 0.18 200 / 0.3), oklch(0.50 0.25 295 / 0.2))" }}
            >
              <div className="rounded-2xl bg-card/80 backdrop-blur-xl p-7 h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 grid place-items-center mb-5 group-hover:bg-primary/20 transition">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <Link to="/services" className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-primary hover:gap-2 transition-all">
                  Learn more <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono tracking-widest text-primary mb-4">TRUSTED WORLDWIDE</div>
          <h2 className="font-display text-4xl md:text-5xl font-black">What our crew says</h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="glass-strong rounded-2xl p-8 md:p-12 min-h-[260px]">
            <Quote className="h-10 w-10 text-primary/40 mb-4" />
            <p className="text-lg md:text-xl leading-relaxed">{testimonials[tIndex].text}</p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="font-display font-bold">{testimonials[tIndex].name}</div>
                <div className="text-sm text-muted-foreground">{testimonials[tIndex].role}</div>
              </div>
              <div className="flex gap-1">
                {[...Array(testimonials[tIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTIndex(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === tIndex ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center glass-strong">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative">
            <Zap className="h-12 w-12 text-primary mx-auto mb-6 fill-primary" />
            <h2 className="font-display text-4xl md:text-6xl font-black">
              Ready to <span className="text-gradient-neon">power up</span>?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Join 10,000+ users who chose the next-gen internet stack. 7-day free trial. Cancel anytime.
            </p>
            <Button asChild variant="neon" size="xl" className="mt-10">
              <Link to="/pricing">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
