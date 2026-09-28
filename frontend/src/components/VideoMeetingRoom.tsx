// AI-Generated Code - 2026-09-28 - Composer

import { useEffect, useRef, useState } from "react";
import {
  createSignalingSocket,
  newPeerId,
  sendJoin,
  sendLeave,
  sendSignal,
  type ServerSignalMessage,
  type SignalPayload,
} from "../lib/videoSignaling";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export type CallStatus =
  | "connecting"
  | "waiting"
  | "negotiating"
  | "connected"
  | "camera-unavailable"
  | "microphone-unavailable"
  | "ended"
  | "error";

function statusLabel(status: CallStatus): string {
  switch (status) {
    case "connecting":
      return "Connecting…";
    case "waiting":
      return "Waiting for participant…";
    case "negotiating":
      return "Connecting…";
    case "connected":
      return "Connected";
    case "camera-unavailable":
      return "Camera unavailable";
    case "microphone-unavailable":
      return "Microphone unavailable";
    case "ended":
      return "Meeting ended";
    case "error":
      return "Connection error";
    default:
      return status;
  }
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function VideoMeetingRoom({
  contactName,
  roomId,
  localDisplayName = "You",
  onEnd,
}: {
  contactName: string;
  roomId: string;
  localDisplayName?: string;
  onEnd: (info: { durationSeconds: number; wasConnected: boolean }) => void;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerIdRef = useRef(newPeerId());
  const remotePeerIdRef = useRef<string | null>(null);
  const makingOfferRef = useRef(false);
  const politeRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const wasConnectedRef = useRef(false);
  const endedRef = useRef(false);

  const [status, setStatus] = useState<CallStatus>("connecting");
  const [mediaIssue, setMediaIssue] = useState<
    "camera-unavailable" | "microphone-unavailable" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [remoteName, setRemoteName] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    setJoinUrl(
      `${window.location.origin}/?videoRoom=${encodeURIComponent(roomId)}&contactName=${encodeURIComponent(contactName)}`
    );
  }, [roomId, contactName]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function attachLocalPreview(stream: MediaStream) {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
        } catch {
          /* autoplay may need mute — local is muted */
        }
      }
    }

    async function getMedia(): Promise<MediaStream | null> {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaIssue("camera-unavailable");
        setStatus("error");
        setError("This browser does not support camera/microphone access.");
        return null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return null;
        }
        await attachLocalPreview(stream);
        return stream;
      } catch (err) {
        const name = err instanceof Error ? err.name : "";
        // Retry audio-only if camera failed
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          if (cancelled) {
            audioOnly.getTracks().forEach((t) => t.stop());
            return null;
          }
          await attachLocalPreview(audioOnly);
          setCamOn(false);
          setMediaIssue("camera-unavailable");
          setError(
            name === "NotAllowedError"
              ? "Camera permission denied. Microphone is available."
              : "Camera unavailable. Microphone is available."
          );
          return audioOnly;
        } catch (audioErr) {
          const aName = audioErr instanceof Error ? audioErr.name : "";
          setMediaIssue("microphone-unavailable");
          setStatus("microphone-unavailable");
          if (aName === "NotAllowedError" || name === "NotAllowedError") {
            setError(
              "Microphone permission denied. Allow mic/camera to join the call."
            );
          } else {
            setError("Camera and microphone are unavailable on this device.");
          }
          return null;
        }
      }
    }

    function ensurePeerConnection(stream: MediaStream | null) {
      if (pcRef.current) return pcRef.current;
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      if (stream) {
        for (const track of stream.getTracks()) {
          pc.addTrack(track, stream);
        }
      }

      pc.onicecandidate = (ev) => {
        const ws = wsRef.current;
        const remoteId = remotePeerIdRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN || !remoteId) return;
        sendSignal(ws, roomId, remoteId, {
          kind: "ice",
          candidate: ev.candidate ? ev.candidate.toJSON() : null,
        });
      };

      pc.ontrack = (ev) => {
        const [remoteStream] = ev.streams;
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          void remoteVideoRef.current.play().catch(() => undefined);
        }
        wasConnectedRef.current = true;
        setStatus("connected");
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") {
          wasConnectedRef.current = true;
          setStatus("connected");
        } else if (state === "failed") {
          setStatus("error");
          setError("WebRTC connection failed. Check network / firewall.");
        } else if (state === "disconnected") {
          if (!endedRef.current) setStatus("waiting");
        }
      };

      return pc;
    }

    async function createAndSendOffer(targetPeerId: string) {
      const pc = pcRef.current;
      const ws = wsRef.current;
      if (!pc || !ws || ws.readyState !== WebSocket.OPEN) return;
      try {
        makingOfferRef.current = true;
        setStatus("negotiating");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(ws, roomId, targetPeerId, {
          kind: "offer",
          sdp: pc.localDescription!,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create offer");
        setStatus("error");
      } finally {
        makingOfferRef.current = false;
      }
    }

    async function handleSignal(
      fromPeerId: string,
      fromDisplayName: string,
      payload: SignalPayload
    ) {
      remotePeerIdRef.current = fromPeerId;
      setRemoteName(fromDisplayName);
      const stream = localStreamRef.current;
      const pc = ensurePeerConnection(stream);
      const ws = wsRef.current;
      if (!ws) return;

      try {
        if (payload.kind === "offer") {
          const offerCollision =
            makingOfferRef.current || pc.signalingState !== "stable";
          if (offerCollision && !politeRef.current) {
            return;
          }
          setStatus("negotiating");
          await pc.setRemoteDescription(payload.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(ws, roomId, fromPeerId, {
            kind: "answer",
            sdp: pc.localDescription!,
          });
        } else if (payload.kind === "answer") {
          await pc.setRemoteDescription(payload.sdp);
        } else if (payload.kind === "ice") {
          if (payload.candidate) {
            try {
              await pc.addIceCandidate(payload.candidate);
            } catch {
              /* ignore late candidates */
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Signaling failed");
        setStatus("error");
      }
    }

    async function start() {
      const stream = await getMedia();
      if (cancelled) return;

      ensurePeerConnection(stream);

      const ws = createSignalingSocket(
        roomId,
        (msg: ServerSignalMessage) => {
          if (cancelled) return;
          if (msg.type === "ready") {
            sendJoin(ws, roomId, peerIdRef.current, localDisplayName);
            return;
          }
          if (msg.type === "joined") {
            if (msg.peers.length === 0) {
              setStatus("waiting");
              return;
            }
            const other = msg.peers[0];
            remotePeerIdRef.current = other.peerId;
            setRemoteName(other.displayName);
            // Existing peer is polite; new joiner (us) is impolite and creates offer
            politeRef.current = false;
            void createAndSendOffer(other.peerId);
            return;
          }
          if (msg.type === "peer-joined") {
            remotePeerIdRef.current = msg.peerId;
            setRemoteName(msg.displayName);
            // We were waiting; new peer joins — they will send offer. We are polite.
            politeRef.current = true;
            setStatus("negotiating");
            return;
          }
          if (msg.type === "peer-left") {
            remotePeerIdRef.current = null;
            setRemoteName(null);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
            // Reset PC for next peer
            if (pcRef.current) {
              pcRef.current.close();
              pcRef.current = null;
            }
            ensurePeerConnection(localStreamRef.current);
            if (!endedRef.current) {
              setStatus("waiting");
            }
            return;
          }
          if (msg.type === "signal") {
            void handleSignal(
              msg.fromPeerId,
              msg.fromDisplayName,
              msg.payload
            );
            return;
          }
          if (msg.type === "error") {
            setError(msg.message);
            setStatus("error");
          }
        },
        () => {
          if (!endedRef.current && !cancelled) {
            setError("Signaling connection closed.");
            setStatus("error");
          }
        },
        () => {
          if (!endedRef.current && !cancelled) {
            setError("Could not reach video signaling server.");
            setStatus("error");
          }
        }
      );
      wsRef.current = ws;
    }

    void start();

    return () => {
      cancelled = true;
      endedRef.current = true;
      const ws = wsRef.current;
      if (ws) {
        sendLeave(ws, roomId);
        ws.close();
        wsRef.current = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per room
  }, [roomId, localDisplayName]);

  function toggleMic() {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      setMediaIssue("microphone-unavailable");
      setError("Microphone unavailable");
      return;
    }
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  }

  function toggleCam() {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) {
      setMediaIssue("camera-unavailable");
      setError("Camera unavailable");
      return;
    }
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  }

  function endMeeting() {
    endedRef.current = true;
    const secs = Math.floor((Date.now() - startedAtRef.current) / 1000);
    const wasConnected = wasConnectedRef.current;
    const ws = wsRef.current;
    if (ws) {
      sendLeave(ws, roomId);
      ws.close();
      wsRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setStatus("ended");
    onEnd({ durationSeconds: secs, wasConnected });
  }

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setError(null);
    } catch {
      setError("Could not copy link — select and copy manually.");
    }
  }

  const displayStatus =
    status === "microphone-unavailable"
      ? status
      : mediaIssue === "camera-unavailable" && status === "waiting"
        ? "camera-unavailable"
        : status;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9842a]">
            Video meeting
          </p>
          <h2 className="font-display text-2xl font-semibold text-[#10241f]">
            {contactName}
          </h2>
          <p className="mt-1 text-sm text-[#2a4038]">
            {statusLabel(displayStatus)}
            {status === "waiting" && mediaIssue === "camera-unavailable"
              ? " · Waiting for participant…"
              : ""}
            {remoteName && status === "connected" ? ` · ${remoteName}` : ""}
            {" · "}
            {formatDuration(duration)}
          </p>
        </div>
        <button
          type="button"
          onClick={endMeeting}
          className="btn-interactive rounded-xl bg-[#a33b2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          End Meeting
        </button>
      </header>

      <div className="view-enter grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.7fr)]">
        <div
          className={`video-tile relative aspect-video overflow-hidden rounded-2xl bg-[#10241f] ${
            status === "connected" ? "is-live" : ""
          }`}
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {status !== "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#10241f]/85 px-6 text-center">
              <p className="text-sm font-semibold text-white">
                {status === "waiting" || status === "connecting"
                  ? "Waiting for participant…"
                  : status === "negotiating"
                    ? "Connecting…"
                    : statusLabel(status)}
              </p>
              <p className="max-w-sm text-xs text-white/70">
                Open the join link in another browser or device. Nobody is shown
                as connected until a real peer joins.
              </p>
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white">
            {remoteName ?? "Remote"}
          </span>
        </div>

        <div className="video-tile relative aspect-video overflow-hidden rounded-2xl bg-[#1a332c] lg:aspect-auto lg:min-h-[220px]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {!camOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a332c] text-sm text-white/80">
              Camera off
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white">
            You
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleMic}
          className={`btn-interactive rounded-xl px-4 py-2.5 text-sm font-semibold ${
            micOn
              ? "bg-[#d7e4dc] text-[#0f4a3a]"
              : "bg-[#2a4038] text-white"
          }`}
        >
          {micOn ? "Mute mic" : "Unmute mic"}
        </button>
        <button
          type="button"
          onClick={toggleCam}
          className={`btn-interactive rounded-xl px-4 py-2.5 text-sm font-semibold ${
            camOn
              ? "bg-[#d7e4dc] text-[#0f4a3a]"
              : "bg-[#2a4038] text-white"
          }`}
        >
          {camOn ? "Camera off" : "Camera on"}
        </button>
        <button
          type="button"
          onClick={() => void copyJoinLink()}
          className="btn-interactive rounded-xl border border-[#1f6b56]/25 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#10241f]"
        >
          Copy join link
        </button>
      </div>

      {(error || mediaIssue) && (
        <p className="text-sm text-[#a33b2c]">
          {error ??
            (mediaIssue === "camera-unavailable"
              ? "Camera unavailable"
              : "Microphone unavailable")}
        </p>
      )}

      <div className="rounded-2xl border border-[#1f6b56]/15 bg-white/60 p-3 text-xs text-[#2a4038]">
        <p className="font-semibold text-[#10241f]">Join from another device</p>
        <p className="mt-1 break-all">{joinUrl}</p>
        <p className="mt-2">
          Room <span className="font-mono">{roomId}</span> · media is peer-to-peer
          via WebRTC · Briefed only relays signaling (no recording, not stored in
          Hindsight).
        </p>
      </div>
    </section>
  );
}
