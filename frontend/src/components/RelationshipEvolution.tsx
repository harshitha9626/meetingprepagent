// AI-Generated Code - 2026-09-28 - Composer

import type { RelationshipEvolution } from "../lib/api";

export function RelationshipEvolutionPanel({
  evolution,
}: {
  evolution: RelationshipEvolution | null | undefined;
}) {
  if (!evolution) return null;
  const { stages, recurringConcerns, openThreads, preferences } = evolution;

  return (
    <section className="panel-surface rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
        Memory evolution
      </p>
      <h3 className="font-display text-lg font-semibold text-[#10241f]">
        How the Relationship Evolved
      </h3>
      <p className="mt-1 text-xs text-[#2a4038]">
        Chronology from logged interactions and Hindsight-backed patterns — not
        invented narrative.
      </p>

      {stages.length === 0 ? (
        <p className="mt-3 text-sm text-[#2a4038]/80">
          No logged interactions yet. Debrief a meeting to grow this timeline.
        </p>
      ) : (
        <ol className="stagger-in mt-4 space-y-0">
          {stages.map((stage, index) => (
            <li
              key={stage.meetingId}
              className="timeline-item relative flex gap-3 rounded-xl pb-5 pr-1"
            >
              <div className="flex flex-col items-center">
                <span className="timeline-node flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1f6b56] text-[11px] font-bold text-white">
                  {stage.meetingNumber}
                </span>
                {index < stages.length - 1 && (
                  <span className="timeline-rail mt-1 w-px flex-1 bg-[#1f6b56]/30" />
                )}
              </div>
              <div className="card-interactive min-w-0 flex-1 rounded-xl pb-1 pl-1">
                <p className="text-xs font-semibold text-[#1f6b56]">
                  {stage.date} · {stage.title}
                  {stage.retained ? " · retained" : ""}
                </p>
                <p className="mt-1 text-sm text-[#10241f]">
                  <span className="font-semibold">Topic: </span>
                  {stage.majorTopic}
                </p>
                {stage.concern && (
                  <p className="mt-0.5 text-sm text-[#2a4038]">
                    <span className="font-semibold text-[#a33b2c]">Concern: </span>
                    {stage.concern}
                  </p>
                )}
                {stage.decision && (
                  <p className="mt-0.5 text-sm text-[#2a4038]">
                    <span className="font-semibold">Decision: </span>
                    {stage.decision}
                  </p>
                )}
                {stage.commitment && (
                  <p className="mt-0.5 text-sm text-[#2a4038]">
                    <span className="font-semibold">Commitment: </span>
                    {stage.commitment}
                  </p>
                )}
                {stage.change && (
                  <p className="mt-0.5 text-sm text-[#2a4038]">
                    <span className="font-semibold">Change / outcome: </span>
                    {stage.change}
                  </p>
                )}
              </div>
            </li>
          ))}
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#c9842a] bg-[#f0d7a8]/40 text-[10px] font-bold text-[#8a5a12]">
              Now
            </span>
            <p className="pt-1 text-sm font-medium text-[#10241f]">
              Current prep uses this history via Hindsight RECALL.
            </p>
          </li>
        </ol>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <PatternBlock title="Recurring concerns" items={recurringConcerns} />
        <PatternBlock title="Open threads" items={openThreads} />
        <PatternBlock title="Preferences" items={preferences} />
      </div>
    </section>
  );
}

function PatternBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-[#f3f7f4]/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0f4a3a]">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-[#2a4038]/70">None yet</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={`${title}-${i}`} className="text-xs leading-relaxed text-[#10241f]">
              • {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
