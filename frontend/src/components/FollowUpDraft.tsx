// AI-Generated Code - 2026-09-28 - Composer

import { useState } from "react";
import { api, type FollowUpDraft as Draft } from "../lib/api";

export function FollowUpDraftPanel({
  contactId,
  meetingId,
  contactName,
}: {
  contactId: string;
  meetingId?: string | null;
  contactName: string;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const { draft: next } = await api.generateFollowUp(
        contactId,
        meetingId ?? null
      );
      setDraft(next);
    } catch (err) {
      setDraft(null);
      setError(
        err instanceof Error ? err.message : "Could not generate follow-up"
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyAll() {
    if (!draft) return;
    const text = `Subject: ${draft.subject}\n\n${draft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError("Could not copy — select the text manually.");
    }
  }

  return (
    <section className="panel-surface rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
            Personalized follow-up
          </p>
          <h3 className="font-display text-lg font-semibold text-[#10241f]">
            Generate Follow-up
          </h3>
          <p className="mt-1 text-xs text-[#2a4038]">
            Draft from the latest debrief, open commitments, and Hindsight
            preferences for {contactName}. Does not send email.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void generate()}
          className="btn-interactive rounded-xl bg-[#1f6b56] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Generating…" : "Generate Follow-up"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-[#a33b2c]">{error}</p>}

      {draft && (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] text-[#2a4038]">
            Based on:{" "}
            {draft.basedOn.debriefUsed ? "debrief" : "no debrief"} ·{" "}
            {draft.basedOn.openCommitmentCount} open commitment(s) ·{" "}
            {draft.basedOn.memoryCount} Hindsight fact(s)
            {draft.meetingTitle
              ? ` · ${draft.meetingTitle} (${draft.meetingDate})`
              : ""}
          </p>
          <div className="rounded-xl border border-[#1f6b56]/15 bg-[#f3f7f4]/60 p-3">
            <p className="text-xs font-semibold text-[#0f4a3a]">Subject</p>
            <p className="mt-1 text-sm font-medium text-[#10241f]">
              {draft.subject}
            </p>
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-[#1f6b56]/15 bg-white/90 p-3 font-sans text-sm leading-relaxed text-[#10241f]">
            {draft.body}
          </pre>
          <button
            type="button"
            onClick={() => void copyAll()}
            className="btn-interactive rounded-lg border border-[#1f6b56]/25 px-3 py-1.5 text-xs font-semibold text-[#0f4a3a]"
          >
            {copied ? "Copied" : "Copy subject + body"}
          </button>
        </div>
      )}
    </section>
  );
}
