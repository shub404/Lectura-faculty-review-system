const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Faculty = require('./models/Faculty');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// GET all faculty
app.get('/api/faculty', async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.json(faculties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new rich review
// POST a new rich review
app.post('/api/faculty/:id/reviews', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ error: "Faculty not found" });

        // Push the new rich review data object from the frontend
        faculty.reviews.push(req.body);

        // Safely recalculate the overall rating
        if (faculty.reviews.length > 0) {
            const totalSatisfaction = faculty.reviews.reduce((sum, rev) => sum + (rev.satisfaction || 0), 0);
            faculty.overallRating = (totalSatisfaction / faculty.reviews.length).toFixed(1);
        }

        await faculty.save(); // This is where MongoDB validates the schema
        res.json(faculty);
    } catch (err) {
        // Log the exact Mongoose Validation Error to the terminal
        console.error('❌ Mongoose Save Error:', err.message); 
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));