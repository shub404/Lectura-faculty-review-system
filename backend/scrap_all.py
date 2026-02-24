import requests
from bs4 import BeautifulSoup
import json
import re

# MATCHED 100% TO YOUR React SchoolsGrid.jsx ARRAY
schools = {
    "School of Civil Engineering": "https://sastra.edu/staffprofiles/schools/civil.php",
    "School of Computing": "https://sastra.edu/staffprofiles/schools/soc.php",
    "School of Electrical & Electronics Engineering": "https://sastra.edu/staffprofiles/schools/seee.php",
    "School of Mechanical Engineering": "https://sastra.edu/staffprofiles/schools/mech.php",
    "School of Chemical & Biotechnology": "https://sastra.edu/staffprofiles/schools/scbt.php",
    "School of Management": "https://sastra.edu/staffprofiles/schools/som.php",
    "School of Arts, Science and Humanities": "https://sastra.edu/staffprofiles/schools/shs.php",
    "CeNTAB": "https://sastra.edu/staffprofiles/schools/centab.php",
    "CARISM": "https://sastra.edu/staffprofiles/schools/carism.php",
    "School of Law": "https://sastra.edu/staffprofiles/schools/law.php",
    "Corporate Relations / Training & Placement": "https://sastra.edu/staffprofiles/schools/tp.php",
    "Distance Education": "https://sastra.edu/staffprofiles/schools/dde.php",
    "Srinivasa Ramanujan Centre": "https://sastra.edu/staffprofiles/schools/src.php"
}

# Mapping email domains to departments to fix the "General" issue
domain_map = {
    "it": "Information Technology",
    "cse": "Computer Science",
    "ict": "ICT",
    "mech": "Mechanical Engineering",
    "civil": "Civil Engineering",
    "src": "Srinivasa Ramanujan Centre",
    "law": "Law",
    "mgt": "Management",
    "maths": "Mathematics",
    "phy": "Physics",
    "chy": "Chemistry",
    "bio": "Biotechnology"
}

all_faculty = []
seen_ids = set()
headers = {'User-Agent': 'Mozilla/5.0'}

print("🚀 Syncing data with React Frontend...")

for school_name, url in schools.items():
    print(f"Processing: {school_name}")
    try:
        res = requests.get(url, headers=headers, timeout=10)
        # Pre-clean the email image tags before parsing
        html = re.sub(r'<img[^>]+atsym\.jpg[^>]*>', '@', res.text)
        soup = BeautifulSoup(html, 'html.parser')
        
        # Look for cards
        cards = soup.find_all('div', class_=re.compile(r'card', re.I))
        
        for card in cards:
            # 1. Extract Name
            name_tag = card.find('h1')
            if not name_tag: continue
            name = name_tag.get_text(strip=True)
            
            # 2. Staff ID & Image
            img_tag = card.find('img')
            img_src = img_tag.get('src', '') if img_tag else ""
            staff_id = img_src.split('/')[-1].replace('.jpg', '')
            
            if staff_id in seen_ids or not staff_id: continue
            seen_ids.add(staff_id)

            # 3. Designation, Department, Email
            # Default values
            designation = "Faculty"
            department = "General"
            email = "No email provided"
            
            # Clean up card text for easier searching
            card_text_blob = card.get_text(separator='|', strip=True)
            lines = [l.strip() for l in card_text_blob.split('|')]
            
            # Find Email
            email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', card_text_blob)
            if email_match:
                email = email_match.group(0).lower()

            # Find Designation (usually the line after the name)
            if len(lines) > 1:
                for line in lines[1:]:
                    if "@" not in line and len(line) > 3:
                        designation = line
                        break

            # 4. Deep Search for Department in Modal
            modal = soup.find(id=re.compile(f"modal-{staff_id}", re.I))
            if modal:
                table = modal.find('table')
                if table:
                    for row in table.find_all('tr'):
                        cells = row.find_all(['td', 'th'])
                        if len(cells) >= 2:
                            header = cells[0].get_text().lower()
                            val = cells[1].get_text(strip=True)
                            if "department" in header: department = val
                            elif "designation" in header: designation = val

            # 5. Smart Fallback for Department from Email
            if department == "General" and "@" in email:
                domain_part = email.split('@')[1].split('.')[0]
                if domain_part in domain_map:
                    department = domain_map[domain_part]

            all_faculty.append({
                "name": name,
                "designation": designation,
                "department": department,
                "email": email,
                "school": school_name, # THIS MATCHES YOUR REACT PROPS
                "imageUrl": f"https://sastra.edu/staffprofiles/upload/{staff_id}.jpg"
            })
            
    except Exception as e:
        print(f"Skipping {school_name} due to error: {e}")

# Save to JSON
with open('seedData.json', 'w', encoding='utf-8') as f:
    json.dump(all_faculty, f, indent=2, ensure_ascii=False)

print(f"\n✅ Done! Scraped {len(all_faculty)} profiles.")
print("👉 Now run 'node seed.js' and check your website!")