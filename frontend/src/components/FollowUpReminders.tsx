// AI-Generated Code - 2026-09-28 - Composer

import type { Commitment } from "../lib/api";

/**
 * Surfaces overdue / due-dated follow-ups from the commitment tracker.
 * No external notifications — display only.
 */
export function FollowUpReminders({
  commitments,
  contactName,
}: {
  commitments: Commitment[];
  contactName: string;
}) {
  const overdue = commitments.filter((c) => c.status === "overdue");
  const dueSoon = commitments.filter(
    (c) => c.status === "pending" && Boolean(c.dueDate)
  );
  const open = commitments.filter(
    (c) => c.status === "pending" || c.status === "overdue"
  );

  return (
    <section className="panel-surface rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
        Follow-up reminders
      </p>
      <h3 className="font-display text-lg font-semibold text-[#10241f]">
        Due dates & overdue
      </h3>
      <p className="mt-1 text-xs text-[#2a4038]">
        From structured commitments for {contactName}. Status lives in Briefed;
        narrative stays in Hindsight.
      </p>

      {open.length === 0 ? (
        <p className="mt-3 text-sm text-[#2a4038]/80">
          No open follow-ups with due dates.
        </p>
      ) : (
        <ul className="stagger-in mt-3 space-y-2">
          {overdue.map((c) => (
            <li
              key={c.id}
              className="commitment-card is-overdue rounded-xl border border-[#a33b2c]/25 bg-[#a33b2c]/8 px-3 py-2"
            >
              <p className="text-xs font-semibold text-[#a33b2c]">🔴 Overdue</p>
              <p className="text-sm text-[#10241f]">{c.description}</p>
              <p className="mt-0.5 text-[11px] text-[#2a4038]">
                Due {c.dueDate ?? "—"}
                {c.meetingTitle ? ` · ${c.meetingTitle}` : ""}
              </p>
            </li>
          ))}
          {dueSoon.map((c) => (
            <li
              key={c.id}
              className="commitment-card rounded-xl border border-[#c9842a]/30 bg-[#f0d7a8]/20 px-3 py-2"
            >
              <p className="text-xs font-semibold text-[#8a5a12]">
                🟡 Pending · due {c.dueDate}
              </p>
              <p className="text-sm text-[#10241f]">{c.description}</p>
            </li>
          ))}
          {open
            .filter((c) => c.status === "pending" && !c.dueDate)
            .slice(0, 3)
            .map((c) => (
              <li
                key={c.id}
                className="commitment-card rounded-xl border border-[#1f6b56]/15 bg-[#f3f7f4]/60 px-3 py-2"
              >
                <p className="text-xs font-semibold text-[#0f4a3a]">
                  🟡 Pending · no due date
                </p>
                <p className="text-sm text-[#10241f]">{c.description}</p>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
