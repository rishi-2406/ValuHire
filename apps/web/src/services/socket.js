import { io } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL = "/";

let socket = null;
const listeners = new Map();

export function getSocket() {
  if (socket && socket.connected) return socket;
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: (cb) => {
      const token = getAccessToken();
      cb({ token: token || "" });
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  });

  socket.on("connect", () => {
    Object.entries(listeners).forEach(([room, fns]) => {
      socket.emit("joinRoom", { roomId: room });
      fns.forEach(fn => fn({ type: "connected", roomId: room }));
    });
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect_error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    Object.entries(listeners).forEach(([room, fns]) => {
      fns.forEach(fn => fn({ type: "disconnected", roomId: room, reason }));
    });
  });

  ["presenceChanged", "codeChange", "cursorMove", "languageChange", "webrtcOffer", "webrtcAnswer", "iceCandidate"].forEach(event => {
    socket.on(event, (payload) => {
      const room = payload?.roomId || payload?.room;
      const fns = listeners.get(room) || [];
      fns.forEach(fn => fn({ type: event, payload }));
    });
  });

  return socket;
}

export function joinRoom(roomId) {
  if (!listeners.has(roomId)) listeners.set(roomId, []);
  const s = getSocket();
  s.emit("joinRoom", { roomId });
}

export function leaveRoom(roomId) {
  if (!listeners.has(roomId)) return;
  const s = getSocket();
  s.emit("leaveRoom", { roomId });
  listeners.delete(roomId);
}

export function onRoomEvent(roomId, fn) {
  if (!listeners.has(roomId)) listeners.set(roomId, []);
  listeners.get(roomId).push(fn);
  const s = getSocket();
  if (s.connected) s.emit("joinRoom", { roomId });
  return () => {
    const fns = listeners.get(roomId) || [];
    listeners.set(roomId, fns.filter(f => f !== fn));
  };
}

export function emitCodeChange(roomId, code) {
  getSocket().emit("codeChange", { roomId, code });
}

export function emitLanguageChange(roomId, language) {
  getSocket().emit("languageChange", { roomId, language });
}

export function emitCursorMove(roomId, cursor) {
  getSocket().emit("cursorMove", { roomId, cursor });
}

export function emitWebRTCOffer(roomId, offer) {
  getSocket().emit("webrtcOffer", { roomId, offer });
}

export function emitWebRTCAnswer(roomId, answer) {
  getSocket().emit("webrtcAnswer", { roomId, answer });
}

export function emitICECandidate(roomId, candidate) {
  getSocket().emit("iceCandidate", { roomId, candidate });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners.clear();
  }
}
