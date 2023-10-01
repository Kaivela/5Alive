import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
function Room({ roomName }) {
  return (
    <div>
      <Link to={`/room/${roomName}`}>{roomName}</Link>
    </div>
  );
}

export default function RoomList() {
  const [roomList, setRoomList] = useState([]);
  useEffect(() => {
    loadRoomList();
  }, []);

  async function loadRoomList() {
    const roomListResponse = await fetch("http://localhost:3000/api/rooms/");
    const roomListFromAPI = await roomListResponse.json();
    setRoomList(roomListFromAPI);
  }

  return (
    <div className="roomList">
      <h1>Room List</h1>
      {roomList.map((roomName, i) => (
        <Room key={i} {...{ roomName }} />
      ))}
    </div>
  );
}
