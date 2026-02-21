import json
import requests
from bs4 import BeautifulSoup
import time

# The verified Request URL from your Network tab
BASE_URL = "https://www.sastra.edu/staffprofiles/schools/soc.php"

def extract_faculty_data():
    print("🚀 Team Aperture SOC Scraper: Initializing...")
    faculty_list = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Arch Linux; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }

    try:
        response = requests.get(BASE_URL, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Based on your Inspect Element (image_5d15c9.png), faculty cards are in col-3 divs
        faculty_cards = soup.find_all('div', class_='col-3')
        print(f"🔍 Found {len(faculty_cards)} faculty profiles in the DOM. Starting extraction...")

        for card in faculty_cards:
            # 1. Extract name from the card's visible heading or strong tag
            name_tag = card.find(['h3', 'h4', 'strong', 'b'])
            if not name_tag: continue
            name = name_tag.get_text(strip=True)

            # 2. Extract visible designation/email if they are in the card body (image_5d775e.jpg)
            # Some info is visible directly under the name in the card
            body_text = card.get_text(separator='|', strip=True)
            
            # 3. Locate the hidden modal immediately following the card (image_5d15c9.png)
            modal = card.find_next_sibling('div', class_='modal')
            
            # Initialize with best-guess defaults from body text
            faculty_data = {
                "name": name,
                "school": "School of Computing",
                "designation": "Faculty",
                "department": "CSE",
                "email": "",
                "qualifications": "",
                "areasOfInterest": "",
                "imageUrl": "https://via.placeholder.com/150"
            }

            # Extract Email if present in card text (e.g., sriram@it.sastra.edu)
            if "@" in body_text:
                parts = body_text.split('|')
                for p in parts:
                    if "@" in p and "." in p:
                        faculty_data['email'] = p.strip()

            # 4. Deep-dive into the Table inside the Modal Inner (image_5d15c9.png)
            if modal:
                table = modal.find('table')
                if table:
                    for tr in table.find_all('tr'):
                        th = tr.find('th')
                        td = tr.find('td')
                        if th and td:
                            label = th.get_text(strip=True).lower()
                            val = td.get_text(strip=True)
                            
                            if 'designation' in label: faculty_data['designation'] = val
                            elif 'department' in label: faculty_data['department'] = val
                            elif 'educational' in label: faculty_data['qualifications'] = val
                            elif 'areas of interest' in label: faculty_data['areasOfInterest'] = val
                            elif 'email' in label: faculty_data['email'] = val

            # 5. Capture Profile Image
            img = card.find('img')
            if img and img.get('src'):
                img_src = img['src']
                faculty_data['imageUrl'] = img_src if img_src.startswith('http') else f"https://www.sastra.edu/staffprofiles/schools/{img_src}"

            faculty_list.append(faculty_data)
            print(f"✅ Extracted: {name} ({faculty_data['designation']})")

    except Exception as e:
        print(f"❌ Scraper Failed: {e}")

    # Write to the file used by your Node.js seeder
    with open('extracted_faculty.json', 'w', encoding='utf-8') as f:
        json.dump(faculty_list, f, indent=4, ensure_ascii=False)
    
    print(f"🎉 Success! {len(faculty_list)} full profiles saved to extracted_faculty.json")

if __name__ == "__main__":
    extract_faculty_data()