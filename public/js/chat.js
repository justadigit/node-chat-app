const socket = io();
//Elements
let $messageForm = document.querySelector("#message-form");
let $messageFormInput = $messageForm.querySelector("input");
let $messageFormButton = $messageForm.querySelector("button");
let $sendLocation = document.querySelector("#shareLocation");
let $messages = document.querySelector("#messages");

//Template
let $messageTemplate = document.querySelector("#message-template").innerHTML;
let $locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});

//socket.io
socket.on("message",(message)=>{
    const html = Mustache.render($messageTemplate,{
        message : message.text,
        createdAt : moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    console.log(message);
});
socket.on("locationMessage",message=>{
    const html = Mustache.render($locationMessageTemplate,{
        url:message.location,
        createdAt:moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    console.log(message);

})
$messageForm.addEventListener("submit",e=>{
    e.preventDefault();
    let newmessage = $messageFormInput.value;
    $messageFormButton.setAttribute("disabled","disabled");
    socket.emit("newMessage",newmessage,(error)=>{
        $messageFormInput.value= "";
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.focus();
        if(error){
           return console.log(error);
        }
        console.log("message Send!");
    });
});
$sendLocation.addEventListener("click",e=>{
    e.preventDefault();
    if(!navigator.geolocation.getCurrentPosition){
        console.log("Your Browser cant support Location");
    }
    navigator.geolocation.getCurrentPosition(location=>{
       socket.emit("location",{
           latitude:location.coords.latitude,
           longitude:location.coords.longitude
       },()=>{
           console.log("Location Shared!");
       });
    });
});
socket.emit("join",{username,room});