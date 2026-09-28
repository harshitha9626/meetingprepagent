// AI-Generated Code - 2026-09-29 - Composer

import { useState } from "react";
import type { DebriefPayload, Meeting } from "../lib/api";
import { api } from "../lib/api";

function friendlyDebriefError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/Failed to fetch|NetworkError|unreachable|Cannot reach/i.test(msg)) {
    return "Cannot reach the API. Start the backend on port 8787 and try again.";
  }
  if (/Contact not found/i.test(msg)) {
    return "Invalid contact. Select a contact, then open Post-Meeting Debrief again.";
  }
  if (/Meeting not found/i.test(msg)) {
    return "That meeting was not found. Refresh and try again.";
  }
  if (/incomplete|VALIDATION|Add /i.test(msg)) {
    return msg;
  }
  return msg || "Failed to save the debrief.";
}

export type DebriefDoneInfo = {
  saved: boolean;
  retained: boolean;
  createNext?: boolean;
  /** Refresh timeline and return home without preparing */
  stayHome?: boolean;
};

export function DebriefForm({
  meeting,
  onDone,
  onCancel,
}: {
  meeting: Meeting;
  onDone: (info: DebriefDoneInfo) => void;
  onCancel?: () => void;
}) {
  const existing = meeting.debrief;
  const [form, setForm] = useState<DebriefPayload>({
    discussed: existing?.discussed ?? "",
    decisions: existing?.decisions ?? "",
    commitments: existing?.commitments ?? "",
    concernsAndPrefs: existing?.concernsAndPrefs ?? "",
    followUps: existing?.followUps ?? "",
    myCommitments: existing?.myCommitments ?? "",
    theirCommitments: existing?.theirCommitments ?? "",
    newInformation: existing?.newInformation ?? "",
    outcome: existing?.outcome ?? "",
    changesNoted: existing?.changesNoted ?? "",
  });
  const [promisedBy, setPromisedBy] = useState<"me" | "contact">("me");
  const [trackCommitment, setTrackCommitment] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [retained, setRetained] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || saved) return;

    const trimmed: DebriefPayload = {
      discussed: form.discussed.trim(),
      decisions: form.decisions.trim(),
      commitments: form.commitments.trim(),
      concernsAndPrefs: form.concernsAndPrefs.trim(),
      followUps: form.followUps.trim(),
      myCommitments: form.myCommitments?.trim() || undefined,
      theirCommitments: form.theirCommitments?.trim() || undefined,
      newInformation: form.newInformation?.trim() || undefined,
      outcome: form.outcome?.trim() || undefined,
      changesNoted: form.changesNoted?.trim() || undefined,
    };
    if (
      !trimmed.discussed ||
      !trimmed.decisions ||
      !trimmed.commitments ||
      !trimmed.concernsAndPrefs ||
      !trimmed.followUps
    ) {
      setError(
        "Debrief is empty or incomplete. Fill all five fields before saving."
      );
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    setProgress("Saving meeting debrief…");
    try {
      // Brief pause so users see the local-save step before retain
      await new Promise((r) => setTimeout(r, 120));
      setProgress("Retaining interaction in Hindsight…");
      const result = await api.debrief(meeting.id, {
        ...trimmed,
        trackCommitment,
        promisedBy,
        dueDate: dueDate || null,
      });
      setSaved(Boolean(result.saved));
      setRetained(Boolean(result.retained));
      if (result.retained) {
        setMessage(
          result.message ||
            "Meeting debrief saved. Relationship memory updated in Hindsight."
        );
      } else {
        setMessage(
          result.message ||
            "Debrief saved, but Hindsight could not remember this interaction."
        );
        if (result.hindsightError) {
          setError(result.hindsightError);
        }
      }
      setProgress(null);
    } catch (err) {
      setProgress(null);
      setMessage(null);
      setError(friendlyDebriefError(err));
    } finally {
      setBusy(false);
    }
  }

  const requiredFields: {
    key:
      | "discussed"
      | "decisions"
      | "commitments"
      | "concernsAndPrefs"
      | "followUps";
    label: string;
    hint: string;
  }[] = [
    {
      key: "discussed",
      label: "What was discussed?",
      hint: "Key discussion points from the meeting",
    },
    {
      key: "decisions",
      label: "What decisions were made?",
      hint: "Agreements and directional choices",
    },
    {
      key: "commitments",
      label: "Commitments / promises (summary)",
      hint: "Used for structured tracking and Hindsight narrative",
    },
    {
      key: "concernsAndPrefs",
      label: "What concerns were raised?",
      hint: "Worries, objections, or preferences to remember",
    },
    {
      key: "followUps",
      label: "Follow-ups",
      hint: "Actions to bring into the next meeting",
    },
  ];

  const optionalFields: {
    key:
      | "myCommitments"
      | "theirCommitments"
      | "newInformation"
      | "outcome"
      | "changesNoted";
    label: string;
    hint: string;
  }[] = [
    {
      key: "myCommitments",
      label: "What commitments did I make?",
      hint: "Optional — your promises",
    },
    {
      key: "theirCommitments",
      label: "What commitments did they make?",
      hint: "Optional — their promises",
    },
    {
      key: "newInformation",
      label: "Important new information",
      hint: "Optional — facts that should enter long-term memory",
    },
    {
      key: "outcome",
      label: "Overall meeting outcome",
      hint: "Optional — how the meeting landed",
    },
    {
      key: "changesNoted",
      label: "What changed since the previous meeting?",
      hint: "Optional — shifts you noticed in the room",
    },
  ];

  return (
    <form onSubmit={submit} className="fade-up space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f6b56]">
            Post-Meeting Debrief
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold">
            {meeting.title}
          </h2>
          <p className="text-sm text-[#2a4038]">{meeting.date}</p>
          <p className="mt-2 max-w-xl text-sm text-[#2a4038]">
            Record what happened. Meaningful details are saved locally, then
            retained in Hindsight for future meeting preparation.
          </p>
        </div>
        {onCancel && !saved && (
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="btn-ghost-interactive rounded-full border border-[#1f6b56]/25 px-4 py-2 text-xs font-semibold text-[#2a4038] disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {requiredFields.map((field) => (
        <label key={field.key} className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#10241f]">{field.label}</span>
          <span className="block text-xs text-[#2a4038]">{field.hint}</span>
          <textarea
            required
            rows={3}
            disabled={saved || busy}
            value={form[field.key] ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
            className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/80 px-3 py-2 text-sm outline-none ring-[#1f6b56] focus:ring-2 disabled:opacity-70"
          />
        </label>
      ))}

      <details className="rounded-xl border border-[#1f6b56]/15 bg-[#f3f7f4]/50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#0f4a3a]">
          More detail (optional) — my/their commitments, outcome, changes
        </summary>
        <div className="mt-3 space-y-3">
          {optionalFields.map((field) => (
            <label key={field.key} className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#10241f]">
                {field.label}
              </span>
              <span className="block text-xs text-[#2a4038]">{field.hint}</span>
              <textarea
                rows={2}
                disabled={saved || busy}
                value={form[field.key] ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/80 px-3 py-2 text-sm outline-none ring-[#1f6b56] focus:ring-2 disabled:opacity-70"
              />
            </label>
          ))}
        </div>
      </details>

      <div className="space-y-2 rounded-xl border border-[#1f6b56]/15 bg-[#f3f7f4]/70 p-3">
        <label className="flex items-start gap-2 text-sm text-[#10241f]">
          <input
            type="checkbox"
            checked={trackCommitment}
            disabled={saved || busy}
            onChange={(e) => setTrackCommitment(e.target.checked)}
            className="mt-1"
          />
          <span>
            Also track <strong>New Commitments</strong> in Smart Commitment
            Tracker (structured status; Hindsight still retains the narrative).
          </span>
        </label>
        {trackCommitment && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-semibold">Promised By</span>
              <select
                value={promisedBy}
                disabled={saved || busy}
                onChange={(e) =>
                  setPromisedBy(e.target.value as "me" | "contact")
                }
                className="w-full rounded-lg border border-[#1f6b56]/25 bg-white/90 px-2 py-1.5 text-sm"
              >
                <option value="me">Me</option>
                <option value="contact">Contact</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">Due Date (optional)</span>
              <input
                type="date"
                value={dueDate}
                disabled={saved || busy}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-[#1f6b56]/25 bg-white/90 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        )}
      </div>

      {progress && (
        <p className="animate-pulse text-sm font-medium text-[#0f4a3a]">
          {progress}
        </p>
      )}

      {message && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            retained
              ? "border-[#1f6b56]/30 bg-[#1f6b56]/10 text-[#0f4a3a]"
              : "border-[#c9842a]/40 bg-[#f0d7a8]/35 text-[#10241f]"
          }`}
        >
          <p className="font-medium">{message}</p>
          <ul className="mt-2 space-y-1 text-xs font-semibold">
            <li>{saved ? "✓ Meeting debrief saved" : "○ Meeting debrief saved"}</li>
            <li>
              {retained
                ? "✓ Relationship memory updated"
                : "○ Relationship memory updated"}
            </li>
          </ul>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-[#a33b2c]/30 bg-[#a33b2c]/10 px-3 py-2 text-sm text-[#a33b2c]">
          {error}
        </p>
      )}

      {!saved ? (
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="btn-magic min-w-cta rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <span>
              {busy ? <span className="btn-spinner" aria-hidden /> : null}
              {busy ? progress || "Saving…" : "Save & Remember"}
            </span>
          </button>
          {onCancel && (
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="btn-interactive rounded-full border border-[#1f6b56]/30 px-5 py-2.5 text-sm font-semibold text-[#0f4a3a] disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={() => onDone({ saved, retained, createNext: true })}
            className="btn-interactive rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create next meeting + prepare
          </button>
          <button
            type="button"
            onClick={() => onDone({ saved, retained })}
            className="btn-interactive rounded-full border border-[#1f6b56]/30 px-5 py-2.5 text-sm font-semibold text-[#0f4a3a]"
          >
            Prepare with updated memory
          </button>
          <button
            type="button"
            onClick={() => onDone({ saved, retained, stayHome: true })}
            className="btn-ghost-interactive rounded-full px-4 py-2.5 text-sm font-semibold text-[#2a4038] underline-offset-2 hover:underline"
          >
            Done — back to timeline
          </button>
        </div>
      )}
    </form>
  );
}
