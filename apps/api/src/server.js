const http = require("http");
const { Server } = require("socket.io");

const createApp = require("./app");
const { apiPort, webOrigin } = require("./config/env");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: webOrigin,
    credentials: true
  }
});

const app = createApp(io);
server.on("request", app);

io.on("connection", (socket) => {
  // User joins their personal notification room so we can target them
  socket.on("joinUserRoom", ({ userId }) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  // Interview/coding rooms
  socket.on("joinRoom", async ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit("presenceChanged", { roomId, socketId: socket.id, joined: true });
    
    // Notify the joining user if someone is already there
    const sockets = await io.in(roomId).fetchSockets();
    if (sockets.length > 1) {
      socket.emit("presenceChanged", { roomId, socketId: "already_there", joined: true });
    }
  });

  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("presenceChanged", { roomId, socketId: socket.id, joined: false });
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeChange", { roomId, code });
  });

  socket.on("cursorMove", ({ roomId, cursor }) => {
    socket.to(roomId).emit("cursorMove", { roomId, socketId: socket.id, cursor });
  });
  
  socket.on("mediaStateChange", ({ roomId, videoOn, micOn }) => {
    socket.to(roomId).emit("mediaStateChange", { roomId, videoOn, micOn });
  });

  socket.on("languageChange", ({ roomId, language }) => {
    socket.to(roomId).emit("languageChange", { roomId, language });
  });

  socket.on("webrtcOffer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtcOffer", { roomId, from: socket.id, offer });
  });

  socket.on("webrtcAnswer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtcAnswer", { roomId, from: socket.id, answer });
  });

  socket.on("iceCandidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("iceCandidate", { roomId, from: socket.id, candidate });
  });

  socket.on("questionChange", ({ roomId, questionText }) => {
    socket.to(roomId).emit("questionChange", { roomId, questionText });
  });

  socket.on("interviewEnded", ({ roomId }) => {
    socket.to(roomId).emit("interviewEnded", { roomId });
  });
});

server.listen(apiPort, () => {
  console.log(`ValuHire API listening on http://localhost:${apiPort}`);
});
