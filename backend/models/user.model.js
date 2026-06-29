const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, '..', 'users.json');

// Ensure users.json exists
function ensureUsersFile() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}), 'utf8');
    }
}

class UserModel {
    static getAll() {
        ensureUsersFile();
        try {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data || '{}');
        } catch (err) {
            console.error('Error reading users file:', err);
            return {};
        }
    }

    static saveAll(users) {
        try {
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
            return true;
        } catch (err) {
            console.error('Error writing users file:', err);
            return false;
        }
    }

    static async create(username, password) {
        const users = this.getAll();
        if (users[username]) {
            throw new Error('User already exists');
        }

        const hash = await bcrypt.hash(password, 10);

        users[username] = {
            username,
            hash
        };

        this.saveAll(users);
        return { username };
    }

    static async authenticate(username, password) {
        const users = this.getAll();
        const user = users[username];
        if (!user) {
            return false;
        }

        return await bcrypt.compare(password, user.hash);
    }

    static exists(username) {
        const users = this.getAll();
        return !!users[username];
    }
}

module.exports = UserModel;
