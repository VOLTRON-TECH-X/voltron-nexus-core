import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

/**
 * Modern multi-signal ad-blocker / privacy-blocker detector.
 * Signals checked:
 *  1. Multiple bait elements with common ad class names (display/visibility/size/removal).
 *  2. Network HEAD requests to AdSense + Monetag domains.
 *  3. Presence of injected ad scripts in the DOM after a delay.
 *  4. window.adsbygoogle availability.
 * The check re-runs periodically so toggling the blocker is detected live.
 */

const AD_SCRIPT_URLS = [
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
  "https://quge5.com/88/tag.min.js",
  "https://n6wxm.com/vignette.min.js",
  "https://nap5k.com/tag.min.js",
];

const BAIT_CLASSES = [
  "adsbox",
  "ad-banner",
  "ad-placement",
  "adsbygoogle",
  "ad-unit",
  "sponsor-ad",
  "banner_ad",
  "google-ads",
];

async function detectBlocker(): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  // 1. Bait elements
  const baits: HTMLDivElement[] = [];
  for (const cls of BAIT_CLASSES) {
    const el = document.createElement("div");
    el.className = cls;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;pointer-events:none;";
    el.innerHTML = "&nbsp;";
    document.body.appendChild(el);
    baits.push(el);
  }

  await new Promise((r) => setTimeout(r, 350));

  let baitBlocked = 0;
  for (const el of baits) {
    if (
      !el.isConnected ||
      el.offsetParent === null ||
      el.offsetHeight === 0 ||
      el.clientHeight === 0
    ) {
      baitBlocked++;
    } else {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") {
        baitBlocked++;
      }
    }
  }
  baits.forEach((b) => b.remove());

  // 2. Network signals — many blockers cancel these requests
  let networkBlocked = 0;
  await Promise.all(
    AD_SCRIPT_URLS.map(async (url) => {
      try {
        await fetch(url, { method: "HEAD", mode: "no-cors", cache: "no-store" });
      } catch {
        networkBlocked++;
      }
    }),
  );

  // 3. Are the actual injected <script> tags reachable?
  const adScripts = Array.from(document.querySelectorAll("script[src]")).filter((s) =>
    AD_SCRIPT_URLS.some((u) => (s as HTMLScriptElement).src.startsWith(u.split("?")[0])),
  );
  // If we expected ad scripts but none appear, something stripped them
  const scriptsMissing = adScripts.length === 0;

  // 4. adsbygoogle global
  const adsbyMissing = !(window as any).adsbygoogle;

  // Decision: bait failure OR multiple network blocks is a strong signal.
  // Use a weighted score to reduce false positives on slow networks.
  let score = 0;
  if (baitBlocked >= 2) score += 2;
  if (networkBlocked >= 2) score += 2;
  if (networkBlocked >= 3) score += 1;
  if (scriptsMissing) score += 1;
  if (adsbyMissing) score += 1;

  return score >= 3;
}

export function AdBlockGuard() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = async (delay = 800) => {
      timer = setTimeout(async () => {
        const result = await detectBlocker();
        if (cancelled) return;
        setBlocked(result);
        // Keep monitoring — user might toggle the blocker
        run(result ? 4000 : 15000);
      }, delay);
    };

    void run(1200);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-2xl grid place-items-center p-4 animate-in fade-in duration-300">
      <div className="relative max-w-lg w-full">
        {/* Glow */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-destructive/40 via-primary/20 to-secondary/30 blur-xl opacity-70" />
        <div className="relative glass-strong neon-border rounded-3xl p-8 md:p-10 text-center overflow-hidden">
          {/* Scan line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />

          <div className="relative h-20 w-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-full bg-destructive/15 grid place-items-center border border-destructive/40">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
          </div>

          <div className="text-[10px] font-mono tracking-[0.3em] text-destructive mb-2">
            ◆ SYSTEM ALERT ◆
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-3 text-gradient-neon">
            ADS BLOCKER IMEGUNDULIWA
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
            Tafadhali <span className="text-destructive font-bold">USITUMIE</span> Ads blocker.
            Tumia browser kama{" "}
            <span className="text-primary font-semibold">Chrome</span>,{" "}
            <span className="text-primary font-semibold">Firefox</span>,{" "}
            <span className="text-primary font-semibold">Edge</span> au zima
            kipengele cha ads blocker. Kutazama matangazo ndo kunatufanya
            tuendelee kutoa huduma zilizopo{" "}
            <span className="text-primary font-black">BURE</span>.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-6 text-[10px] font-mono">
            <div className="glass rounded-lg py-2 px-2 border border-primary/20">
              <div className="text-primary">01</div>
              <div className="text-muted-foreground">Zima blocker</div>
            </div>
            <div className="glass rounded-lg py-2 px-2 border border-primary/20">
              <div className="text-primary">02</div>
              <div className="text-muted-foreground">Refresh</div>
            </div>
            <div className="glass rounded-lg py-2 px-2 border border-primary/20">
              <div className="text-primary">03</div>
              <div className="text-muted-foreground">Endelea</div>
            </div>
          </div>

          <p className="font-display text-lg text-gradient-neon font-black mb-5">
            KARIBUNI WOTE
          </p>

          <button
            onClick={() => location.reload()}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-7 py-3 text-sm font-bold text-primary-foreground hover:shadow-[0_0_30px_-5px_hsl(var(--primary))] transition-all"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            NIMEZIMA — REFRESH
          </button>
        </div>
      </div>
    </div>
  );
}
