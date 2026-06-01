const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { apiPort, webOrigin } = require("./config/env");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: webOrigin,
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit("presenceChanged", { socketId: socket.id, joined: true });
  });

  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("presenceChanged", { socketId: socket.id, joined: false });
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeChange", { code });
  });

  socket.on("cursorMove", ({ roomId, cursor }) => {
    socket.to(roomId).emit("cursorMove", { socketId: socket.id, cursor });
  });

  socket.on("languageChange", ({ roomId, language }) => {
    socket.to(roomId).emit("languageChange", { language });
  });

  socket.on("webrtcOffer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtcOffer", { from: socket.id, offer });
  });

  socket.on("webrtcAnswer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtcAnswer", { from: socket.id, answer });
  });

  socket.on("iceCandidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("iceCandidate", { from: socket.id, candidate });
  });
});

server.listen(apiPort, () => {
  console.log(`ValuHire API listening on http://localhost:${apiPort}`);
});
