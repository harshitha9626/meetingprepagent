// AI-Generated Code - 2026-09-29 - Composer

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { AnimatedCount } from "./components/AnimatedCount";
import { BeforeAfterCompare } from "./components/BeforeAfterCompare";
import { CommitmentTracker } from "./components/CommitmentTracker";
import { ContactList } from "./components/ContactList";
import { DebriefForm } from "./components/DebriefForm";
import { DemoStepper } from "./components/DemoStepper";
import { DemoStoryCard } from "./components/DemoStoryCard";
import { DebugPanel } from "./components/DebugPanel";
import { MeetingBriefView } from "./components/MeetingBriefView";
import { MemoryFlowStrip } from "./components/MemoryFlowStrip";
import { MemoryToggle } from "./components/MemoryToggle";
import { MemoryUsedPanel } from "./components/MemoryUsedPanel";
import { RelationshipMemoryExplorer } from "./components/RelationshipMemoryExplorer";
import { FollowUpDraftPanel } from "./components/FollowUpDraft";
import { FollowUpReminders } from "./components/FollowUpReminders";
import { MeetingInsightsPanel } from "./components/MeetingInsights";
import { RelationshipEvolutionPanel } from "./components/RelationshipEvolution";
import { SmartRelationshipMemory } from "./components/SmartRelationshipMemory";
import { Toast, type ToastKind } from "./components/Toast";
import { UpcomingMeetings } from "./components/UpcomingMeetings";
import { VideoMeetingRoom } from "./components/VideoMeetingRoom";
import { WhatChanged } from "./components/WhatChanged";
import {
  api,
  type Commitment,
  type Contact,
  type Meeting,
  type MemoryDebugInfo,
  type PrepareResponse,
  type RelationshipMemory,
  type UpcomingMeetingRow,
} from "./lib/api";
import {
  clearSession,
  getStoredUser,
  getToken,
  type AuthUser,
} from "./lib/auth";

type View = "home" | "prep" | "debrief" | "video" | "meeting-ended";

function isRaviContact(contact?: Contact): boolean {
  return (
    !!contact &&
    contact.name === "Ravi Sharma" &&
    contact.company === "Nimbus Retail"
  );
}

