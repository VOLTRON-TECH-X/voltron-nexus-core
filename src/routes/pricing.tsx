import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Voltron Tech" },
      { name: "description", content: "Transparent pricing. Basic $9.99, Pro $24.99, Business $49.99 per month. Enterprise custom." },
      { property: "og:title", content: "Pricing — Voltron Tech" },
      { property: "og:description", content: "Pick the plan that fits your scale. 7-day free trial on all plans." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Basic", price: 9.99, Icon: Zap, tag: null,
    desc: "For solo users getting started.",
    features: ["VPN — 5 server locations", "Cloud storage 5 GB", "1 device", "Email support", "30-day money back"],
    variant: "neonOutline" as const,
  },
  {
    name: "Pro", price: 24.99, Icon: Sparkles, tag: "MOST POPULAR",
    desc: "For power users and small teams.",
    features: ["VPN Pro — all 50+ locations", "Cloud storage 100 GB", "1 dedicated IP", "5 devices", "Priority email + chat", "Turbo Downloader included"],
    variant: "neon" as const, featured: true,
  },
  {
    name: "Business", price: 49.99, Icon: Crown, tag: null,
    desc: "For growing teams that need control.",
    features: ["Everything in Pro", "Cloud storage 1 TB", "5 dedicated IPs", "Unlimited devices", "24/7 priority support", "Web hosting + SSL", "DDoS protection"],
    variant: "purple" as const,
  },
  {
    name: "Enterprise", price: null, Icon: Building2, tag: null,
    desc: "Custom infrastructure at scale.",
    features: ["Custom everything", "Dedicated account manager", "SLA & compliance reports", "On-premise options", "Custom integrations", "Quarterly security audits"],
    variant: "neonOutline" as const,
  },
];

function PricingPage() {
  return (
    <div>
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-4">
            ◆ TRANSPARENT PRICING ◆
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black">
            Pick your <span className="text-gradient-neon">power level</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            7-day free trial on every plan. No credit card required to start. Cancel anytime, no questions.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {plans.map(({ name, price, Icon, tag, desc, features, variant, featured }) => (
            <div
              key={name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                featured
                  ? "glass-strong border-2 border-primary/60 shadow-[0_0_40px_oklch(0.85_0.18_200/0.3)] scale-[1.02]"
                  : "glass neon-glow-hover"
              }`}
            >
              {tag && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full">
                  {tag}
                </div>
              )}

              <Icon className={`h-8 w-8 mb-4 ${featured ? "text-primary" : "text-foreground/70"}`} />
              <h3 className="font-display text-2xl font-bold">{name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 min-h-[40px]">{desc}</p>

              <div className="mb-6">
                {price !== null ? (
                  <>
                    <span className="font-display text-5xl font-black text-gradient-neon">${price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </>
                ) : (
                  <span className="font-display text-3xl font-black text-gradient-neon">Custom</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant={variant} className="w-full">
                <Link to="/contact">
                  {price !== null ? "Start Free Trial" : "Contact Sales"}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12 font-mono">
          All prices in USD. Taxes may apply based on your region.
        </p>
      </section>
    </div>
  );
}
