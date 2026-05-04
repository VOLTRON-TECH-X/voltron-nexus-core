// One-time admin seeder. Idempotent: if user exists, just ensures the super_admin role.
// Call: POST /functions/v1/seed-admin  (no auth required, but only seeds the hardcoded admin)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ADMIN_EMAIL = "voltrontechtx@gmail.com";
const ADMIN_PASSWORD = "@Voltron0120";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // 1) Try to find existing user by listing
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) throw listErr;

    let user = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    // 2) Create if missing
    if (!user) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: "Voltron Admin" },
      });
      if (createErr) throw createErr;
      user = created.user;
    } else {
      // Reset password just in case
      await supabase.auth.admin.updateUserById(user.id, { password: ADMIN_PASSWORD, email_confirm: true });
    }

    // 3) Ensure super_admin role
    const { error: roleErr } = await supabase
      .from("user_roles")
      .upsert({ user_id: user!.id, role: "super_admin" }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({ ok: true, userId: user!.id, email: ADMIN_EMAIL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("seed-admin error", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
