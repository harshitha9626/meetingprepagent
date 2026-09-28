// AI-Generated Code - 2026-09-29 - Composer

import { useState } from "react";
import type { RecalledMemory } from "../lib/api";
import { AnimatedCount } from "./AnimatedCount";

function formatWhen(when?: string | null): string | null {
  if (!when) return null;
  try {
    const d = new Date(when);
    if (Number.isNaN(d.getTime())) return when;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return when;
  }
}

function sourceLabel(memory: RecalledMemory): string {
  if (memory.documentId) {
    const parts = memory.documentId.split(":");
    const meetingId = parts[parts.length - 1] || memory.documentId;
    return `Source / interaction: ${meetingId}`;
  }
  return "Source / interaction: Hindsight recall";
}

function kindLabel(section: string): string | null {
  if (section === "missedFollowUps" || section === "commitments") {
    return "Open commitment";
  }
  if (section === "preferences") return "Learned previously";
  if (section === "recurringConcerns") return "Learned previously";
  return null;
}

export function MemoryUsedPanel({
  memories,
  memoryCount,
  mode,
}: {
  memories: RecalledMemory[];
  memoryCount: number;
  mode: "memory" | "generic";
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <aside className="fade-up-delay flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
            MEMORY USED
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-[#10241f]">
            Memory Used for This Meeting
          </h2>
        </div>
        {mode === "memory" && memoryCount > 0 && (
          <span className="hindsight-badge memory-pulse rounded-full bg-[#1f6b56] px-2.5 py-1 text-[11px] font-semibold text-white">
            Recalled from Hindsight
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-[#2a4038]">
        {mode === "generic"
          ? "Memory off — nothing here is from Hindsight recall."
          : memoryCount > 0 ? (
              <>
                <AnimatedCount
                  value={memoryCount}
                  className="font-semibold text-[#0f4a3a]"
                />{" "}
                fact(s) recalled from Hindsight for this brief.
              </>
            ) : (
              "No relevant memories were recalled for this contact."
            )}
      </p>

      {mode === "generic" || memories.length === 0 ? (
        <div className="empty-state">
          {mode === "generic"
            ? "Switch to With Hindsight to show real recalled memories."
            : "No memories found yet. Complete a meeting debrief to retain interactions, then prepare again."}
        </div>
      ) : (
        <ul className="stagger-in space-y-3 overflow-auto pr-1">
          {memories.map((memory, index) => {
            const when = formatWhen(memory.whenLearned);
            const kind = kindLabel(memory.section);
            const key = `${memory.id}-${index}`;
            const selected = selectedId === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedId((prev) => (prev === key ? null : key))
                  }
                  className={`memory-card w-full rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4 text-left shadow-[0_10px_30px_rgba(16,36,31,0.04)] ${
                    selected ? "is-selected" : ""
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="hindsight-badge rounded-full bg-[#d7e4dc] px-2 py-0.5 text-[11px] font-semibold text-[#0f4a3a]">
                      Recalled from Hindsight
                    </span>
                    {kind && (
                      <span className="rounded-full bg-[#f0d7a8]/70 px-2 py-0.5 text-[11px] font-semibold text-[#10241f]">
                        {kind}
                      </span>
                    )}
                    {when && (
                      <span className="text-[11px] font-medium text-[#2a4038]">
                        Learned previously · {when}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-[#2a4038]">
                    {sourceLabel(memory)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#10241f]">
                    <span className="font-semibold">Memory: </span>
                    {memory.text}
                  </p>
                  <p className="mt-3 border-t border-[#1f6b56]/10 pt-2 text-xs leading-relaxed text-[#1f6b56]">
                    <span className="font-semibold">Relevant to this meeting: </span>
                    {memory.whyRelevant}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
