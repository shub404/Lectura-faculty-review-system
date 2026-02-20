const fs = require('fs');
const path = require('path');

// Define the path to your seed data file
const dataPath = path.join(__dirname, 'seedData.json');

const updateImages = () => {
  try {
    // 1. Read the existing JSON file
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const facultyList = JSON.parse(rawData);

    // 2. Loop through and update the imageUrl based on the email
    const updatedList = facultyList.map(faculty => {
      // Check if email exists and is valid
      if (faculty.email && faculty.email.includes('@')) {
        // Extract everything before the '@' symbol
        const emailPrefix = faculty.email.split('@')[0].trim();
        
        // Construct the SASTRA image URL
        // Example: sriram@it.sastra.edu -> sriram -> https://www.sastra.edu/staffprofiles/admin/images/sriram.jpg
        faculty.imageUrl = `https://www.sastra.edu/staffprofiles/admin/images/${emailPrefix}.jpg`;
      } else {
        // Fallback for missing or invalid emails
        faculty.imageUrl = 'https://via.placeholder.com/150';
      }
      return faculty;
    });

    // 3. Write the updated array back to the JSON file
    fs.writeFileSync(dataPath, JSON.stringify(updatedList, null, 2));
    
    console.log(`✅ Successfully updated image URLs for ${updatedList.length} faculty members!`);
    console.log('You can now run "node seed.js" to push these changes to MongoDB.');

  } catch (err) {
    console.error('❌ Error updating images:', err);
  }
};

// Execute the function
updateImages();