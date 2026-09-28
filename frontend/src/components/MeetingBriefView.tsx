// AI-Generated Code - 2026-09-28 - Composer

import type { MeetingBrief } from "../lib/api";

const sections: {
  key: keyof MeetingBrief;
  title: string;
  list?: boolean;
}[] = [
  { key: "overview", title: "1. Contact overview" },
  { key: "discussions", title: "2. Previous discussions", list: true },
  { key: "decisions", title: "3. Important decisions", list: true },
  { key: "commitments", title: "4. Open / pending commitments", list: true },
  { key: "missedFollowUps", title: "5. Missed follow-ups", list: true },
  { key: "recurringConcerns", title: "6. Recurring concerns", list: true },
  { key: "preferences", title: "7. Relevant preferences", list: true },
  { key: "agenda", title: "8. Suggested agenda", list: true },
  { key: "questions", title: "9. Questions to ask", list: true },
];

export function MeetingBriefView({
  brief,
  mode,
}: {
  brief: MeetingBrief;
  mode: "memory" | "generic";
}) {
  return (
    <article className="fade-up space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1f6b56]/20 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f6b56]">
            Meeting brief
          </p>
          <h2 className="font-display mt-1 text-3xl font-semibold text-[#10241f]">
            {mode === "memory" ? "Personalized with memory" : "Generic (no memory)"}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            mode === "memory"
              ? "bg-[#1f6b56] text-white"
              : "bg-[#d7e4dc] text-[#2a4038]"
          }`}
        >
          {mode === "memory" ? "Hindsight-powered" : "Memory off"}
        </span>
      </header>

      {sections.map((section) => {
        const value = brief[section.key];
        return (
          <section key={section.key} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#2a4038]">
              {section.title}
            </h3>
            {section.list && Array.isArray(value) ? (
              <ul className="space-y-2">
                {(value as string[]).length === 0 ? (
                  <li className="text-[#2a4038]/70">None captured yet.</li>
                ) : (
                  (value as string[]).map((item, i) => (
                    <li
                      key={`${section.key}-${i}`}
                      className="border-l-2 border-[#c9842a]/70 pl-3 text-[15px] leading-relaxed text-[#10241f]"
                    >
                      {item}
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <p className="text-[15px] leading-relaxed text-[#10241f]">
                {String(value)}
              </p>
            )}
          </section>
        );
      })}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#2a4038]">
          10. Previous interaction timeline
        </h3>
        <ol className="space-y-3">
          {brief.timeline.length === 0 ? (
            <li className="text-[#2a4038]/70">No prior meetings logged.</li>
          ) : (
            brief.timeline.map((item) => (
              <li key={`${item.date}-${item.summary}`} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1f6b56]" />
                <div>
                  <p className="text-xs font-semibold text-[#1f6b56]">{item.date}</p>
                  <p className="text-[15px] leading-relaxed text-[#10241f]">
                    {item.summary}
                  </p>
                </div>
              </li>
            ))
          )}
        </ol>
      </section>
    </article>
  );
}
