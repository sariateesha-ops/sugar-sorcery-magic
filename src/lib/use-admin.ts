import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/orders.functions";

/** Client-side admin gate. The real authorization happens server-side in
 *  every admin server function (RLS + has_role); this only drives the UI. */
export function useAdminGate() {
  const verify = useServerFn(checkIsAdmin);
  return useQuery({
    queryKey: ["admin-gate"],
    retry: false,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return { signedIn: false, isAdmin: false, email: null };
      try {
        const res = await verify({});
        return {
          signedIn: true,
          isAdmin: res.isAdmin,
          email: data.user.email ?? null,
        };
      } catch {
        return { signedIn: true, isAdmin: false, email: data.user.email ?? null };
      }
    },
  });
}
