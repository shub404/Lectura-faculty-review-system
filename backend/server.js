const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { spawn } = require('child_process');   // 🔥 ADD THIS
const Faculty = require('./models/Faculty');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

/* ============================================================
   GET ALL FACULTY
============================================================ */
app.get('/api/faculty', async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================
   ADD REVIEW
============================================================ */
app.post('/api/faculty/:id/reviews', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    faculty.reviews.push(req.body);

    // Recalculate overall rating
    if (faculty.reviews.length > 0) {
      const totalSatisfaction = faculty.reviews.reduce(
        (sum, rev) => sum + (rev.satisfaction || 0), 
        0
      );
      faculty.overallRating = (totalSatisfaction / faculty.reviews.length).toFixed(1);
    }

    await faculty.save();
    res.json(faculty);

  } catch (err) {
    console.error('❌ Mongoose Save Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================
   🤖 AI SUMMARIZATION ROUTE
============================================================ */
app.post('/api/summarize', (req, res) => {
  const { comments } = req.body;

  if (!comments || comments.length === 0) {
    return res.json({ summary: "Not enough feedback available." });
  }

  // 🔥 Make sure this path is correct
    const python = spawn('py', ['-3.13', 'summariser.py'], {
        cwd: __dirname
    });

  let summary = '';
  let errorOutput = '';

  // Send comments to Python
  python.stdin.write(JSON.stringify(comments));
  python.stdin.end();

  // Capture Python output
  python.stdout.on('data', (data) => {
    summary += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Python Error:', errorOutput);
      return res.status(500).json({ error: 'Summarization failed' });
    }

    res.json({ summary: summary.trim() });
  });
});


/* ============================================================
   START SERVER
============================================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));