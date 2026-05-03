import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
      { property: "og:description", content: "Secure, fast, limitless internet infrastructure for the modern web." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
