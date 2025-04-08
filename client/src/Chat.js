import React, { use, useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
//this adds the scroll to bottom functionality to the chat window

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  //const [usernamesList, setUsernamesList] = useState([]);
  let [usersList, setUsersList] = useState([]);


  const sendMessage = async () => {
    //this sends the message to the right room from the right user
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      //this pauses the function until the message is sent to the server
      //it makes sure that the function wont continue until the message is sent
      //but i don't think such case will ever occur
      //maybe it's redundant, but it doesn't hurt to have it for safety
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    socket.on("username_received", (receivedName, receivedId) => {
      setUsersList((listU) => [...listU, { id: receivedId, username: receivedName }]);
      //to do: add a function that removes the user from the list
      //when he leaves the room, also update the list when a new user joins
    });

    // Handle a user disconnecting
    socket.on("user_disconnected", (disconnectedUser) => {
      setUsersList((listU) => listU.filter(user => user.id == disconnectedUser));
    });

  }, [socket]);

  function activeUsers() {
    return (usersList.map(user => `${user.username}`).join(', '));
  }

  return (
    <div className="chat-window">
      <div className="active-users">
        <p id="active-users-list">Active Users: You, {activeUsers()}</p>
      </div>
      <div className="chat-header">
        <p>Room password: {room}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">
                      {username === messageContent.author
                        ? "you"
                        : messageContent.author}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hi..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyUp={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}
export default Chat;
