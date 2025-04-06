import './App.css';
import io from 'socket.io-client';
import {useState} from "react";
import Chat from './Chat';

const socket = io.connect("http://localhost:3001")  // връзка към сървъра

function App() {                                 //логика на приложението
const [username, setUsername] = useState("");
const [room, setRoom] = useState("");
const [showChat, setShowChat] = useState(false);

const joinRoom = () => {                         //изпраща данни към сървъ
  if (username !== "" && room !== ""){
    socket.emit("join_room", room);
    socket.emit("user_username", username, room);
    setShowChat(true);
  }
}

  return (
    <div className="App">
      {!showChat ? (
      <div className='joinChatContainer'>
        
      <h3>Join a Chat Room</h3>

      <input type="text" placeholder="Input your name..." onChange={(event) => {setUsername(event.target.value);}}/>
      <input type="password" placeholder="Room password...(max 10)" maxLength="10" onChange={(event) => {setRoom(event.target.value);}}/>
      <button onClick={joinRoom}>Join room</button>
      </div>
      ) 
      : (
      <Chat socket={socket} username={username} room={room}/>
      )
      }

    </div>
  );
}

export default App;
