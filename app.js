"use strict";

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
var users = {};
var index=0;
var i;
var data;
io.on('connection', (socket) => {
    console.log("A user Connected");
    i = 0;
    data = {id:socket.id}
    users[index] = data;
    console.log("----Kullanıcı Listesi-----");
    console.table(users);
    socket.on('event message', (data) => {
        socket.broadcast.emit('event message',data);
    });
    index++;
});


http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
