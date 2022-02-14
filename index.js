const express = require('express');
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const PORT = 4000;

const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '100mb'}));
app.use('/static', express.static('public'));

// middlewares
const { authorization } = require('./middlewares/middlewares');

// routes
const users = require('./routes/user/user.route');
const validate = require('./routes/validate/validate.route');
const post = require('./routes/post/post.route');
const comment = require('./routes/comment/comment.route');
const conversation = require('./routes/conversation/conversation.route');
const message = require('./routes/message/message.route');

app.use('/users', users);
app.use('/validate', authorization, validate);
app.use('/posts', authorization, post);
app.use('/comments', authorization, comment);
app.use('/conversations', authorization, conversation);
app.use('/messages', authorization, message);

mongoose.connect('mongodb://localhost/socialApp', { useNewUrlParser: true, useUnifiedTopology: true });
const connect = mongoose.connection;
connect.on('error', function(){
  console.log('Mongodb connect to fail !');
});
connect.on('open', function(){
  console.log('Mongodb connected...');
});


// socket
let usersSocket = [];
io.on("connection", (socket) => {

  // join conversation 
  // Note: room = conversation
  socket.on('join-room', ({ conversationId, userId }) => {
    socket.join(conversationId);
    socket.currenRoom = conversationId;

    // add User
    addUser(userId, socket.id);
    // console.log("join-room: ", socket.adapter.rooms);
    // console.log("usersSocket: ", usersSocket);
  });

  // leave conversation
  socket.on('leave-room', () => {
    socket.leave(socket.currenRoom);

    // remove user
    removeUser(socket.id);
    // console.log("leave-room: ", socket.adapter.rooms);
    // console.log("usersSocket: ", usersSocket);
  })


  // send and get message
  socket.on('client-send-message', (message) => {
    // console.log('message: ', message);
    // console.log("currenRoom: ", socket.currenRoom);
    io.sockets.in(socket.currenRoom).emit('client-get-message', message)
  });

  // send and get message
  socket.on('someone-typing', (fullname) => {
    // send to all users and exclude sender
    socket.to(socket.currenRoom).emit('get-someone-typing', fullname)
  });

   // send and get message
   socket.on('someone-stop-typing', () => {
    io.sockets.in(socket.currenRoom).emit('get-someone-stop-typing')
  });


  // user disconnect
  socket.on('disconnect', () => {
    removeUser(socket.id);
  });
  
});


const addUser = (userId, socketId) => {
  const existUser = usersSocket.some(user => user.userId === userId);
  if (!existUser) {
    usersSocket.push({userId, socketId});
  }
}

const removeUser = (socketId) => {
  usersSocket = usersSocket.filter(user => user.socketId !== socketId)
}

// server listening
http.listen(PORT, () => {
  console.log('Server is running on ' + PORT);
})