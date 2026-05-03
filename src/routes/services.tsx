import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Cloud, Globe, Download, Server, Lock, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Voltron Tech" },
      { name: "description", content: "VPN, encrypted cloud storage, dedicated IPs, web hosting, DDoS protection and more." },
      { property: "og:title", content: "Services — Voltron Tech" },
      { property: "og:description", content: "Six modules of next-gen internet infrastructure." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    Icon: Shield,
    title: "VPN Service",
    tag: "PRIVACY",
    desc: "Military-grade AES-256 encryption across 50+ global servers. Strict no-logs policy independently audited.",
    features: ["50+ server locations", "No-logs verified", "WireGuard + OpenVPN", "Kill-switch & split-tunneling"],
  },
  {
    Icon: Cloud,
    title: "Encrypted Cloud Storage",
    tag: "STORAGE",
    desc: "Zero-knowledge encrypted file storage with secure sharing links and end-to-end encryption.",
    features: ["End-to-end encrypted", "Zero-knowledge architecture", "Secure share links", "Version history 90 days"],
  },
  {
    Icon: Globe,
    title: "Dedicated IP Addresses",
    tag: "NETWORK",
    desc: "Residential and datacenter IPs for whitelisting, gaming servers, e-commerce and bypassing CAPTCHAs.",
    features: ["Residential & datacenter", "Static or rotating", "100+ countries", "API access included"],
  },
  {
    Icon: Download,
    title: "Turbo Download Manager",
    tag: "SPEED",
    desc: "Multi-threaded download accelerator with smart resume, scheduling and browser integration.",
    features: ["Up to 10x faster", "Smart resume", "Scheduler & queue", "Browser extensions"],
  },
  {
    Icon: Server,
    title: "Web Hosting & SSL",
    tag: "HOSTING",
    desc: "Auto-scaling cloud hosting with free SSL, daily backups and 99.99% uptime guarantee.",
    features: ["Free SSL certificates", "Daily backups", "1-click deploys", "99.99% uptime SLA"],
  },
  {
    Icon: Lock,
    title: "DDoS Protection & Audits",
    tag: "SECURITY",
    desc: "Always-on DDoS mitigation, vulnerability scanning and quarterly penetration tests by certified pros.",
    features: ["Up to 1Tbps mitigation", "Quarterly pen-tests", "Real-time threat feed", "OWASP-aligned reports"],
  },
];

function ServicesPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-4">
            ◆ OUR ARSENAL ◆
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black">
            Premium <span className="text-gradient-neon">Services</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Six tightly integrated modules. Pick what you need, scale when you grow.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map(({ Icon, title, tag, desc, features }) => (
            <article
              key={title}
              className="group glass rounded-2xl p-8 neon-glow-hover relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition" />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-secondary-foreground bg-secondary/30 px-2 py-1 rounded">
                    {tag}
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold mb-3">{title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{desc}</p>

                <ul className="space-y-2 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <Button asChild variant="neonOutline" size="sm">
                    <Link to="/contact">Learn More</Link>
                  </Button>
                  <Button asChild variant="neon" size="sm">
                    <Link to="/pricing">
                      Get Started <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
