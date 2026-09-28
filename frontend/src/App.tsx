// AI-Generated Code - 2026-09-28 - Composer

import { useCallback, useEffect, useMemo, useState } from "react";
import { ContactList } from "./components/ContactList";
import { DebriefForm } from "./components/DebriefForm";
import { MeetingBriefView } from "./components/MeetingBriefView";
import { MemoryToggle } from "./components/MemoryToggle";
import { WhatIRemember } from "./components/WhatIRemember";
import {
  api,
  type Contact,
  type Meeting,
  type PrepareResponse,
} from "./lib/api";

type View = "home" | "prep" | "debrief";

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<"memory" | "generic">("memory");
  const [prep, setPrep] = useState<PrepareResponse | null>(null);
  const [debriefMeeting, setDebriefMeeting] = useState<Meeting | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState("…");
  const [showCreate, setShowCreate] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    role: "",
  });

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [contacts, selectedId]
  );

  const refreshContacts = useCallback(async () => {
    const { contacts: list } = await api.listContacts();
    setContacts(list);
    if (!selectedId && list[0]) setSelectedId(list[0].id);
    if (selectedId && !list.find((c) => c.id === selectedId)) {
      setSelectedId(list[0]?.id);
    }
  }, [selectedId]);

  const refreshSelected = useCallback(async (id?: string) => {
    if (!id) {
      setMeetings([]);
      return;
    }
    const detail = await api.getContact(id);
    setMeetings(detail.meetings);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const health = await api.health();
        setProvider(health.memoryProvider);
        await refreshContacts();
      } catch {
        setError("API unreachable. Start the backend on port 8787.");
      }
    })();
  }, [refreshContacts]);

  useEffect(() => {
    refreshSelected(selectedId).catch(() =>
      setError("Failed to load contact meetings")
    );
  }, [selectedId, refreshSelected]);

  async function handleSeed() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.seedDemo();
      setStatus(result.message);
      await refreshContacts();
      setSelectedId(result.contact.id);
      setView("home");
      setPrep(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.resetDemo();
      setStatus(result.message);
      setPrep(null);
      setSelectedId(undefined);
      setMeetings([]);
      await refreshContacts();
      setView("home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  async function handlePrepare(nextMode: "memory" | "generic" = mode) {
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    setMode(nextMode);
    try {
      const result = await api.prepare(selectedId, nextMode);
      setPrep(result);
      setProvider(result.meta.memoryProvider);
      setView("prep");
      setStatus(
        nextMode === "memory"
          ? `Prepared with ${result.meta.memoryCount} recalled memories.`
          : "Prepared generic brief with memory disabled."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prepare failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { contact } = await api.createContact(newContact);
      await refreshContacts();
      setSelectedId(contact.id);
      setShowCreate(false);
      setNewContact({ name: "", company: "", role: "" });
      setStatus(`Created contact ${contact.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="fade-up mb-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9842a]">
            Hindsight Hackathon · Meeting Prep Agent
          </p>
          <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight text-[#10241f] sm:text-6xl">
            Briefed
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#2a4038]">
            Walk into every customer meeting knowing what you promised, what’s
            still open, and what they care about — because the agent remembers.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !selectedId}
              onClick={() => handlePrepare("memory")}
              className="rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6b56] disabled:opacity-50"
            >
              Prepare meeting
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleSeed}
              className="rounded-full border border-[#1f6b56]/35 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#0f4a3a] transition hover:border-[#1f6b56]"
            >
              Load Priya demo
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleReset}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#2a4038] underline-offset-4 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-[#1f6b56]/15 bg-[#10241f] p-6 text-[#f3f7f4] shadow-2xl shadow-[#10241f]/20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c9842a]/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-[#1f6b56]/40 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0d7a8]">
            Memory loop
          </p>
          <p className="font-display mt-3 text-2xl font-semibold leading-snug">
            Interaction → retain → recall → better prep
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Provider: <span className="font-semibold text-white">{provider}</span>
            {selected ? ` · Focus: ${selected.name}` : ""}
          </p>
        </div>
      </header>

      {(status || error) && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
            error
              ? "border border-[#a33b2c]/30 bg-[#a33b2c]/10 text-[#a33b2c]"
              : "border border-[#1f6b56]/20 bg-white/70 text-[#0f4a3a]"
          }`}
        >
          {error || status}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2a4038]">
              Contacts
            </h2>
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="text-xs font-semibold text-[#1f6b56]"
            >
              {showCreate ? "Cancel" : "+ New"}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateContact} className="space-y-2 rounded-2xl bg-white/70 p-3">
              {(["name", "company", "role"] as const).map((key) => (
                <input
                  key={key}
                  required
                  placeholder={key[0].toUpperCase() + key.slice(1)}
                  value={newContact[key]}
                  onChange={(e) =>
                    setNewContact((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#1f6b56]/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1f6b56]"
                />
              ))}
              <button
                type="submit"
                className="w-full rounded-full bg-[#1f6b56] py-2 text-sm font-semibold text-white"
              >
                Create
              </button>
            </form>
          )}

          <ContactList
            contacts={contacts}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setView("home");
              setPrep(null);
            }}
          />

          {selected && (
            <div className="space-y-3 rounded-2xl border border-[#1f6b56]/15 bg-white/60 p-4">
              <h3 className="text-sm font-semibold text-[#10241f]">Meetings</h3>
              <ul className="space-y-2">
                {meetings.map((meeting) => (
                  <li
                    key={meeting.id}
                    className="rounded-xl border border-[#1f6b56]/10 bg-white/80 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-[#10241f]">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-[#2a4038]">
                      {meeting.date} · {meeting.status}
                    </p>
                    {meeting.status !== "logged" && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-[#1f6b56]"
                        onClick={() => {
                          setDebriefMeeting(meeting);
                          setView("debrief");
                        }}
                      >
                        Log debrief → retain
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="min-h-[640px] rounded-[28px] border border-[#1f6b56]/12 bg-white/75 p-5 shadow-[0_20px_60px_rgba(16,36,31,0.06)] backdrop-blur sm:p-8">
          {view === "home" && selected && (
            <div className="fade-up mx-auto max-w-2xl space-y-5 py-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
                Ready when you are
              </p>
              <h2 className="font-display text-4xl font-semibold text-[#10241f]">
                Prep for {selected.name}
              </h2>
              <p className="text-[#2a4038]">
                Generate a meeting brief grounded in retained debriefs — then
                toggle memory off to see the generic alternative.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handlePrepare("memory")}
                  className="rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Prepare with memory
                </button>
                {meetings.find((m) => m.status === "upcoming") && (
                  <button
                    type="button"
                    onClick={() => {
                      const upcoming = meetings.find((m) => m.status === "upcoming");
                      if (!upcoming) return;
                      setDebriefMeeting(upcoming);
                      setView("debrief");
                    }}
                    className="rounded-full border border-[#1f6b56]/30 px-5 py-2.5 text-sm font-semibold text-[#0f4a3a]"
                  >
                    Debrief a meeting
                  </button>
                )}
              </div>
            </div>
          )}

          {view === "home" && !selected && (
            <div className="flex h-full min-h-[480px] items-center justify-center text-center">
              <div>
                <h2 className="font-display text-3xl font-semibold">
                  Start with the demo contact
                </h2>
                <p className="mt-3 text-[#2a4038]">
                  Load Priya Shah @ Acme to show Meeting 1 → 2 retain, then Meeting 3 prep.
                </p>
              </div>
            </div>
          )}

          {view === "debrief" && debriefMeeting && (
            <DebriefForm
              meeting={debriefMeeting}
              onDone={async () => {
                await refreshSelected(selectedId);
                setStatus("Debrief retained. Prepare the next meeting to see recall.");
                setView("home");
              }}
            />
          )}

          {view === "prep" && prep && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <MemoryToggle
                  mode={mode}
                  disabled={busy}
                  onChange={(next) => handlePrepare(next)}
                />
                <button
                  type="button"
                  className="text-sm font-semibold text-[#2a4038]"
                  onClick={() => setView("home")}
                >
                  ← Back
                </button>
              </div>
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
                <MeetingBriefView brief={prep.brief} mode={prep.mode} />
                <WhatIRemember
                  memories={prep.memories}
                  provider={prep.meta.memoryProvider}
                  memoryCount={prep.meta.memoryCount}
                  mode={prep.mode}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
