const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// ==========================================
// 1. Update Profile & Bio Details
// ==========================================
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

// ==========================================
// 2. Upload Profile Picture
// ==========================================
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

// ==========================================
// 3. Update Pricing Plans
// ==========================================
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

// ==========================================
// 4. Add Certification
// ==========================================
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

// ==========================================
// 5. Upload & Add Gallery Item
// ==========================================
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

// ==========================================
// 6. Delete Gallery Item
// ==========================================
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

// ==========================================
// 7. Change Admin Credentials
// ==========================================
router.post('/change-credentials', (req, res) => {
    try {
        const { newUsername, newPassword } = req.body;

        if (!newUsername || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both username and password are required.' });
        }

        // Update process environment variables for current session
        process.env.ADMIN_USER = newUsername;
        process.env.ADMIN_PASS = newPassword;

        res.json({ success: true, message: 'Admin credentials updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// DELETE Gallery Image
// DELETE Gallery Image using ID or URL parameter
router.delete('/gallery/:idOrIndex', async (req, res) => {
    try {
        const { idOrIndex } = req.params;
        const content = await Content.findOne();

        if (!content || !content.gallery || content.gallery.length === 0) {
            return res.status(404).json({ success: false, message: 'No gallery items found.' });
        }

        let targetItem = null;

        // 1. Try matching by _id or imageUrl first
        targetItem = content.gallery.find(item => 
            (item._id && item._id.toString() === idOrIndex) || 
            (item.imageUrl && encodeURIComponent(item.imageUrl) === encodeURIComponent(idOrIndex))
        );

        // 2. Fallback: If passed a numeric index string
        if (!targetItem && !isNaN(parseInt(idOrIndex, 10))) {
            const idx = parseInt(idOrIndex, 10);
            targetItem = content.gallery[idx];
        }

        if (!targetItem) {
            return res.status(404).json({ success: false, message: 'Target image not found in database.' });
        }

        // 3. Perform direct $pull update in MongoDB (Guaranteed atomic deletion)
        if (targetItem._id) {
            await Content.updateOne(
                { _id: content._id },
                { $pull: { gallery: { _id: targetItem._id } } }
            );
        } else {
            await Content.updateOne(
                { _id: content._id },
                { $pull: { gallery: { imageUrl: targetImage.imageUrl } } }
            );
        }

        return res.json({ success: true, message: 'Image deleted permanently from database!' });
    } catch (err) {
        console.error('Gallery Delete Route Error:', err);
        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});
module.exports = router;