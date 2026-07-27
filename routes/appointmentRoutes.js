const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// @route   POST /api/appointments
// @desc    Book a new appointment with duplicate check
router.post('/', async (req, res) => {
    try {
        const {
            name,
            whatsappNumber,
            email,
            appointmentDate,
            appointmentTime,
            concern,
            ageGroup,
            gender
        } = req.body;

        // 1. Prevent booking for past dates
        const selectedDate = new Date(appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book an appointment for a past date.'
            });
        }

        // 2. Prevent Multiple Appointments on the same date for same Email or WhatsApp
        const existingAppointment = await Appointment.findOne({
            appointmentDate,
            $or: [{ email: email.toLowerCase() }, { whatsappNumber }]
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'You already have an appointment booked for this date!'
            });
        }

        const newAppointment = new Appointment({
            name,
            whatsappNumber,
            email: email.toLowerCase(),
            appointmentDate,
            appointmentTime,
            concern,
            ageGroup,
            gender
        });

        await newAppointment.save();

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully!',
            data: newAppointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to book appointment.',
            error: error.message
        });
    }
});

// @route   GET /api/appointments
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ appointmentDate: 1 });
        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;