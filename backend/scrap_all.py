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

domain_map = {
    "it": "Information Technology", "cse": "Computer Science", "ict": "ICT",
    "mech": "Mechanical Engineering", "civil": "Civil Engineering", "src": "Srinivasa Ramanujan Centre",
    "law": "Law", "mgt": "Management", "maths": "Mathematics", "phy": "Physics",
    "chy": "Chemistry", "bio": "Biotechnology"
}

all_faculty = []
seen_ids = set()
headers = {'User-Agent': 'Mozilla/5.0'}

print("🚀 Extracting full profiles (including Qualifications & Interests)...")

for school_name, url in schools.items():
    print(f"Processing: {school_name}")
    try:
        res = requests.get(url, headers=headers, timeout=10)
        
        html = re.sub(r'<img[^>]+atsym\.jpg[^>]*>', '@', res.text)
        soup = BeautifulSoup(html, 'html.parser')
        
        cards = soup.find_all('div', class_=re.compile(r'card', re.I))
        
        for card in cards:
            name_tag = card.find('h1')
            if not name_tag: continue
            name = name_tag.get_text(strip=True)
            
            img_tag = card.find('img')
            img_src = img_tag.get('src', '') if img_tag else ""
            staff_id = img_src.split('/')[-1].replace('.jpg', '')
            
            if staff_id in seen_ids or not staff_id: continue
            seen_ids.add(staff_id)

            # --- NEW DEFAULT VALUES ADDED HERE ---
            designation = "Faculty"
            department = "General"
            email = "No email provided"
            qualifications = "Not provided"
            areas_of_interest = "Not provided"
            
            card_text_blob = card.get_text(separator='|', strip=True)
            lines = [l.strip() for l in card_text_blob.split('|')]
            
            email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', card_text_blob)
            if email_match:
                email = email_match.group(0).lower()

            if len(lines) > 1:
                for line in lines[1:]:
                    if "@" not in line and len(line) > 3:
                        designation = line
                        break

            modal_element = soup.find(id=re.compile(rf"^modal-{staff_id}$", re.I))
            table = None
            
            if modal_element:
                if modal_element.name == 'input':
                    wrapper = modal_element.find_next_sibling('div')
                    if wrapper: table = wrapper.find('table')
                else:
                    table = modal_element.find('table')
            
            if table:
                for row in table.find_all('tr'):
                    th = row.find('th')
                    td = row.find('td')
                    
                    if th and td:
                        header_text = th.get_text(strip=True).lower()
                        cell_text = td.get_text(strip=True)
                        
                        # --- NEW CONDITIONS ADDED HERE ---
                        if "department" in header_text:
                            department = cell_text
                        elif "designation" in header_text:
                            designation = cell_text
                        elif "qualification" in header_text:
                            qualifications = cell_text
                        elif "interest" in header_text:
                            areas_of_interest = cell_text

            if department == "General" and "@" in email:
                domain_part = email.split('@')[1].split('.')[0]
                if domain_part in domain_map:
                    department = domain_map[domain_part]

            # --- APPENDING THE NEW FIELDS TO JSON ---
            all_faculty.append({
                "name": name,
                "designation": designation,
                "department": department,
                "email": email,
                "qualifications": qualifications,
                "areasOfInterest": areas_of_interest,
                "school": school_name,
                "imageUrl": f"https://sastra.edu/staffprofiles/upload/{staff_id}.jpg"
            })
            
    except Exception as e:
        print(f"Skipping {school_name} due to error: {e}")

with open('seedData.json', 'w', encoding='utf-8') as f:
    json.dump(all_faculty, f, indent=2, ensure_ascii=False)

print(f"\n✅ Done! Scraped {len(all_faculty)} profiles with Qualifications and Interests.")