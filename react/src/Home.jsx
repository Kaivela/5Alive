import { useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef(0);
  const [disabledState, setDisabledState] = useState(true);
  const [isHidden, setIsHidden] = useState(true);

  function handleInputKeyUp(event) {
    setIsHidden(true);
    if (event.target.value === "") {
      setDisabledState(true);
    } else {
      setDisabledState(false);
    }
  }

  async function createRandomRoom() {
    const createResponse = await fetch("http://localhost:3000/api/create");
    const roomId = await createResponse.text();
    location.pathname = `/room/${roomId}`;
  }

  async function createCustomRoom() {
    const roomName = inputRef.current.value;
    const createResponse = await fetch(
      `http://localhost:3000/api/create/${roomName}`
    );
    if (createResponse.status !== 409) {
      // pas d'erreur
      // location.pathname = `/room/${roomName}`;
      alert("redirect");
    } else {
      setIsHidden(false);
      inputRef.current.focus();
    }
  }

  return (
    <>
      <div className="roomList">
        <h1>Room List</h1>
      </div>
      <div className="create-room">
        <div>
          <button
            className="custom"
            onClick={createCustomRoom}
            disabled={disabledState}
          >
            Create Custom Room
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Your custom name"
            onKeyUp={handleInputKeyUp}
          />
          <span className={`error ${isHidden ? "hidden" : ""}`}>
            cette room existe déjà
          </span>
        </div>
        <button onClick={createRandomRoom}>Create Random Room</button>
      </div>
    </>
  );
}
