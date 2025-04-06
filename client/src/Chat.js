import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({socket, username, room}){
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [usernamesList, setUsernamesList] = useState([]);

    const sendMessage = async() => {
        if(currentMessage !== ""){
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() 
                + ":" 
                + new Date(Date.now()).getMinutes(),
            };

            await socket.emit("send_message", messageData);           // изпраща съобщението към сървъра
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    useEffect(() => {                                                // при промяна в сървъра се извиква функциятa

        socket.on("receive_message", (data) =>{
            setMessageList((list) => [...list, data]);
        })

    }, [socket])

    useEffect(() => {      

        socket.on("username_recieved", (recievedName) =>{
            setUsernamesList((listU) => [...listU, recievedName]);
        })

    }, [socket])
    

    return(
        <div className="chat-window">
            <div className="active-users">
                <p>Active Users: {usernamesList.join(', ')}</p>
            </div>
            <div className="chat-header">
                <p>Room password: {room}</p>
            </div>
            <div className="chat-body">
                <ScrollToBottom className="message-container">
                {messageList.map((messageContent) => {
                    return <div className="message" id={username === messageContent.author ? "you" : "other"}>
                        <div>
                            <div className="message-content">
                                <p>{messageContent.message}</p>
                            </div>
                            <div className="message-meta">
                                <p id="time">{messageContent.time}</p>
                                <p id="author">{username === messageContent.author ? "you" : messageContent.author}</p>                               
                            </div>
                        </div>
                    </div>;
                })}
                </ScrollToBottom>
            </div>
            <div className="chat-footer">
                <input type="text" value={currentMessage} placeholder="Hi..." onChange={(event) => {setCurrentMessage(event.target.value);}}
                onKeyPress={(event) => {event.key === "Enter" && sendMessage();
            }}                
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
    )
}

export default Chat