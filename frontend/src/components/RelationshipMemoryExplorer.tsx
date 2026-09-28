// AI-Generated Code - 2026-09-28 - Composer

import type { RelationshipMemory } from "../lib/api";

export function RelationshipMemoryExplorer({
  data,
  loading,
  error,
  onRefresh,
}: {
  data: RelationshipMemory | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}) {
  return (
    <section className="panel-surface space-y-3 rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
            Relationship Memory
          </p>
          <h3 className="font-display text-lg font-semibold text-[#10241f]">
            {data?.contact.name ?? "Selected contact"}
          </h3>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="btn-ghost-interactive text-xs font-semibold text-[#1f6b56] disabled:opacity-50"
          >
            {loading ? "Recalling relationship memory…" : "Refresh from Hindsight"}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-[#a33b2c]">{error}</p>}
      {loading && !data && (
        <p className="recall-progress text-sm text-[#2a4038]">
          <span className="inline-flex gap-1 text-[#1f6b56]">
            <span className="pulse-dot" />
            <span className="pulse-dot" />
            <span className="pulse-dot" />
          </span>
          Recalling relationship memory…
        </p>
      )}

      {data && (
        <div className="space-y-3 text-sm">
          <p className="text-xs text-[#2a4038]">
            {data.memoryCount} facts from Hindsight · bank {data.bankId}
          </p>

          <Block title="Important facts" items={data.facts.slice(0, 6).map((f) => f.text)} />
          <Block title="Preferences" items={data.preferences} />
          <Block title="Concerns" items={data.concerns} />
          <Block title="Commitments / follow-ups" items={data.commitments} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2a4038]">
              Timeline
            </p>
            <ul className="mt-1 space-y-1">
              {data.timeline.map((t, index) => (
                <li key={`${t.date}-${t.title}-${index}`} className="text-xs text-[#10241f]">
                  {t.date} · {t.title}
                  {t.retained ? " · retained" : ""}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-[#2a4038]">
            Last interaction:{" "}
            {data.lastInteraction
              ? `${data.lastInteraction.date} — ${data.lastInteraction.title}`
              : "None yet"}
          </p>
        </div>
      )}
    </section>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#2a4038]">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-1 text-xs text-[#2a4038]/70">None recalled yet.</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.slice(0, 4).map((item, index) => (
            <li
              key={`${title}-${index}-${item.slice(0, 24)}`}
              className="border-l-2 border-[#1f6b56]/40 pl-2 text-xs leading-relaxed text-[#10241f]"
            >
              {item.length > 160 ? `${item.slice(0, 157)}…` : item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
