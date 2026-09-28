// AI-Generated Code - 2026-09-28 - Composer
/**
 * WebRTC signaling over WebSocket.
 * Relays SDP offers/answers and ICE candidates between peers in a room.
 * Does not touch media streams or Hindsight.
 */

import type { IncomingMessage } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

const MAX_PEERS_PER_ROOM = 2;

type ClientMessage =
  | { type: "join"; roomId: string; peerId: string; displayName?: string }
  | { type: "signal"; roomId: string; targetPeerId: string; payload: unknown }
  | { type: "leave"; roomId: string };

type Peer = {
  ws: WebSocket;
  peerId: string;
  displayName: string;
  roomId: string;
};

function send(ws: WebSocket, data: unknown) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function roomIdFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, "http://localhost");
    return u.searchParams.get("roomId");
  } catch {
    return null;
  }
}

export function attachVideoSignaling(
  server: import("node:http").Server,
  path = "/ws/video"
) {
  const wss = new WebSocketServer({ server, path });
  /** roomId → peerId → Peer */
  const rooms = new Map<string, Map<string, Peer>>();

  function peersInRoom(roomId: string): Peer[] {
    const room = rooms.get(roomId);
    return room ? [...room.values()] : [];
  }

  function removePeer(peer: Peer) {
    const room = rooms.get(peer.roomId);
    if (!room) return;
    room.delete(peer.peerId);
    if (room.size === 0) rooms.delete(peer.roomId);
    for (const other of peersInRoom(peer.roomId)) {
      send(other.ws, {
        type: "peer-left",
        peerId: peer.peerId,
        displayName: peer.displayName,
      });
    }
  }

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    let self: Peer | null = null;
    const hintRoom = roomIdFromUrl(req.url);

    send(ws, {
      type: "ready",
      path,
      hintRoom,
      maxPeers: MAX_PEERS_PER_ROOM,
    });

    ws.on("message", (raw) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(String(raw)) as ClientMessage;
      } catch {
        send(ws, { type: "error", message: "Invalid JSON signaling message." });
        return;
      }

      if (msg.type === "join") {
        const roomId = String(msg.roomId || "").trim();
        const peerId = String(msg.peerId || "").trim();
        const displayName = String(msg.displayName || "Guest").trim() || "Guest";
        if (!roomId || !peerId) {
          send(ws, { type: "error", message: "roomId and peerId are required." });
          return;
        }

        if (self) removePeer(self);

        let room = rooms.get(roomId);
        if (!room) {
          room = new Map();
          rooms.set(roomId, room);
        }

        if (room.has(peerId)) {
          const old = room.get(peerId)!;
          try {
            old.ws.close();
          } catch {
            /* ignore */
          }
          room.delete(peerId);
        }

        if (room.size >= MAX_PEERS_PER_ROOM) {
          send(ws, {
            type: "error",
            code: "ROOM_FULL",
            message: "This meeting room already has two participants.",
          });
          return;
        }

        self = { ws, peerId, displayName, roomId };
        room.set(peerId, self);

        const others = peersInRoom(roomId).filter((p) => p.peerId !== peerId);
        send(ws, {
          type: "joined",
          roomId,
          peerId,
          peers: others.map((p) => ({
            peerId: p.peerId,
            displayName: p.displayName,
          })),
        });

        for (const other of others) {
          send(other.ws, {
            type: "peer-joined",
            peerId,
            displayName,
          });
        }
        return;
      }

      if (msg.type === "signal") {
        if (!self || self.roomId !== msg.roomId) {
          send(ws, { type: "error", message: "Join a room before signaling." });
          return;
        }
        const room = rooms.get(msg.roomId);
        const target = room?.get(msg.targetPeerId);
        if (!target) {
          send(ws, {
            type: "error",
            message: "Target peer is not in this room.",
          });
          return;
        }
        send(target.ws, {
          type: "signal",
          fromPeerId: self.peerId,
          fromDisplayName: self.displayName,
          payload: msg.payload,
        });
        return;
      }

      if (msg.type === "leave") {
        if (self) {
          removePeer(self);
          self = null;
        }
        send(ws, { type: "left" });
        return;
      }

      send(ws, { type: "error", message: "Unknown signaling message type." });
    });

    ws.on("close", () => {
      if (self) {
        removePeer(self);
        self = null;
      }
    });

    ws.on("error", () => {
      if (self) {
        removePeer(self);
        self = null;
      }
    });
  });

  return wss;
}
