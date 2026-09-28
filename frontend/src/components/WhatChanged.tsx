// AI-Generated Code - 2026-09-29 - Composer

import type { WhatChangedItem } from "../lib/api";

const KIND_LABEL: Record<WhatChangedItem["kind"], string> = {
  recurring_concern: "Recurring concern",
  new_decision: "New decision",
  new_commitment: "Commitment / follow-up",
  resolved_commitment: "Resolved commitment",
  changed_preference: "Preference",
  new_interaction: "Interaction",
};

export function WhatChanged({
  items,
  mode,
}: {
  items: WhatChangedItem[];
  mode: "memory" | "generic";
}) {
  return (
    <section className="panel-surface rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
        Since last meeting
      </p>
      <h3 className="font-display text-lg font-semibold text-[#10241f]">
        What Changed Since Last Meeting?
      </h3>
      <p className="mt-1 text-xs text-[#2a4038]">
        Factual deltas from meetings, commitments, and recalled Hindsight
        context — not invented.
      </p>

      {mode === "generic" && items.length === 0 ? (
        <p className="mt-3 text-sm text-[#2a4038]/80">
          Turn on Personalized memory to include Hindsight context.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-[#2a4038]/80">
          No significant changes found yet. As the relationship evolves, shifts will appear here.
        </p>
      ) : (
        <ul className="stagger-in mt-3 space-y-2.5">
          {items.map((item, i) => (
            <li
              key={`${item.kind}-${i}`}
              className="card-interactive border-l-2 border-[#1f6b56]/40 pl-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0f4a3a]">
                {KIND_LABEL[item.kind]}
                <span className="ml-2 font-medium normal-case tracking-normal text-[#2a4038]/70">
                  · {item.source}
                </span>
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-[#10241f]">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
