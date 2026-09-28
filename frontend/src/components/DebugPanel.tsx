// AI-Generated Code - 2026-09-28 - Composer

import type { MemoryDebugInfo } from "../lib/api";

export function DebugPanel({
  debug,
  open,
  onToggle,
}: {
  debug: MemoryDebugInfo | null;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 max-w-xs font-mono text-xs">
      <button
        type="button"
        onClick={onToggle}
        className="btn-interactive pointer-events-auto rounded-full border border-[#1f6b56]/40 bg-[#10241f] px-3 py-1.5 font-sans text-[11px] font-semibold text-[#f0d7a8] shadow-lg"
      >
        {open ? "Hide memory debug" : "Memory debug"}
      </button>
      {open && (
        <div className="pointer-events-auto mt-2 max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-[#1f6b56]/30 bg-[#10241f] p-3 text-[#f3f7f4] shadow-2xl">
          <p className="font-sans text-[10px] uppercase tracking-wide text-[#f0d7a8]">
            Dev panel · no API keys
          </p>
          {!debug ? (
            <p className="text-white/70">No retain/recall yet this session.</p>
          ) : (
            <dl className="space-y-1.5">
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">bank</dt>
                <dd>{debug.bankId || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">contact</dt>
                <dd className="text-right">
                  {debug.contactName || debug.contactId || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">retain</dt>
                <dd>
                  {debug.retain?.status ?? "—"}
                  {debug.retain?.documentIds?.length
                    ? ` (${debug.retain.documentIds.length} docs)`
                    : ""}
                </dd>
              </div>
              {debug.retain?.error && (
                <p className="text-[#f0d7a8]">{debug.retain.error}</p>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">recall</dt>
                <dd>
                  {debug.recall?.status ?? "—"}
                  {typeof debug.recall?.memoryCount === "number"
                    ? ` · ${debug.recall.memoryCount} memories`
                    : ""}
                </dd>
              </div>
              {typeof debug.recall?.queryCount === "number" && (
                <div className="flex justify-between gap-3">
                  <dt className="text-white/60">queries</dt>
                  <dd>{debug.recall.queryCount}</dd>
                </div>
              )}
              {debug.recall?.error && (
                <p className="text-[#f0d7a8]">{debug.recall.error}</p>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">llm</dt>
                <dd>{debug.llm?.status ?? "—"}</dd>
              </div>
              {debug.llm?.error && (
                <p className="text-[#f0d7a8]">{debug.llm.error}</p>
              )}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
