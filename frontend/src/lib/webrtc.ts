// AI-Generated Code - 2026-09-28 - Composer
/**
 * WebRTC helpers for Briefed video meetings.
 * Media stays in the browser; only SDP/ICE go through signaling.
 */

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export type MediaAccessResult = {
  stream: MediaStream | null;
  cameraError: string | null;
  micError: string | null;
};

/** Request camera + mic only when starting a meeting. */
export async function acquireLocalMedia(): Promise<MediaAccessResult> {
  let cameraError: string | null = null;
  let micError: string | null = null;
  let stream: MediaStream | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return { stream, cameraError: null, micError: null };
  } catch {
    // Fall back to audio-only or video-only so the room still works.
  }

  try {
    const videoOnly = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    stream = videoOnly;
    micError = "Microphone unavailable";
  } catch {
    cameraError = "Camera unavailable";
  }

  try {
    const audioOnly = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    if (stream) {
      for (const track of audioOnly.getAudioTracks()) {
        stream.addTrack(track);
      }
      micError = null;
    } else {
      stream = audioOnly;
      cameraError = "Camera unavailable";
    }
  } catch {
    if (!stream) {
      micError = "Microphone unavailable";
    } else if (!micError) {
      micError = "Microphone unavailable";
    }
  }

  return { stream, cameraError, micError };
}

export function stopMediaStream(stream: MediaStream | null | undefined) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export function signalingUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  // Prefer Vite proxy (/ws → backend) when on the frontend origin.
  if (window.location.port === "5173" || window.location.port === "4173") {
    return `${proto}//${window.location.host}/ws/signaling`;
  }
  // Direct API host (e.g. production same-origin or API port)
  const apiHost =
    import.meta.env.VITE_API_WS_HOST ||
    `${window.location.hostname}:8787`;
  return `${proto}//${apiHost}/ws/signaling`;
}

export function roomIdForContact(contactId: string): string {
  return `briefed-${contactId}`;
}
