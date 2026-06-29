const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, '..', 'chat_history.json');

class ChatModel {
    constructor() {
        this.chatHistory = new Map();
        this.loadHistory();
    }

    loadHistory() {
        try {
            if (fs.existsSync(HISTORY_FILE)) {
                const fileContent = fs.readFileSync(HISTORY_FILE, 'utf8');
                if (fileContent.trim()) {
                    const data = JSON.parse(fileContent);
                    this.chatHistory = new Map(Object.entries(data));
                }
            }
        } catch (err) {
            console.error('Error loading chat history:', err);
        }
    }

    saveHistory() {
        try {
            const obj = Object.fromEntries(this.chatHistory);
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(obj, null, 2), 'utf8');
        } catch (err) {
            console.error('Error saving chat history:', err);
        }
    }

    getRoomHistory(roomName) {
        if (!this.chatHistory.has(roomName)) {
            this.chatHistory.set(roomName, []);
        }
        return this.chatHistory.get(roomName);
    }

    addMessage(roomName, message) {
        const history = this.getRoomHistory(roomName);
        history.push(message);
        if (history.length > 100) {
            history.shift();
        }
        this.saveHistory();
        return message;
    }
}

module.exports = new ChatModel();
