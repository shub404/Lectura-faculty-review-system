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

    for (let i = 0; i < facultyData.length; i++) {
      const f = facultyData[i];

      const sanitizedData = {
        name: f.name || "Unknown",
        school: f.school || "General",
        imageUrl: f.imageUrl || "",
        department: f.department && f.department !== "General"
          ? f.department
          : (f.dept || "General"),
        designation: f.designation && f.designation !== "Faculty"
          ? f.designation
          : (f.desig || "Faculty"),
        email: f.email || "No email provided",
        qualifications: f.qualifications || "Not provided",
        areasOfInterest: f.areasOfInterest || "Not provided",
        order: i
      };

      await Faculty.updateOne(
        { email: sanitizedData.email }, // email is unique — avoids name collision
        { $set: sanitizedData },
        { upsert: true }
      );
    }

    console.log(`✅ Faculty data synced without deleting reviews.`);

    mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();