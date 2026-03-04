const mongoose = require('mongoose');

// Expanded schema to capture all the new Junior Guidance metrics
const ReviewSchema = new mongoose.Schema({
    // Step 1: Pulse
    satisfaction: { type: Number, required: true },
    recommend: { type: String, required: true },
    attendance: { type: String, required: true },
    approachability: { type: Number, required: true }, // 1-4 Emoji Scale

    // Step 2: Course Reality & Core Metrics
    ratings: {
        clarity: Number,
        syllabus: Number,
        examAlignment: Number // 1-5 Stars
    },
    courseReality: {
        workload: String,
        assignmentFreq: String,
        internalStyle: String,
        backgroundReq: String,
        avgStudentKeepUp: String,
        doubtHandling: String,
        cgpaGoal: String,
        knowledgeGoal: String
    },

    // Step 3: Context
    context: {
        strengths: [String],
        improvements: [String],
        bestSuitedFor: [String],
        learnerType: [String]
    },

    feedback: { type: String, maxlength: 120 }, // Short 120 char line
    adminId: { type: String },
    flagged: { type: Boolean, default: false }, // Report/Flag review feature
    date: { type: Date, default: Date.now }
});

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    school: { type: String, required: true },
    department: { type: String, default: "General" },
    designation: { type: String, default: "Faculty" },
    email: { type: String, default: "" },
    imageUrl: { type: String, default: 'https://via.placeholder.com/150' },
    qualifications: { type: String, default: "" },
    areasOfInterest: { type: String, default: "" },
    order: { type: Number, default: 0 }, // Preserves seedData.json order
    overallRating: { type: Number, default: 0 },
    reviews: [ReviewSchema]
});

module.exports = mongoose.model('Faculty', FacultySchema);