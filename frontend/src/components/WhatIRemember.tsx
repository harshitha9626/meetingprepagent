// AI-Generated Code - 2026-09-28 - Composer

import type { RecalledMemory } from "../lib/api";

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  discussions: "Discussions",
  decisions: "Decisions",
  commitments: "Commitments",
  missedFollowUps: "Missed follow-ups",
  recurringConcerns: "Concerns",
  preferences: "Preferences",
  agenda: "Agenda",
  questions: "Questions",
  timeline: "Timeline",
};

export function WhatIRemember({
  memories,
  provider,
  memoryCount,
  mode,
}: {
  memories: RecalledMemory[];
  provider: string;
  memoryCount: number;
  mode: "memory" | "generic";
}) {
  return (
    <aside className="fade-up-delay flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
            Visible memory
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-[#10241f]">
            What I Remember
          </h2>
        </div>
        <span className="memory-pulse rounded-full bg-[#f0d7a8] px-2.5 py-1 text-[11px] font-semibold text-[#10241f]">
          {provider === "hindsight" ? "hindsight" : "local demo"}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[#2a4038]">
        {mode === "generic"
          ? "Memory is off. This is what a generic prep looks like without retain → recall."
          : `${memoryCount} recalled fact(s) grounded this brief. Each item shows why it matters for today’s meeting.`}
      </p>

      {mode === "generic" || memories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1f6b56]/35 bg-white/50 p-4 text-sm text-[#2a4038]">
          {mode === "generic"
            ? "No memories retrieved — toggle Personalized to see Hindsight recall."
            : "No memories yet. Log a debrief to retain the first interaction."}
        </div>
      ) : (
        <ul className="space-y-3 overflow-auto pr-1">
          {memories.map((memory, index) => (
            <li
              key={`${memory.id}-${index}`}
              className="rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4 shadow-[0_10px_30px_rgba(16,36,31,0.04)]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#d7e4dc] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0f4a3a]">
                  {sectionLabels[memory.section] || memory.section}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#10241f]">{memory.text}</p>
              <p className="mt-3 border-t border-[#1f6b56]/10 pt-2 text-xs leading-relaxed text-[#1f6b56]">
                <span className="font-semibold">Why relevant: </span>
                {memory.whyRelevant}
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
