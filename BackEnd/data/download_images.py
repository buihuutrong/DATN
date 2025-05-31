import os
import requests
from PIL import Image
from io import BytesIO

# Tạo thư mục nếu chưa tồn tại
os.makedirs('../public/images/foods', exist_ok=True)

# Danh sách các ảnh cần tải
images = {
    # Món chính
    'brown-rice-salmon.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'brown-rice-noodles-chicken.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-tofu-tomato.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'brown-rice-noodles-beef.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-basa-fish.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'brown-rice-beef-broccoli.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-noodles-shrimp.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-mackerel-tomato.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'brown-rice-noodles-pork-mushroom.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-shrimp-vegetables.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-noodles-chicken-mushroom.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-fish-passion-fruit.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'brown-rice-noodles-beef-greens.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-chicken-mushroom.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-noodles-shrimp-vegetables.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    'brown-rice-baked-salmon-orange.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    
    # Món protein
    'honey-glazed-chicken.jpg': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435',
    'pan-seared-salmon.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'tofu-mushroom.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'pan-seared-tuna-orange.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'tofu-peanut-sauce.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'baked-basa-lemon.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'baked-salmon-orange.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'baked-snakehead-fish-tamarind.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'tofu-straw-mushroom.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'baked-basa-passion-fruit.jpg': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    
    # Món rau và salad
    'tofu-salad.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'garlic-greens.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'tuna-salad.jpg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    'garlic-water-spinach.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'vegetable-salad-sesame.jpg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    'greens-mushroom-stirfry.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'sprout-salad-roasted-sesame.jpg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    'garlic-sweet-potato-leaves.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'vegetable-salad-roasted-sesame.jpg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    'tuna-vegetable-salad.jpg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    
    # Món súp
    'chicken-mushroom-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'beef-vegetable-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'pumpkin-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'chicken-vegetable-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'pumpkin-mushroom-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'beef-ball-vegetable-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'winter-melon-mushroom-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'beef-sweet-leaf-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'pumpkin-mushroom-almond-soup.jpg': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    
    # Món ăn sáng
    'oatmeal-fruits.jpg': 'https://images.unsplash.com/photo-1517093602195-b40af9261bdb',
    'eggs-whole-grain-bread.jpg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    'whole-grain-bread-eggs-avocado.jpg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    'oatmeal-yogurt-fruits.jpg': 'https://images.unsplash.com/photo-1517093602195-b40af9261bdb',
    'whole-grain-bread-eggs-vegetables.jpg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    'oatmeal-yogurt-honey.jpg': 'https://images.unsplash.com/photo-1517093602195-b40af9261bdb',
    'whole-grain-bread-salmon-avocado.jpg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    'oatmeal-almond-milk-fruits.jpg': 'https://images.unsplash.com/photo-1517093602195-b40af9261bdb',
    
    # Món tráng miệng
    'yogurt-granola-fruits.jpg': 'https://images.unsplash.com/photo-1488477181946-6428a848b919',
    'green-smoothie.jpg': 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
    'strawberry-banana-smoothie.jpg': 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
    'yogurt-granola-honey.jpg': 'https://images.unsplash.com/photo-1488477181946-6428a848b919',
    'yogurt-fruits-granola.jpg': 'https://images.unsplash.com/photo-1488477181946-6428a848b919',
    'yogurt-fruits-nuts.jpg': 'https://images.unsplash.com/photo-1488477181946-6428a848b919',
    'mango-banana-smoothie.jpg': 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
    'banana-chia-smoothie.jpg': 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82'
}

def download_image(url, filename):
    try:
        # Thêm tham số quality và format cho URL Unsplash
        if 'unsplash.com' in url:
            url = f"{url}?q=80&fm=jpg&fit=crop&w=800&h=600"
            
        response = requests.get(url)
        if response.status_code == 200:
            # Mở ảnh và resize về kích thước phù hợp
            img = Image.open(BytesIO(response.content))
            img = img.resize((800, 600), Image.Resampling.LANCZOS)
            
            # Lưu ảnh
            save_path = os.path.join('../public/images/foods', filename)
            img.save(save_path, 'JPEG', quality=85)
            print(f'Đã tải thành công: {filename}')
        else:
            print(f'Lỗi khi tải {filename}: {response.status_code}')
    except Exception as e:
        print(f'Lỗi khi xử lý {filename}: {str(e)}')

# Tải từng ảnh
for filename, url in images.items():
    download_image(url, filename)

print('Hoàn thành tải ảnh!') 