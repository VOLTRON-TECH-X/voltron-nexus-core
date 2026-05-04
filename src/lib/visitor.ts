import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "voltron_session_id";
const HEARTBEAT_KEY = "voltron_last_heartbeat";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackPageView(page: string) {
  if (typeof window === "undefined") return;
  try {
    const session_id = getSessionId();
    await supabase.from("visitors").insert({
      session_id,
      page,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent.slice(0, 500),
    });
    localStorage.setItem(HEARTBEAT_KEY, String(Date.now()));
  } catch {
    /* swallow analytics errors */
  }
}

// Heartbeat ping every 60s so "online now" stays accurate
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
export function startHeartbeat(page: string) {
  if (typeof window === "undefined" || heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    void trackPageView(`${page}#heartbeat`);
  }, 60_000);
}
