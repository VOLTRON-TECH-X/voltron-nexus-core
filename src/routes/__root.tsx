import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/lib/visitor";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="min-h-screen grid place-items-center px-4 grid-bg">
      <div className="text-center max-w-md">
        <h1 className="font-display text-8xl font-black text-gradient-neon">404</h1>
        <h2 className="mt-4 font-display text-2xl">Signal Lost</h2>
        <p className="mt-2 text-muted-foreground">
          The page you're trying to reach is off-grid.
        </p>
        <Link
          to="/"
          className="inline-flex mt-6 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Return to base
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Voltron Tech — Next-Gen Internet Solutions" },
      { name: "description", content: "VPN, encrypted cloud, dedicated IPs, hosting & cybersecurity. Beyond the connection." },
      { name: "author", content: "Voltron Tech" },
      { property: "og:title", content: "Voltron Tech — Next-Gen Internet Solutions" },
      { property: "og:description", content: "VPN, encrypted cloud, dedicated IPs, hosting & cybersecurity. Beyond the connection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Voltron Tech — Next-Gen Internet Solutions" },
      { name: "twitter:description", content: "VPN, encrypted cloud, dedicated IPs, hosting & cybersecurity. Beyond the connection." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ace2fbfb-ea40-4734-ad7f-148e3a97d1bb/id-preview-d164036a--26f6d595-0d75-4603-b0d5-33af9e297fe1.lovable.app-1777796767252.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ace2fbfb-ea40-4734-ad7f-148e3a97d1bb/id-preview-d164036a--26f6d595-0d75-4603-b0d5-33af9e297fe1.lovable.app-1777796767252.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
      <Toaster theme="dark" />
    </>
  );
}
