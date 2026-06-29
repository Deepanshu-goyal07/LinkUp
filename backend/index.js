const express = require('express');
const { createServer } = require('node:http');
const path = require('path');
const { Server } = require('socket.io');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random());
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });



// Import routes & socket handlers
const authRoutes = require('./routes/auth.routes');
const { registerSocketHandlers } = require('./controllers/chat.controller');

const app = express();
const server = createServer(app);

// Initialize Socket.io with CORS enabled for frontend dev server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Parse JSON and urlencoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for API routes during frontend dev server testing
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files from the React frontend directory directly
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve uploads folder statically
app.use('/uploads', express.static(uploadsDir));

// Register API routes
app.use('/api', authRoutes);

// File Upload endpoint
app.post('/api/upload', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const fileData = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            url: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size
        }));
        res.json({ success: true, files: fileData });
    } catch (err) {
        console.error('Upload handler error:', err);
        res.status(500).json({ error: 'Failed to upload files' });
    }
});


// Fallback all other routes to frontend index.html
app.get('/(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Register Socket.io events via Chat Controller
registerSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
