

const generateMessage=(uname,txt)=>{

    return {
        username:uname,    
        text:txt,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (uname , url)=>{

    return {
        username:uname,
        url:url,
        sharedAt:new Date().getTime()

    }
}

module.exports = { generateMessage ,generateLocationMessage }