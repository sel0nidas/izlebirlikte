const express = require('express');
const app = express();

var path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

let users = [];
let usersid = [];
let result;
var tempvalue;
var fpsroom;
var index;
var indexsec;

app.get(('/'), (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));

});

app.get(('/login'), (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));

});

app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname + '/room.html'));
});

app.get('/nasil-kullanilir', (req, res) => {
    res.sendFile(path.join(__dirname + '/nasil-kullanilir.html'));
});


io.on('connection', (socket) => {
	
    socket.on('new user',(user)=>{

        var check = users.findIndex((element) => element.username == user.username);
        result = users.filter(word => word.roomid == user.roomid);
        
        if( check == -1 ){     
            socket.join(user.roomid);
			
			if(result.length==0){
				user.mod="moderator";
				io.to(socket.id).emit('moderator check',"moderator");
			}
			else{
				user.mod="izleyici";
				io.to(socket.id).emit('moderator check',"izleyici");
			}
            users.push(user);    
            usersid.push(user.id);
            console.log(user.username+" "+user.roomid+" odasına katıldı.");
            
			io.to(user.roomid).emit("message new user", users.length);
			io.to(user.roomid).emit('room users list', result.length);
        }
        else{
			if(result.length==1){
				user.mod="moderator";
				io.to(socket.id).emit('moderator check',"moderator");
			}
			else{
				user.mod="izleyici";
				io.to(socket.id).emit('moderator check',"izleyici");
			}
            socket.join(user.roomid);  
            console.log(check+" index kullanıcısı ile aynı username'e sahipsin o yüzden üst üste giriş yapamazsın, son kaldığın noktaya yönlendiriyorum. Eğer çıkmak istiyorsan çıkış yap.");

            var oldid = users.findIndex((word) => word.id == user.storageid);
			io.to(user.id).emit("existing user","existing user");
			
            users[oldid].storageid = users[oldid].id;
            users[oldid].id = user.id;
            usersid[oldid] = user.id;
        }
		io.to(user.roomid).emit("message new user", users);
		io.to(user.roomid).emit('room users list', result.length);
		
		index = users.findIndex((element) => element.roomid == user.roomid);
		
        console.table(users);
        console.table(usersid);
		io.to(user.roomid).emit("message new user", users);
		io.to(user.roomid).emit('room users list', result);
		
        //fpsroom = users.findIndex((word) => word.roomid == user.roomid);
        //console.log(users[fpsroom]);
    });
    
    console.table(users);
    socket.on('leave room',(data)=>{

        console.log("ÇIKMADAN ÖNCE");
        result = users.filter(word => word.roomid == data.roomid);
        console.log(result);
		
        socket.leave(data.roomid);
        console.log("Bu odadan ayrıldı");

        index = users.findIndex((element) => element.username == data.username);
		users.splice(index,1);
		usersid.splice(index,1);
		
        indexsec = users.findIndex((element) => element.roomid == data.roomid);
        
        result = users.filter(word => word.roomid == data.roomId);

        console.log("ÇIKTIKTAN SONRA");
        console.log(result);
    });
	
    socket.on('event message', (data) => {
        index = users.findIndex((element) => element.roomid == data.roomid);
        if(socket.id == usersid[index]){
            socket.broadcast.to(data.roomid).emit('event message',data);
        }
      });
	
      socket.on('videoid',(YTvideodata) => {
        
        index = users.findIndex((element) => element.roomid == data.roomid);
        if(socket.id == usersid[index]){
          socket.broadcast.to(YTvideodata.roomid).emit('videoid',YTvideodata);
          io.to(socket.id).emit('moderator',"moderator");
        }
      });

	/*	
	socket.on('twiframe video url',(twdata) => {
        index = users.findIndex((element) => element.roomid == twdata.roomid);
        if(socket.id == usersid[index]){
          io.to(twdata.roomid).emit('twiframe video url',twdata);
			io.to(socket.id).emit('moderator',"moderator");
        }
      });
	  */
	
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`); 
});
