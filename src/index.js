let http = require("http");
let express = require("express");
let app = express();
let server = http.createServer(app);
let socketio = require("socket.io");
let io = socketio(server);
let port = process.env.PORT || 3500;
let path = require("path");
let Filter = require('bad-words');
let { generateMessage, generateLocationMessage } = require("./utils/messages.js");
let { addUser,removeUser,getUser,getUserInRoom } = require("./utils/users.js");

let publicDirectoryPath = (path.join(__dirname,'../public')).replace(/\\/g,'/');

app.use(express.static(publicDirectoryPath));
io.on("connection",(socket)=>{
    console.log("New WebSocket Connection");

    socket.on("join",(options,callback)=>{
        const {error , user} = addUser({id:socket.id,...options});
        if(error){
            return callback(error);
        }

        socket.join(user.room);
        socket.emit("message",generateMessage("Admin",`Welcome!`));
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin",`${user.username} has joined!`));
        io.to(user.room).emit("roomData",{
            room :user.room,
            users: getUserInRoom(user.room)
        })
        callback();
    })

    socket.on("newMessage",(sms,callback)=>{
        const user = getUser(socket.id);
        let filter = new Filter();
        if(filter.isProfane(sms)){
            return callback("Profane is now Allowed!");
        }
       
        io.to(user.room).emit("message",generateMessage(user.username,sms));
        callback();
    })

    socket.on("location",(location,callback)=>{
        const user = getUser(socket.id);

        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://www.google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })
     
    socket.on("disconnect",()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit("message",generateMessage('Admin',`${user.username} has left!`));
            io.to(user.room).emit("roomData",{
            room :user.room,
            users: getUserInRoom(user.room)
        })
        }
    })
});

server.listen(port ,()=>{
    console.log(`Server is running at ${port}`);
});