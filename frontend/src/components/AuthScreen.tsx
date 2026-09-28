// AI-Generated Code - 2026-09-29 - Composer

import { useState } from "react";
import { api } from "../lib/api";
import type { AuthUser } from "../lib/auth";
import { setSession } from "../lib/auth";

type Mode = "login" | "register";

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result =
        mode === "register"
          ? await api.register({ name, email, password })
          : await api.login({ email, password });
      setSession(result.token, result.user);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <div className="fade-up mb-8 text-center">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-[#10241f]">
          BRIEFED
        </h1>
        <p className="mt-3 text-lg font-semibold text-[#0f4a3a]">
          Prepare for conversations with the context that matters.
        </p>
        <p className="mt-2 text-sm text-[#2a4038]">
          Sign in to access your contacts, briefs, and Hindsight relationship
          memory — synced across devices.
        </p>
      </div>

      <div className="view-enter rounded-[28px] border border-[#1f6b56]/15 bg-white/80 p-6 shadow-[0_20px_60px_rgba(16,36,31,0.08)] backdrop-blur sm:p-8">
        <div className="mb-5 flex rounded-full border border-[#1f6b56]/20 bg-[#f3f7f4]/80 p-1">
          <button
            type="button"
            className={`btn-interactive flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
              mode === "login"
                ? "bg-[#1f6b56] text-white"
                : "text-[#2a4038]"
            }`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Log in
          </button>
          <button
            type="button"
            className={`btn-interactive flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
              mode === "register"
                ? "bg-[#1f6b56] text-white"
                : "text-[#2a4038]"
            }`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#10241f]">Name</span>
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/90 px-3 py-2.5 text-sm"
                placeholder="Harshitha"
              />
            </label>
          )}
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#10241f]">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/90 px-3 py-2.5 text-sm"
              placeholder="test@example.com"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#10241f]">
              Password
            </span>
            <input
              required
              type="password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              minLength={8}
              className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/90 px-3 py-2.5 text-sm"
              placeholder={
                mode === "register" ? "At least 8 characters" : "Your password"
              }
            />
          </label>

          {error && (
            <p className="rounded-xl border border-[#a33b2c]/30 bg-[#a33b2c]/10 px-3 py-2 text-sm text-[#a33b2c]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-magic mt-2 w-full rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <span className="inline-flex items-center justify-center">
              {busy ? <span className="btn-spinner" aria-hidden /> : null}
              {busy
                ? mode === "register"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "register"
                  ? "Create account"
                  : "Sign in"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