function friendlyClientError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : fallback;
  if (/HINDSIGHT_API_KEY|HINDSIGHT_NOT_CONFIGURED|not configured/i.test(msg)) {
    return "Hindsight is not configured. Add HINDSIGHT_API_KEY to backend/.env and restart the API.";
  }
  if (/Failed to fetch|NetworkError|unreachable/i.test(msg)) {
    return "Cannot reach the API. Start the backend on port 8787 and check your network.";
  }
  if (/Contact not found/i.test(msg)) {
    return "That contact was not found. Load the Ravi demo or create a contact.";
  }
  return msg || fallback;
}

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    getToken() ? getStoredUser() : null
  );
  const [authChecking, setAuthChecking] = useState(() => Boolean(getToken()));
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<"memory" | "generic">("memory");
  const [prepMemory, setPrepMemory] = useState<PrepareResponse | null>(null);
  const [prepGeneric, setPrepGeneric] = useState<PrepareResponse | null>(null);
  const [debriefMeeting, setDebriefMeeting] = useState<Meeting | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hindsightOk, setHindsightOk] = useState<boolean | null>(null);
  const [bankId, setBankId] = useState("…");
  const [memoryDebug, setMemoryDebug] = useState<MemoryDebugInfo | null>(null);
  const [demoStep, setDemoStep] = useState(1);
  const [retainBanner, setRetainBanner] = useState<string | null>(null);
  const [relMemory, setRelMemory] = useState<RelationshipMemory | null>(null);
  const [relLoading, setRelLoading] = useState(false);
  const [relError, setRelError] = useState<string | null>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  // Only auto-open with ?debug — open by default in DEV covered main CTAs
  const [debugOpen, setDebugOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("debug");
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    role: "",
  });
  const [videoRoomId, setVideoRoomId] = useState<string | null>(null);
  const [videoContactName, setVideoContactName] = useState("Contact");
  const [lastCallDuration, setLastCallDuration] = useState(0);
  const [guestVideoOnly, setGuestVideoOnly] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("videoRoom");
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<
    UpcomingMeetingRow[]
  >([]);
  const [prepExtrasOpen, setPrepExtrasOpen] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    kind: ToastKind;
  } | null>(null);

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [contacts, selectedId]
  );

  const isRaviDemo = isRaviContact(selected);
  const prep = mode === "memory" ? prepMemory : prepGeneric;
  const flowActive =
    view === "video" || view === "meeting-ended"
      ? 5
      : view === "prep"
        ? 4
        : retainBanner
          ? 2
          : demoStep >= 3
            ? 2
            : 1;

  /** Guest join via ?videoRoom=&contactName= (second browser / device). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const room = params.get("videoRoom");
    if (!room) return;
    const name = params.get("contactName") || "Meeting";
    setVideoRoomId(room);
    setVideoContactName(name);
    setGuestVideoOnly(true);
    setView("video");
    setStatus(`Joining video room for ${name}…`);
  }, []);

  const refreshContacts = useCallback(async () => {
    const { contacts: list } = await api.listContacts();
    setContacts(list);
    if (!selectedId && list[0]) setSelectedId(list[0].id);
    if (selectedId && !list.find((c) => c.id === selectedId)) {
      setSelectedId(list[0]?.id);
    }
  }, [selectedId]);

  const refreshUpcoming = useCallback(async () => {
    try {
      const { meetings: list } = await api.listUpcomingMeetings();
      setUpcomingMeetings(list);
    } catch {
      setUpcomingMeetings([]);
    }
  }, []);

  const refreshSelected = useCallback(async (id?: string) => {
    if (!id) {
      setMeetings([]);
      return;
    }
    const detail = await api.getContact(id);
    setMeetings(detail.meetings);
  }, []);

  const loadCommitments = useCallback(async (id?: string) => {
    if (!id) {
      setCommitments([]);
      return;
    }
    try {
      const { commitments: list } = await api.listCommitments(id);
      setCommitments(list);
    } catch {
      setCommitments([]);
    }
  }, []);

  const loadRelationshipMemory = useCallback(
    async (id?: string, opts?: { announce?: boolean }) => {
      if (!id) {
        setRelMemory(null);
        return;
      }
      setRelLoading(true);
      setRelError(null);
      try {
        const data = await api.relationshipMemory(id);
        setRelMemory(data);
        if (opts?.announce) {
          setError(null);
          setStatus(
            `Refresh from Hindsight: ${data.memoryCount} fact(s) recalled for this contact.`
          );
        }
      } catch (err) {
        setRelMemory(null);
        const msg = friendlyClientError(
          err,
          "Could not recall relationship memory."
        );
        setRelError(msg);
        if (opts?.announce) {
          setStatus(null);
          setError(`Refresh from Hindsight failed. ${msg}`);
        }
      } finally {
        setRelLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const onExpired = () => {
      setAuthUser(null);
      setAuthChecking(false);
      setContacts([]);
      setSelectedId(undefined);
      setMeetings([]);
      setPrepMemory(null);
      setPrepGeneric(null);
      setView("home");
      setError("Session expired. Please log in again.");
    };
    window.addEventListener("briefed:auth-expired", onExpired);
    return () => window.removeEventListener("briefed:auth-expired", onExpired);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setAuthChecking(false);
      setAuthUser(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { user } = await api.me();
        if (!cancelled) {
          setAuthUser(user);
        }
      } catch {
        clearSession();
        if (!cancelled) setAuthUser(null);
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      try {
        const health = await api.health();
        setHindsightOk(health.hindsightConfigured);
        if (!health.hindsightConfigured) {
          setError(
            "Hindsight is not configured. Add HINDSIGHT_API_KEY to backend/.env and restart the API."
          );
        }
        await refreshContacts();
        await refreshUpcoming();
        try {
          const dbg = await api.debugMemory();
          setBankId(dbg.hindsight.bankId);
        } catch {
          setBankId(health.bankId);
        }
      } catch {
        setError("API unreachable. Start the backend on port 8787.");
      }
    })();
  }, [authUser, refreshContacts, refreshUpcoming]);

  useEffect(() => {
    if (!authUser) return;
    refreshSelected(selectedId).catch(() =>
      setError("Failed to load contact meetings")
    );
    loadCommitments(selectedId).catch(() => undefined);
    if (selectedId) {
      loadRelationshipMemory(selectedId).catch(() => undefined);
    }
  }, [
    authUser,
    selectedId,
    refreshSelected,
    loadCommitments,
    loadRelationshipMemory,
  ]);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      /* still clear local session */
    }
    clearSession();
    setAuthUser(null);
    setContacts([]);
    setSelectedId(undefined);
    setMeetings([]);
    setPrepMemory(null);
    setPrepGeneric(null);
    setRelMemory(null);
    setCommitments([]);
    setUpcomingMeetings([]);
    setView("home");
    setStatus(null);
    setError(null);
    setToast({ message: "Logged out", kind: "info" });
  }

  async function handleSeed() {
    setBusy(true);
    setError(null);
    setStatus(null);
    setDemoStep(2);
    setProgress(
      hindsightOk === false
        ? "Loading Ravi demo data…"
        : "Retaining Ravi’s 3 meetings into Hindsight…"
    );
    setRetainBanner(null);
    try {
      const result = await api.seedDemo();
      const count = result.retained?.length ?? result.debug?.retainCount ?? 0;
      setStatus(result.message);
      setToast({
        message: result.hindsightError
          ? "Ravi demo loaded locally · Hindsight retain incomplete"
          : "Ravi demo loaded · memories retained in Hindsight",
        kind: result.hindsightError ? "info" : "success",
      });
      await refreshContacts();
      await refreshUpcoming();
      setSelectedId(result.contact.id);
      if (result.meetings) {
        setMeetings(result.meetings);
      } else {
        await refreshSelected(result.contact.id);
      }
      setDemoStep(3);
      setView("home");
      setPrepMemory(null);
      setPrepGeneric(null);

      if (result.debug) {
        setMemoryDebug({
          bankId: result.debug.bankId,
          contactId: result.debug.contactId,
          contactName: result.contact.name,
          retain: {
            status: result.hindsightError ? "error" : "ok",
            documentIds: result.debug.documentIds,
            error: result.hindsightError,
            at: new Date().toISOString(),
          },
        });
      }

      if (result.hindsightError) {
        setRetainBanner(null);
        setError(friendlyClientError(result.hindsightError, result.hindsightError));
        setHindsightOk(result.hindsightConfigured ?? false);
        setDemoStep(4);
        // Relationship recall will fail without Hindsight — surface that in the explorer
        await loadRelationshipMemory(result.contact.id);
        await loadCommitments(result.contact.id);
        setDemoStep(4);
      } else {
        setRetainBanner(
          `Hindsight remembered this relationship — ${count} interactions retained for Ravi Sharma.`
        );
        setHindsightOk(true);
        await loadRelationshipMemory(result.contact.id);
        await loadCommitments(result.contact.id);
        setDemoStep(4);
      }
    } catch (err) {
      setError(friendlyClientError(err, "Demo seed failed"));
      setDemoStep(1);
      // Seed may have written SQLite before failing — refresh so UI is not stuck empty
      try {
        await refreshContacts();
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function handleReset() {
    setBusy(true);
    setError(null);
    setProgress("Clearing local demo data…");
    try {
      const result = await api.resetDemo();
      setStatus(result.message);
      setPrepMemory(null);
      setPrepGeneric(null);
      setSelectedId(undefined);
      setMeetings([]);
      setRelMemory(null);
      setRetainBanner(null);
      setDemoStep(1);
      await refreshContacts();
      setView("home");
    } catch (err) {
      setError(friendlyClientError(err, "Reset failed"));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  function openInteractionForm(meeting: Meeting) {
    setDebugOpen(false);
    setError(null);
    setStatus(`Post-Meeting Debrief — “${meeting.title}”.`);
    setProgress(null);
    setDebriefMeeting(meeting);
    setView("debrief");
    setDemoStep(2);
  }

  function startVideoMeeting() {
    if (!selectedId || !selected) {
      setError("Select a contact before starting a video meeting.");
      return;
    }
    setDebugOpen(false);
    setError(null);
    setGuestVideoOnly(false);
    setVideoRoomId(`briefed-${selectedId}`);
    setVideoContactName(selected.name);
    setView("video");
    setStatus(
      prepMemory || prepGeneric
        ? `Video meeting with ${selected.name} — grant camera/mic when prompted.`
        : `Video meeting with ${selected.name}. Tip: Prepare My Meeting first for a personalized brief.`
    );
    setDemoStep(5);
  }

  function handleVideoEnded(info: {
    durationSeconds: number;
    wasConnected: boolean;
  }) {
    setLastCallDuration(info.durationSeconds);
    setVideoRoomId(null);
    if (guestVideoOnly) {
      setGuestVideoOnly(false);
      setView("home");
      setStatus("Meeting ended. Guest session closed — host can add a debrief.");
      // Clear join query so refresh doesn't re-enter the room
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("videoRoom");
        url.searchParams.delete("contactName");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
      return;
    }
    setView("meeting-ended");
    setStatus(
      info.wasConnected
        ? "Meeting ended. Add a Post-Meeting Debrief to retain what mattered."
        : "Meeting ended (no remote peer connected). You can still add a debrief."
    );
  }

  /** Open debrief for upcoming meeting, or create one for today. */
  async function openPostMeetingDebrief() {
    if (!selectedId || !selected) {
      setError("Select a contact before opening Post-Meeting Debrief.");
      return;
    }
    setDebugOpen(false);
    setError(null);
    let upcoming = meetings.find((m) => m.status === "upcoming");
    if (!upcoming) {
      setBusy(true);
      setProgress("Creating meeting for debrief…");
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { meeting } = await api.createMeeting(selectedId, {
          title: `Meeting with ${selected.name}`,
          date: today,
          status: "upcoming",
        });
        upcoming = meeting;
        await refreshSelected(selectedId);
      } catch (err) {
        setError(friendlyClientError(err, "Could not create meeting for debrief"));
        setBusy(false);
        setProgress(null);
        return;
      } finally {
        setBusy(false);
        setProgress(null);
      }
    }
    openInteractionForm(upcoming);
  }

  async function handlePrepare(nextMode: "memory" | "generic" = "memory") {
    if (!selectedId) {
      setError("Select a contact before preparing a meeting.");
      setStatus(null);
      return;
    }
    setDebugOpen(false);
    setBusy(true);
    setError(null);
    setStatus(null);
    setRetainBanner(null);
    setMode(nextMode);
    setDemoStep(5);
    const contactLabel =
      contacts.find((c) => c.id === selectedId)?.name ?? selectedId;

    /** Visual stages only — advances while the real prepare request is in flight. */
    const recallStages =
      nextMode === "memory"
        ? [
            "Connecting to relationship memory…",
            "Recalling relevant interactions…",
            "Understanding what changed…",
            "Preparing your meeting brief…",
          ]
        : ["Preparing your meeting…", "Building generic agenda…"];
    let stageIdx = 0;
    setProgress(recallStages[0]);
    const stageTimer = window.setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, recallStages.length - 1);
      setProgress(recallStages[stageIdx]);
    }, 1400);

    try {
      if (nextMode === "memory") {
        const withMem = await api.prepare(selectedId, "memory");
        setPrepMemory(withMem);
        setMemoryDebug(withMem.debug);
        setProgress("Building before/after comparison…");
        const without = await api.prepare(selectedId, "generic");
        setPrepGeneric(without);
        setView("prep");
        setError(null);
        if (withMem.meta.memoryCount === 0) {
          setStatus(
            "No relevant memories were recalled. Retain interactions first, then try again."
          );
        } else if (withMem.debug.llm?.status === "error") {
          setStatus(
            `Recalled ${withMem.meta.memoryCount} memories; brief used fallback composition (LLM error).`
          );
          setToast({
            message: `Meeting brief ready · ${withMem.meta.memoryCount} memories recalled`,
            kind: "info",
          });
        } else {
          setStatus(
            `Prepared with ${withMem.meta.memoryCount} memories recalled from Hindsight.`
          );
          setToast({
            message: `Meeting brief generated · ${withMem.meta.memoryCount} memories recalled from Hindsight`,
            kind: "success",
          });
        }
      } else {
        const without = await api.prepare(selectedId, "generic");
        setPrepGeneric(without);
        setMemoryDebug(without.debug);
        setView("prep");
        setStatus("Showing generic brief without Hindsight recall.");
      }
    } catch (err) {
      const message = friendlyClientError(err, "Prepare failed");
      setError(`Prepare My Meeting failed. ${message}`);
      setStatus(null);
      setToast({
        message: "Something went wrong. Please try again.",
        kind: "error",
      });
      setDemoStep(4);
      setView("home");
      setMemoryDebug((prev) => ({
        bankId: prev?.bankId ?? bankId,
        contactId: selectedId,
        contactName: contactLabel,
        retain: prev?.retain,
        recall: {
          status: "error",
          queryCount: 0,
          memoryCount: 0,
          error: message,
          at: new Date().toISOString(),
        },
        llm: { status: "skipped" },
      }));
      if (/not configured|HINDSIGHT_API_KEY/i.test(message)) {
        setHindsightOk(false);
      }
    } finally {
      window.clearInterval(stageTimer);
      setBusy(false);
      setProgress(null);
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
      setDemoStep(2);
    } catch (err) {
      setError(friendlyClientError(err, "Create failed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDebriefDone(info: {
    saved: boolean;
    retained: boolean;
    createNext?: boolean;
    stayHome?: boolean;
  }) {
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    if (info.saved && info.retained) {
      setRetainBanner("Hindsight remembered this interaction.");
      setStatus("Meeting debrief saved and remembered.");
      setToast({
        message: "Meeting debrief saved · Relationship memory updated",
        kind: "success",
      });
    } else if (info.saved) {
      setRetainBanner(null);
      setStatus(
        "Debrief saved, but Hindsight could not remember this interaction."
      );
      setToast({
        message: "Debrief saved · Hindsight could not retain this interaction",
        kind: "error",
      });
    }
    try {
      await refreshSelected(selectedId);
      await loadCommitments(selectedId);
      await refreshUpcoming();
      try {
        const dbg = await api.debugMemory();
        setMemoryDebug(dbg.debug);
      } catch {
        /* optional */
      }
      await loadRelationshipMemory(selectedId);

      if (info.stayHome) {
        setView("home");
        setDebriefMeeting(null);
        setDemoStep(info.retained ? 4 : 3);
        return;
      }

      setProgress(
        info.createNext
          ? "Creating next meeting, then recalling relationship memory…"
          : info.retained
            ? "Remembering complete. Preparing meeting…"
            : "Preparing meeting with local history…"
      );
      if (info.createNext) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        const iso = nextDate.toISOString().slice(0, 10);
        await api.createMeeting(selectedId, {
          title: `Follow-up with ${selected?.name ?? "contact"}`,
          date: iso,
          status: "upcoming",
        });
        await refreshSelected(selectedId);
      }
      setDemoStep(4);
      setPrepGeneric(null);
      setDebriefMeeting(null);
      await handlePrepare("memory");
    } catch (err) {
      setError(friendlyClientError(err, "Post-debrief flow failed"));
      setView("home");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#2a4038]">
        Checking session…
      </div>
    );
  }

  if (!authUser && !guestVideoOnly) {
    return (
      <>
        <AuthScreen
          onAuthenticated={(user) => {
            setAuthUser(user);
            setError(null);
            setToast({
              message: `Welcome, ${user.name}`,
              kind: "success",
            });
          }}
        />
        {toast && (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onDone={() => setToast(null)}
          />
        )}
      </>
    );
  }

  if (guestVideoOnly) {
    if (!videoRoomId) {
      return (
        <div className="flex min-h-screen items-center justify-center text-sm text-[#2a4038]">
          Joining video room…
        </div>
      );
    }
    return (
      <div className="mx-auto min-h-screen max-w-5xl px-4 py-8">
        <VideoMeetingRoom
          contactName={videoContactName}
          roomId={videoRoomId}
          localDisplayName="Guest"
          onEnd={handleVideoEnded}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="fade-up mb-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-2xl border border-[#1f6b56]/15 bg-white/60 px-3 py-2 text-left">
              <p className="text-sm font-semibold text-[#10241f]">
                {authUser!.name}
              </p>
              <p className="text-xs text-[#2a4038]">{authUser!.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="btn-ghost-interactive rounded-full border border-[#1f6b56]/20 px-3 py-1.5 text-xs font-semibold text-[#2a4038]"
            >
              Logout
            </button>
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-[#10241f] sm:text-6xl">
            BRIEFED
          </h1>
          <p className="mt-3 text-lg font-semibold leading-snug text-[#0f4a3a] sm:text-xl">
            Prepare for conversations with the context that matters.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#2a4038] sm:text-lg">
            Remembers what you discussed, what was promised, what was left
            unresolved, and how each contact prefers to communicate — so you can
            walk into every meeting prepared.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !selectedId}
              onClick={() => handlePrepare("memory")}
              title={
                !selectedId
                  ? "Select a contact or start the Ravi demo first"
                  : hindsightOk === false
                    ? "Calls prepare; will show a clear Hindsight configuration error if the key is missing"
                    : undefined
              }
              className="btn-magic min-w-cta rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <span className="inline-flex items-center justify-center">
                {busy && progress ? (
                  <>
                    <span className="btn-spinner" aria-hidden />
                    Preparing…
                  </>
                ) : (
                  "Prepare Meeting"
                )}
              </span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleSeed}
              title={
                hindsightOk === false
                  ? "Loads Ravi demo data locally, then explains that Hindsight must be configured"
                  : undefined
              }
              className="btn-interactive rounded-full border border-[#1f6b56]/35 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#0f4a3a]"
            >
              {busy && progress?.includes("Ravi") ? (
                <span className="inline-flex items-center">
                  <span className="btn-spinner" aria-hidden />
                  Starting demo…
                </span>
              ) : (
                "Start Ravi demo"
              )}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleReset}
              className="btn-ghost-interactive rounded-full px-4 py-2.5 text-sm font-semibold text-[#2a4038] underline-offset-4 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <DemoStepper current={demoStep} />
          <div className="relative overflow-hidden rounded-[24px] border border-[#1f6b56]/15 bg-[#10241f] p-5 text-[#f3f7f4]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0d7a8]">
              Hindsight
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm leading-relaxed text-white/85">
              {busy && progress ? (
                <>
                  <span className="status-dot is-busy" aria-hidden />
                  <span className="font-medium text-[#f0d7a8]">
                    Recalling memories…
                  </span>
                </>
              ) : view === "prep" &&
                prepMemory &&
                prepMemory.meta.memoryCount > 0 ? (
                <>
                  <span className="font-medium text-[#8fd4b8]">✓ Memory recalled</span>
                </>
              ) : hindsightOk === false ? (
                <>
                  <span className="status-dot is-err" aria-hidden />
                  <span className="text-[#f0a090]">Hindsight not configured</span>
                </>
              ) : hindsightOk ? (
                <>
                  <span className="status-dot is-ok" aria-hidden />
                  <span className="text-[#8fd4b8]">Hindsight Connected</span>
                </>
              ) : (
                <>
                  <span className="status-dot is-idle" aria-hidden />
                  <span className="text-white/60">Checking connection…</span>
                </>
              )}
            </p>
            <p className="mt-1.5 text-xs text-white/55">
              Bank <span className="font-medium text-white/80">{bankId}</span>
              {selected ? ` · ${selected.name}` : ""}
            </p>
            {(prepMemory?.meta.memoryCount != null ||
              memoryDebug?.recall?.memoryCount != null) &&
              !busy && (
                <p className="mt-2 text-xs text-white/70">
                  <AnimatedCount
                    value={
                      prepMemory?.meta.memoryCount ??
                      memoryDebug?.recall?.memoryCount ??
                      0
                    }
                    className="font-semibold text-white"
                  />{" "}
                  memories recalled from Hindsight
                </p>
              )}
            {progress && (
              <p className="mt-3 text-sm font-medium text-[#f0d7a8]">{progress}</p>
            )}
          </div>
        </div>
      </header>

      <div className="mb-6">
        <MemoryFlowStrip activeIndex={flowActive} />
      </div>

      {(status || error || progress || retainBanner) && (
        <div className="mb-6 space-y-2">
          {retainBanner && (
            <div className="rounded-2xl border border-[#c9842a]/35 bg-[#f0d7a8]/35 px-4 py-3 text-sm font-medium text-[#10241f]">
              {retainBanner}
            </div>
          )}
          {status && !error && !progress && (
            <div className="rounded-2xl border border-[#1f6b56]/20 bg-white/70 px-4 py-3 text-sm text-[#0f4a3a]">
              {status}
            </div>
          )}
          {progress && (
            <div className="view-enter rounded-2xl border border-[#1f6b56]/20 bg-white/70 px-4 py-3 text-sm text-[#0f4a3a]">
              <span className="recall-progress">
                <span className="inline-flex gap-1 text-[#1f6b56]">
                  <span className="pulse-dot" />
                  <span className="pulse-dot" />
                  <span className="pulse-dot" />
                </span>
                {progress}
              </span>
            </div>
          )}
          {error && (
            <div className="view-enter rounded-2xl border border-[#a33b2c]/30 bg-[#a33b2c]/10 px-4 py-3 text-sm text-[#a33b2c]">
              {status ? (
                <>
                  <span className="block font-medium text-[#0f4a3a]">{status}</span>
                  <span className="mt-1 block">{error}</span>
                </>
              ) : (
                error
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2a4038]">
              Contacts
            </h2>
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="btn-ghost-interactive text-xs font-semibold text-[#1f6b56]"
            >
              {showCreate ? "Cancel" : "+ New"}
            </button>
          </div>

          {showCreate && (
            <form
              onSubmit={handleCreateContact}
              className="view-enter space-y-2 rounded-2xl bg-white/70 p-3"
            >
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
                className="btn-interactive w-full rounded-full bg-[#1f6b56] py-2 text-sm font-semibold text-white"
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
              setPrepMemory(null);
              setPrepGeneric(null);
              loadRelationshipMemory(id);
              loadCommitments(id);
            }}
          />

          {selected && (
            <div className="space-y-3 rounded-2xl border border-[#1f6b56]/15 bg-white/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#10241f]">
                  Relationship timeline
                </h3>
                {isRaviDemo && (
                  <span className="rounded-full bg-[#f0d7a8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#10241f]">
                    Demo Data
                  </span>
                )}
              </div>
              {meetings.length === 0 ? (
                <div className="empty-state">
                  No meeting history yet. Complete your first meeting debrief to
                  start building relationship memory.
                </div>
              ) : (
                <ul className="timeline-rail stagger-in space-y-2 pl-4">
                  {meetings.map((meeting) => (
                    <li
                      key={meeting.id}
                      className="timeline-item card-interactive relative rounded-xl border border-[#1f6b56]/10 bg-white/80 px-3 py-2"
                    >
                      <span className="timeline-node absolute -left-4 top-3 h-2 w-2 rounded-full bg-[#1f6b56]" />
                      <p className="text-sm font-medium text-[#10241f]">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-[#2a4038]">
                        {meeting.date} · {meeting.status}
                        {meeting.hindsightDocumentId ? " · retained" : ""}
                      </p>
                      {meeting.status !== "logged" && (
                        <button
                          type="button"
                          className="btn-ghost-interactive mt-2 text-xs font-semibold text-[#1f6b56]"
                          onClick={() => openInteractionForm(meeting)}
                        >
                          Post-Meeting Debrief
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {commitments.length > 0 && (
                <div className="border-t border-[#1f6b56]/10 pt-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#2a4038]">
                    Commitment timeline
                  </p>
                  <ul className="stagger-in space-y-2">
                    {commitments.slice(0, 6).map((c) => (
                      <li
                        key={c.id}
                        className={`commitment-card rounded-xl border border-[#1f6b56]/10 bg-white/80 px-3 py-2 text-xs text-[#10241f] ${
                          c.status === "completed"
                            ? "is-completed"
                            : c.status === "overdue"
                              ? "is-overdue"
                              : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">
                            {c.description.slice(0, 80)}
                            {c.description.length > 80 ? "…" : ""}
                          </p>
                          <span
                            className={`status-pill shrink-0 ${
                              c.status === "completed"
                                ? "is-done commitment-check"
                                : c.status === "overdue"
                                  ? "is-overdue"
                                  : "is-open"
                            }`}
                          >
                            {c.status === "completed"
                              ? "✓ Done"
                              : c.status === "overdue"
                                ? "Overdue"
                                : "Open"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#2a4038]">
                          {c.meetingTitle
                            ? `${c.meetingDate} · ${c.meetingTitle}`
                            : new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {selected && (
            <CommitmentTracker
              contactId={selected.id}
              contactName={selected.name}
              meetings={meetings}
              commitments={commitments}
              onChanged={() => {
                void loadCommitments(selected.id);
                setToast({
                  message: "Commitment updated",
                  kind: "success",
                });
              }}
            />
          )}

          {selected && (
            <RelationshipMemoryExplorer
              data={relMemory}
              loading={relLoading}
              error={relError}
              onRefresh={async () => {
                setProgress("Recalling memories…");
                try {
                  await loadRelationshipMemory(selectedId, { announce: true });
                } finally {
                  setProgress(null);
                }
              }}
            />
          )}
        </aside>

        <main className="relative min-h-[560px] min-w-0 overflow-x-hidden rounded-[28px] border border-[#1f6b56]/12 bg-white/75 p-5 shadow-[0_20px_60px_rgba(16,36,31,0.06)] backdrop-blur sm:min-h-[640px] sm:p-8">
          {busy && progress && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-[#f3f7f4]/82 backdrop-blur-[2px]">
              <div className="loading-stage toast-enter rounded-2xl border border-[#1f6b56]/20 bg-white px-6 py-5 text-center shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
                  Prepare Meeting
                </p>
                <p className="recall-progress mt-3 justify-center font-medium text-[#10241f]">
                  <span className="inline-flex gap-1 text-[#1f6b56]">
                    <span className="pulse-dot" />
                    <span className="pulse-dot" />
                    <span className="pulse-dot" />
                  </span>
                  {progress}
                </p>
                <p className="mt-2 text-xs text-[#2a4038]">
                  Waiting on Hindsight — results are not simulated.
                </p>
              </div>
            </div>
          )}

          {view === "home" && selected && (
            <div className="view-enter mx-auto max-w-2xl space-y-5 py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
                {isRaviDemo ? "Selected · Ravi demo" : "Selected contact"}
              </p>
              <h2 className="font-display text-3xl font-semibold text-[#10241f] sm:text-4xl">
                Prep for {selected.name}
              </h2>
              {isRaviDemo && <DemoStoryCard />}
              <p className="text-[#2a4038]">
                {meetings.filter((m) => m.status === "logged").length} logged
                interaction(s). Select a contact, prepare the meeting, recall
                relationship memory, then review your personalized brief.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handlePrepare("memory")}
                  title={
                    hindsightOk === false
                      ? "Calls prepare; will show a clear Hindsight configuration error if the key is missing"
                      : undefined
                  }
                  className="btn-magic min-w-cta rounded-full bg-[#0f4a3a] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <span className="inline-flex items-center justify-center">
                    {busy && progress ? (
                      <>
                        <span className="btn-spinner" aria-hidden />
                        Preparing…
                      </>
                    ) : (
                      "Prepare Meeting"
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={busy || !selectedId}
                  onClick={() => openPostMeetingDebrief()}
                  className="btn-interactive rounded-full border border-[#1f6b56]/30 px-5 py-2.5 text-sm font-semibold text-[#0f4a3a]"
                >
                  Post-Meeting Debrief
                </button>
                <button
                  type="button"
                  disabled={busy || !selectedId}
                  onClick={startVideoMeeting}
                  className="btn-interactive rounded-full bg-[#1f6b56] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                  title="Start a real WebRTC video call"
                >
                  Start Video Meeting
                </button>
              </div>

              <div className="mx-auto max-w-xl space-y-4 pt-4 text-left">
                <UpcomingMeetings
                  meetings={upcomingMeetings}
                  busy={busy}
                  onPrepare={(contactId) => {
                    setSelectedId(contactId);
                    void handlePrepare("memory");
                  }}
                />
                <FollowUpReminders
                  commitments={commitments}
                  contactName={selected.name}
                />
              </div>
            </div>
          )}

          {view === "home" && !selected && (
            <div className="view-enter flex h-full min-h-[420px] items-center justify-center px-2 text-center sm:min-h-[480px]">
              <div className="max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
                  Get started
                </p>
                <h2 className="font-display mt-2 text-3xl font-semibold text-[#10241f]">
                  Select a contact to prepare
                </h2>
                <p className="mt-3 text-[#2a4038]">
                  Click <strong>Start Ravi demo</strong> to create Ravi Sharma,
                  retain three meetings in Hindsight, then run{" "}
                  <strong>Prepare Meeting</strong>.
                </p>
              </div>
            </div>
          )}

          {view === "debrief" && debriefMeeting && selectedId && (
            <div className="view-enter space-y-6">
              <DebriefForm
                meeting={debriefMeeting}
                onDone={handleDebriefDone}
                onCancel={() => {
                  setView("home");
                  setDebriefMeeting(null);
                  setStatus(null);
                  setError(null);
                }}
              />
              <FollowUpDraftPanel
                contactId={selectedId}
                contactName={selected?.name ?? "Contact"}
                meetingId={debriefMeeting.id}
              />
            </div>
          )}

          {view === "prep" && prep && (
            <div className="view-enter space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#2a4038]">
                    Before vs after memory
                  </p>
                  <MemoryToggle
                    mode={mode}
                    disabled={busy}
                    onChange={(next) => {
                      setMode(next);
                      if (next === "memory" && !prepMemory) {
                        handlePrepare("memory");
                      } else if (next === "generic" && !prepGeneric) {
                        handlePrepare("generic");
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={startVideoMeeting}
                    className="btn-interactive rounded-xl bg-[#1f6b56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                    title="Start a real WebRTC video call with this contact"
                  >
                    Start Video Meeting
                  </button>
                  <button
                    type="button"
                    className="btn-ghost-interactive text-sm font-semibold text-[#2a4038]"
                    onClick={() => setView("home")}
                  >
                    ← Back
                  </button>
                </div>
              </div>

              <BeforeAfterCompare
                withMemory={prepMemory}
                withoutMemory={prepGeneric}
                activeMode={mode}
              />

              <SmartRelationshipMemory
                memories={prep.memories}
                mode={prep.mode}
              />

              <WhatChanged
                items={prep.whatChanged ?? []}
                mode={prep.mode}
              />

              <RelationshipEvolutionPanel evolution={prep.evolution} />

              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
                <MeetingBriefView
                  brief={prep.brief}
                  mode={prep.mode}
                  openCommitments={prep.openCommitments ?? []}
                />
                <div className="space-y-4">
                  <MemoryUsedPanel
                    memories={prep.memories}
                    memoryCount={prep.meta.memoryCount}
                    mode={prep.mode}
                  />
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#1f6b56]"
                    onClick={() => setPrepExtrasOpen((v) => !v)}
                  >
                    {prepExtrasOpen
                      ? "Hide insights, follow-up & reminders"
                      : "Show insights, follow-up & reminders"}
                  </button>
                  {prepExtrasOpen && (
                    <>
                      <MeetingInsightsPanel insights={prep.insights} />
                      <FollowUpReminders
                        commitments={commitments}
                        contactName={prep.meta.contactName}
                      />
                      {selectedId && (
                        <FollowUpDraftPanel
                          contactId={selectedId}
                          contactName={prep.meta.contactName}
                          meetingId={
                            [...meetings]
                              .filter((m) => m.status === "logged")
                              .sort((a, b) => b.date.localeCompare(a.date))[0]
                              ?.id ?? null
                          }
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1f6b56]/20 bg-[#f3f7f4]/80 p-4">
                <div>
                  <p className="text-sm font-semibold text-[#10241f]">
                    Ready for the call?
                  </p>
                  <p className="text-xs text-[#2a4038]">
                    Start a real WebRTC meeting. Camera/mic are requested only
                    when you click Start. After you end, debrief into Hindsight.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={startVideoMeeting}
                  className="btn-magic rounded-xl bg-[#1f6b56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  <span>Start Video Meeting</span>
                </button>
              </div>
            </div>
          )}

          {view === "video" && videoRoomId && (
            <div className="view-enter">
              <VideoMeetingRoom
                contactName={videoContactName}
                roomId={videoRoomId}
                localDisplayName={guestVideoOnly ? "Guest" : "Maya"}
                onEnd={handleVideoEnded}
              />
            </div>
          )}

          {view === "meeting-ended" && (
            <section className="view-enter mx-auto max-w-xl space-y-5 rounded-2xl border border-[#1f6b56]/15 bg-white/80 p-6 text-center shadow-[0_16px_40px_rgba(16,36,31,0.06)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
                Call complete
              </p>
              <h2 className="font-display text-3xl font-semibold text-[#10241f]">
                Meeting ended
              </h2>
              <p className="text-sm text-[#2a4038]">
                {videoContactName}
                {lastCallDuration > 0
                  ? ` · ${Math.floor(lastCallDuration / 60)}m ${lastCallDuration % 60}s`
                  : ""}
              </p>
              <p className="text-sm leading-relaxed text-[#10241f]">
                Capture what was discussed, decided, and promised. Saving the
                debrief runs Hindsight <strong>RETAIN</strong> — no video or audio
                is stored.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void openPostMeetingDebrief()}
                  className="btn-interactive rounded-xl bg-[#1f6b56] px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  Add Post-Meeting Debrief
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView(prepMemory || prepGeneric ? "prep" : "home");
                    setStatus(null);
                  }}
                  className="btn-interactive rounded-xl border border-[#1f6b56]/25 bg-white px-5 py-3 text-sm font-semibold text-[#10241f]"
                >
                  {prepMemory || prepGeneric ? "Back to brief" : "Back home"}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      <DebugPanel
        debug={memoryDebug}
        open={debugOpen}
        onToggle={() => setDebugOpen((v) => !v)}
      />

      {toast && (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
