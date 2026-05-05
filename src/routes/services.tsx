import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

interface Service {
  id: string;
  title: string;
  tag: string | null;
  description: string;
  icon: string | null;
  features: string[];
  cover_image: string | null;
}

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("id,title,tag,description,icon,features,cover_image")
        .eq("is_active", true)
        .order("sort_order");
      setServices((data as Service[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
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
            Modules tightly integrated. Pick what you need, scale when you grow.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center text-muted-foreground font-mono">◆ LOADING ◆</div>
        ) : services.length === 0 ? (
          <div className="text-center text-muted-foreground glass rounded-2xl p-12">No services yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((s) => {
              const Icon = ((Icons as any)[s.icon ?? "Shield"] as React.ElementType) ?? Icons.Shield;
              return (
                <article key={s.id} className="group glass rounded-2xl p-8 neon-glow-hover relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      {s.tag && (
                        <span className="text-[10px] font-mono tracking-widest text-secondary-foreground bg-secondary/30 px-2 py-1 rounded">
                          {s.tag}
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-3">{s.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">{s.description}</p>
                    {s.features?.length > 0 && (
                      <ul className="space-y-2 mb-8">
                        {s.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-3">
                      <Button asChild variant="neonOutline" size="sm">
                        <Link to="/contact">Learn More</Link>
                      </Button>
                      <Button asChild variant="neon" size="sm">
                        <Link to="/configs">
                          Get Started <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
