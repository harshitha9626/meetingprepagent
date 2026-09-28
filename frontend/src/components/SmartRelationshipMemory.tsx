// AI-Generated Code - 2026-09-28 - Composer

import { useMemo } from "react";
import type { RecalledMemory } from "../lib/api";
import {
  buildSmartRelationshipMemory,
  type SmartMemoryItem,
} from "../lib/smartRelationshipMemory";

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

function sourceHint(item: SmartMemoryItem): string | null {
  const when = formatWhen(item.whenLearned);
  if (item.documentId) {
    const parts = item.documentId.split(":");
    const meetingId = parts[parts.length - 1] || item.documentId;
    return when
      ? `${when} · ${meetingId}`
      : `Source: ${meetingId}`;
  }
  return when ? `Learned · ${when}` : null;
}

export function SmartRelationshipMemory({
  memories,
  mode,
}: {
  memories: RecalledMemory[];
  mode: "memory" | "generic";
}) {
  const summary = useMemo(
    () => buildSmartRelationshipMemory(memories),
    [memories]
  );

  if (mode === "generic") {
    return (
      <section className="fade-up rounded-[24px] border border-[#2a4038]/15 bg-[#2a4038]/5 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2a4038]">
          Relationship Memory
        </p>
        <h2 className="font-display mt-1 text-2xl font-semibold text-[#10241f]">
          Smart Relationship Memory
        </h2>
        <p className="mt-2 text-sm text-[#2a4038]">
          Memory mode is off — no Hindsight recall to summarize. Switch to{" "}
          <strong>With Hindsight</strong> to see grouped relationship memory.
        </p>
      </section>
    );
  }

  return (
    <section className="fade-up panel-surface rounded-[24px] border border-[#1f6b56]/18 bg-white/80 p-5 shadow-[0_12px_40px_rgba(16,36,31,0.05)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
            Relationship Memory
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-[#10241f]">
            Smart Relationship Memory
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#2a4038]">
            Grouped summary of memories recalled from Hindsight for this contact.
            Evidence cards remain below in Memory Used.
          </p>
        </div>
        <span className="rounded-full bg-[#1f6b56] px-2.5 py-1 text-[11px] font-semibold text-white">
          Recalled from Hindsight
        </span>
      </div>

      {summary.totalSourceMemories === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-[#1f6b56]/35 bg-[#f3f7f4]/80 px-4 py-3 text-sm text-[#2a4038]">
          No relevant memories found. Retain interactions in Hindsight, then
          prepare again.
        </p>
      ) : (
        <p className="mt-3 text-xs font-medium text-[#2a4038]">
          {summary.categorizedCount} of {summary.totalSourceMemories} recalled
          fact(s) placed into categories (deduped).
        </p>
      )}

      <div className="stagger-in mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.categories.map((category) => (
          <div
            key={category.id}
            className="card-interactive rounded-2xl border border-[#1f6b56]/12 bg-[#f3f7f4]/60 p-4"
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f4a3a]">
              {category.title}
            </h3>
            {category.items.length === 0 ? (
              <p className="mt-3 text-sm text-[#2a4038]/80">
                No relevant memories found.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {category.items.map((item) => {
                  const hint = sourceHint(item);
                  return (
                    <li key={item.id} className="text-sm leading-relaxed text-[#10241f]">
                      <p>
                        {item.urgent ? (
                          <span className="mr-1 font-semibold text-[#a33b2c]">
                            ⚠
                          </span>
                        ) : (
                          <span className="mr-1 text-[#1f6b56]">•</span>
                        )}
                        {item.text}
                      </p>
                      {hint && (
                        <p className="mt-1 pl-4 text-[11px] font-medium text-[#2a4038]/80">
                          {hint}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
