const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    school: { type: String, required: true }, 
    department: { type: String, required: false, default: "General" }, // Changed to optional
    designation: { type: String, required: false, default: "Faculty" }, 
    email: { type: String, default: "" },
    imageUrl: { type: String, default: 'https://via.placeholder.com/150' },
    qualifications: { type: String, default: "" },
    areasOfInterest: { type: String, default: "" },
    overallRating: { type: Number, default: 0 },
    reviews: [{
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Faculty', FacultySchema);