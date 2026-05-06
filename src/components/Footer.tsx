import { Link } from "@tanstack/react-router";
import { Send, MessageCircle, Share2 } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error && !error.message.includes("duplicate")) {
      toast.error(error.message);
      return;
    }
    toast.success("Subscribed! Welcome aboard.");
    setEmail("");
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://voltron-nexus-core.lovable.app";
    const text = "VOLTRON TECH — Next-Gen Internet Solutions";
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link imenakiliwa! Shiriki na marafiki.");
  };

  return (
    <footer className="relative mt-32 border-t border-primary/15">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="container mx-auto px-4 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Next-Gen Internet Solutions. Beyond the connection — secure, fast, limitless.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-widest text-primary mb-4">FOLLOW US</h4>
          <div className="flex flex-col gap-3">
            <a
              href="http://wa.me/255759612721"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-3 py-2 rounded-lg glass neon-glow-hover text-sm hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp
            </a>
            <a
              href="http://t.me/Voltronmastertv"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-3 py-2 rounded-lg glass neon-glow-hover text-sm hover:text-primary"
            >
              <Send className="h-4 w-4 text-primary" /> Telegram
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-widest text-primary mb-4">QUICK LINKS</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/configs" className="hover:text-primary">VPN Configs</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-widest text-primary mb-4">NEWSLETTER</h4>
          <p className="text-sm text-muted-foreground mb-4">Tech insights & product drops, no spam.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <Input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input/50"
            />
            <Button type="submit" variant="neon" size="sm">Join</Button>
          </form>
          <Button onClick={share} variant="neonOutline" size="sm" className="mt-4 w-full">
            <Share2 className="h-4 w-4 mr-2" /> Share Voltron
          </Button>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2026 Voltron Tech. All systems operational.</p>
          <p className="font-mono">v2.0.26 · build #4421</p>
        </div>
      </div>
    </footer>
  );
}
