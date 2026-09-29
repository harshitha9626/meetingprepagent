// AI-Generated Code - 2026-09-29 - Composer

import { useState } from "react";
import { api } from "../lib/api";
import type { AuthUser } from "../lib/auth";
import { setSession } from "../lib/auth";

type Mode = "login" | "register";

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Please enter your name";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 50) return "Name must be at most 50 characters";
  return null;
}

function validateEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return "Please enter your email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Enter a valid email address";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Please enter a password";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character";
  }
  return null;
}

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await api.login({
        email: email.trim().toLowerCase(),
        password,
      });
      setSession(result.token, result.user);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const nameErr = validateName(name);
    if (nameErr) {
      setError(nameErr);
      return;
    }
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    const passwordErr = validatePassword(password);
    if (passwordErr) {
      setError(passwordErr);
      return;
    }
    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await api.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });
      setPassword("");
      setConfirmPassword("");
      setName("");
      setMode("login");
      setSuccess(result.message || "Account created. Please log in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
      </div>

      <div className="view-enter rounded-[28px] border border-[#1f6b56]/15 bg-white/80 p-6 shadow-[0_20px_60px_rgba(16,36,31,0.08)] backdrop-blur sm:p-8">
        <div className="mb-5 flex rounded-full border border-[#1f6b56]/20 bg-[#f3f7f4]/80 p-1">
          <button
            type="button"
            className={`btn-interactive flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
              mode === "login" ? "bg-[#1f6b56] text-white" : "text-[#2a4038]"
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
              setSuccess(null);
            }}
          >
            Register
          </button>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-3">
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
                placeholder="Enter your email address"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#10241f]">
                Password
              </span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/90 px-3 py-2.5 text-sm"
                placeholder="Enter your password"
              />
            </label>

            {success && (
              <p className="rounded-xl border border-[#1f6b56]/20 bg-[#f3f7f4]/90 px-3 py-2 text-sm text-[#0f4a3a]">
                {success}
              </p>
            )}

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
              {busy ? "Signing in…" : "Login"}
            </button>

            <p className="pt-2 text-center text-sm text-[#2a4038]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-semibold text-[#1f6b56]"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setSuccess(null);
                }}
              >
                Register
              </button>
            </p>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#10241f]">
                Full name
              </span>
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/90 px-3 py-2.5 text-sm"
                placeholder="Enter your full name"
              />
            </label>
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
                placeholder="Enter your email address"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#10241f]">
                Password
              </span>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/90 px-3 py-2.5 text-sm"
                placeholder="Create a password"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#10241f]">
                Confirm password
              </span>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/90 px-3 py-2.5 text-sm"
                placeholder="Confirm your password"
              />
            </label>
            <p className="text-[11px] leading-relaxed text-[#2a4038]">
              Use 8+ characters with upper, lower, number, and special character.
            </p>

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
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
