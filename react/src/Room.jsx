import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./room.css";

export default function Room() {
  const nameRef = useRef(0);
  const messageRef = useRef(0);
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef();
  messagesRef.current = messages;
  useEffect(() => {
    console.log("useEffect");
    loadMessages();
    const evtSource = new EventSource(
      "http://localhost:3000/api/events/" + roomId
    );
    evtSource.onmessage = function (event) {
      // console.log("got event", { event });
      const { name, message } = JSON.parse(event.data);
      // console.log({ messagesRef });
      setMessages((oldMessages) => {
        return [...oldMessages, { name, message }];
      });
    };

    async function loadMessages() {
      // console.log("loadMessages()");
      const oldMessagesResponse = await fetch(
        "http://localhost:3000/api/chat/" + roomId
      );
      const oldMessages = await oldMessagesResponse.json();
      // console.log({ oldMessages });
      setMessages([...oldMessages]);
    }
  }, []);

  async function sendMessage(event) {
    event.preventDefault();
    const name = nameRef.current.value;
    const message = messageRef.current.value;
    messageRef.current.value = "";
    messageRef.current.focus();
    const dataToSend = {
      name,
      message,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    };
    await fetch("http://localhost:3000/api/chat/" + roomId, options);
  }

  return (
    <>
      <div className="output">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message.name} : {message.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          className="name"
          placeholder="Entrez votre nom"
          ref={nameRef}
        />
        <input
          type="text"
          className="message"
          placeholder="Entrez votre message"
          ref={messageRef}
        />
        <button type="submit" className="send">
          send
        </button>
      </form>
    </>
  );
}
