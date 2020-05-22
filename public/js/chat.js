const socket = io()

// socket.on('countUpdated' , (count)=>{
//     console.log('count updated & new count is' , count)
// })

// document.querySelector('#increment').addEventListener("click", () => {
//     console.log('Clicked')
//     socket.emit('increment')

    
// })

      
//Templates
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//options
const {username , room} = Qs.parse( location.search , {ignoreQueryPrefix : true} )


const autoscroll = ()=>{

    //New message element,  $ to store element
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //  console.log(newMessageMargin)

    //visible height
    
    const visibleHeight = $messages.offsetHeight

    //height of messages container

    const containerHeight = $messages.scrollHeight

    //how far i scrolled

   const scrollOffset = $messages.scrollTop + visibleHeight

   if(containerHeight - newMessageHeight <= scrollOffset){

    $messages.scrollTop = $messages.scrollHeight
   }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        Username:message.username,
        message :message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    
    autoscroll()
})

socket.on('locationmessage' ,(location)=>{
    console.log(location)
    const html = Mustache.render(locationMessageTemplate,{
        Username:location.username,
        url:location.url,
        sharedAt: moment(location.sharedAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()
})


document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    //disable as soon as clicked
    document.querySelector('#message-form').querySelector('button').setAttribute('disabled' , 'disabled')


    const message = e.target.elements.message.value

    socket.emit('sendMessage', message,(err)=>{

        //enable

        document.querySelector('#message-form').querySelector('button').removeAttribute('disabled')
        document.querySelector('#message-form').querySelector('input').value=""    
        document.querySelector('#message-form').querySelector('input').focus()
        if(err){
            console.log('your message not deliverd ',err)    
        }
        else
        console.log('your message deliverd ')
    })
})

document.querySelector('#send-location').addEventListener('click' , ()=>{
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{

            latitude : position.coords.latitude,
            longitude : position.coords.longitude 
        } ,()=>{

            console.log('location shared')
        })
    })

})

socket.emit('join' , { username , room },(error)=>{
    
    if(error){
        alert(error)
        location.href='/'

    }
})

socket.on('roomData' , ({room , users})=>{

    const template = document.querySelector('#sidebar-template').innerHTML

    const html = Mustache.render(template , {
        room,
        users

    })

    //document.querySelector('#chat__sidebar').innerHTML=html
    document.querySelector('#sidebar').innerHTML = html
})

