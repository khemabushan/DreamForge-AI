"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api, setTokens, ApiError } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await api.auth.signup({ email, password, display_name: name || undefined });
      const tokens = await api.auth.login({ email, password });
      setTokens(tokens.access_token, tokens.refresh_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink bg-dream-gradient px-6">
      <Card className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 font-display text-lg italic text-mist">
          <Moon size={18} className="text-drift" strokeWidth={1.5} />
          DreamForge
        </Link>
        <h1 className="mt-6 font-display text-xl text-mist">Sign up</h1>
        <p className="mt-1 font-body text-sm text-mist-muted">
          Start mapping your dreams in minutes.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-glass-border bg-white/[0.02] px-4 py-2.5 font-body text-sm text-mist placeholder:text-mist-faint focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-glass-border bg-white/[0.02] px-4 py-2.5 font-body text-sm text-mist placeholder:text-mist-faint focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="rounded-lg border border-glass-border bg-white/[0.02] px-4 py-2.5 font-body text-sm text-mist placeholder:text-mist-faint focus:outline-none"
          />
          {error && <p className="font-body text-xs text-red-300">{error}</p>}
          <Button
            className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSubmit}
            disabled={submitting || !email || password.length < 8}
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </div>

        <p className="mt-5 text-center font-body text-xs text-mist-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-drift-soft hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
