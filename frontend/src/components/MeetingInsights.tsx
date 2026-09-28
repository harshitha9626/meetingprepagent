// AI-Generated Code - 2026-09-28 - Composer

import type { MeetingInsights as Insights } from "../lib/api";

export function MeetingInsightsPanel({
  insights,
}: {
  insights: Insights | null | undefined;
}) {
  if (!insights) return null;

  return (
    <section className="panel-surface rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
        Meeting insights
      </p>
      <h3 className="font-display text-lg font-semibold text-[#10241f]">
        {insights.contactName}
      </h3>
      <p className="mt-1 text-xs text-[#2a4038]">
        Factual counts only — no relationship scores.
      </p>

      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <Stat label="Interactions" value={String(insights.interactionCount)} />
        <Stat label="Upcoming" value={String(insights.upcomingCount)} />
        <Stat
          label="Open commitments"
          value={String(insights.openCommitmentCount)}
        />
        <Stat
          label="Overdue follow-ups"
          value={String(insights.overdueCommitmentCount)}
          emphasize={insights.overdueCommitmentCount > 0}
        />
        <Stat
          label="Memories recalled"
          value={String(insights.recalledMemoryCount)}
        />
        <Stat
          label="Last interaction"
          value={
            insights.lastInteraction
              ? `${insights.lastInteraction.date} — ${insights.lastInteraction.title}`
              : "None yet"
          }
        />
      </dl>

      <TopicBlock title="Recurring concerns" items={insights.recurringConcerns} />
      <TopicBlock title="Recent decisions" items={insights.recentDecisions} />
      <TopicBlock title="Topics discussed" items={insights.topicsDiscussed} />
    </section>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2 ${
        emphasize ? "bg-[#a33b2c]/10" : "bg-[#f3f7f4]/80"
      }`}
    >
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#2a4038]">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-sm font-medium leading-snug ${
          emphasize ? "text-[#a33b2c]" : "text-[#10241f]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function TopicBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2a4038]">
        {title}
      </p>
      <ul className="mt-1 space-y-1">
        {items.map((t, i) => (
          <li key={`${title}-${i}`} className="text-sm text-[#10241f]">
            · {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
