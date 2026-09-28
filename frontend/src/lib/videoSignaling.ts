// AI-Generated Code - 2026-09-28 - Composer
/**
 * Thin WebSocket client for WebRTC offer/answer/ICE relay.
 */

export type SignalPayload =
  | { kind: "offer"; sdp: RTCSessionDescriptionInit }
  | { kind: "answer"; sdp: RTCSessionDescriptionInit }
  | { kind: "ice"; candidate: RTCIceCandidateInit | null };

export type ServerSignalMessage =
  | { type: "ready"; path: string; hintRoom: string | null; maxPeers: number }
  | {
      type: "joined";
      roomId: string;
      peerId: string;
      peers: { peerId: string; displayName: string }[];
    }
  | { type: "peer-joined"; peerId: string; displayName: string }
  | { type: "peer-left"; peerId: string; displayName: string }
  | {
      type: "signal";
      fromPeerId: string;
      fromDisplayName: string;
      payload: SignalPayload;
    }
  | { type: "left" }
  | { type: "error"; message: string; code?: string };

function signalingUrl(roomId: string): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${proto}//${host}/ws/video?roomId=${encodeURIComponent(roomId)}`;
}

export function createSignalingSocket(
  roomId: string,
  onMessage: (msg: ServerSignalMessage) => void,
  onClose: () => void,
  onError: (err: Event) => void
): WebSocket {
  const ws = new WebSocket(signalingUrl(roomId));
  ws.onmessage = (ev) => {
    try {
      onMessage(JSON.parse(String(ev.data)) as ServerSignalMessage);
    } catch {
      /* ignore malformed */
    }
  };
  ws.onclose = () => onClose();
  ws.onerror = (ev) => onError(ev);
  return ws;
}

export function sendJoin(
  ws: WebSocket,
  roomId: string,
  peerId: string,
  displayName: string
) {
  ws.send(JSON.stringify({ type: "join", roomId, peerId, displayName }));
}

export function sendSignal(
  ws: WebSocket,
  roomId: string,
  targetPeerId: string,
  payload: SignalPayload
) {
  ws.send(JSON.stringify({ type: "signal", roomId, targetPeerId, payload }));
}

export function sendLeave(ws: WebSocket, roomId: string) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "leave", roomId }));
  }
}

export function newPeerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `peer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
