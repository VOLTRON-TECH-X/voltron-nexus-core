import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Wifi, BarChart3, LogOut, ShieldCheck, Mail, Menu, Layers } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

const navItems: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "Blog Posts", icon: FileText },
  { to: "/admin/services", label: "Services", icon: Layers },
  { to: "/admin/vpn", label: "VPN Configs", icon: Wifi },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/messages", label: "Messages", icon: Mail },
];

function NavList({ pathname, onNavigate, onLogout }: { pathname: string; onNavigate: () => void; onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-primary/10">
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2">
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
            <Link key={n.to} to={n.to as string} onClick={onNavigate}
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
          <Link to="/" onClick={onNavigate}>← Back to site</Link>
        </Button>
        <Button onClick={onLogout} variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    setOpen(false);
    navigate({ to: "/admin/login" });
  };

  const close = () => setOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 glass-strong border-b border-primary/15">
        <div className="flex items-center gap-3 px-4 h-14">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open admin menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-background border-r border-primary/15">
              <NavList pathname={pathname} onNavigate={close} onLogout={logout} />
            </SheetContent>
          </Sheet>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center">
              <ShieldCheck className="h-4 w-4 text-background" />
            </div>
            <span className="font-display font-black tracking-wider text-sm">VOLTRON ADMIN</span>
          </Link>
        </div>
      </header>
      <main>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
