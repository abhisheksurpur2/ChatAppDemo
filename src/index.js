const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage , generateLocationMessage } = require('./utils/messages')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
const filter = require('bad-words')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    


    
    socket.on('join' , ({ username , room},callback)=>{

        const {error , user}= addUser({ id: socket.id , username ,room})
        
        if(error){

            return callback(error)
        }

        
        socket.join(user.room)
        
        socket.emit('message', generateMessage('Welcome '+user.username.toUpperCase()+' !'))   //message 1
    
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username+' has joined !'))    //message 2

        io.to(user.room).emit('roomData' , {

            room: user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
        
    })
    
    
    socket.on('sendMessage', (message,callback) => {     
        const fil = new filter()
        
        if(fil.isProfane(message)){

           return console.log('profanity not allowed')
        }
        const user = getUser(socket.id)
        const obj = generateMessage(user.username , message)
        io.to(user.room).emit('message',obj )        //message 3
        
        callback()
    })
    
    
    socket.on('sendLocation' , (obj,callback)=>{

        const user = getUser(socket.id)

        io.to(user.room).emit('locationmessage' ,generateLocationMessage(user.username,'https://google.com/maps?q='+obj.latitude+','+obj.longitude))
        callback()
    })
    
    socket.on('disconnect' , ()=>{
        
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message' , generateMessage(user.username , user.username+' has left from  '+user.room+' room'))    //message 4
        
            io.to(user.room).emit('roomData' , {

                room: user.room,
                users : getUsersInRoom(user.room)
            })
        }



    })
})



server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})