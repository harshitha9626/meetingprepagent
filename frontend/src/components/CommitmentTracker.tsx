// AI-Generated Code - 2026-09-29 - Composer

import { useMemo, useState } from "react";
import type {
  Commitment,
  CommitmentStatus,
  Meeting,
  PromisedBy,
} from "../lib/api";
import { api } from "../lib/api";

const FILTERS: { id: "all" | CommitmentStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "overdue", label: "Overdue" },
];

function StatusPill({ status }: { status: CommitmentStatus }) {
  if (status === "completed") {
    return <span className="status-pill is-done commitment-check">✓ Completed</span>;
  }
  if (status === "overdue") {
    return <span className="status-pill is-overdue">Overdue</span>;
  }
  return <span className="status-pill is-open">Open</span>;
}

function promisedByLabel(
  promisedBy: PromisedBy,
  contactName: string
): string {
  return promisedBy === "me" ? "Me" : contactName;
}

export function CommitmentTracker({
  contactId,
  contactName,
  meetings,
  commitments,
  onChanged,
}: {
  contactId: string;
  contactName: string;
  meetings: Meeting[];
  commitments: Commitment[];
  onChanged: () => void;
}) {
  const [filter, setFilter] = useState<"all" | CommitmentStatus>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [description, setDescription] = useState("");
  const [promisedBy, setPromisedBy] = useState<PromisedBy>("me");
  const [dueDate, setDueDate] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return commitments;
    return commitments.filter((c) => c.status === filter);
  }, [commitments, filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const text = description.trim();
    if (text.length < 3) {
      setError("Enter a commitment description.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatusMsg(null);
    try {
      await api.createCommitment(contactId, {
        description: text,
        promisedBy,
        meetingId: meetingId || null,
        dueDate: dueDate || null,
      });
      setDescription("");
      setDueDate("");
      setShowAdd(false);
      setStatusMsg("Commitment saved.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save commitment");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: CommitmentStatus) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.updateCommitmentStatus(id, status);
      setStatusMsg(
        status === "completed"
          ? "Commitment marked completed."
          : `Commitment marked ${status}.`
      );
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-surface space-y-3 rounded-2xl border border-[#1f6b56]/15 bg-white/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
            Promises & Commitments
          </p>
          <h3 className="font-display text-lg font-semibold text-[#10241f]">
            Smart Commitment Tracker
          </h3>
          <p className="mt-1 text-xs text-[#2a4038]">
            Structured status in Briefed. Relationship narrative stays in
            Hindsight.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => setShowAdd((v) => !v)}
          className="btn-interactive rounded-full border border-[#1f6b56]/30 px-3 py-1.5 text-xs font-semibold text-[#0f4a3a] disabled:opacity-50"
        >
          {showAdd ? "Cancel" : "+ Add Commitment"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`btn-interactive rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              filter === f.id
                ? "bg-[#1f6b56] text-white"
                : "bg-[#d7e4dc]/70 text-[#2a4038] hover:bg-[#d7e4dc]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="space-y-2 rounded-xl border border-[#1f6b56]/15 bg-[#f3f7f4]/80 p-3"
        >
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#10241f]">
              Commitment
            </span>
            <textarea
              required
              rows={2}
              value={description}
              disabled={busy}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[#1f6b56]/25 bg-white/90 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1f6b56]"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#10241f]">
              Promised By
            </span>
            <select
              value={promisedBy}
              disabled={busy}
              onChange={(e) => setPromisedBy(e.target.value as PromisedBy)}
              className="w-full rounded-lg border border-[#1f6b56]/25 bg-white/90 px-2 py-1.5 text-sm"
            >
              <option value="me">Me</option>
              <option value="contact">{contactName}</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#10241f]">
              Source meeting (optional)
            </span>
            <select
              value={meetingId}
              disabled={busy}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full rounded-lg border border-[#1f6b56]/25 bg-white/90 px-2 py-1.5 text-sm"
            >
              <option value="">None</option>
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.date} — {m.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#10241f]">
              Due Date (optional)
            </span>
            <input
              type="date"
              value={dueDate}
              disabled={busy}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-[#1f6b56]/25 bg-white/90 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="btn-interactive rounded-full bg-[#0f4a3a] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save Commitment"}
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-lg border border-[#a33b2c]/30 bg-[#a33b2c]/10 px-2 py-1.5 text-xs text-[#a33b2c]">
          {error}
        </p>
      )}
      {statusMsg && !error && (
        <p className="text-xs font-medium text-[#1f6b56]">{statusMsg}</p>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="font-medium text-[#10241f]">No commitments recorded yet.</p>
          <p className="mt-1">
            Add a promise from a debrief or track one here so the next brief can
            surface it.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => (
            <li
              key={c.id}
              className={`commitment-card rounded-xl border border-[#1f6b56]/12 bg-white/80 px-3 py-2.5 ${
                c.status === "completed"
                  ? "is-completed"
                  : c.status === "overdue"
                    ? "is-overdue"
                    : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#10241f]">
                  {c.description}
                </p>
                <StatusPill status={c.status} />
              </div>
              <p className="mt-1 text-[11px] text-[#2a4038]">
                Promised by: {promisedByLabel(c.promisedBy, contactName)}
                {" · "}
                Contact: {c.contactName ?? contactName}
              </p>
              <p className="text-[11px] text-[#2a4038]">
                Created:{" "}
                {c.meetingTitle
                  ? `${c.meetingDate ?? ""} · ${c.meetingTitle}`
                  : new Date(c.createdAt).toLocaleDateString()}
                {c.dueDate ? ` · Due: ${c.dueDate}` : ""}
              </p>
              {c.status !== "completed" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setStatus(c.id, "completed")}
                    className="btn-interactive rounded-full bg-[#1f6b56] px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                  >
                    Mark Completed
                  </button>
                  {c.status === "pending" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setStatus(c.id, "overdue")}
                      className="btn-interactive rounded-full border border-[#a33b2c]/40 px-2.5 py-1 text-[11px] font-semibold text-[#a33b2c] disabled:opacity-50"
                    >
                      Mark Overdue
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
