const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./Users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: ['GET', 'POST'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  };
  
  app.use(cors(corsOptions)); // Enable CORS for Express
  
  const io = socketio(server, {
    cors: {
      origin: 'http://localhost:3000', // Allow requests from this origin
      methods: ['GET', 'POST'], // Allow these HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
      credentials: true // Allow credentials
    }
  });
  
app.use(router);

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.join(user?.room);

    socket.emit('message', { user: 'admin', text: `${user?.name}, welcome to room ${user?.room}.`});
    socket.broadcast.to(user?.room).emit('message', { user: 'admin', text: `${user?.name} has joined!` });

    io.to(user?.room).emit('roomData', { room: user?.room, users: getUsersInRoom(user?.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user?.room).emit('message', { user: user?.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user?.room).emit('message', { user: 'Admin', text: `${user?.name} has left.` });
      io.to(user?.room).emit('roomData', { room: user?.room, users: getUsersInRoom(user?.room)});
    }
  })
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));