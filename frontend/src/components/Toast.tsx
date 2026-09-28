// AI-Generated Code - 2026-09-29 - Composer

import { useEffect, useState } from "react";

export type ToastKind = "success" | "info" | "error";

export function Toast({
  message,
  kind = "success",
  onDone,
  ttlMs = 3200,
}: {
  message: string;
  kind?: ToastKind;
  onDone: () => void;
  ttlMs?: number;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveAt = window.setTimeout(() => setLeaving(true), ttlMs - 220);
    const doneAt = window.setTimeout(onDone, ttlMs);
    return () => {
      window.clearTimeout(leaveAt);
      window.clearTimeout(doneAt);
    };
  }, [message, onDone, ttlMs]);

  const tones =
    kind === "error"
      ? "border-[#a33b2c]/35 bg-[#fff5f3] text-[#a33b2c]"
      : kind === "info"
        ? "border-[#1f6b56]/25 bg-white text-[#0f4a3a]"
        : "border-[#1f6b56]/30 bg-[#10241f] text-[#f3f7f4]";

  return (
    <div
      role="status"
      className={`pointer-events-auto fixed bottom-4 right-4 z-50 max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_16px_40px_rgba(16,36,31,0.16)] ${tones} ${
        leaving ? "toast-exit" : "toast-enter"
      }`}
    >
      {kind === "success" ? "✓ " : kind === "error" ? "✕ " : ""}
      {message}
    </div>
  );
}
