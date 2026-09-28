// AI-Generated Code - 2026-09-29 - Composer

import type { PrepareResponse } from "../lib/api";

/**
 * Side-by-side comparison.
 * WITH Hindsight must be from a real prepare(mode=memory) response.
 * WITHOUT is prepare(mode=generic) — intentionally no recall.
 */
export function BeforeAfterCompare({
  withMemory,
  withoutMemory,
  activeMode = "memory",
}: {
  withMemory: PrepareResponse | null;
  withoutMemory: PrepareResponse | null;
  activeMode?: "memory" | "generic";
}) {
  const withPoints = extractWithPoints(withMemory);
  const withoutPoints = extractWithoutPoints(withoutMemory);
  const contactName =
    withMemory?.meta.contactName ||
    withoutMemory?.meta.contactName ||
    "this contact";

  return (
    <section className="grid gap-4 md:grid-cols-2" key={activeMode}>
      <div
        className={`before-after-panel panel-swap rounded-2xl border border-[#2a4038]/20 bg-[#2a4038]/5 p-4 ${
          activeMode === "generic"
            ? "ring-1 ring-[#2a4038]/15"
            : "is-dimmed"
        }`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2a4038]">
          Without memory
        </p>
        <p className="mt-1 text-sm font-semibold text-[#10241f]">
          Generic preparation
        </p>
        <p className="mt-0.5 text-xs text-[#2a4038]">
          Baseline agenda for {contactName}
        </p>
        <ul className="stagger-in mt-3 space-y-2 text-sm text-[#2a4038]">
          {withoutPoints.map((p, i) => (
            <li key={`wo-${i}`} className="border-l-2 border-[#2a4038]/30 pl-3">
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-[#2a4038]/80">
          {withoutMemory
            ? "From prepare without Hindsight recall."
            : "Run Prepare to load the generic baseline."}
        </p>
      </div>

      <div
        className={`before-after-panel panel-swap rounded-2xl border border-[#1f6b56]/35 bg-[#1f6b56]/8 p-4 ${
          activeMode === "memory" ? "is-active-memory" : "is-dimmed"
        }`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1f6b56]">
          With Hindsight
        </p>
        <p className="mt-1 text-sm font-semibold text-[#10241f]">
          Personalized preparation
        </p>
        <p className="mt-0.5 text-xs text-[#0f4a3a]">
          Grounded in recalled relationship memory
        </p>
        {withPoints.length === 0 ? (
          <p className="mt-3 text-sm text-[#2a4038]">
            No recalled memories yet — run Prepare with Hindsight configured.
          </p>
        ) : (
          <ul className="stagger-in mt-3 space-y-2 text-sm text-[#10241f]">
            {withPoints.map((p, i) => (
              <li key={`w-${i}`} className="border-l-2 border-[#c9842a] pl-3">
                {p}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-[#0f4a3a]">
          {withMemory && withMemory.meta.memoryCount > 0
            ? `${withMemory.meta.memoryCount} memories recalled from Hindsight`
            : "Waiting for a successful Hindsight recall — this panel will not invent facts."}
        </p>
      </div>
    </section>
  );
}

function extractWithoutPoints(prep: PrepareResponse | null): string[] {
  if (!prep) {
    return [
      "Discuss the project at a high level",
      "Ask about timeline",
      "Discuss requirements",
    ];
  }
  const b = prep.brief;
  const points = [
    ...(b.agenda ?? []).slice(0, 3),
    ...(b.questions ?? []).slice(0, 2),
  ].filter(Boolean);
  return points.length
    ? points.map((p) => (p.length > 120 ? `${p.slice(0, 117)}…` : p))
    : [
        "Discuss the project at a high level",
        "Ask about timeline",
        "Discuss requirements",
      ];
}

function extractWithPoints(prep: PrepareResponse | null): string[] {
  if (!prep || prep.mode !== "memory") return [];
  const b = prep.brief;
  const points: string[] = [];
  const push = (arr?: string[]) => {
    for (const item of arr ?? []) {
      if (points.length >= 5) return;
      if (item && !/unknown without memory|no .* available without memory/i.test(item)) {
        points.push(item.length > 140 ? `${item.slice(0, 137)}…` : item);
      }
    }
  };
  push(b.missedFollowUps);
  push(b.recurringConcerns);
  push(b.commitments);
  push(b.preferences);
  if (b.agenda?.[0]) points.push(b.agenda[0]);
  if (points.length < 3) push(b.discussions);
  return points.slice(0, 5);
}
