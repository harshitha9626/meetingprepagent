// AI-Generated Code - 2026-09-28 - Composer
/**
 * WebRTC signaling over WebSocket.
 * Relays join/leave + SDP/ICE between peers in a room.
 * Does not touch media, Hindsight, or SQLite.
 */

import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

const MAX_PEERS_PER_ROOM = 2;

type ClientMeta = {
  peerId: string;
  roomId: string | null;
};

type InboundMessage =
  | { type: "join"; roomId: string; peerId?: string }
  | { type: "signal"; targetPeerId: string; payload: unknown }
  | { type: "leave" };

function safeSend(ws: WebSocket, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function leaveRoom(
  meta: ClientMeta,
  rooms: Map<string, Map<string, WebSocket>>
) {
  if (!meta.roomId || !meta.peerId) return;
  const room = rooms.get(meta.roomId);
  if (!room) return;
  room.delete(meta.peerId);
  for (const peerWs of room.values()) {
    safeSend(peerWs, { type: "peer-left", peerId: meta.peerId });
  }
  if (room.size === 0) rooms.delete(meta.roomId);
  meta.roomId = null;
}

/** Attach /ws/signaling to an existing HTTP server (same port as Express). */
export function attachSignaling(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/signaling" });
  /** roomId → peerId → socket */
  const rooms = new Map<string, Map<string, WebSocket>>();

  wss.on("connection", (ws) => {
    const meta: ClientMeta = { peerId: "", roomId: null };

    ws.on("message", (raw) => {
      let msg: InboundMessage;
      try {
        msg = JSON.parse(String(raw)) as InboundMessage;
      } catch {
        safeSend(ws, { type: "error", code: "BAD_JSON", message: "Invalid JSON" });
        return;
      }

      if (msg.type === "join") {
        const roomId = String(msg.roomId || "").trim();
        if (!roomId) {
          safeSend(ws, {
            type: "error",
            code: "BAD_ROOM",
            message: "roomId is required",
          });
          return;
        }

        leaveRoom(meta, rooms);

        if (!rooms.has(roomId)) rooms.set(roomId, new Map());
        const room = rooms.get(roomId)!;
        if (room.size >= MAX_PEERS_PER_ROOM) {
          safeSend(ws, {
            type: "error",
            code: "ROOM_FULL",
            message: "Meeting room is full (max 2 participants).",
          });
          return;
        }

        meta.peerId = String(msg.peerId || randomUUID());
        meta.roomId = roomId;
        const others = [...room.keys()];
        room.set(meta.peerId, ws);

        safeSend(ws, {
          type: "joined",
          peerId: meta.peerId,
          roomId,
          peers: others,
        });

        for (const [pid, peerWs] of room) {
          if (pid !== meta.peerId) {
            safeSend(peerWs, { type: "peer-joined", peerId: meta.peerId });
          }
        }
        return;
      }

      if (msg.type === "signal") {
        if (!meta.roomId || !meta.peerId) return;
        const room = rooms.get(meta.roomId);
        const target = room?.get(msg.targetPeerId);
        if (!target) return;
        safeSend(target, {
          type: "signal",
          fromPeerId: meta.peerId,
          payload: msg.payload,
        });
        return;
      }

      if (msg.type === "leave") {
        leaveRoom(meta, rooms);
      }
    });

    ws.on("close", () => leaveRoom(meta, rooms));
    ws.on("error", () => leaveRoom(meta, rooms));
  });

  return {
    roomCount: () => rooms.size,
    peerCount: (roomId: string) => rooms.get(roomId)?.size ?? 0,
  };
}
