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

let users = [];
// this is a list that will store all the users connected to the server
//below I will create functions to add, remove and get users from this list
const addUser = (userId, username, room) => {
  users.push({ userId, user: username, room });
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
// this allows me to get the user from the list by his id
const removeUser = (userId) => {
  users = users.filter((user) => user.userId !== userId);
};

//sockets listen to events that are "emit"ed from the client
//here I basically write down those emits and declare
//what i need the server to do when it receives them
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_joined_room", (username, room) => {
    socket.join(room);
    socket.roomName = room;
    console.log("User", username, "with id:", socket.id, "joined room:", room);
    addUser(socket.id, username, room);
    console.log("User added to the list of users:", users);
    // this adds the user to the list of users in the room
    const usersInRoom = users.filter((user) => user.room === room);
    socket.emit("current_users", usersInRoom);
    // this sends the current users in the room to the user who just joined
    // this is needed for the new user to see who is already in the room
    socket.to(room).emit("username_received", username, socket.id);
    console.log("Username sent:", username, "to room:", room);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    if (socket.roomName) {
      socket.to(socket.roomName).emit("user_disconnected", socket.id);
      getUser(socket.id);
      console.log(
        `User ${socket.id} disconnected from room ${socket.roomName}`
      );
      removeUser(socket.id);
      console.log("User removed from the list of users:", users);
    }
  });
});

server.listen(3001, () => {
  console.log("Server running");
  // this tells me that the server is running successfully
});
