import requests
from bs4 import BeautifulSoup
import json
import time

def get_faculty_ids(school_url, school_name):
    print(f"🔍 Scraping {school_name}...")
    headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0'}
    
    try:
        response = requests.get(school_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        faculty_list = []

        # Find all divs with class 'card' as seen in your screenshot
        cards = soup.find_all('div', class_='card')
        
        for card in cards:
            img = card.find('img')
            name_tag = card.find('h1') # Looking for the name in the <h1> tag
            
            if img and 'src' in img.attrs:
                # Extract C1763 from '../upload/C1763.jpg'
                img_src = img['src']
                staff_id = img_src.split('/')[-1].replace('.jpg', '')
                
                name = name_tag.get_text(strip=True) if name_tag else "Unknown"
                
                faculty_list.append({
                    "name": name,
                    "school": school_name,
                    "imageUrl": f"https://sastra.edu/staffprofiles/upload/{staff_id}.jpg"
                })

        print(f"✅ Found {len(faculty_list)} members in {school_name}")
        return faculty_list
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

schools = {
    "School of Computing": "https://sastra.edu/staffprofiles/schools/soc.php",
    "School of Civil Engineering": "https://sastra.edu/staffprofiles/schools/civil.php",
    "School of Electrical & Electronics Engineering": "https://sastra.edu/staffprofiles/schools/seee.php"
}

all_data = []
for name, url in schools.items():
    all_data.extend(get_faculty_ids(url, name))
    time.sleep(1) # Be respectful to the server

with open('extracted_faculty.json', 'w') as f:
    json.dump(all_data, f, indent=2)