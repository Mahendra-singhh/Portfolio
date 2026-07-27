const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// Get all site content
router.get('/', async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            // Seed initial default content if none exists
            content = new Content({
                certifications: [
                    { title: 'Diploma in Yoga', description: 'Certified foundation and advanced practices' },
                    { title: 'TTC', description: 'Certified professional teacher training course' }
                ],
                pricing: [
                    { planName: 'Basic Plan', price: '₹199', popular: false, features: ['Quick Guidance', 'Basic Consultation'] },
                    { planName: 'Premium Plan', price: '₹499', popular: true, features: ['Health Plan', 'Complete Support'] },
                    { planName: 'Advance Plan', price: '₹1999', popular: false, features: ['Full Plan & Routine', 'Priority Support'] }
                ],
                gallery: [
                    { title: 'Morning Flow Session', imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600' }
                ]
            });
            await content.save();
        }
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;