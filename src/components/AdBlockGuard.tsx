import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

/**
 * Detects if an ad-blocker is preventing ad-related scripts/requests from loading.
 * Strategy:
 *  1. Inject a bait <div> using common ad-related class names. Blockers hide/remove it.
 *  2. Try to fetch the AdSense script URL — blockers block the network request.
 *  3. Check window.adsbygoogle / monetag presence.
 */
export function AdBlockGuard() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const detect = async () => {
      // 1. Bait element
      const bait = document.createElement("div");
      bait.className = "adsbox ad-banner ad-placement adsbygoogle";
      bait.style.cssText =
        "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;";
      bait.innerHTML = "&nbsp;";
      document.body.appendChild(bait);

      await new Promise((r) => setTimeout(r, 400));
      const baitBlocked =
        bait.offsetHeight === 0 ||
        bait.clientHeight === 0 ||
        getComputedStyle(bait).display === "none" ||
        getComputedStyle(bait).visibility === "hidden";
      bait.remove();

      // 2. Network test against AdSense
      let networkBlocked = false;
      try {
        await fetch(
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6964692480408265",
          { method: "HEAD", mode: "no-cors", cache: "no-store" },
        );
      } catch {
        networkBlocked = true;
      }

      if (cancelled) return;
      setBlocked(baitBlocked || networkBlocked);
    };

    void detect();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl grid place-items-center p-4">
      <div className="glass-strong neon-border rounded-2xl max-w-lg w-full p-8 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-destructive/20 grid place-items-center mb-4">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-black mb-3">
          Ads Blocker Imegunduliwa
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
          Tafadhali <span className="text-primary font-semibold">USITUMIE</span>{" "}
          Ads blocker. Tumia browser zingine kama{" "}
          <span className="text-primary">Chrome</span>,{" "}
          <span className="text-primary">Firefox</span> au zima kipengele cha
          ads blocker. Kutazama matangazo ndo kunatufanya tuendelee kutoa
          huduma zilizopo <span className="text-primary font-bold">BURE</span>.
        </p>
        <p className="font-display text-lg text-gradient-neon font-black">
          KARIBUNI WOTE
        </p>
        <button
          onClick={() => location.reload()}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Nimezima — Refresh
        </button>
      </div>
    </div>
  );
}
