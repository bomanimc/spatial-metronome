const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
require('dotenv').config();

const io = require('socket.io')(http, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8000',
}));
app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';

let animationInterval;
let sequenceIndex = 0;
// TODO: Consider initializing with a test pattern.
let sequence = [
  [["#fc5c65", "#fd9644", "#fed330", "#26de81"], ["yellow", "orange", "pink"]],
  [["#26de81", "#fc5c65", "#fd9644", "#fed330"], ["orange", "pink", "yellow"]],
  [["#fed330", "#26de81", "#fc5c65", "#fd9644"], ["orange", "pink", "yellow"]],
  [["#fd9644", "#fed330", "#26de81", "#fc5c65"], ["orange", "pink", "yellow"]],
];
const connectedPositions = {};

const addConnectedPosition = (r, c) => 
  connectedPositions[`${r}-${c}`] = `${r}-${c}` in connectedPositions ? connectedPositions[`${r}-${c}`] + 1 : 1;

const removeConnectedPosition = (r, c) => 
  connectedPositions[`${r}-${c}`] = `${r}-${c}` in connectedPositions ? connectedPositions[`${r}-${c}`] - 1 : 0;

app.post('/api/upload', (req, res) => {
  const { sequence: uploadedSequence } = req.body.data;
  console.log("UPLOAD", uploadedSequence);
  sequence = uploadedSequence;

  res.sendStatus(200);
});

app.get('*', (req, res) => {
  res.send({sequence});
});

http.listen(port, (err) => {
  if (err) throw err;
  console.log(`> [${env}] Ready on http://localhost:${port}`);
});

// socket.io server
io.on('connection', (socket) => {
  console.log('Someone connected');

  // TODO (Maybe): Send sequence on the server to creator during initial creation.
  socket.on('connectAnimator', () => {
    console.log("Connected an animator");
    socket.join("animators");
    socket.emit("connectedPositions", {connectedPositions});
  });

  socket.on('connectedPosition', (data) => {
    const {row, col} = data;
    console.log(`Connected: r: ${row} c: ${col}`);
    addConnectedPosition(row, col);
    socket.to("animators").emit("connectedPositions", {connectedPositions});
    console.log("connectedPositions", connectedPositions);
  });

  socket.on('disconnectedPosition', (data) => {
    const {row, col} = data;
    console.log(`Disconnected: r: ${row} c: ${col}`);
    removeConnectedPosition(row, col);
    socket.to("animators").emit({connectedPositions});
    console.log("connectedPositions", connectedPositions);
  });
  
  socket.on('animationStep', (data) => {
    sequenceIndex = (sequenceIndex + 1) % sequence.length;
  });

  if (!animationInterval) {
    console.log("Interval", animationInterval);
    animationInterval = setInterval(() => {
      sequenceIndex = (sequenceIndex + 1) % sequence.length;
      console.log("Sequence Index", sequenceIndex);
      console.log("Socket Count", io.engine.clientsCount);
  
      io.emit("newFrame", {
        frame: sequence[sequenceIndex],
      });
    }, 2000);
  } else {
    console.log("Interval already set");
  }
});
