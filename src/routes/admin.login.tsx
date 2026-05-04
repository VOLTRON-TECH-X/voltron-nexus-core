import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Voltron Tech" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      toast.error(error?.message ?? "Login failed");
      setBusy(false);
      return;
    }
    // Verify staff role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isStaff = (roles ?? []).some((r) =>
      ["super_admin", "admin", "editor"].includes(r.role as string),
    );
    if (!isStaff) {
      await supabase.auth.signOut();
      toast.error("Account has no admin access");
      setBusy(false);
      return;
    }
    toast.success("Welcome back, Commander");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen grid place-items-center grid-bg px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 neon-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary grid place-items-center">
            <ShieldCheck className="h-6 w-6 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-wider">VOLTRON</h1>
            <p className="text-xs font-mono text-muted-foreground">ADMIN CONSOLE</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="font-mono text-xs tracking-widest">EMAIL</Label>
            <div className="relative mt-1">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="font-mono text-xs tracking-widest">PASSWORD</Label>
            <div className="relative mt-1">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)} className="pl-9" autoComplete="current-password" />
            </div>
          </div>
          <Button type="submit" variant="neon" className="w-full" disabled={busy}>
            {busy ? "Authenticating…" : "Enter Console"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground font-mono">
          Restricted access · Voltron Tech © 2026
        </p>
      </div>
    </div>
  );
}
