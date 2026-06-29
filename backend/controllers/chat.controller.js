const ChatModel = require('../models/chat.model');
const UserModel = require('../models/user.model');

const onlineUsers = new Map(); // key = socket.id, value = username

function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('a user connected');

        // Handle when a user joins and sets their username
        socket.on('user joined', (username) => {
            if (!username) return;

            // Verify user actually exists in user store
            if (!UserModel.exists(username)) {
                socket.emit('error_message', 'Authentication failed. Please log in again.');
                return;
            }

            socket.username = username; // Store username in socket
            onlineUsers.set(socket.id, username); // Map of online users
            console.log(`${username} joined the chat`);

            // Join a personal room named after the username
            socket.join(`user:${username}`);

            // Broadcast updated list of online users (uniqued list)
            const uniqueOnlineUsers = Array.from(new Set(onlineUsers.values()));
            io.emit('update users list', uniqueOnlineUsers);

            // Send system message to all users
            io.emit('chat message', {
                type: 'system',
                text: `${username} joined the chat`
            });
        });

        // Handle joining a 1-to-1 room
        socket.on('join room', (targetUsername) => {
            if (!socket.username) return;

            // Create a unique room name for this conversation (alphabetical order)
            const roomName = `room:${[socket.username, targetUsername].sort().join('-')}`;

            // Leave other room:* rooms
            Array.from(socket.rooms).forEach(r => {
                if (r.startsWith('room:') && r !== roomName) {
                    socket.leave(r);
                }
            });

            // Join the room
            socket.join(roomName);
            console.log(`${socket.username} joined room: ${roomName}`);

            // Retrieve history using the model
            const history = ChatModel.getRoomHistory(roomName);

            // Send history to client
            socket.emit('room history', {
                room: roomName,
                target: targetUsername,
                history: history
            });
        });

        // Handle private message
        socket.on('private message', (msgData) => {
            const { target, text, files } = msgData;
            if (!socket.username || !target) return;

            const room = `room:${[socket.username, target].sort().join('-')}`;
            console.log(`private message from ${socket.username} to ${target} (room ${room}): ${text || ''} (${files ? files.length : 0} files)`);

            const newMsg = {
                type: 'user',
                room: room,
                sender: socket.username,
                receiver: target,
                text: text || '',
                files: files || [],
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            // Save to history using model
            ChatModel.addMessage(room, newMsg);

            // Emit to both user rooms
            io.to(`user:${socket.username}`).to(`user:${target}`).emit('chat message', newMsg);
        });

        socket.on('disconnect', () => {
            if (socket.username) {
                console.log(`${socket.username} disconnected`);
                onlineUsers.delete(socket.id);
                
                // Broadcast updated list
                const uniqueOnlineUsers = Array.from(new Set(onlineUsers.values()));
                io.emit('update users list', uniqueOnlineUsers);
                
                // Send system message
                io.emit('chat message', {
                    type: 'system',
                    text: `${socket.username} left the chat`
                });
            } else {
                console.log('a user disconnected');
            }
        });
    });
}

module.exports = { registerSocketHandlers };
