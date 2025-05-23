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
    // When joining the room, receive the full list of users already there
    socket.on("current_users", (userArray) => {
      // Make sure each user has the structure { id, username }
      const formatted = userArray.map((u) => ({
        id: u.userId,
        username: u.user,
      }));
      setUsersList(formatted);
    });
    socket.on("receive_message", handleMessage);
    socket.on("username_received", handleUsername);
    socket.on("user_disconnected", handleDisconnect);

    return () => {
      socket.off("current_users");
      socket.off("receive_message", handleMessage);
      socket.off("username_received", handleUsername);
      socket.off("user_disconnected", handleDisconnect);
    };
  }, [socket]);

  function handleMessage(data) {
    setMessageList((list) => [...list, data]);
  }

  function handleUsername(receivedName, receivedId) {
    setUsersList((listU) => {
      // Only add if not already in the list
      if (listU.find((user) => user.id === receivedId)) return listU;
      return [...listU, { id: receivedId, username: receivedName }];
    });
  }

  function handleDisconnect(disconnectedUser) {
    setUsersList((listU) =>
      listU.filter((user) => user.id !== disconnectedUser)
    );
  }

  function activeUsers() {
    if (usersList.length > 1) {
      return usersList.map(user => user.username).join(", "); // Multiple users
    } else if (usersList.length === 1) {
      return usersList[0].username; // One user
    } else {
      return "alone"; // No users
    }
  }

  return (
    <div className="chat-window">
      <div className="active-users">
        <p id="active-users-list">Active Users: {activeUsers()}</p>
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
