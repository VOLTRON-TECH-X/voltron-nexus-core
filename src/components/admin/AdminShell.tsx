import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Wifi, BarChart3, LogOut, ShieldCheck, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ReactNode } from "react";

const navItems: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "Blog Posts", icon: FileText },
  { to: "/admin/vpn", label: "VPN Configs", icon: Wifi },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/messages", label: "Messages", icon: Mail },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-primary/15 glass-strong flex flex-col">
        <div className="p-6 border-b border-primary/10">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center">
              <ShieldCheck className="h-5 w-5 text-background" />
            </div>
            <div>
              <p className="font-display font-black tracking-wider text-sm">VOLTRON</p>
              <p className="text-[10px] font-mono text-muted-foreground">ADMIN PANEL</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to as string}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active ? "bg-primary/10 text-primary neon-border" : "text-foreground/70 hover:bg-primary/5 hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-primary/10 space-y-2">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link to="/">← Back to site</Link>
          </Button>
          <Button onClick={logout} variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
