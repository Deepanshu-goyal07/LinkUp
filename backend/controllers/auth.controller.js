const UserModel = require('../models/user.model');

class AuthController {
    static async signup(req, res) {
        let { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        username = username.trim();
        password = password.trim();

        if (username.length < 4) {
            return res.status(400).json({ success: false, message: 'Username must be at least 4 characters long' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one number' });
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one special character' });
        }

        try {
            await UserModel.create(username, password);
            return res.status(201).json({ success: true, message: 'Signup successful! Please log in.' });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    static async login(req, res) {
        let { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        username = username.trim();
        password = password.trim();

        const success = await UserModel.authenticate(username, password);
        if (success) {
            return res.status(200).json({ success: true, message: 'Login successful', username });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    }

    static async getNotifications(req, res) {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        try {
            const ChatModel = require('../models/chat.model');
            const notifications = [];

            // Retrieve all messages across all rooms where the receiver matches 'username'
            for (const [roomName, messages] of ChatModel.chatHistory.entries()) {
                const receivedMessages = messages.filter(m => m.receiver === username);
                notifications.push(...receivedMessages);
            }

            return res.status(200).json({ success: true, notifications });
        } catch (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
        }
    }
}

module.exports = AuthController;
