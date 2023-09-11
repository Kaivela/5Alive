// import bodyParser from "body-parser";
// eslint-disable-next-line no-unused-vars
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;
const rooms = {
  toto: {
    messages: [],
    clients: [],
  },
  tata: {
    messages: [],
    clients: [],
  },
};
// const messages = [];
// let clients = [];

// user va sur /
// il voit une page qui :
// liste les rooms + possibilité de rejoindre existante
// donne la possibilité d'en créer une custom
// donne la possibilité d'en créer une random

// user va sur /room/<new random id>
// new random room crée - ***ok***

// user va sur /room/<existing id>
// il peut chat avec cette room - ***ok***

// user va sur /room/<new custom id>
// la room est crée - ***ok***

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/room/:roomId", express.static("public"));
app.use(cors());

app.post("/api/chat/:roomId", handleChat);

app.get("/api/rooms", getRooms);
app.get("/api/events/:roomId", eventsHandler);
app.get("/api/chat/:roomId", getMessages);
app.get("/api/status/:roomId", getStatus);
app.get("/api/create/:roomId", handleCreateCustomRoom);
app.get("/api/create", handleCreateRandomRoom);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/**
 * @param {express.Request} request
 * @param {express.Response} response
 */
function handleChat(request, response) {
  const roomId = request.params.roomId;
  const message = request.body;
  if (rooms[roomId] == undefined) {
    response.status(404).send("404 room not found");
    return;
  }
  rooms[roomId].messages.push(message);
  response.send();
  return sendEventsToRoom(message, roomId);
}

function getMessages(request, response) {
  const roomId = request.params.roomId;
  if (rooms[roomId] == undefined) {
    response.status(404).send("404 room not found");
    return;
  }
  response.json(rooms[roomId].messages);
}

function eventsHandler(request, response) {
  const roomId = request.params.roomId;
  if (rooms[roomId] == undefined) {
    response.status(404);
    response.send("404 room not found");
    return;
  }

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  response.writeHead(200, headers);

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    response,
  };

  rooms[roomId].clients.push(newClient);

  request.on("close", () => {
    console.log(`${clientId} Connection closed`);
    rooms[roomId].clients = rooms[roomId].clients.filter(
      (client) => client.id !== clientId
    );
  });
}

function getStatus(request, response) {
  const roomId = request.params.roomId;
  if (rooms[roomId] == undefined) {
    response.status(404);
    response.send("404 room not found");
    return;
  }
  response.json({ clients: rooms[roomId].clients.length });
}

function handleCreateCustomRoom(request, response) {
  const roomId = request.params.roomId;
  if (rooms[roomId] !== undefined) {
    response.status(409);
    response.send("la room existe déjà !");
    return;
  }
  rooms[roomId] = {
    messages: [],
    clients: [],
  };
  response.send("ok");
}

function sendEventsToRoom(newMessage, roomId) {
  rooms[roomId].clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newMessage)}\n\n`)
  );
}

function getRooms(request, response) {
  const roomList = Object.keys(rooms);
  response.json(roomList);
}

function handleCreateRandomRoom(request, response) {
  const roomId = createRandomId();
  rooms[roomId] = {
    messages: [],
    clients: [],
  };
  response.send("ok");
}

function createRandomId() {
  const roomId = Math.round(Math.random() * 1_000_000_000);
  if (rooms[roomId] !== undefined) {
    return createRandomId();
  }
  return roomId;
}

// user va sur /
// il voit une page qui :

// liste les rooms + possibilité de rejoindre existante

// donne la possibilité d'en créer une custom
// <button type="button" id="custom">Créer votre salle</button>
// donne la possibilité d'en créer une random
// <button type="button" id="random">Créer une salle aléatoire</button>
