import express from 'express'
// import cors from 'cors'
import bodyparser from 'body-parser'
import { Server } from "socket.io";


const io = new Server(8000, {
    cors: true
});
// const  app = express();
const usernameToSocketMap = new Map();
const socketToUsernameMap = new Map();

// app.use(bodyparser.json());
io.on('connection', socket=>{
    console.log("Socket Connected");
    socket.on('room-join' , (recieved) => {
        const { roomId, username} = recieved;
        // console.log("User", recieved);
        usernameToSocketMap.set(username, socket.id);
        socketToUsernameMap.set(socket.id, username);

        io.to(roomId).emit('user-joined', { username,id: socket.id });
        socket.join(roomId);
        io.to(socket.id).emit('room-join', recieved)
    });

    socket.on('user-call', ({ to, offer }) => {
        // console.log("offer => " + JSON.stringify(offer));
        io.to(to).emit('incoming-call', { from: socket.id, offer });
    });

    socket.on('call-accepted', ({ to, ans }) => {
        // console.log("offer => " + JSON.stringify(offer));
        io.to(to).emit('call-accepted', { from: socket.id, ans });
    });
    socket.on('peer-nego-needed', ({to, offer})=>{
        console.log('peer-nego-needed', offer);
        io.to(to).emit('peer-nego-needed' , {from: socket.id , offer});
    })
    socket.on('peer-nego-done', ({to, ans})=> {
        console.log('peer-nego-done', ans);
        io.to(to).emit('peer-nego-final' , {from: socket.id , ans});

    })

});
// {from : socket.id, offer}


// app.listen('8000', () => {
//     console.log("Listening at port 8000");
// })

io.listen(8001)

