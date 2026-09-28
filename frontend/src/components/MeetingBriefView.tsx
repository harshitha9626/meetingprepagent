// AI-Generated Code - 2026-09-29 - Composer

import type { Commitment, MeetingBrief } from "../lib/api";

const sections: {
  key: keyof MeetingBrief;
  title: string;
  list?: boolean;
}[] = [
  { key: "overview", title: "Contact context" },
  { key: "discussions", title: "Previous discussions", list: true },
  { key: "recurringConcerns", title: "Recurring concerns", list: true },
  { key: "commitments", title: "Open commitments", list: true },
  { key: "missedFollowUps", title: "Missed follow-ups", list: true },
  { key: "preferences", title: "Communication preferences", list: true },
  { key: "decisions", title: "What was decided", list: true },
  { key: "outcomes", title: "Relevant outcomes", list: true },
  { key: "agenda", title: "Meeting agenda", list: true },
  { key: "questions", title: "Suggested questions", list: true },
];

function StatusPill({ status }: { status: Commitment["status"] }) {
  if (status === "completed") {
    return <span className="status-pill is-done">Completed</span>;
  }
  if (status === "overdue") {
    return <span className="status-pill is-overdue">Overdue</span>;
  }
  return <span className="status-pill is-open">Open</span>;
}

export function MeetingBriefView({
  brief,
  mode,
  openCommitments = [],
}: {
  brief: MeetingBrief;
  mode: "memory" | "generic";
  openCommitments?: Commitment[];
}) {
  return (
    <article className="fade-up space-y-1">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#1f6b56]/15 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f6b56]">
            Meeting brief
          </p>
          <h2 className="font-display mt-1 text-3xl font-semibold text-[#10241f]">
            {mode === "memory" ? "Your personalized brief" : "Generic brief"}
          </h2>
          {mode === "memory" && (
            <p className="mt-1 text-xs font-medium text-[#1f6b56]">
              Personalized using facts recalled from Hindsight
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            mode === "memory"
              ? "bg-[#1f6b56] text-white"
              : "bg-[#d7e4dc] text-[#2a4038]"
          }`}
        >
          {mode === "memory" ? "Recalled from Hindsight" : "Memory off"}
        </span>
      </header>

      <section className="brief-section">
        <h3 className="brief-section-title">Open commitments</h3>
        <p className="mb-2 text-xs text-[#2a4038]">
          From the structured commitment tracker for this contact.
        </p>
        {openCommitments.length === 0 ? (
          <p className="text-sm text-[#2a4038]/80">No open commitments.</p>
        ) : (
          <ul className="stagger-in space-y-3">
            {openCommitments.map((c) => (
              <li key={c.id} className="brief-item">
                <span className="font-medium">{c.description}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#2a4038]">
                  <StatusPill status={c.status} />
                  {c.dueDate ? <span>Due {c.dueDate}</span> : null}
                  {c.meetingTitle ? <span>{c.meetingTitle}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sections.map((section) => {
        const value = brief[section.key];
        const listValue = Array.isArray(value) ? (value as string[]) : [];
        return (
          <section key={section.key} className="brief-section">
            <h3 className="brief-section-title">{section.title}</h3>
            {section.list ? (
              <ul className="stagger-in space-y-2">
                {listValue.length === 0 ? (
                  <li className="text-sm text-[#2a4038]/70">None captured yet.</li>
                ) : (
                  listValue.map((item, i) => (
                    <li key={`${section.key}-${i}`} className="brief-item">
                      {item}
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <p className="text-[15px] leading-relaxed text-[#10241f]">
                {String(value ?? "")}
              </p>
            )}
          </section>
        );
      })}

      <section className="brief-section">
        <h3 className="brief-section-title">Relationship timeline</h3>
        {brief.timeline.length === 0 ? (
          <div className="empty-state">
            No meeting history yet. Complete your first meeting debrief to start
            building relationship memory.
          </div>
        ) : (
          <ol className="timeline-rail stagger-in space-y-3 pl-5">
            {brief.timeline.map((item, i) => (
              <li
                key={`${item.date}-${item.summary}-${i}`}
                className="timeline-item relative rounded-lg px-2 py-1"
              >
                <span className="timeline-node absolute -left-5 top-2 h-2.5 w-2.5 rounded-full bg-[#1f6b56]" />
                <p className="text-xs font-semibold text-[#1f6b56]">{item.date}</p>
                <p className="text-[15px] leading-relaxed text-[#10241f]">
                  {item.summary}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}
