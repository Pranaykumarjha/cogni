import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Trip room joining
    socket.on("join-trip", (tripId) => {
      socket.join(`trip:${tripId}`);
      console.log(`Socket ${socket.id} joined trip:${tripId}`);
    });

    socket.on("leave-trip", (tripId) => {
      socket.leave(`trip:${tripId}`);
      console.log(`Socket ${socket.id} left trip:${tripId}`);
    });

    // Real-time itinerary updates
    socket.on("itinerary-update", (data) => {
      // Broadcast to everyone else in the room
      socket.to(`trip:${data.tripId}`).emit("itinerary-updated", data);
    });

    // Voting updates
    socket.on("cast-vote", (data) => {
      socket.to(`trip:${data.tripId}`).emit("vote-cast", data);
    });
    
    // New proposals
    socket.on("new-proposal", (data) => {
      socket.to(`trip:${data.tripId}`).emit("proposal-added", data);
    });

    // Real-time presence
    socket.on("presence", (data) => {
      socket.to(`trip:${data.tripId}`).emit("presence-update", {
        socketId: socket.id,
        ...data,
      });
    });

    // Real-time chat
    socket.on("send-message", (data) => {
      // Broadcast to everyone else in the room
      socket.to(`trip:${data.tripId}`).emit("new-message", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
