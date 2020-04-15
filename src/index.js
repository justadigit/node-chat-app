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

let publicDirectoryPath = (path.join(__dirname,'../public')).replace(/\\/g,'/');

app.use(express.static(publicDirectoryPath));
let count = 0;
io.on("connection",(socket)=>{
    console.log("New WebSocket Connection");

    socket.on("join",({username,room})=>{

        socket.join(room);
        socket.emit("message",generateMessage('Welcome!'));
        socket.broadcast.to(room).emit('message',generateMessage(`${username} has joined!`));
    })

    socket.on("newMessage",(sms,callback)=>{
        let filter = new Filter();
        if(filter.isProfane(sms)){
            return callback("Profane is now Allowed!");
        }
        io.emit("message",generateMessage(sms));
        callback();
    })

    socket.on("location",(location,callback)=>{
        io.emit("locationMessage",generateLocationMessage(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })
     
    socket.on("disconnect",()=>{
        io.emit("message",generateMessage("A user has Left"));
    })
});

server.listen(port ,()=>{
    console.log(`Server is running at ${port}`);
});