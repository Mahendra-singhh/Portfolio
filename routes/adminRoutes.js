const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Content = require('../models/Content');

// Configure Multer Storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({ storage });

// Helper to get or create content document
const getContentDoc = async () => {
    let content = await Content.findOne();
    if (!content) {
        content = new Content();
        await content.save();
    }
    return content;
};

// 1. Update Profile & Bio Details
router.post('/profile', async (req, res) => {
    try {
        const content = await getContentDoc();
        content.profile = { ...content.profile, ...req.body };
        await content.save();
        res.json({ success: true, message: 'Profile updated successfully!', data: content.profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Upload Profile Picture
router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const content = await getContentDoc();
        content.profile.profilePic = '/uploads/' + req.file.filename;
        await content.save();
        res.json({ success: true, message: 'Profile picture updated!', url: content.profile.profilePic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Update Pricing Plans
router.post('/pricing', async (req, res) => {
    try {
        const content = await getContentDoc();
        content.pricing = req.body.pricing;
        await content.save();
        res.json({ success: true, message: 'Pricing plans updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Add Certification
router.post('/certifications', async (req, res) => {
    try {
        const content = await getContentDoc();
        content.certifications.push(req.body);
        await content.save();
        res.json({ success: true, message: 'Certification added successfully!', certifications: content.certifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Upload & Add Gallery Item
router.post('/upload-gallery', upload.single('galleryImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
        const content = await getContentDoc();
        content.gallery.push({
            title: req.body.title || 'Yoga Image',
            imageUrl: '/uploads/' + req.file.filename
        });
        await content.save();
        res.json({ success: true, message: 'Gallery image uploaded successfully!', gallery: content.gallery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Delete Gallery Item
router.delete('/gallery/:id', async (req, res) => {
    try {
        const content = await getContentDoc();
        content.gallery = content.gallery.filter(item => item._id.toString() !== req.params.id);
        await content.save();
        res.json({ success: true, message: 'Image removed from gallery!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// In routes/adminRoutes.js
const express = require('express');
const router = express.Router();
// Assuming you have an Admin model or config file
const fs = require('fs');
const path = require('path');

// Route to update credentials
router.post('/change-credentials', (req, res) => {
    const { newUsername, newPassword } = req.body;

    if (!newUsername || !newPassword) {
        return res.status(400).json({ message: 'Both username and password are required.' });
    }

    // Example using .env file / environment variable updates or JSON store:
    // Update process.env for current session
    process.env.ADMIN_USER = newUsername;
    process.env.ADMIN_PASS = newPassword;

    // Optional: Persist to a JSON config or database so changes survive restarts
    const configPath = path.join(__dirname, '../config/adminConfig.json');
    fs.writeFileSync(configPath, JSON.stringify({ ADMIN_USER: newUsername, ADMIN_PASS: newPassword }));

    res.json({ message: 'Admin credentials updated successfully!' });
});

module.exports = router;