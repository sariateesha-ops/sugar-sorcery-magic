import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Sugar Sorcery" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Secure sign-in for the Sugar Sorcery bakery order management portal.",
      },
      { property: "og:title", content: "Admin Login — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Secure sign-in for the Sugar Sorcery order management portal.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError("Incorrect email or password.");
      setBusy(false);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin-gate"] });
    setBusy(false);
    void navigate({ to: "/admin" });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-primary/70" />
        <h1 className="brand-title mt-4 text-4xl text-primary">Admin Login</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Authorised Sugar Sorcery staff only.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-xl border border-border/70 bg-card p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Signing in" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
