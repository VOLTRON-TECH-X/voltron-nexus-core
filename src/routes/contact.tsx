import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, MessageSquare, MapPin, Send, ChevronDown, Twitter, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — Voltron Tech" },
      { name: "description", content: "Get in touch with Voltron Tech. Contact form, FAQs and live chat support." },
      { property: "og:title", content: "Contact — Voltron Tech" },
      { property: "og:description", content: "We're online 24/7. Drop us a message or check our FAQs." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject required").max(150),
  message: z.string().trim().min(10, "Min 10 characters").max(2000),
});

const faqs = [
  { q: "How do I get started?", a: "Pick any plan from the pricing page, sign up with your email, and you'll be online in under 60 seconds. All plans include a 7-day free trial." },
  { q: "Can I cancel anytime?", a: "Absolutely. Cancel from your dashboard with one click. We never charge cancellation fees, and you keep access until the end of your billing period." },
  { q: "Do you keep logs of my activity?", a: "No. Our VPN is independently audited as a strict no-logs service. We don't track, store, or share what you do online — period." },
  { q: "What payment methods do you accept?", a: "Credit/debit cards, PayPal, and major cryptocurrencies (BTC, ETH, USDC). Enterprise customers can pay via wire transfer or invoice." },
  { q: "Is there a money-back guarantee?", a: "Yes — 30 days. If you're not satisfied within the first month, we'll refund you in full. No forms, no friction." },
  { q: "Do you offer discounts for non-profits or students?", a: "We do — 50% off any plan for verified non-profits, students, and educators. Contact our team to apply." },
];

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name, email: result.data.email,
      subject: result.data.subject, message: result.data.message,
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Message launched! We'll reply within 24h.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div>
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-4">
            ◆ MISSION CONTROL ◆
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black">
            Get in <span className="text-gradient-neon">touch</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Sales, support, partnerships — we read every message. Online 24/7.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* CONTACT FORM */}
          <div className="lg:col-span-2 glass-strong rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-6">Send us a transmission</h2>
            <form onSubmit={submit} className="grid md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 bg-input/50" placeholder="Jane Doe"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 bg-input/50" placeholder="you@domain.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="mt-1.5 bg-input/50" placeholder="What's on your mind?"
                />
                {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message" rows={6} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5 bg-input/50 resize-none" placeholder="Tell us everything..."
                />
                {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="neon" size="lg" disabled={loading} className="w-full md:w-auto">
                  {loading ? "Transmitting..." : <>Send Message <Send className="h-4 w-4" /></>}
                </Button>
              </div>
            </form>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Direct channels</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <div className="font-medium">support@voltrontech.io</div>
                    <div className="text-muted-foreground text-xs">Replies within 4h</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <div className="font-medium">Live chat</div>
                    <div className="text-muted-foreground text-xs">24/7 · powered by humans</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <div className="font-medium">Global HQ</div>
                    <div className="text-muted-foreground text-xs">Distributed across 12 time zones</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Live chat</h3>
              <div className="rounded-lg border border-primary/20 bg-background/40 p-4 space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-xs font-bold">V</div>
                  <div className="bg-muted/50 rounded-lg rounded-tl-sm px-3 py-2 max-w-[80%]">
                    Hey! Need a hand with anything today?
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="bg-primary/20 rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%]">
                    Yes — questions about Pro plan
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Agent typing...
                </div>
              </div>
              <Button variant="neonOutline" size="sm" className="w-full mt-4">Open Live Chat</Button>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Follow us</h3>
              <div className="flex gap-3">
                {[Twitter, Send, MessageCircle, Instagram].map((Icon, i) => (
                  <a
                    key={i} href="#"
                    className="h-10 w-10 grid place-items-center rounded-lg glass neon-glow-hover text-foreground/70 hover:text-primary"
                    aria-label="Social"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-mono tracking-widest text-primary mb-3">◆ COMMON QUESTIONS ◆</div>
            <h2 className="font-display text-4xl font-black">Frequently asked</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-primary/5 transition"
                >
                  <span className="font-medium pr-4">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-primary shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
