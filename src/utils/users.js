const users=[]
const addUser = ({id,username,room})=>{
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if(!username || !room){
        return {
            error : "User name and Room are required!"
        }
    }

    const existingUser = users.find(user=>{
        return user.username == username && user.room ==room
    })
    //Check the existing user
    if(existingUser){
         return {
             error : "User is in use!"
         }
    }

    //store user
    const user = { id ,username,room};
    users.push(user)
    return { user} 
};
 //remove user
const removeUser = (id)=>{
    const index = users.findIndex(user=>user.id==id)
    if(index!== -1){
        return users.splice(index,1)[0]
    }
}

//get user
const getUser = (id)=>{
    return user = users.find(user=>user.id==id);
}
//get User in Room
const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase();
    return room = users.filter(user=>user.room==room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}