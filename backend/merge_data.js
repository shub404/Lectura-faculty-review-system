const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'seedData.json');
const EXTRACTED_PATH = path.join(__dirname, 'extracted_faculty.json');

const mergeData = () => {
  try {
    // 1. Load both files
    const existingData = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
    const extractedData = JSON.parse(fs.readFileSync(EXTRACTED_PATH, 'utf-8'));

    console.log(`Merging ${extractedData.length} extracted items into ${existingData.length} existing items...`);

    // 2. Map existing data by name for easy lookup
    const existingMap = new Map(existingData.map(f => [f.name.toLowerCase(), f]));

    // 3. Process extracted data
    extractedData.forEach(newFaculty => {
      const key = newFaculty.name.toLowerCase();
      
      if (existingMap.has(key)) {
        // Update ONLY the imageUrl if the faculty already exists
        const current = existingMap.get(key);
        current.imageUrl = newFaculty.imageUrl;
      } else {
        // Add as a new entry if they don't exist
        existingData.push({
          ...newFaculty,
          designation: "Faculty", // Placeholder
          email: "",              // Placeholder
          overallRating: 0,
          reviews: []
        });
      }
    });

    // 4. Save the merged result back to seedData.json
    fs.writeFileSync(SEED_PATH, JSON.stringify(existingData, null, 2));
    
    console.log(`✅ Merge Complete! Final count in seedData.json: ${existingData.length}`);
    console.log(`Run "node seed.js" to update your MongoDB now.`);

  } catch (err) {
    console.error("❌ Error merging data:", err);
  }
};

mergeData();