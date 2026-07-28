const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roleOrCity: { type: String, default: 'Client' },
    message: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' }, // Requires admin approval
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);