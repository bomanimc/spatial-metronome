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

app.get('*', (req, res) => {
  res.send({sequence});
});

http.listen(port, (err) => {
  if (err) throw err;
  console.log(`> [${env}] Ready on http://localhost:${port}`);
});

io.on('connection', (socket) => {
  console.log('Someone connected');

  socket.on('quiet', () => {
    console.log("Quiet");
    io.emit("isSilent", { isSilent: true });
  });

  socket.on('loud', () => {
    console.log("Loud");
    io.emit("isSilent", { isSilent: false });
  });
});
