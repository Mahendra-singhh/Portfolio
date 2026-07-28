const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointmentRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Ensure 'public/uploads' directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ADMIN AUTHENTICATION MIDDLEWARE ---
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Puneesh@2026'; // Change your password here or in .env

const requireAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel Access"');
        return res.status(401).send('Authentication required to access Admin Panel.');
    }

    // Decode credentials from Base64
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel Access"');
    return res.status(401).send('Invalid username or password.');
};
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// HTML Page Fallback Routes
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/testimonials', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'testimonials.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Protect admin API endpoints and admin HTML page
app.get('/admin', requireAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin.html', requireAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use('/api/admin', requireAdminAuth, adminRoutes);

// Serve static assets from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/content', contentRoutes);

// Direct HTML Fallback Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});