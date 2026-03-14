const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const path = require('path');
const Faculty = require('./models/Faculty');
const PORT = process.env.PORT || 5000;
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB and start server only after connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });
app.get('/api/faculty', async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ order: 1 });
    res.json(faculties);
  } catch (err) {
    console.error('❌ Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/faculty/:id/reviews', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    faculty.reviews.push(req.body);

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


app.post('/api/faculty/:facultyId/reviews/:reviewId/flag', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.facultyId);
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    const review = faculty.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    review.flagged = true;
    await faculty.save();
    res.json({ message: "Review has been flagged for admin review.", faculty });

  } catch (err) {
    console.error('❌ Flag Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/summarize', (req, res) => {
  const { reviews } = req.body;

  if (!reviews || reviews.length === 0) {
    return res.json({ summary: "Not enough feedback available." });
  }

  const pythonExecutable = 'python';

  const python = spawn(pythonExecutable, [path.join(__dirname, 'summariser.py')], {
    cwd: __dirname,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  let summary = '';
  let errorOutput = '';

  python.stdin.write(JSON.stringify(reviews));
  python.stdin.end();

  // Capture Python output
  python.stdout.on('data', (data) => {
    summary += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error(`[Python Log]: ${data.toString().trim()}`);
  });

  python.on('error', (err) => {
    console.error('❌ Python Spawn Error:', err);
    res.status(500).json({ error: 'Failed to start AI engine' });
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Python Exit Code:', code);
      console.error('❌ Python Error:', errorOutput);
      return res.status(500).json({ error: 'Summarization failed' });
    }

    console.log("✅ AI Summary:", summary);
    res.json({ summary: summary.trim() });
  });
});
