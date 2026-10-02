import { createServerFn } from "@tanstack/react-start";
export const tmpMoveAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.auth.admin.updateUserById("357a42c5-f962-4259-a3a1-f1e6215488eb", {
    email: "sugarsor.admin.7010@admin.sugarsorcery.app",
    password: "Ss@423vm47!%54UZ",
    email_confirm: true,
  });
  return { ok: !error, error: error?.message ?? null };
});
