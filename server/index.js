const express = require('express');
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io")
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    },
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join_room", (room) => {  
        socket.join(room);
        console.log("User with id:", socket.id, "joined room:", room);
    });
    
    socket.on("user_username", (username, room) => {
        socket.to(room).emit("username_recieved", username)
        console.log("Username sent:",username, "to room:", room)
    })

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    });

    socket.on("disconnect", () => {
        console.log("User disconected", socket.id);
    });

});


server.listen(3001, () => {
    console.log("Server running");
});