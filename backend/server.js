const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const Faculty = require('./models/Faculty');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error(err));

// 1. Get all faculty for the student directory
app.get('/api/faculty', async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.json(faculties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Health check for frontend status
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success' });
});

// 3. Post a Review (The new Admin/Senior feature)
app.post('/api/faculty/:id/review', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const faculty = await Faculty.findById(req.params.id);
        
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        faculty.reviews.push({ rating, comment });
        
        // Math for the average rating
        const total = faculty.reviews.reduce((sum, r) => sum + r.rating, 0);
        faculty.overallRating = total / faculty.reviews.length;

        await faculty.save();
        res.status(201).json(faculty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));