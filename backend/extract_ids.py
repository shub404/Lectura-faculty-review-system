import requests
from bs4 import BeautifulSoup
import json
import re

schools = {
    "School of Computing": "https://sastra.edu/staffprofiles/schools/soc.php",
    "School of Civil Engineering": "https://sastra.edu/staffprofiles/schools/civil.php",
    "School of Electrical & Electronics Engineering": "https://sastra.edu/staffprofiles/schools/seee.php",
    "School of Mechanical Engineering": "https://sastra.edu/staffprofiles/schools/mech.php",
    "Tata Power": "https://sastra.edu/staffprofiles/schools/tp.php",
    "Srinivasa Ramanujan Centre": "https://sastra.edu/staffprofiles/schools/src.php",
    "School of Law": "https://sastra.edu/staffprofiles/schools/law.php",
    "CARISM": "https://sastra.edu/staffprofiles/schools/carism.php",
    "School of Humanities & Sciences": "https://sastra.edu/staffprofiles/schools/shs.php",
    "School of Chemical & Biotechnology": "https://sastra.edu/staffprofiles/schools/scbt.php",
    "School of Management": "https://sastra.edu/staffprofiles/schools/som.php"
}

all_data = []

print("Starting Universal Faculty Extraction...")

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

for school_name, url in schools.items():
    print(f"Scraping {school_name}...")
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # --- FIX 1: The Pre-Processor ---
        # Intercept the raw HTML and replace image-based '@' symbols with real text BEFORE parsing
        raw_html = response.text
        raw_html = re.sub(r'<img[^>]*atsym[^>]*>', '@', raw_html, flags=re.IGNORECASE)
        raw_html = re.sub(r'\[at\]', '@', raw_html, flags=re.IGNORECASE)
        
        soup = BeautifulSoup(raw_html, 'html.parser')
        
        # Find all faculty images to use as our anchor points
        images = soup.find_all('img', src=re.compile(r'upload/.*\.jpg', re.I))
        if not images:
            print(f"  -> ❌ No images found.")
            continue
        
        school_faculty_count = 0

        for img in images:
            img_src = img.get('src', '')
            staff_id = img_src.split('/')[-1].replace('.jpg', '')
            image_url = f"https://sastra.edu/staffprofiles/upload/{staff_id}.jpg"

            # Climb DOM to find the specific container for this faculty
            container = img.parent
            card = container
            while container and container.name != 'body':
                if len(container.find_all('img', src=re.compile(r'upload/.*\.jpg', re.I))) > 1:
                    break 
                card = container
                container = container.parent
            
            if not card: continue
                
            # Extract clean lines of text from the card
            text_lines = [line.strip() for line in card.get_text(separator='\n').split('\n') if line.strip()]
            if not text_lines: continue
                
            faculty = {
                "name": text_lines[0], 
                "designation": "Faculty", 
                "email": "",
                "school": school_name, 
                "department": "General", 
                "imageUrl": image_url,
                "overallRating": 0,
                "reviews": []
            }
            
            # --- FIX 2: Universal Card Text Parser ---
            for i, line in enumerate(text_lines):
                lower_line = line.lower()
                
                # Check explicitly for Department labels
                if "department" in lower_line and ":" in lower_line:
                    faculty["department"] = line.split(":", 1)[-1].strip()
                elif lower_line == "department" and i + 1 < len(text_lines):
                    faculty["department"] = text_lines[i+1]
                    
                # Check explicitly for Designation labels
                if "designation" in lower_line and ":" in lower_line:
                    faculty["designation"] = line.split(":", 1)[-1].strip()
                elif lower_line == "designation" and i + 1 < len(text_lines):
                    faculty["designation"] = text_lines[i+1]
                    
                # Look for email footprint
                if "sastra.edu" in lower_line:
                    clean_email = line.split(":")[-1].strip().replace(" ", "").replace('•', '@')
                    if "@" not in clean_email and clean_email.endswith("sastra.edu"):
                        pass # Kept as is if they just typed 'name.sastra.edu'
                    faculty["email"] = clean_email

            # Unlabelled Designation Fallback (Usually the 2nd line right under the name)
            if faculty["designation"] == "Faculty" and len(text_lines) > 1:
                line2 = text_lines[1]
                if not any(x in line2.lower() for x in ["sastra.edu", "department", "school"]):
                    faculty["designation"] = line2
                    
            # Handle combined text strings like "Asst. Professor • CSE"
            if " • " in faculty["designation"] or " | " in faculty["designation"]:
                parts = faculty["designation"].replace("|", "•").split("•")
                faculty["designation"] = parts[0].strip()
                if faculty["department"] == "General" and len(parts) > 1:
                    faculty["department"] = parts[1].strip()

            # --- FIX 3: The Hidden Modal Hunter ---
            # If department or email is STILL missing, scan the hidden tables linked to this ID
            if faculty["department"] == "General" or faculty["email"] == "":
                # Find the hidden input trigger for this specific staff ID
                modal_trigger = soup.find(id=re.compile(f"modal-{staff_id}", re.I))
                
                if modal_trigger:
                    # The modal content wrapper is usually the immediate sibling div
                    modal_wrapper = modal_trigger.find_next_sibling('div')
                    
                    if modal_wrapper:
                        # Scan all table headers in the modal
                        for th in modal_wrapper.find_all(['th', 'td', 'div']):
                            th_text = th.get_text(strip=True).lower()
                            
                            # Dig out Department
                            if faculty["department"] == "General" and "department" in th_text:
                                nxt = th.find_next_sibling(['td', 'th', 'div'])
                                if nxt: faculty["department"] = nxt.get_text(strip=True).replace(':', '').strip()
                                    
                            # Dig out Email
                            if faculty["email"] == "" and ("email" in th_text or "mail" in th_text):
                                nxt = th.find_next_sibling(['td', 'th', 'div'])
                                if nxt:
                                    em = nxt.get_text(strip=True).replace(':', '').strip().replace(" ", "")
                                    if "sastra.edu" in em.lower(): faculty["email"] = em

            all_data.append(faculty)
            school_faculty_count += 1
            
        print(f"  -> ✅ Found {school_faculty_count} members.")
            
    except Exception as e:
        print(f"  -> ❌ Error scraping {school_name}: {e}")

# Deduplicate
unique_data = []
seen = set()
for f in all_data:
    identifier = f["name"] + f["imageUrl"]
    if identifier not in seen:
        seen.add(identifier)
        unique_data.append(f)

js_content = f"const seedData = {json.dumps(unique_data, indent=2)};\n\nmodule.exports = seedData;"
with open('seedData.js', 'w', encoding='utf-8') as file:
    file.write(js_content)

print(f"\nSuccess! Extracted {len(unique_data)} unique faculty profiles.")
print("Data saved to 'seedData.js'. Run 'node seed.js' to seed MongoDB!")