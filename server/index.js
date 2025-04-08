// nodemon is used to automatically restart the server when files change
const express = require("express");
// express is the backend web framework for node.js
const app = express();
const http = require("http");
// http is used to create a server
const cors = require("cors");
// cors is used to allow cross-origin requests. It's a security feature that allows or denies requests from different origins (domains).
const { Server } = require("socket.io");
// socket.io is used to create a websocket connection. websockets allow continuous, open connections
app.use(cors());

const server = http.createServer(app);
// to start a server in terminal, run - cd server -> npm start
// this will start the server on port 3001

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//sockets listen to events that are "emit"ed from the client
//here I basically write down those emits and declare
//what i need the server to do when it receives them
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log("User with id:", socket.id, "joined room:", room);
  });

  socket.on("user_username", (username, room) => {
    socket.to(room).emit("username_received", username);
    console.log("Username sent:", username, "to room:", room);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running");
  // this tells me that the server is running successfully
});
