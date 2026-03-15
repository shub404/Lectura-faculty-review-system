const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const Faculty = require('./models/Faculty');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
}));
app.use(express.json());

app.use('/api/auth', authRouter);

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

app.post('/api/faculty/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    faculty.reviews.push({ ...req.body, adminEmail: req.admin.adminEmail });

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
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    const review = faculty.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.flagged = true;
    await faculty.save();
    res.json({ message: 'Review has been flagged for admin review.', faculty });
  } catch (err) {
    console.error('❌ Flag Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/summarize', (req, res) => {
  const { reviews } = req.body;

  if (!reviews || reviews.length === 0) {
    return res.json({ summary: 'Not enough feedback available.' });
  }

  const python = spawn('python', [path.join(__dirname, 'summariser.py')], {
    cwd: __dirname,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  let summary = '';
  let errorOutput = '';

  python.stdin.write(JSON.stringify(reviews));
  python.stdin.end();

  python.stdout.on('data', (data) => { summary += data.toString(); });
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
      console.error('❌ Python Exit Code:', code, errorOutput);
      return res.status(500).json({ error: 'Summarization failed' });
    }
    res.json({ summary: summary.trim() });
  });
});
