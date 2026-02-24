const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('./models/Faculty'); 
const facultyData = require('./seedData.json'); 

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    console.log('Clearing old faculty data...');
    await Faculty.deleteMany({});
    
    const sanitizedData = facultyData.map(f => ({
      name: f.name || "Unknown",
      school: f.school || "General",
      imageUrl: f.imageUrl || "",
      department: f.department && f.department !== "General" ? f.department : (f.dept || "General"),
      designation: f.designation && f.designation !== "Faculty" ? f.designation : (f.desig || "Faculty"),
      email: f.email || "No email provided",
      
      // --- NEW FIELDS ADDED HERE ---
      qualifications: f.qualifications || "Not provided",
      areasOfInterest: f.areasOfInterest || "Not provided",
      // ------------------------------

      overallRating: 0,
      reviews: []
    }));

    console.log(`Inserting ${sanitizedData.length} Faculty members with full profiles...`);
    await Faculty.insertMany(sanitizedData);
    
    console.log(`✅ SUCCESS! ${sanitizedData.length} members updated on Lectura Portal.`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();