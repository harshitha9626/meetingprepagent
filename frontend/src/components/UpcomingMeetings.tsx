// AI-Generated Code - 2026-09-28 - Composer

import type { UpcomingMeetingRow } from "../lib/api";

/**
 * Internal upcoming-meeting list (not Google Calendar / Outlook).
 */
export function UpcomingMeetings({
  meetings,
  onPrepare,
  busy,
}: {
  meetings: UpcomingMeetingRow[];
  onPrepare: (contactId: string) => void;
  busy?: boolean;
}) {
  return (
    <section className="panel-surface rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
        Upcoming meetings
      </p>
      <h3 className="font-display text-lg font-semibold text-[#10241f]">
        Prepare with Briefed
      </h3>
      <p className="mt-1 text-xs text-[#2a4038]">
        Stored in Briefed — not synced from an external calendar.
      </p>

      {meetings.length === 0 ? (
        <p className="mt-3 text-sm text-[#2a4038]/80">
          No upcoming meetings. Seed the Ravi demo or create a meeting when you
          debrief.
        </p>
      ) : (
        <ul className="stagger-in mt-3 space-y-2">
          {meetings.map((m) => (
            <li
              key={m.id}
              className="card-interactive flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1f6b56]/12 bg-[#f3f7f4]/50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#10241f]">{m.title}</p>
                <p className="text-xs text-[#2a4038]">
                  {m.date} · {m.contactName} · {m.role} · {m.company}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onPrepare(m.contactId)}
                className="btn-magic shrink-0 rounded-lg bg-[#1f6b56] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                <span>Prepare with Briefed</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
