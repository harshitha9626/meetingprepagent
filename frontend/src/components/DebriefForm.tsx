// AI-Generated Code - 2026-09-28 - Composer

import { useState } from "react";
import type { DebriefPayload, Meeting } from "../lib/api";
import { api } from "../lib/api";

const empty: DebriefPayload = {
  discussed: "",
  decisions: "",
  commitments: "",
  concernsAndPrefs: "",
};

export function DebriefForm({
  meeting,
  onDone,
}: {
  meeting: Meeting;
  onDone: () => void;
}) {
  const [form, setForm] = useState<DebriefPayload>(meeting.debrief || empty);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await api.debrief(meeting.id, form);
      setMessage(
        `Retained via ${result.provider}. Document ${result.documentId}`
      );
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retain debrief");
    } finally {
      setBusy(false);
    }
  }

  const fields: { key: keyof DebriefPayload; label: string; hint: string }[] = [
    {
      key: "discussed",
      label: "What was discussed?",
      hint: "Topics, context, stakeholder dynamics",
    },
    {
      key: "decisions",
      label: "Decisions made",
      hint: "Agreements and directional choices",
    },
    {
      key: "commitments",
      label: "Promises & commitments",
      hint: "Who / what / when — including anything at risk",
    },
    {
      key: "concernsAndPrefs",
      label: "Concerns, preferences, prep style",
      hint: "Recurring worries + how Maya should prepare",
    },
  ];

  return (
    <form onSubmit={submit} className="fade-up space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f6b56]">
          Post-meeting debrief
        </p>
        <h2 className="font-display mt-1 text-2xl font-semibold">
          {meeting.title}
        </h2>
        <p className="text-sm text-[#2a4038]">{meeting.date}</p>
      </div>

      {fields.map((field) => (
        <label key={field.key} className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#10241f]">{field.label}</span>
          <span className="block text-xs text-[#2a4038]">{field.hint}</span>
          <textarea
            required
            rows={3}
            value={form[field.key]}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
            className="w-full rounded-xl border border-[#1f6b56]/25 bg-white/80 px-3 py-2 text-sm outline-none ring-[#1f6b56] focus:ring-2"
          />
        </label>
      ))}

      {error && <p className="text-sm text-[#a33b2c]">{error}</p>}
      {message && <p className="text-sm text-[#1f6b56]">{message}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6b56] disabled:opacity-60"
      >
        {busy ? "Retaining in memory…" : "Retain in Hindsight"}
      </button>
    </form>
  );
}
