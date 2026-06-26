const express = require('express');
const { createServer } = require('node:http');
const path = require('path');
const { Server } = require('socket.io');


const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle when a user joins and sets their username
    socket.on('user joined', (username) => {
        socket.username = username;
        console.log(`${username} joined the chat`);
        io.emit('chat message', {
            type: 'system',
            text: `${username} joined the chat`
        });
    });

    // Handle user sending a chat message
    socket.on('chat message', (msgData) => {
        console.log(`message from ${msgData.username}: ${msgData.text}`);
        io.emit('chat message', {
            type: 'user',
            username: msgData.username,
            text: msgData.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`${socket.username} disconnected`);
            io.emit('chat message', {
                type: 'system',
                text: `${socket.username} left the chat`
            });
        } else {
            console.log('a user disconnected');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});