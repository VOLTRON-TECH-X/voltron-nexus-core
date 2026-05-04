import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Voltron Tech" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, isStaff } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (!isStaff && !isLoginPage) navigate({ to: "/admin/login" });
  }, [loading, isStaff, isLoginPage, navigate]);

  if (isLoginPage) return <Outlet />;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center grid-bg">
        <div className="font-mono text-sm text-primary animate-pulse">◆ AUTHENTICATING ◆</div>
      </div>
    );
  }

  if (!isStaff) return null;

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
