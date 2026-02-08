const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config(); // Load environment variables

const { initializeDatabase, db } = require('./database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const requestRoutes = require('./routes/requests');
const aiAssistantRoutes = require('./routes/ai-assistant');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'blood-donor-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiAssistantRoutes);

// WebSocket connection handling
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Broadcast function for real-time updates
function broadcastUpdate(type, data) {
    const message = JSON.stringify({ type, data });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Make broadcast available globally
global.broadcastUpdate = broadcastUpdate;

// Enhanced request creation endpoint with broadcast
app.post('/api/requests', (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        if (data.success && data.request) {
            // Broadcast new request to all connected clients
            broadcastUpdate('new_request', data.request);
        }
        return originalJson(data);
    };
    next();
});

// Health check endpoint for deployment platform
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🩸 Blood Donor Management System                         ║
║  Server running on http://localhost:${PORT}                   ║
║  WebSocket server ready for real-time updates             ║
╚════════════════════════════════════════════════════════════╝
  `);
});
