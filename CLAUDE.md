File Name: CLAUDE.md

# Lectura - Faculty Insight System

## 📌 Project Overview
Lectura is a comprehensive faculty review and insight platform designed for SASTRA University students.  
It provides detailed profiles of professors across multiple schools (Computing, Civil, SEEE, Mechanical, SCBT, Management, Arts/Science, Law, SRC) along with student ratings, reviews, and specific feedback metrics such as workload, exam alignment, and leniency.

---

## 🗂️ Project Structure
Lectura-faculty-review-system/
  backend/
    models/
      Faculty.js # Mongoose schema definitions
    node_modules/
    scripts/ # Utility and automation scripts
    .env # Backend environment variables
    extracted_faculty.json # Dynamic output from Python scraper
    merge_data.js
    package-lock.json
    package.json
    extract_ids.py # Omni-scraper for all SASTRA schools
    seed.js # Database sync and seeder script
    server.js # Main Express server entry point
    summariser.py # AI/Text summarization logic
    updateImages.js # Image processing / fallback logic
  frontend/
    node_modules/
    public/
    src/ # React components, contexts, and styles
    .gitignore
    eslint.config.js
    index.html
    package-lock.json
    package.json
    README.md
    vite.config.js
  CLAUDE.md # Global AI Instructions
  README.md # Project documentation

---

## 🗄️ Faculty Schema (MongoDB / Mongoose)

The primary data model expects the following structure for each faculty member.  
The seeder must handle missing fields gracefully.

{
  "name": "Dr. NEELAKANTAN TR",
  "designation": "Dean - SoCE & Coordinator, IQAC",
  "department": "Civil",
  "email": "neelakantan@civil.sastra.edu",
  "qualifications": "PhD - Civil Engineering - 1998\rME - Hydrology and Water Resources Engineering - 1993\rBE Civil Engineering - 1991",
  "areasOfInterest": "Water and Environmental Systems, Higher Education Policy, Concrete Technology",
  "school": "School of Civil Engineering",
  "imageUrl": "https://sastra.edu/staffprofiles/upload/C2449.jpg"
}

---

## 🔌 API & External Services

Lectura utilizes the following API layers:

1. **Internal REST API (Node/Express):** - Serves faculty data, reviews, and metrics to the React frontend.
   - Handles database queries via Mongoose.

2. **External Data Scraping:** - Scraper interacts with SASTRA University staff portal endpoints.

3. **AI Summarization API (Python):** - `summariser.py` interacts with Large Language Model (LLM) APIs to process and summarize student reviews.

4. **UI-Avatar API:** - Used as a fallback for missing `imageUrl` values to provide consistent profile UI.

---

## 🛠️ Tech Stack

Frontend:
- React.js (Vite)
- JSX
- Inline CSS / Custom Styles

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose

Data Engineering (Scraper):
- Python 3
- requests
- BeautifulSoup4

Environment:
- Arch Linux (Primary Development Environment)

---

## 🚀 Core Commands

Frontend (React / Vite)
cd frontend
npm install
npm run dev
(Installs dependencies and starts the Vite development server.)

Backend (Node / Express)
cd backend
npm install
npm run dev
(Installs dependencies and starts the backend server, typically using nodemon.)

---

## 🔄 The Data Pipeline (CRUCIAL WORKFLOW)

The SASTRA portal contains inconsistent DOM structures, which can cause incomplete data, duplicates, or broken images. The pipeline must be executed in this order.

1️⃣ Activate Python Environment
cd backend
source venv/bin/activate

2️⃣ Execute Omni-Scraper
python extract_ids.py
This script:
- Accesses multiple SASTRA school endpoints
- Extracts faculty profile identifiers
- Performs deduplication
- Cleans inconsistent titles
- Generates UI-Avatar fallbacks for missing images
- Outputs structured data into: extracted_faculty.json

3️⃣ Seed the Database
node seed.js
The seeder:
- Connects to MongoDB
- Wipes the existing faculties collection
- Inserts cleaned faculty records from extracted_faculty.json
This ensures the database always contains fresh and consistent data.

---

## 🤖 AI Assistant Guidelines & Rules

These rules must always be followed by AI coding assistants.

1️⃣ Code Generation (STRICT RULE)
AI assistants must:
- Ask for the information or pre-existing files to modify code relative to it.
- Provide partial code snippets only if change is small or asked.
- Provide the entire file code if change is large.
- Include the exact file path and file name
Example: File Name: backend/models/Faculty.js

2️⃣ Data Handling & Scraping
The SASTRA portal uses inconsistent HTML structures.
Examples:
- Sometimes names appear in <h3>
- Sometimes designations appear in <h3>
- Some faculty pages omit email fields
- Some faculty profiles reuse images
Therefore:
- Always rely on Two-Pass Reconciliation
- Use Fuzzy Deduplication to remove duplicates
- Never trust raw scraped data without normalization
Critical Rule:
- Never manually edit: seedData.js or extracted_faculty.json
- All corrections must be implemented programmatically in: extract_ids.py or seed.js

3️⃣ Frontend Architecture
Frontend components must follow these guidelines:
- Use React Functional Components
- Use standard hooks: useState, useEffect, useMemo
Image Handling:
- All images must include an onError fallback.
- Example concept: image → if broken → fallback to UI avatar
- This prevents broken UI cards when faculty profile images are missing.
UI Design Philosophy:
- The UI must remain: Fast, Minimal, Scannable
- Students should quickly see: ratings, workload, exam difficulty, review summaries

4️⃣ Backend & Database
Backend rules:
- Always use Mongoose schemas
- Maintain strict schema consistency
- Avoid inserting inconsistent data structures
Seeder Responsibilities:
- The seeder must handle missing fields gracefully.
- Examples: 
  - Field: email -> Default: "Not Provided"
  - Field: department -> Default: "General"
  - Field: imageUrl -> Default: UI-Avatar fallback
- This ensures legacy or incomplete scraped data does not break the database schema.

---

## 📌 Important Development Principles

Automation First:
- Never manually fix scraped data.

Schema Consistency:
- All faculty records must match the Mongoose schema.

Fault-Tolerant Scraping:
- Expect missing or malformed DOM elements.

UI Stability:
- No broken images or empty profile cards.

---

## 🎯 Project Goal

Create a centralized faculty insight platform where SASTRA students can:
- Discover professors
- Evaluate teaching quality
- Understand workload expectations
- Make informed course selections.

The system should prioritize:
- Data accuracy
- Automation
- Fast student usability