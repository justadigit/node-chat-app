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
let $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});

//autoscroll
const autoscroll = ()=>{

    //New Message Element 
    const $newMessage = $messages.lastElementChild;

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //how far Have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight- newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}
//socket.io
socket.on("message",(message)=>{
    const html = Mustache.render($messageTemplate,{
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
});
socket.on("locationMessage",message=>{
    const html = Mustache.render($locationMessageTemplate,{
        username: message.username,
        url:message.location,
        createdAt:moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    console.log(message);
    autoscroll();

})
socket.on('roomData',({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html;
    autoscroll();
})
$messageForm.addEventListener("submit",e=>{
    e.preventDefault();
    let newmessage = e.target.message.value;
    socket.emit("newMessage",newmessage,(error)=>{
        $messageFormInput.value= "";
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
        return alert("Your Browser cant support Location");
    }
    $sendLocation.setAttribute("disabled","disabled");

    navigator.geolocation.getCurrentPosition(location=>{
       socket.emit("location",{
           latitude:location.coords.latitude,
           longitude:location.coords.longitude
       },()=>{
        $sendLocation.removeAttribute("disabled");
           console.log("Location Shared!");
       });
    });
});
socket.emit("join",{username,room},error=>{
  if(error){
      alert(error)
      location.href="/"
  }
});