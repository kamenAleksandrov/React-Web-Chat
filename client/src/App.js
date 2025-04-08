import "./App.css";
import io from "socket.io-client";
//this is the client functionality of socket.io
import { useState } from "react";
import Chat from "./Chat";
//this is the chat function in my chat.js file

const socket = io.connect("http://localhost:3001");
//this is the server address, where the socket.io server is running
function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    // this function is called when the user clicks the join room button
    // if the username and room are not empty,
    // it emits the join_room event to the server
    // and sets the showChat state to true, this will show the chat component
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      socket.emit("user_username", username, room);
      setShowChat(true);
    }
  };

  return (
    // this is the initial screen where the user can enter their username and room name.
    <div className="App">
      {showChat ? 
      // this whole return is showChat? (true) : (false)
      (  
        <Chat socket={socket} username={username} room={room} />
        //here i send the necessary props to the chat component
      ) : (
        <div className="joinChatContainer">
          <h3>Join a Chat Room</h3>

          <input
            type="text"
            placeholder="Input your name..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="password"
            //the password is also the room name
            placeholder="Room password...(max 10)"
            maxLength="10"
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join room</button>
        </div>
      )}
    </div>
  );
}
export default App;