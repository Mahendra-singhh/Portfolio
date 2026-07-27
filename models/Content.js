const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    profile: {
        name: { type: String, default: 'Puneesh Kumar' },
        title: { type: String, default: 'Yoga Trainer | Wellness Expert' },
        tagline: { type: String, default: 'Teaching yoga to every age group.' },
        bio: { type: String, default: 'Certified Yoga Trainer and Wellness Expert with over 5 years of experience.' },
        profilePic: { type: String, default: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600' },
        reviewsScore: { type: String, default: '4.9 / 5' },
        clientsCount: { type: String, default: '2000+' },
        experience: { type: String, default: '5+ Years' },
        languages: { type: String, default: 'Hindi & English' },
        email: { type: String, default: 'puneexxxxxxx@gmail.com' },
        phone: { type: String, default: 'xxxxx25273' },
        location: { type: String, default: '110043' }
    },
    certifications: [
        {
            title: String,
            description: String
        }
    ],
    pricing: [
        {
            planName: String,
            price: String,
            popular: Boolean,
            features: [String]
        }
    ],
    gallery: [
        {
            title: String,
            imageUrl: String
        }
    ]
});

module.exports = mongoose.model('Content', contentSchema);