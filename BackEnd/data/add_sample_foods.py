# add_healthy_foods.py
from pymongo import MongoClient
from datetime import datetime

# Kết nối MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["DOANTN"]
foods_collection = db["Food"]

# Xóa dữ liệu cũ
foods_collection.delete_many({})

# Danh sách món ăn lành mạnh
healthy_foods = [
    # 1. Món chính (30 món)
    {
        "name": "Cơm gạo lứt với cá hồi",
        "image": "/images/foods/brown-rice-salmon.jpg",
        "calories": 450,
        "protein": 30,
        "carbs": 45,
        "fat": 20,
        "preferences": ["healthy", "high_protein", "omega3"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá hồi", "quantity": 150, "unit": "g"},
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Bông cải xanh", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt với tỷ lệ 1:2 (gạo:nước)",
            "Áp chảo cá hồi với dầu ô liu",
            "Hấp bông cải và cà rốt",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Bún gạo lứt với thịt gà",
        "image": "/images/foods/brown-rice-noodles-chicken.jpg",
        "calories": 400,
        "protein": 25,
        "carbs": 50,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bún gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Ức gà", "quantity": 150, "unit": "g"},
            {"name": "Rau sống", "quantity": 100, "unit": "g"},
            {"name": "Nước mắm", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Chanh", "quantity": 1, "unit": "quả"}
        ],
        "instructions": [
            "Luộc bún gạo lứt",
            "Áp chảo ức gà với gia vị",
            "Rửa sạch rau sống",
            "Pha nước mắm chua ngọt",
            "Trộn đều và thưởng thức"
        ]
    },
    {
        "name": "Cơm gạo lứt với đậu hũ sốt cà chua",
        "image": "/images/foods/brown-rice-tofu-tomato.jpg",
        "calories": 380,
        "protein": 15,
        "carbs": 55,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Cà chua", "quantity": 200, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Chiên đậu hũ vàng",
            "Xào cà chua với hành tây",
            "Nấu sốt cà chua với đậu hũ",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với thịt bò xào rau",
        "image": "/images/foods/brown-rice-noodles-beef.jpg",
        "calories": 420,
        "protein": 28,
        "carbs": 48,
        "fat": 18,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Thịt bò", "quantity": 150, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Dầu mè", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào thịt bò với gia vị",
            "Xào rau cải",
            "Trộn đều với nước sốt",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Cơm gạo lứt với cá basa nướng",
        "image": "/images/foods/brown-rice-basa-fish.jpg",
        "calories": 400,
        "protein": 25,
        "carbs": 45,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Cá basa", "quantity": 200, "unit": "g"},
            {"name": "Rau muống", "quantity": 200, "unit": "g"},
            {"name": "Nước mắm", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Chanh", "quantity": 1, "unit": "quả"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Ướp cá với gia vị",
            "Nướng cá ở 180°C",
            "Xào rau muống",
            "Ăn kèm nước mắm chua ngọt"
        ]
    },
    # 2. Món protein (40 món)
    {
        "name": "Ức gà nướng sốt mật ong",
        "image": "/images/foods/honey-glazed-chicken.jpg",
        "calories": 350,
        "protein": 40,
        "carbs": 20,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Ức gà", "quantity": 200, "unit": "g"},
            {"name": "Mật ong", "quantity": 15, "unit": "ml"},
            {"name": "Tỏi", "quantity": 10, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"},
            {"name": "Nước tương", "quantity": 10, "unit": "ml"}
        ],
        "instructions": [
            "Ướp gà với mật ong, tỏi, gừng và nước tương",
            "Để ướp 30 phút",
            "Nướng ở 180°C trong 20-25 phút",
            "Kiểm tra độ chín và thưởng thức"
        ]
    },
    {
        "name": "Cá hồi áp chảo sốt chanh dây",
        "image": "/images/foods/pan-seared-salmon.jpg",
        "calories": 380,
        "protein": 35,
        "carbs": 15,
        "fat": 22,
        "preferences": ["high_protein", "omega3", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá hồi", "quantity": 200, "unit": "g"},
            {"name": "Chanh dây", "quantity": 2, "unit": "quả"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Hành tây", "quantity": 30, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Áp chảo cá hồi với dầu ô liu",
            "Làm sốt chanh dây với hành tây và gừng",
            "Rưới sốt lên cá",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt nấm",
        "image": "/images/foods/tofu-mushroom.jpg",
        "calories": 250,
        "protein": 18,
        "carbs": 20,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Nấm bào ngư", "quantity": 100, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Xào nấm với gia vị",
            "Nấu sốt với nước tương",
            "Trang trí với hành lá",
            "Thưởng thức"
        ]
    },
    # 3. Món rau và salad (30 món)
    {
        "name": "Salad đậu hũ non",
        "image": "/images/foods/tofu-salad.jpg",
        "calories": 250,
        "protein": 15,
        "carbs": 20,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Đậu hũ non", "quantity": 200, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà chua bi", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Giấm balsamic", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Cắt đậu hũ thành miếng vuông",
            "Rửa và cắt rau",
            "Trộn đều với dầu ô liu và giấm",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Rau cải xào tỏi",
        "image": "/images/foods/garlic-greens.jpg",
        "calories": 120,
        "protein": 5,
        "carbs": 15,
        "fat": 6,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau cải", "quantity": 300, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Muối", "quantity": 1, "unit": "muỗng cà phê"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Băm nhỏ tỏi",
            "Xào tỏi thơm",
            "Xào rau với gia vị",
            "Thưởng thức"
        ]
    },
    # 4. Món canh/súp (20 món)
    {
        "name": "Súp gà nấm",
        "image": "/images/foods/chicken-mushroom-soup.jpg",
        "calories": 280,
        "protein": 25,
        "carbs": 20,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Ức gà", "quantity": 150, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Nấm bào ngư", "quantity": 100, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Gừng", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng gà",
            "Thêm nấm và gia vị",
            "Nấu đến khi nấm chín",
            "Thêm hành lá và thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt bò",
        "image": "/images/foods/beef-vegetable-soup.jpg",
        "calories": 250,
        "protein": 20,
        "carbs": 15,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt bò", "quantity": 100, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt bò",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 5. Món ăn sáng (20 món)
    {
        "name": "Yến mạch với trái cây",
        "image": "/images/foods/oatmeal-fruits.jpg",
        "calories": 320,
        "protein": 12,
        "carbs": 55,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu yến mạch với sữa hạnh nhân",
            "Cắt trái cây",
            "Trang trí với trái cây và hạt chia",
            "Thưởng thức"
        ]
    },
    {
        "name": "Trứng ốp la với bánh mì nguyên cám",
        "image": "/images/foods/eggs-whole-grain-bread.jpg",
        "calories": 350,
        "protein": 20,
        "carbs": 30,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Bơ", "quantity": 10, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"}
        ],
        "instructions": [
            "Chiên trứng ốp la",
            "Nướng bánh mì",
            "Rửa và cắt rau",
            "Trang trí và thưởng thức"
        ]
    },
    # 6. Món tráng miệng lành mạnh (10 món)
    {
        "name": "Sữa chua với granola và trái cây",
        "image": "/images/foods/yogurt-granola-fruits.jpg",
        "calories": 250,
        "protein": 15,
        "carbs": 30,
        "fat": 8,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Granola", "quantity": 30, "unit": "g"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"},
            {"name": "Hạt hạnh nhân", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Thêm granola và trái cây",
            "Rưới mật ong",
            "Trang trí với hạt và thưởng thức"
        ]
    },
    {
        "name": "Sinh tố trái cây và rau xanh",
        "image": "/images/foods/green-smoothie.jpg",
        "calories": 200,
        "protein": 8,
        "carbs": 35,
        "fat": 5,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Rau bina", "quantity": 50, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Táo", "quantity": 1, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch rau và trái cây",
            "Cắt nhỏ trái cây",
            "Xay nhuyễn tất cả nguyên liệu",
            "Thêm hạt chia và thưởng thức"
        ]
    },
     {
        "name": "Cơm gạo lứt với thịt bò xào bông cải",
        "image": "/images/foods/brown-rice-beef-broccoli.jpg",
        "calories": 420,
        "protein": 30,
        "carbs": 45,
        "fat": 18,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Thịt bò", "quantity": 150, "unit": "g"},
            {"name": "Bông cải xanh", "quantity": 150, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Dầu mè", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Xào thịt bò với gia vị",
            "Xào bông cải",
            "Trộn đều và thưởng thức"
        ]
    },
    {
        "name": "Mì gạo lứt với tôm và rau củ",
        "image": "/images/foods/brown-rice-noodles-shrimp.jpg",
        "calories": 380,
        "protein": 25,
        "carbs": 48,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Tôm", "quantity": 150, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào tôm với gia vị",
            "Xào rau củ",
            "Trộn đều và thưởng thức"
        ]
    },
    # 8. Món protein bổ sung
    {
        "name": "Cá ngừ áp chảo sốt cam",
        "image": "/images/foods/pan-seared-tuna-orange.jpg",
        "calories": 350,
        "protein": 40,
        "carbs": 15,
        "fat": 18,
        "preferences": ["high_protein", "omega3", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá ngừ", "quantity": 200, "unit": "g"},
            {"name": "Cam", "quantity": 1, "unit": "quả"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Hành tây", "quantity": 30, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Áp chảo cá ngừ với dầu ô liu",
            "Làm sốt cam với hành tây và gừng",
            "Rưới sốt lên cá",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt đậu phộng",
        "image": "/images/foods/tofu-peanut-sauce.jpg",
        "calories": 280,
        "protein": 20,
        "carbs": 25,
        "fat": 15,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Bơ đậu phộng", "quantity": 30, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Ớt", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Làm sốt đậu phộng với nước tương",
            "Rưới sốt lên đậu hũ",
            "Trang trí với hành lá và ớt",
            "Thưởng thức"
        ]
    },
    # 9. Món rau và salad bổ sung
    {
        "name": "Salad cá ngừ",
        "image": "/images/foods/tuna-salad.jpg",
        "calories": 300,
        "protein": 25,
        "carbs": 20,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Cá ngừ", "quantity": 150, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà chua bi", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Giấm balsamic", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Áp chảo cá ngừ",
            "Rửa và cắt rau",
            "Trộn đều với dầu ô liu và giấm",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Rau muống xào tỏi",
        "image": "/images/foods/garlic-water-spinach.jpg",
        "calories": 120,
        "protein": 5,
        "carbs": 15,
        "fat": 6,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau muống", "quantity": 300, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Muối", "quantity": 1, "unit": "muỗng cà phê"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Băm nhỏ tỏi",
            "Xào tỏi thơm",
            "Xào rau với gia vị",
            "Thưởng thức"
        ]
    },
    # 10. Món canh/súp bổ sung
    {
        "name": "Súp bí đỏ",
        "image": "/images/foods/pumpkin-soup.jpg",
        "calories": 200,
        "protein": 8,
        "carbs": 30,
        "fat": 10,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Bí đỏ", "quantity": 300, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Gừng", "quantity": 10, "unit": "g"},
            {"name": "Hạt bí", "quantity": 20, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đỏ với hành tây và gừng",
            "Xay nhuyễn",
            "Thêm sữa hạnh nhân",
            "Trang trí với hạt bí và thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt gà",
        "image": "/images/foods/chicken-vegetable-soup.jpg",
        "calories": 250,
        "protein": 20,
        "carbs": 15,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt gà", "quantity": 100, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt gà",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 11. Món ăn sáng bổ sung
    {
        "name": "Bánh mì nguyên cám với trứng và bơ",
        "image": "/images/foods/whole-grain-bread-eggs-avocado.jpg",
        "calories": 350,
        "protein": 18,
        "carbs": 30,
        "fat": 20,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Bơ", "quantity": 50, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Chiên trứng",
            "Cắt bơ và rau",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Yến mạch với sữa chua và trái cây",
        "image": "/images/foods/oatmeal-yogurt-fruits.jpg",
        "calories": 320,
        "protein": 15,
        "carbs": 50,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu yến mạch với sữa hạnh nhân",
            "Cắt trái cây",
            "Trang trí với trái cây và hạt chia",
            "Thưởng thức"
        ]
    },
    # 12. Món tráng miệng lành mạnh bổ sung
    {
        "name": "Sinh tố dâu tây và chuối",
        "image": "/images/foods/strawberry-banana-smoothie.jpg",
        "calories": 250,
        "protein": 10,
        "carbs": 40,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Dâu tây", "quantity": 100, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Rửa sạch trái cây",
            "Cắt nhỏ trái cây",
            "Xay nhuyễn tất cả nguyên liệu",
            "Thêm hạt chia và thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với granola và mật ong",
        "image": "/images/foods/yogurt-granola-honey.jpg",
        "calories": 280,
        "protein": 15,
        "carbs": 35,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Granola", "quantity": 30, "unit": "g"},
            {"name": "Mật ong", "quantity": 10, "unit": "ml"},
            {"name": "Hạt hạnh nhân", "quantity": 10, "unit": "g"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Thêm granola",
            "Rưới mật ong",
            "Trang trí với hạt và quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Cơm gạo lứt với cá thu sốt cà chua",
        "image": "/images/foods/brown-rice-mackerel-tomato.jpg",
        "calories": 420,
        "protein": 28,
        "carbs": 45,
        "fat": 18,
        "preferences": ["healthy", "high_protein", "omega3"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá thu", "quantity": 150, "unit": "g"},
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Cà chua", "quantity": 100, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Chiên cá thu",
            "Làm sốt cà chua với hành tây",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với thịt heo xào nấm",
        "image": "/images/foods/brown-rice-noodles-pork-mushroom.jpg",
        "calories": 400,
        "protein": 25,
        "carbs": 48,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Thịt heo", "quantity": 150, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Nấm bào ngư", "quantity": 100, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào thịt heo với gia vị",
            "Xào nấm",
            "Trộn đều và thưởng thức"
        ]
    },
    # 2. Món protein
    {
        "name": "Cá basa nướng sốt chanh",
        "image": "/images/foods/baked-basa-lemon.jpg",
        "calories": 350,
        "protein": 35,
        "carbs": 15,
        "fat": 18,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá basa", "quantity": 200, "unit": "g"},
            {"name": "Chanh", "quantity": 1, "unit": "quả"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Tỏi", "quantity": 10, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Ướp cá với chanh, tỏi, gừng",
            "Nướng ở 180°C",
            "Làm sốt chanh",
            "Rưới sốt lên cá và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt nấm và rau củ",
        "image": "/images/foods/tofu-mushroom-vegetables.jpg",
        "calories": 280,
        "protein": 18,
        "carbs": 25,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Xào nấm và rau củ",
            "Nấu sốt với nước tương",
            "Trang trí và thưởng thức"
        ]
    },
    # 3. Món rau và salad
    {
        "name": "Salad rau củ với sốt mè",
        "image": "/images/foods/vegetable-salad-sesame.jpg",
        "calories": 200,
        "protein": 8,
        "carbs": 25,
        "fat": 10,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Dưa leo", "quantity": 50, "unit": "g"},
            {"name": "Sốt mè", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Hạt mè", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Rửa và cắt rau củ",
            "Trộn đều với sốt mè",
            "Rắc hạt mè lên trên",
            "Thưởng thức"
        ]
    },
    {
        "name": "Rau cải xào nấm",
        "image": "/images/foods/greens-mushroom-stirfry.jpg",
        "calories": 150,
        "protein": 8,
        "carbs": 20,
        "fat": 7,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Tỏi", "quantity": 10, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Nước tương", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Xào tỏi thơm",
            "Xào nấm và rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 4. Món canh/súp
    {
        "name": "Súp bí đỏ nấm",
        "image": "/images/foods/pumpkin-mushroom-soup.jpg",
        "calories": 220,
        "protein": 10,
        "carbs": 35,
        "fat": 8,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Bí đỏ", "quantity": 300, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Gừng", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đỏ với hành tây và gừng",
            "Thêm nấm",
            "Xay nhuyễn",
            "Thêm sữa hạnh nhân và thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt bò viên",
        "image": "/images/foods/beef-ball-vegetable-soup.jpg",
        "calories": 280,
        "protein": 22,
        "carbs": 18,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt bò viên", "quantity": 150, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt bò viên",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 5. Món ăn sáng
    {
        "name": "Yến mạch với sữa chua và mật ong",
        "image": "/images/foods/oatmeal-yogurt-honey.jpg",
        "calories": 300,
        "protein": 12,
        "carbs": 45,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"},
            {"name": "Mật ong", "quantity": 10, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Nấu yến mạch với nước",
            "Thêm sữa chua",
            "Rưới mật ong",
            "Trang trí với hạt chia và quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Bánh mì nguyên cám với trứng và rau",
        "image": "/images/foods/whole-grain-bread-eggs-vegetables.jpg",
        "calories": 320,
        "protein": 18,
        "carbs": 35,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Chiên trứng",
            "Rửa và cắt rau",
            "Trang trí và thưởng thức"
        ]
    },
    # 6. Món tráng miệng lành mạnh
    {
        "name": "Sinh tố chuối và hạt chia",
        "image": "/images/foods/banana-chia-smoothie.jpg",
        "calories": 250,
        "protein": 10,
        "carbs": 35,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Chuối", "quantity": 2, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 15, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Cắt nhỏ chuối",
            "Xay nhuyễn với sữa hạnh nhân",
            "Thêm hạt chia",
            "Rưới mật ong và rắc quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với trái cây và granola",
        "image": "/images/foods/yogurt-fruits-granola.jpg",
        "calories": 280,
        "protein": 15,
        "carbs": 35,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Granola", "quantity": 30, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Cắt trái cây",
            "Thêm granola",
            "Rưới mật ong",
            "Thưởng thức"
        ]
    },
     {
        "name": "Cơm gạo lứt với tôm xào rau củ",
        "image": "/images/foods/brown-rice-shrimp-vegetables.jpg",
        "calories": 380,
        "protein": 25,
        "carbs": 45,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Tôm", "quantity": 150, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Xào tôm với gia vị",
            "Xào rau củ",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với thịt gà xào nấm",
        "image": "/images/foods/brown-rice-noodles-chicken-mushroom.jpg",
        "calories": 400,
        "protein": 28,
        "carbs": 45,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Ức gà", "quantity": 150, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Nấm bào ngư", "quantity": 100, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào thịt gà với gia vị",
            "Xào nấm",
            "Trộn đều và thưởng thức"
        ]
    },
    # 8. Món protein bổ sung
    {
        "name": "Cá hồi nướng sốt cam",
        "image": "/images/foods/baked-salmon-orange.jpg",
        "calories": 380,
        "protein": 35,
        "carbs": 15,
        "fat": 20,
        "preferences": ["high_protein", "omega3", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá hồi", "quantity": 200, "unit": "g"},
            {"name": "Cam", "quantity": 1, "unit": "quả"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Hành tây", "quantity": 30, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Ướp cá với nước cam",
            "Nướng ở 180°C",
            "Làm sốt cam với hành tây và gừng",
            "Rưới sốt lên cá và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt đậu phộng",
        "image": "/images/foods/tofu-peanut-sauce.jpg",
        "calories": 280,
        "protein": 20,
        "carbs": 25,
        "fat": 15,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Bơ đậu phộng", "quantity": 30, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Ớt", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Làm sốt đậu phộng với nước tương",
            "Rưới sốt lên đậu hũ",
            "Trang trí với hành lá và ớt",
            "Thưởng thức"
        ]
    },
    # 9. Món rau và salad bổ sung
    {
        "name": "Salad cá ngừ",
        "image": "/images/foods/tuna-salad.jpg",
        "calories": 300,
        "protein": 25,
        "carbs": 20,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Cá ngừ", "quantity": 150, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà chua bi", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Giấm balsamic", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Áp chảo cá ngừ",
            "Rửa và cắt rau",
            "Trộn đều với dầu ô liu và giấm",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Rau muống xào tỏi",
        "image": "/images/foods/garlic-water-spinach.jpg",
        "calories": 120,
        "protein": 5,
        "carbs": 15,
        "fat": 6,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau muống", "quantity": 300, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Muối", "quantity": 1, "unit": "muỗng cà phê"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Băm nhỏ tỏi",
            "Xào tỏi thơm",
            "Xào rau với gia vị",
            "Thưởng thức"
        ]
    },
    # 10. Món canh/súp bổ sung
    {
        "name": "Súp bí đỏ",
        "image": "/images/foods/pumpkin-soup.jpg",
        "calories": 200,
        "protein": 8,
        "carbs": 30,
        "fat": 10,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Bí đỏ", "quantity": 300, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Gừng", "quantity": 10, "unit": "g"},
            {"name": "Hạt bí", "quantity": 20, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đỏ với hành tây và gừng",
            "Xay nhuyễn",
            "Thêm sữa hạnh nhân",
            "Trang trí với hạt bí và thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt gà",
        "image": "/images/foods/chicken-vegetable-soup.jpg",
        "calories": 250,
        "protein": 20,
        "carbs": 15,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt gà", "quantity": 100, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt gà",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 11. Món ăn sáng bổ sung
    {
        "name": "Bánh mì nguyên cám với trứng và bơ",
        "image": "/images/foods/whole-grain-bread-eggs-avocado.jpg",
        "calories": 350,
        "protein": 18,
        "carbs": 30,
        "fat": 20,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Bơ", "quantity": 50, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Chiên trứng",
            "Cắt bơ và rau",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Yến mạch với sữa chua và trái cây",
        "image": "/images/foods/oatmeal-yogurt-fruits.jpg",
        "calories": 320,
        "protein": 15,
        "carbs": 50,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu yến mạch với sữa hạnh nhân",
            "Cắt trái cây",
            "Trang trí với trái cây và hạt chia",
            "Thưởng thức"
        ]
    },
    # 12. Món tráng miệng lành mạnh bổ sung
    {
        "name": "Sinh tố dâu tây và chuối",
        "image": "/images/foods/strawberry-banana-smoothie.jpg",
        "calories": 250,
        "protein": 10,
        "carbs": 40,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Dâu tây", "quantity": 100, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Rửa sạch trái cây",
            "Cắt nhỏ trái cây",
            "Xay nhuyễn tất cả nguyên liệu",
            "Thêm hạt chia và thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với granola và mật ong",
        "image": "/images/foods/yogurt-granola-honey.jpg",
        "calories": 280,
        "protein": 15,
        "carbs": 35,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Granola", "quantity": 30, "unit": "g"},
            {"name": "Mật ong", "quantity": 10, "unit": "ml"},
            {"name": "Hạt hạnh nhân", "quantity": 10, "unit": "g"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Thêm granola",
            "Rưới mật ong",
            "Trang trí với hạt và quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Cơm gạo lứt với cá thu sốt cà chua",
        "image": "/images/foods/brown-rice-mackerel-tomato.jpg",
        "calories": 420,
        "protein": 28,
        "carbs": 45,
        "fat": 18,
        "preferences": ["healthy", "high_protein", "omega3"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá thu", "quantity": 150, "unit": "g"},
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Cà chua", "quantity": 100, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Chiên cá thu",
            "Làm sốt cà chua với hành tây",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với thịt heo xào nấm",
        "image": "/images/foods/brown-rice-noodles-pork-mushroom.jpg",
        "calories": 400,
        "protein": 25,
        "carbs": 48,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Thịt heo", "quantity": 150, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Nấm bào ngư", "quantity": 100, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào thịt heo với gia vị",
            "Xào nấm",
            "Trộn đều và thưởng thức"
        ]
    },
    # 2. Món protein
    {
        "name": "Cá basa nướng sốt chanh",
        "image": "/images/foods/baked-basa-lemon.jpg",
        "calories": 350,
        "protein": 35,
        "carbs": 15,
        "fat": 18,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá basa", "quantity": 200, "unit": "g"},
            {"name": "Chanh", "quantity": 1, "unit": "quả"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Tỏi", "quantity": 10, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Ướp cá với chanh, tỏi, gừng",
            "Nướng ở 180°C",
            "Làm sốt chanh",
            "Rưới sốt lên cá và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt nấm và rau củ",
        "image": "/images/foods/tofu-mushroom-vegetables.jpg",
        "calories": 280,
        "protein": 18,
        "carbs": 25,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Xào nấm và rau củ",
            "Nấu sốt với nước tương",
            "Trang trí và thưởng thức"
        ]
    },
    # 3. Món rau và salad
    {
        "name": "Salad rau củ với sốt mè",
        "image": "/images/foods/vegetable-salad-sesame.jpg",
        "calories": 200,
        "protein": 8,
        "carbs": 25,
        "fat": 10,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Dưa leo", "quantity": 50, "unit": "g"},
            {"name": "Sốt mè", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Hạt mè", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Rửa và cắt rau củ",
            "Trộn đều với sốt mè",
            "Rắc hạt mè lên trên",
            "Thưởng thức"
        ]
    },
    {
        "name": "Rau cải xào nấm",
        "image": "/images/foods/greens-mushroom-stirfry.jpg",
        "calories": 150,
        "protein": 8,
        "carbs": 20,
        "fat": 7,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Tỏi", "quantity": 10, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Nước tương", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Xào tỏi thơm",
            "Xào nấm và rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 4. Món canh/súp
    {
        "name": "Súp bí đỏ nấm",
        "image": "/images/foods/pumpkin-mushroom-soup.jpg",
        "calories": 220,
        "protein": 10,
        "carbs": 35,
        "fat": 8,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Bí đỏ", "quantity": 300, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Gừng", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đỏ với hành tây và gừng",
            "Thêm nấm",
            "Xay nhuyễn",
            "Thêm sữa hạnh nhân và thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt bò viên",
        "image": "/images/foods/beef-ball-vegetable-soup.jpg",
        "calories": 280,
        "protein": 22,
        "carbs": 18,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt bò viên", "quantity": 150, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt bò viên",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 5. Món ăn sáng
    {
        "name": "Yến mạch với sữa chua và mật ong",
        "image": "/images/foods/oatmeal-yogurt-honey.jpg",
        "calories": 300,
        "protein": 12,
        "carbs": 45,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"},
            {"name": "Mật ong", "quantity": 10, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Nấu yến mạch với nước",
            "Thêm sữa chua",
            "Rưới mật ong",
            "Trang trí với hạt chia và quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Bánh mì nguyên cám với trứng và rau",
        "image": "/images/foods/whole-grain-bread-eggs-vegetables.jpg",
        "calories": 320,
        "protein": 18,
        "carbs": 35,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Chiên trứng",
            "Rửa và cắt rau",
            "Trang trí và thưởng thức"
        ]
    },
    # 6. Món tráng miệng lành mạnh
    {
        "name": "Sinh tố chuối và hạt chia",
        "image": "/images/foods/banana-chia-smoothie.jpg",
        "calories": 250,
        "protein": 10,
        "carbs": 35,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Chuối", "quantity": 2, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 15, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Cắt nhỏ chuối",
            "Xay nhuyễn với sữa hạnh nhân",
            "Thêm hạt chia",
            "Rưới mật ong và rắc quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với trái cây và granola",
        "image": "/images/foods/yogurt-fruits-granola.jpg",
        "calories": 280,
        "protein": 15,
        "carbs": 35,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Granola", "quantity": 30, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Cắt trái cây",
            "Thêm granola",
            "Rưới mật ong",
            "Thưởng thức"
        ]
    },
     {
        "name": "Cơm gạo lứt với tôm xào rau củ",
        "image": "/images/foods/brown-rice-shrimp-vegetables.jpg",
        "calories": 380,
        "protein": 25,
        "carbs": 45,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Tôm", "quantity": 150, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Xào tôm với gia vị",
            "Xào rau củ",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với thịt gà xào nấm",
        "image": "/images/foods/brown-rice-noodles-chicken-mushroom.jpg",
        "calories": 400,
        "protein": 28,
        "carbs": 45,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Ức gà", "quantity": 150, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Nấm bào ngư", "quantity": 100, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào thịt gà với gia vị",
            "Xào nấm",
            "Trộn đều và thưởng thức"
        ]
    },
    # 8. Món protein bổ sung
    {
        "name": "Cá hồi nướng sốt cam",
        "image": "/images/foods/baked-salmon-orange.jpg",
        "calories": 380,
        "protein": 35,
        "carbs": 15,
        "fat": 20,
        "preferences": ["high_protein", "omega3", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá hồi", "quantity": 200, "unit": "g"},
            {"name": "Cam", "quantity": 1, "unit": "quả"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Hành tây", "quantity": 30, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Ướp cá với nước cam",
            "Nướng ở 180°C",
            "Làm sốt cam với hành tây và gừng",
            "Rưới sốt lên cá và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt đậu phộng",
        "image": "/images/foods/tofu-peanut-sauce.jpg",
        "calories": 280,
        "protein": 20,
        "carbs": 25,
        "fat": 15,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Bơ đậu phộng", "quantity": 30, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Ớt", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Làm sốt đậu phộng với nước tương",
            "Rưới sốt lên đậu hũ",
            "Trang trí với hành lá và ớt",
            "Thưởng thức"
        ]
    },
    # 9. Món rau và salad bổ sung
    {
        "name": "Salad cá ngừ",
        "image": "/images/foods/tuna-salad.jpg",
        "calories": 300,
        "protein": 25,
        "carbs": 20,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Cá ngừ", "quantity": 150, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà chua bi", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Giấm balsamic", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Áp chảo cá ngừ",
            "Rửa và cắt rau",
            "Trộn đều với dầu ô liu và giấm",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Rau muống xào tỏi",
        "image": "/images/foods/garlic-water-spinach.jpg",
        "calories": 120,
        "protein": 5,
        "carbs": 15,
        "fat": 6,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau muống", "quantity": 300, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Muối", "quantity": 1, "unit": "muỗng cà phê"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Băm nhỏ tỏi",
            "Xào tỏi thơm",
            "Xào rau với gia vị",
            "Thưởng thức"
        ]
    },
    # 10. Món canh/súp bổ sung
    {
        "name": "Súp bí đỏ",
        "image": "/images/foods/pumpkin-soup.jpg",
        "calories": 200,
        "protein": 8,
        "carbs": 30,
        "fat": 10,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Bí đỏ", "quantity": 300, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Gừng", "quantity": 10, "unit": "g"},
            {"name": "Hạt bí", "quantity": 20, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đỏ với hành tây và gừng",
            "Xay nhuyễn",
            "Thêm sữa hạnh nhân",
            "Trang trí với hạt bí và thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt gà",
        "image": "/images/foods/chicken-vegetable-soup.jpg",
        "calories": 250,
        "protein": 20,
        "carbs": 15,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt gà", "quantity": 100, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt gà",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 11. Món ăn sáng bổ sung
    {
        "name": "Bánh mì nguyên cám với trứng và bơ",
        "image": "/images/foods/whole-grain-bread-eggs-avocado.jpg",
        "calories": 350,
        "protein": 18,
        "carbs": 30,
        "fat": 20,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Bơ", "quantity": 50, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Chiên trứng",
            "Cắt bơ và rau",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Yến mạch với sữa chua và trái cây",
        "image": "/images/foods/oatmeal-yogurt-fruits.jpg",
        "calories": 320,
        "protein": 15,
        "carbs": 50,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu yến mạch với sữa hạnh nhân",
            "Cắt trái cây",
            "Trang trí với trái cây và hạt chia",
            "Thưởng thức"
        ]
    },
    # 12. Món tráng miệng lành mạnh bổ sung
    {
        "name": "Sinh tố dâu tây và chuối",
        "image": "/images/foods/strawberry-banana-smoothie.jpg",
        "calories": 250,
        "protein": 10,
        "carbs": 40,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Dâu tây", "quantity": 100, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Rửa sạch trái cây",
            "Cắt nhỏ trái cây",
            "Xay nhuyễn tất cả nguyên liệu",
            "Thêm hạt chia và thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với granola và mật ong",
        "image": "/images/foods/yogurt-granola-honey.jpg",
        "calories": 280,
        "protein": 15,
        "carbs": 35,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Granola", "quantity": 30, "unit": "g"},
            {"name": "Mật ong", "quantity": 10, "unit": "ml"},
            {"name": "Hạt hạnh nhân", "quantity": 10, "unit": "g"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Thêm granola",
            "Rưới mật ong",
            "Trang trí với hạt và quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với trái cây và hạt",
        "image": "/images/foods/yogurt-fruits-nuts.jpg",
        "calories": 300,
        "protein": 18,
        "carbs": 30,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Táo", "quantity": 1, "unit": "quả"},
            {"name": "Hạt hạnh nhân", "quantity": 15, "unit": "g"},
            {"name": "Hạt óc chó", "quantity": 15, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Cắt táo",
            "Thêm các loại hạt",
            "Rưới mật ong và thưởng thức"
        ]
    },
    # 13. Món chính bổ sung
    {
        "name": "Cơm gạo lứt với cá trắm sốt chanh dây",
        "image": "/images/foods/brown-rice-fish-passion-fruit.jpg",
        "calories": 400,
        "protein": 30,
        "carbs": 45,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Cá trắm", "quantity": 200, "unit": "g"},
            {"name": "Chanh dây", "quantity": 2, "unit": "quả"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Chiên cá trắm",
            "Làm sốt chanh dây với hành tây",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với bò xào rau cải",
        "image": "/images/foods/brown-rice-noodles-beef-greens.jpg",
        "calories": 420,
        "protein": 30,
        "carbs": 45,
        "fat": 18,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Thịt bò", "quantity": 150, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào thịt bò với tỏi",
            "Xào rau cải",
            "Trộn đều và thưởng thức"
        ]
    },
    # 14. Món protein bổ sung
    {
        "name": "Cá lóc nướng sốt me",
        "image": "/images/foods/baked-snakehead-fish-tamarind.jpg",
        "calories": 350,
        "protein": 32,
        "carbs": 20,
        "fat": 16,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá lóc", "quantity": 250, "unit": "g"},
            {"name": "Me", "quantity": 50, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Ớt", "quantity": 10, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Ướp cá với tỏi và ớt",
            "Nướng ở 180°C",
            "Làm sốt me",
            "Rưới sốt lên cá và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt nấm rơm",
        "image": "/images/foods/tofu-straw-mushroom.jpg",
        "calories": 250,
        "protein": 18,
        "carbs": 20,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Nấm rơm", "quantity": 150, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Xào nấm rơm với hành tây",
            "Nấu sốt với nước tương",
            "Trang trí với hành lá và thưởng thức"
        ]
    },
    # 15. Món rau và salad bổ sung
    {
        "name": "Salad rau mầm với sốt mè rang",
        "image": "/images/foods/sprout-salad-roasted-sesame.jpg",
        "calories": 180,
        "protein": 10,
        "carbs": 20,
        "fat": 8,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Rau mầm", "quantity": 200, "unit": "g"},
            {"name": "Mè rang", "quantity": 20, "unit": "g"},
            {"name": "Dầu mè", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Nước tương", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Hành phi", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch rau mầm",
            "Làm sốt mè rang",
            "Trộn đều với dầu mè và nước tương",
            "Trang trí với hành phi và thưởng thức"
        ]
    },
    {
        "name": "Rau lang xào tỏi",
        "image": "/images/foods/garlic-sweet-potato-leaves.jpg",
        "calories": 130,
        "protein": 6,
        "carbs": 18,
        "fat": 7,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau lang", "quantity": 300, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Muối", "quantity": 1, "unit": "muỗng cà phê"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Băm nhỏ tỏi",
            "Xào tỏi thơm",
            "Xào rau với gia vị",
            "Thưởng thức"
        ]
    },
    # 16. Món canh/súp bổ sung
    {
        "name": "Súp bí đao nấm",
        "image": "/images/foods/winter-melon-mushroom-soup.jpg",
        "calories": 180,
        "protein": 8,
        "carbs": 25,
        "fat": 8,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Bí đao", "quantity": 300, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Gừng", "quantity": 10, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đao với hành tây và gừng",
            "Thêm nấm",
            "Nêm gia vị",
            "Trang trí với hành lá và thưởng thức"
        ]
    },
    {
        "name": "Canh rau ngót thịt bò",
        "image": "/images/foods/beef-sweet-leaf-soup.jpg",
        "calories": 260,
        "protein": 22,
        "carbs": 18,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt bò", "quantity": 100, "unit": "g"},
            {"name": "Rau ngót", "quantity": 200, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt bò",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 17. Món ăn sáng bổ sung
    {
        "name": "Bánh mì nguyên cám với cá hồi và bơ",
        "image": "/images/foods/whole-grain-bread-salmon-avocado.jpg",
        "calories": 380,
        "protein": 25,
        "carbs": 30,
        "fat": 22,
        "preferences": ["high_protein", "healthy", "omega3"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Cá hồi", "quantity": 100, "unit": "g"},
            {"name": "Bơ", "quantity": 50, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Chanh", "quantity": 0.5, "unit": "quả"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Áp chảo cá hồi",
            "Cắt bơ và rau",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Yến mạch với sữa hạnh nhân và trái cây",
        "image": "/images/foods/oatmeal-almond-milk-fruits.jpg",
        "calories": 300,
        "protein": 12,
        "carbs": 45,
        "fat": 12,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Táo", "quantity": 1, "unit": "quả"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Nấu yến mạch với sữa hạnh nhân",
            "Cắt táo",
            "Thêm hạt chia và quế",
            "Thưởng thức"
        ]
    },
    # 18. Món tráng miệng lành mạnh bổ sung
    {
        "name": "Sinh tố xoài và chuối",
        "image": "/images/foods/mango-banana-smoothie.jpg",
        "calories": 280,
        "protein": 8,
        "carbs": 45,
        "fat": 10,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Xoài", "quantity": 150, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Cắt nhỏ trái cây",
            "Xay nhuyễn với sữa hạnh nhân",
            "Thêm hạt chia",
            "Rưới mật ong và thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với trái cây và hạt",
        "image": "/images/foods/yogurt-fruits-nuts.jpg",
        "calories": 300,
        "protein": 18,
        "carbs": 30,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Táo", "quantity": 1, "unit": "quả"},
            {"name": "Hạt hạnh nhân", "quantity": 15, "unit": "g"},
            {"name": "Hạt óc chó", "quantity": 15, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Cắt táo",
            "Thêm các loại hạt",
            "Rưới mật ong và thưởng thức"
        ]
    },
    # 19. Món chính bổ sung
    {
        "name": "Cơm gạo lứt với gà xào nấm",
        "image": "/images/foods/brown-rice-chicken-mushroom.jpg",
        "calories": 380,
        "protein": 28,
        "carbs": 45,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Ức gà", "quantity": 150, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Nấm bào ngư", "quantity": 100, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Xào thịt gà với gia vị",
            "Xào nấm",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với tôm xào rau củ",
        "image": "/images/foods/brown-rice-noodles-shrimp-vegetables.jpg",
        "calories": 400,
        "protein": 25,
        "carbs": 45,
        "fat": 18,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Tôm", "quantity": 150, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào tôm với gia vị",
            "Xào rau củ",
            "Trộn đều và thưởng thức"
        ]
    },
    # 20. Món protein bổ sung
    {
        "name": "Cá basa nướng sốt chanh dây",
        "image": "/images/foods/baked-basa-passion-fruit.jpg",
        "calories": 360,
        "protein": 30,
        "carbs": 18,
        "fat": 20,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá basa", "quantity": 200, "unit": "g"},
            {"name": "Chanh dây", "quantity": 2, "unit": "quả"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Hành tây", "quantity": 30, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Ướp cá với nước chanh dây",
            "Nướng ở 180°C",
            "Làm sốt chanh dây với hành tây và gừng",
            "Rưới sốt lên cá và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt nấm và rau củ",
        "image": "/images/foods/tofu-mushroom-vegetables.jpg",
        "calories": 260,
        "protein": 18,
        "carbs": 22,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Xào nấm và rau củ",
            "Nấu sốt với nước tương",
            "Trang trí và thưởng thức"
        ]
    },
    # 21. Món rau và salad bổ sung
    {
        "name": "Salad rau củ với sốt mè rang",
        "image": "/images/foods/vegetable-salad-roasted-sesame.jpg",
        "calories": 200,
        "protein": 8,
        "carbs": 25,
        "fat": 10,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Dưa leo", "quantity": 50, "unit": "g"},
            {"name": "Mè rang", "quantity": 20, "unit": "g"},
            {"name": "Dầu mè", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Rửa và cắt rau củ",
            "Làm sốt mè rang",
            "Trộn đều với dầu mè",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Rau cải xào tỏi",
        "image": "/images/foods/garlic-greens.jpg",
        "calories": 120,
        "protein": 5,
        "carbs": 15,
        "fat": 6,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Rau cải", "quantity": 300, "unit": "g"},
            {"name": "Tỏi", "quantity": 20, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"},
            {"name": "Muối", "quantity": 1, "unit": "muỗng cà phê"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Rửa và cắt rau",
            "Băm nhỏ tỏi",
            "Xào tỏi thơm",
            "Xào rau với gia vị",
            "Thưởng thức"
        ]
    },
    # 22. Món canh/súp bổ sung
    {
        "name": "Súp bí đỏ nấm",
        "image": "/images/foods/pumpkin-mushroom-soup.jpg",
        "calories": 220,
        "protein": 10,
        "carbs": 35,
        "fat": 8,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Bí đỏ", "quantity": 300, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Gừng", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đỏ với hành tây và gừng",
            "Thêm nấm",
            "Xay nhuyễn",
            "Thêm sữa hạnh nhân và thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt bò viên",
        "image": "/images/foods/beef-ball-vegetable-soup.jpg",
        "calories": 280,
        "protein": 22,
        "carbs": 18,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt bò viên", "quantity": 150, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt bò viên",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    # 23. Món ăn sáng bổ sung
    {
        "name": "Yến mạch với sữa chua và mật ong",
        "image": "/images/foods/oatmeal-yogurt-honey.jpg",
        "calories": 300,
        "protein": 12,
        "carbs": 45,
        "fat": 10,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"},
            {"name": "Mật ong", "quantity": 10, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Nấu yến mạch với nước",
            "Thêm sữa chua",
            "Rưới mật ong",
            "Trang trí với hạt chia và quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Bánh mì nguyên cám với trứng và rau",
        "image": "/images/foods/whole-grain-bread-eggs-vegetables.jpg",
        "calories": 320,
        "protein": 18,
        "carbs": 35,
        "fat": 15,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Chiên trứng",
            "Rửa và cắt rau",
            "Trang trí và thưởng thức"
        ]
    },
    # 24. Món tráng miệng lành mạnh bổ sung
    {
        "name": "Sinh tố chuối và hạt chia",
        "image": "/images/foods/banana-chia-smoothie.jpg",
        "calories": 250,
        "protein": 10,
        "carbs": 35,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Chuối", "quantity": 2, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 15, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Cắt nhỏ chuối",
            "Xay nhuyễn với sữa hạnh nhân",
            "Thêm hạt chia",
            "Rưới mật ong và rắc quế",
            "Thưởng thức"
        ]
    },
     {
        "name": "Cơm gạo lứt với cá hồi nướng sốt cam",
        "image": "/images/foods/brown-rice-baked-salmon-orange.jpg",
        "calories": 420,
        "protein": 35,
        "carbs": 45,
        "fat": 18,
        "preferences": ["healthy", "high_protein", "omega3"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Cá hồi", "quantity": 200, "unit": "g"},
            {"name": "Cam", "quantity": 1, "unit": "quả"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Gừng", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu gạo lứt",
            "Ướp cá hồi với nước cam",
            "Nướng cá ở 180°C",
            "Làm sốt cam với hành tây và gừng",
            "Ăn kèm cơm gạo lứt"
        ]
    },
    {
        "name": "Mì gạo lứt với tôm xào rau củ",
        "image": "/images/foods/brown-rice-noodles-shrimp-vegetables.jpg",
        "calories": 380,
        "protein": 28,
        "carbs": 42,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì gạo lứt", "quantity": 200, "unit": "g"},
            {"name": "Tôm", "quantity": 150, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"}
        ],
        "instructions": [
            "Luộc mì gạo lứt",
            "Xào tôm với gia vị",
            "Xào rau củ và nấm",
            "Trộn đều và thưởng thức"
        ]
    },
    {
        "name": "Salad cá ngừ với rau củ",
        "image": "/images/foods/tuna-vegetable-salad.jpg",
        "calories": 320,
        "protein": 30,
        "carbs": 20,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Cá ngừ", "quantity": 150, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 100, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"},
            {"name": "Dưa leo", "quantity": 50, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 1, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Áp chảo cá ngừ",
            "Rửa và cắt rau củ",
            "Trộn đều với dầu ô liu",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Súp bí đỏ với nấm và sữa hạnh nhân",
        "image": "/images/foods/pumpkin-mushroom-almond-soup.jpg",
        "calories": 250,
        "protein": 12,
        "carbs": 35,
        "fat": 10,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": ["winter", "fall"],
            "weather": ["cold", "rainy"]
        },
        "ingredients": [
            {"name": "Bí đỏ", "quantity": 300, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hành tây", "quantity": 50, "unit": "g"},
            {"name": "Gừng", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu bí đỏ với hành tây và gừng",
            "Thêm nấm",
            "Xay nhuyễn",
            "Thêm sữa hạnh nhân và thưởng thức"
        ]
    },
    {
        "name": "Yến mạch với sữa chua và trái cây",
        "image": "/images/foods/oatmeal-yogurt-fruits.jpg",
        "calories": 350,
        "protein": 15,
        "carbs": 45,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 50, "unit": "g"},
            {"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Hạt chia", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Nấu yến mạch với nước",
            "Thêm sữa chua",
            "Trang trí với trái cây và hạt chia",
            "Thưởng thức"
        ]
    },
    {
        "name": "Bánh mì nguyên cám với trứng và bơ",
        "image": "/images/foods/whole-grain-bread-eggs-avocado.jpg",
        "calories": 380,
        "protein": 20,
        "carbs": 35,
        "fat": 22,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 2, "unit": "lát"},
            {"name": "Trứng", "quantity": 2, "unit": "quả"},
            {"name": "Bơ", "quantity": 50, "unit": "g"},
            {"name": "Rau xà lách", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"}
        ],
        "instructions": [
            "Nướng bánh mì",
            "Chiên trứng",
            "Cắt bơ và rau",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Đậu hũ sốt nấm và rau củ",
        "image": "/images/foods/tofu-mushroom-vegetables.jpg",
        "calories": 280,
        "protein": 18,
        "carbs": 25,
        "fat": 12,
        "preferences": ["vegan", "healthy"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 200, "unit": "g"},
            {"name": "Nấm đông cô", "quantity": 100, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Đậu que", "quantity": 50, "unit": "g"},
            {"name": "Nước tương", "quantity": 2, "unit": "muỗng canh"}
        ],
        "instructions": [
            "Chiên đậu hũ vàng",
            "Xào nấm và rau củ",
            "Nấu sốt với nước tương",
            "Trang trí và thưởng thức"
        ]
    },
    {
        "name": "Sinh tố chuối và hạt chia",
        "image": "/images/foods/banana-chia-smoothie.jpg",
        "calories": 250,
        "protein": 10,
        "carbs": 35,
        "fat": 8,
        "preferences": ["healthy", "vegan"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["snack", "dessert"],
            "season": ["spring", "summer"],
            "weather": ["hot"]
        },
        "ingredients": [
            {"name": "Chuối", "quantity": 2, "unit": "quả"},
            {"name": "Sữa hạnh nhân", "quantity": 200, "unit": "ml"},
            {"name": "Hạt chia", "quantity": 15, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"},
            {"name": "Quế", "quantity": 1, "unit": "muỗng cà phê"}
        ],
        "instructions": [
            "Cắt nhỏ chuối",
            "Xay nhuyễn với sữa hạnh nhân",
            "Thêm hạt chia",
            "Rưới mật ong và rắc quế",
            "Thưởng thức"
        ]
    },
    {
        "name": "Canh rau cải thịt bò viên",
        "image": "/images/foods/beef-ball-vegetable-soup.jpg",
        "calories": 300,
        "protein": 25,
        "carbs": 20,
        "fat": 15,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sodium"],
        "context": {
            "mealTime": ["lunch", "dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt bò viên", "quantity": 150, "unit": "g"},
            {"name": "Rau cải", "quantity": 200, "unit": "g"},
            {"name": "Cà rốt", "quantity": 50, "unit": "g"},
            {"name": "Hành lá", "quantity": 20, "unit": "g"},
            {"name": "Gừng", "quantity": 5, "unit": "g"}
        ],
        "instructions": [
            "Nấu nước dùng với gừng",
            "Thêm thịt bò viên",
            "Khi thịt chín, thêm rau",
            "Nêm gia vị và thưởng thức"
        ]
    },
    {
        "name": "Sữa chua với trái cây và granola",
        "image": "/images/foods/yogurt-fruits-granola.jpg",
        "calories": 300,
        "protein": 15,
        "carbs": 35,
        "fat": 12,
        "preferences": ["healthy", "high_protein"],
        "restrictions": ["low_sugar"],
        "context": {
            "mealTime": ["dessert", "snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua Hy Lạp", "quantity": 200, "unit": "g"},
            {"name": "Dâu tây", "quantity": 50, "unit": "g"},
            {"name": "Chuối", "quantity": 1, "unit": "quả"},
            {"name": "Granola", "quantity": 30, "unit": "g"},
            {"name": "Mật ong", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Cho sữa chua vào bát",
            "Cắt trái cây",
            "Thêm granola",
            "Rưới mật ong",
            "Thưởng thức"
        ]
    },
    # 3. Món giàu protein, ít carb/fat (bổ sung)
    {
        "name": "Ức gà luộc",
        "image": "/images/foods/boiled-chicken-breast.jpg",
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "preferences": ["high_protein", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Ức gà", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc ức gà với nước và một ít muối."]
    },
    {
        "name": "Cá ngừ hộp nước muối",
        "image": "/images/foods/tuna-can.jpg",
        "calories": 120,
        "protein": 26,
        "carbs": 0,
        "fat": 1,
        "preferences": ["high_protein", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Cá ngừ hộp", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc trộn salad."]
    },
    {
        "name": "Thịt bò nạc luộc",
        "image": "/images/foods/boiled-lean-beef.jpg",
        "calories": 170,
        "protein": 28,
        "carbs": 0,
        "fat": 5,
        "preferences": ["high_protein", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Thịt bò nạc", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc thịt bò với một ít muối."]
    },
    {
        "name": "Lòng trắng trứng luộc",
        "image": "/images/foods/boiled-egg-white.jpg",
        "calories": 52,
        "protein": 11,
        "carbs": 0.7,
        "fat": 0.2,
        "preferences": ["high_protein", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["breakfast", "lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Lòng trắng trứng", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc lòng trắng trứng cho đến khi chín."]
    },
    {
        "name": "Cá basa hấp",
        "image": "/images/foods/steamed-basa-fish.jpg",
        "calories": 105,
        "protein": 20,
        "carbs": 0,
        "fat": 2.5,
        "preferences": ["high_protein", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Cá basa", "quantity": 100, "unit": "g"}],
        "instructions": ["Hấp cá basa với gừng và hành."]
    },
    {
        "name": "Tôm luộc",
        "image": "/images/foods/boiled-shrimp.jpg",
        "calories": 99,
        "protein": 24,
        "carbs": 0.2,
        "fat": 0.3,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["shellfish"],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Tôm", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc tôm với một ít muối."]
    },
    {
        "name": "Đậu phụ non hấp",
        "image": "/images/foods/steamed-silken-tofu.jpg",
        "calories": 62,
        "protein": 7,
        "carbs": 1.2,
        "fat": 3,
        "preferences": ["high_protein", "vegan", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Đậu phụ non", "quantity": 100, "unit": "g"}],
        "instructions": ["Hấp đậu phụ non cho nóng, ăn kèm nước tương."]
    },
    {
        "name": "Cá thu nướng",
        "image": "/images/foods/grilled-mackerel.jpg",
        "calories": 205,
        "protein": 25,
        "carbs": 0,
        "fat": 11,
        "preferences": ["high_protein", "omega3", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Cá thu", "quantity": 100, "unit": "g"}],
        "instructions": ["Nướng cá thu với một ít muối và tiêu."]
    },
    {
        "name": "Thịt lợn nạc luộc",
        "image": "/images/foods/boiled-lean-pork.jpg",
        "calories": 143,
        "protein": 22,
        "carbs": 0,
        "fat": 5,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["pork"],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Thịt lợn nạc", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc thịt lợn nạc với một ít muối."]
    },
    {
        "name": "Sữa chua Hy Lạp không đường",
        "image": "/images/foods/greek-yogurt.jpg",
        "calories": 59,
        "protein": 10,
        "carbs": 3.6,
        "fat": 0.4,
        "preferences": ["high_protein", "healthy"],
        "restrictions": ["dairy"],
        "context": {"mealTime": ["breakfast", "snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Sữa chua Hy Lạp", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc kết hợp với trái cây ít đường."]
    },
    # 4. Món giàu carb, ít protein/fat (bổ sung)
    {
        "name": "Cơm trắng",
        "image": "/images/foods/white-rice.jpg",
        "calories": 130,
        "protein": 2.7,
        "carbs": 28,
        "fat": 0.3,
        "preferences": ["carb_rich"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Gạo trắng", "quantity": 100, "unit": "g"}],
        "instructions": ["Nấu cơm như bình thường."]
    },
    {
        "name": "Khoai lang luộc",
        "image": "/images/foods/boiled-sweet-potato.jpg",
        "calories": 86,
        "protein": 1.6,
        "carbs": 20,
        "fat": 0.1,
        "preferences": ["carb_rich", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["breakfast", "lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Khoai lang", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc khoai lang cho đến khi chín mềm."]
    },
    {
        "name": "Bánh mì trắng",
        "image": "/images/foods/white-bread.jpg",
        "calories": 265,
        "protein": 7,
        "carbs": 49,
        "fat": 3.2,
        "preferences": ["carb_rich"],
        "restrictions": ["gluten"],
        "context": {"mealTime": ["breakfast", "lunch"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Bánh mì trắng", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc nướng. "]
    },
    {
        "name": "Bún tươi",
        "image": "/images/foods/fresh-rice-noodles.jpg",
        "calories": 110,
        "protein": 1.8,
        "carbs": 25,
        "fat": 0.2,
        "preferences": ["carb_rich"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Bún tươi", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc dùng với nước dùng."]
    },
    {
        "name": "Miến dong luộc",
        "image": "/images/foods/boiled-glass-noodles.jpg",
        "calories": 80,
        "protein": 0.2,
        "carbs": 19,
        "fat": 0.1,
        "preferences": ["carb_rich", "vegan"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Miến dong", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc miến dong cho mềm."]
    },
    {
        "name": "Cháo trắng",
        "image": "/images/foods/plain-rice-porridge.jpg",
        "calories": 70,
        "protein": 1.5,
        "carbs": 16,
        "fat": 0.1,
        "preferences": ["carb_rich"],
        "restrictions": [],
        "context": {"mealTime": ["breakfast", "lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Gạo trắng", "quantity": 100, "unit": "g"}],
        "instructions": ["Nấu cháo trắng với nhiều nước."]
    },
    {
        "name": "Bánh phở luộc",
        "image": "/images/foods/boiled-pho-noodles.jpg",
        "calories": 110,
        "protein": 2,
        "carbs": 24,
        "fat": 0.2,
        "preferences": ["carb_rich"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Bánh phở", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc bánh phở cho mềm."]
    },
    {
        "name": "Khoai tây luộc",
        "image": "/images/foods/boiled-potato.jpg",
        "calories": 77,
        "protein": 2,
        "carbs": 17,
        "fat": 0.1,
        "preferences": ["carb_rich", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["breakfast", "lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Khoai tây", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc khoai tây cho đến khi chín mềm."]
    },
    {
        "name": "Ngô luộc",
        "image": "/images/foods/boiled-corn.jpg",
        "calories": 96,
        "protein": 3.4,
        "carbs": 21,
        "fat": 1.5,
        "preferences": ["carb_rich", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["breakfast", "lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Ngô", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc ngô cho đến khi chín mềm."]
    },
    {
        "name": "Bánh đa khô luộc",
        "image": "/images/foods/boiled-dried-noodles.jpg",
        "calories": 120,
        "protein": 2.5,
        "carbs": 27,
        "fat": 0.3,
        "preferences": ["carb_rich"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Bánh đa khô", "quantity": 100, "unit": "g"}],
        "instructions": ["Luộc bánh đa khô cho mềm."]
    },
    # 5. Món giàu fat, ít protein/carb (bổ sung)
    {
        "name": "Bơ quả",
        "image": "/images/foods/avocado.jpg",
        "calories": 160,
        "protein": 2,
        "carbs": 8.5,
        "fat": 15,
        "preferences": ["fat_rich", "healthy"],
        "restrictions": [],
        "context": {"mealTime": ["breakfast", "snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Bơ", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc làm salad."]
    },
    {
        "name": "Dầu oliu",
        "image": "/images/foods/olive-oil.jpg",
        "calories": 119,
        "protein": 0,
        "carbs": 0,
        "fat": 13.5,
        "preferences": ["fat_rich", "vegan"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Dầu oliu", "quantity": 15, "unit": "ml"}],
        "instructions": ["Dùng để trộn salad hoặc nấu ăn."]
    },
    {
        "name": "Hạnh nhân rang",
        "image": "/images/foods/roasted-almonds.jpg",
        "calories": 579,
        "protein": 21,
        "carbs": 22,
        "fat": 50,
        "preferences": ["fat_rich", "healthy"],
        "restrictions": ["nuts"],
        "context": {"mealTime": ["snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Hạnh nhân", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc làm topping cho salad."]
    },
    {
        "name": "Hạt óc chó",
        "image": "/images/foods/walnuts.jpg",
        "calories": 654,
        "protein": 15,
        "carbs": 14,
        "fat": 65,
        "preferences": ["fat_rich", "healthy"],
        "restrictions": ["nuts"],
        "context": {"mealTime": ["snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Hạt óc chó", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc làm topping cho salad."]
    },
    {
        "name": "Dừa tươi",
        "image": "/images/foods/coconut.jpg",
        "calories": 354,
        "protein": 3.3,
        "carbs": 15,
        "fat": 33,
        "preferences": ["fat_rich", "vegan"],
        "restrictions": [],
        "context": {"mealTime": ["snack", "dessert"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Cơm dừa", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc làm topping cho món tráng miệng."]
    },
    {
        "name": "Phô mai cheddar",
        "image": "/images/foods/cheddar-cheese.jpg",
        "calories": 403,
        "protein": 25,
        "carbs": 1.3,
        "fat": 33,
        "preferences": ["fat_rich", "dairy"],
        "restrictions": ["dairy"],
        "context": {"mealTime": ["breakfast", "snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Phô mai cheddar", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc dùng với bánh mì."]
    },
    {
        "name": "Bơ đậu phộng",
        "image": "/images/foods/peanut-butter.jpg",
        "calories": 588,
        "protein": 25,
        "carbs": 20,
        "fat": 50,
        "preferences": ["fat_rich", "vegan"],
        "restrictions": ["nuts"],
        "context": {"mealTime": ["breakfast", "snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Bơ đậu phộng", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc phết lên bánh mì."]
    },
    {
        "name": "Hạt điều rang",
        "image": "/images/foods/roasted-cashews.jpg",
        "calories": 553,
        "protein": 18,
        "carbs": 30,
        "fat": 44,
        "preferences": ["fat_rich", "healthy"],
        "restrictions": ["nuts"],
        "context": {"mealTime": ["snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Hạt điều", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc làm topping cho salad."]
    },
    {
        "name": "Dầu dừa",
        "image": "/images/foods/coconut-oil.jpg",
        "calories": 862,
        "protein": 0,
        "carbs": 0,
        "fat": 100,
        "preferences": ["fat_rich", "vegan"],
        "restrictions": [],
        "context": {"mealTime": ["lunch", "dinner"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Dầu dừa", "quantity": 15, "unit": "ml"}],
        "instructions": ["Dùng để nấu ăn hoặc trộn salad."]
    },
    {
        "name": "Hạt hướng dương rang",
        "image": "/images/foods/roasted-sunflower-seeds.jpg",
        "calories": 584,
        "protein": 21,
        "carbs": 20,
        "fat": 51,
        "preferences": ["fat_rich", "vegan"],
        "restrictions": ["nuts"],
        "context": {"mealTime": ["snack"], "season": "all", "weather": ["all"]},
        "ingredients": [{"name": "Hạt hướng dương", "quantity": 100, "unit": "g"}],
        "instructions": ["Ăn trực tiếp hoặc làm topping cho salad."]
    },
    {
        "name": "Trứng luộc",
        "image": "/images/foods/boiled-egg.jpg",
        "calories": 78,
        "protein": 6,
        "carbs": 1,
        "fat": 5,
        "preferences": ["healthy", "high_protein", "quick"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
        "mealTime": ["breakfast", "sanck"],
        "season": "all",
        "weather": ["all"]
        },
        "ingredients": [
        {"name": "Trứng gà", "quantity": 50, "unit": "g"},
        {"name": "Muối", "quantity": 1, "unit": "g"}
        ],
        "instructions": [
        "Cho trứng vào nồi, thêm nước và một chút muối.",
        "Luộc trong 8-10 phút đến khi trứng chín.",
        "Bóc vỏ và dùng nóng."
        ]
        },
        {
        "name": "Ức gà nướng",
        "image": "/images/foods/grilled-chicken-breast.jpg",
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "preferences": ["healthy", "high_protein", "low_fat"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["lunch"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Ức gà", "quantity": 100, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch ức gà, ướp với muối và tiêu trong 15 phút.",
            "Nướng trên chảo hoặc lò nướng ở 200°C trong 20 phút, trở đều.",
            "Cắt lát và dùng nóng."
        ]
        },
        {
        "name": "Đậu hũ chiên giòn",
        "image": "/images/foods/fried-tofu.jpg",
        "calories": 120,
        "protein": 10,
        "carbs": 2,
        "fat": 8,
        "preferences": ["vegan", "high_protein"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 100, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Cắt đậu hũ thành miếng vừa ăn, để ráo nước.",
            "Đun nóng dầu, chiên đậu hũ ở lửa vừa đến khi vàng giòn.",
            "Vớt ra, để ráo dầu và dùng nóng."
        ]
        },
        {
        "name": "Tôm hấp bia",
        "image": "/images/foods/steamed-shrimp-beer.jpg",
        "calories": 90,
        "protein": 20,
        "carbs": 1,
        "fat": 1,
        "preferences": ["healthy", "high_protein", "low_fat"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Tôm tươi", "quantity": 100, "unit": "g"},
            {"name": "Bia", "quantity": 50, "unit": "ml"},
            {"name": "Sả", "quantity": 10, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch tôm, để ráo. Đập dập sả và lót dưới nồi.",
            "Đặt tôm lên trên sả, đổ bia vào nồi.",
            "Hấp trong 10 phút đến khi tôm chín đỏ, dùng nóng."
        ]
        },
        {
        "name": "Thịt heo luộc",
        "image": "/images/foods/boiled-pork.jpg",
        "calories": 200,
        "protein": 25,
        "carbs": 0,
        "fat": 10,
        "preferences": ["high_protein", "quick"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["lunch"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt heo", "quantity": 100, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch thịt heo, cho vào nồi nước lạnh với chút muối.",
            "Luộc ở lửa vừa trong 20 phút đến khi thịt chín.",
            "Vớt ra, thái lát mỏng, dùng với nước mắm."
        ]
        },
        {
        "name": "Cá thu chiên",
        "image": "/images/foods/fried-mackerel.jpg",
        "calories": 190,
        "protein": 22,
        "carbs": 0,
        "fat": 12,
        "preferences": ["high_protein"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá thu", "quantity": 100, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Rửa sạch cá thu, ướp với muối trong 10 phút.",
            "Đun nóng dầu, chiên cá ở lửa vừa đến khi vàng hai mặt.",
            "Vớt ra, để ráo dầu, dùng nóng."
        ]
        },
        {
        "name": "Đậu hũ hấp trứng",
        "image": "/images/foods/steamed-tofu-egg.jpg",
        "calories": 110,
        "protein": 12,
        "carbs": 2,
        "fat": 6,
        "preferences": ["vegan", "high_protein", "healthy"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Đậu hũ", "quantity": 80, "unit": "g"},
            {"name": "Trứng gà", "quantity": 50, "unit": "g"}
        ],
        "instructions": [
            "Cắt đậu hũ thành miếng, đặt vào bát.",
            "Đập trứng vào bát, trộn đều với đậu hũ.",
            "Hấp trong 15 phút đến khi trứng chín, dùng nóng."
        ]
        },
        {
        "name": "Trứng chiên cà chua",
        "image": "/images/foods/egg-tomato-omelette.jpg",
        "calories": 90,
        "protein": 6,
        "carbs": 5,
        "fat": 5,
        "preferences": ["healthy", "high_protein", "quick"],
        "restrictions": ["gluten_free"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Trứng gà", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 3, "unit": "ml"}
        ],
        "instructions": [
            "Đập trứng vào bát, đánh tan. Cà chua cắt nhỏ.",
            "Đun nóng dầu, cho cà chua vào xào sơ, sau đó đổ trứng vào.",
            "Chiên ở lửa vừa đến khi trứng chín, dùng nóng."
        ]
        },
        {
        "name": "Trứng chiên cà chua",
        "image": "/images/foods/egg-tomato-omelette.jpg",
        "calories": 90,
        "protein": 6,
        "carbs": 5,
        "fat": 5,
        "preferences": ["healthy", "high_protein", "quick"],
        "restrictions": ["gluten_free"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Trứng gà", "quantity": 50, "unit": "g"},
            {"name": "Cà chua", "quantity": 50, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 3, "unit": "ml"}
        ],
        "instructions": [
            "Đập trứng vào bát, đánh tan. Cà chua cắt nhỏ.",
            "Đun nóng dầu, cho cà chua vào xào sơ, sau đó đổ trứng vào.",
            "Chiên ở lửa vừa đến khi trứng chín, dùng nóng."
        ]
        },
        {
        "name": "Thịt bò nướng lá lốt",
        "image": "/images/foods/grilled-beef-lot-leaf.jpg",
        "calories": 180,
        "protein": 24,
        "carbs": 1,
        "fat": 9,
        "preferences": ["high_protein"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt bò", "quantity": 100, "unit": "g"},
            {"name": "Lá lốt", "quantity": 20, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"}
        ],
        "instructions": [
            "Băm nhỏ thịt bò, ướp với muối trong 15 phút.",
            "Cuốn thịt bò vào lá lốt, xiên que.",
            "Nướng trên than hoặc lò nướng ở 200°C trong 10 phút, dùng nóng."
        ]
        },
        {
        "name": "Cơm gạo lứt",
        "image": "/images/foods/boiled-brown-rice.jpg",
        "calories": 130,
        "protein": 2.5,
        "carbs": 25,
        "fat": 1,
        "preferences": ["healthy", "high_carb", "low_fat"],
        "restrictions": ["gluten_free", "vegan"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo lứt", "quantity": 100, "unit": "g"},
            {"name": "Nước", "quantity": 200, "unit": "ml"}
        ],
        "instructions": [
            "Rửa gạo lứt sạch, ngâm 30 phút.",
            "Cho gạo và nước vào nồi, luộc ở lửa vừa trong 40 phút đến khi chín mềm.",
            "Để ráo nước, dùng nóng."
        ]
        },
        {
        "name": "Bánh mì ",
        "image": "/images/foods/whole-wheat-toast.jpg",
        "calories": 250,
        "protein": 9,
        "carbs": 48,
        "fat": 3,
        "preferences": ["high_carb", "quick"],
        "restrictions": ["vegetarian"],
        "context": {
            "mealTime": ["lunch"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì nguyên cám", "quantity": 100, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 2, "unit": "ml"}
        ],
        "instructions": [
            "Cắt bánh mì thành lát, phết nhẹ dầu ô liu.",
            "Nướng ở 180°C trong 10 phút đến khi vàng giòn.",
            "Dùng nóng với rau hoặc phô mai."
        ]
        },
        {
        "name": "Khoai lang chiên",
        "image": "/images/foods/fried-sweet-potato.jpg",
        "calories": 150,
        "protein": 2,
        "carbs": 35,
        "fat": 4,
        "preferences": ["high_carb", "healthy"],
        "restrictions": ["gluten_free", "vegan"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Khoai lang", "quantity": 100, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Gọt vỏ khoai lang, cắt thành que, rửa sạch.",
            "Đun nóng dầu, chiên khoai ở lửa vừa đến khi vàng giòn.",
            "Vớt ra, để ráo dầu, dùng nóng."
        ]
        },
        {
        "name": "Bánh khoai tây hấp",
        "image": "/images/foods/steamed-potato-cake.jpg",
        "calories": 120,
        "protein": 3,
        "carbs": 28,
        "fat": 1,
        "preferences": ["high_carb", "healthy"],
        "restrictions": ["gluten_free", "vegan"],
        "context": {
            "mealTime": ["snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Khoai tây", "quantity": 100, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"}
        ],
        "instructions": [
            "Gọt vỏ khoai tây, nghiền nhuyễn, nêm muối.",
            "Định hình thành bánh, đặt vào xửng.",
            "Hấp trong 15 phút đến khi chín mềm, dùng nóng."
        ]
        },
        {
        "name": "Cơm trắng",
        "image": "/images/foods/boiled-white-rice.jpg",
        "calories": 130,
        "protein": 2.5,
        "carbs": 28,
        "fat": 0.3,
        "preferences": ["high_carb", "quick"],
        "restrictions": ["gluten_free", "vegan"],
        "context": {
            "mealTime": ["lunch"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Gạo trắng", "quantity": 100, "unit": "g"},
            {"name": "Nước", "quantity": 200, "unit": "ml"}
        ],
        "instructions": [
            "Rửa gạo trắng sạch, ngâm 20 phút.",
            "Cho gạo và nước vào nồi, luộc ở lửa vừa trong 20 phút.",
            "Để ráo nước, dùng nóng."
        ]
        },
        {
        "name": "Bánh ngô chiên",
        "image": "/images/foods/fried-corn-cake.jpg",
        "calories": 180,
        "protein": 4,
        "carbs": 32,
        "fat": 6,
        "preferences": ["high_carb", "vegetarian"],
        "restrictions": ["gluten_free"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Ngô ngọt", "quantity": 100, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Xay nhuyễn ngô, định hình thành bánh.",
            "Đun nóng dầu, chiên bánh ngô ở lửa vừa đến khi vàng.",
            "Vớt ra, để ráo dầu, dùng nóng."
        ]
        },
        {
        "name": "Yến mạch",
        "image": "/images/foods/cooked-oatmeal.jpg",
        "calories": 120,
        "protein": 5,
        "carbs": 27,
        "fat": 2,
        "preferences": ["high_carb", "healthy"],
        "restrictions": ["gluten_free", "vegan"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Yến mạch", "quantity": 100, "unit": "g"},
            {"name": "Nước", "quantity": 200, "unit": "ml"}
        ],
        "instructions": [
            "Cho yến mạch và nước vào nồi.",
            "Nấu ở lửa vừa trong 10 phút, khuấy đều đến khi sệt.",
            "Dùng nóng với trái cây tùy chọn."
        ]
        },
        {
        "name": "Bánh mì khoai lang nướng",
        "image": "/images/foods/sweet-potato-bread-toast.jpg",
        "calories": 220,
        "protein": 4,
        "carbs": 45,
        "fat": 3,
        "preferences": ["high_carb", "healthy"],
        "restrictions": ["vegetarian"],
        "context": {
            "mealTime": ["snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh mì", "quantity": 80, "unit": "g"},
            {"name": "Khoai lang nghiền", "quantity": 20, "unit": "g"}
        ],
        "instructions": [
            "Phết khoai lang nghiền lên bánh mì.",
            "Nướng ở 180°C trong 8 phút đến khi vàng.",
            "Dùng nóng hoặc nguội."
        ]
        },
        {
        "name": "Mì sợi",
        "image": "/images/foods/boiled-noodles.jpg",
        "calories": 140,
        "protein": 5,
        "carbs": 30,
        "fat": 1,
        "preferences": ["high_carb", "quick"],
        "restrictions": ["vegetarian"],
        "context": {
            "mealTime": ["lunch"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Mì sợi", "quantity": 100, "unit": "g"},
            {"name": "Nước", "quantity": 300, "unit": "ml"}
        ],
        "instructions": [
            "Đun sôi nước, cho mì sợi vào luộc 5 phút.",
            "Vớt mì ra, để ráo nước.",
            "Dùng với nước sốt hoặc rau tùy chọn."
        ]
        },
        {
        "name": "Bánh gạo nướng",
        "image": "/images/foods/grilled-rice-cake.jpg",
        "calories": 160,
        "protein": 3,
        "carbs": 35,
        "fat": 1,
        "preferences": ["high_carb", "healthy"],
        "restrictions": ["gluten_free", "vegan"],
        "context": {
            "mealTime": ["snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Bánh gạo", "quantity": 100, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"}
        ],
        "instructions": [
            "Phết nhẹ muối lên bánh gạo.",
            "Nướng ở 150°C trong 5 phút đến khi giòn.",
            "Dùng nóng hoặc nguội."
        ]
        },
        {
        "name": "Bơ nghiền",
        "image": "/images/foods/mashed-avocado.jpg",
        "calories": 160,
        "protein": 2,
        "carbs": 9,
        "fat": 15,
        "preferences": ["healthy", "high_fat", "vegan"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Quả bơ", "quantity": 100, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"}
        ],
        "instructions": [
            "Cắt đôi quả bơ, lấy phần thịt, nghiền nhuyễn.",
            "Nêm chút muối cho vừa miệng.",
            "Dùng ngay với bánh mì hoặc ăn trực tiếp."
        ]
        },
        {
        "name": "Thịt ba chỉ nướng",
        "image": "/images/foods/grilled-pork-belly.jpg",
        "calories": 300,
        "protein": 12,
        "carbs": 0,
        "fat": 28,
        "preferences": ["high_fat", "savory"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["lunch"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt ba chỉ", "quantity": 100, "unit": "g"},
            {"name": "Muối", "quantity": 1, "unit": "g"},
            {"name": "Tiêu", "quantity": 0.5, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch thịt ba chỉ, ướp với muối và tiêu trong 15 phút.",
            "Nướng trên chảo hoặc lò ở 200°C trong 20 phút, trở đều.",
            "Cắt lát, dùng nóng với rau sống."
        ]
        },
        {
        "name": "Cá hồi chiên",
        "image": "/images/foods/fried-salmon.jpg",
        "calories": 250,
        "protein": 20,
        "carbs": 0,
        "fat": 18,
        "preferences": ["high_fat", "healthy"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Cá hồi fillet", "quantity": 100, "unit": "g"},
            {"name": "Dầu ô liu", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Rửa sạch cá hồi, ướp với muối trong 10 phút.",
            "Đun nóng dầu ô liu, chiên cá ở lửa vừa đến khi vàng hai mặt.",
            "Dùng nóng với chanh hoặc rau."
        ]
        },
        {
        "name": "Hạt óc chó rang",
        "image": "/images/foods/roasted-walnuts.jpg",
        "calories": 185,
        "protein": 4,
        "carbs": 4,
        "fat": 18,
        "preferences": ["high_fat", "healthy", "vegan"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Hạt óc chó", "quantity": 100, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch hạt óc chó, để ráo nước.",
            "Rang trên chảo không dầu ở lửa vừa trong 5-7 phút đến khi thơm.",
            "Để nguội, dùng làm món ăn vặt."
        ]
        },
        {
        "name": "Dừa nạo",
        "image": "/images/foods/shredded-coconut.jpg",
        "calories": 354,
        "protein": 3,
        "carbs": 15,
        "fat": 33,
        "preferences": ["high_fat", "vegan"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["lunch"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Dừa tươi", "quantity": 100, "unit": "g"}
        ],
        "instructions": [
            "Tách vỏ dừa, nạo phần cùi trắng.",
            "Rửa sạch, để ráo nước.",
            "Dùng trực tiếp hoặc trộn với đường tùy thích."
        ]
        },
        {
        "name": "Trứng ốp la",
        "image": "/images/foods/fried-egg.jpg",
        "calories": 120,
        "protein": 6,
        "carbs": 1,
        "fat": 10,
        "preferences": ["high_fat", "quick"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Trứng gà", "quantity": 50, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Đun nóng dầu trong chảo.",
            "Đập trứng vào, rán ở lửa vừa đến khi lòng đỏ chín vừa.",
            "Dùng nóng với bánh mì hoặc rau."
        ]
        },
        {
        "name": "Phô mai tan chảy",
        "image": "/images/foods/melted-cheese.jpg",
        "calories": 300,
        "protein": 7,
        "carbs": 1,
        "fat": 25,
        "preferences": ["high_fat", "savory"],
        "restrictions": ["gluten_free"],
        "context": {
            "mealTime": ["snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Phô mai cheddar", "quantity": 100, "unit": "g"}
        ],
        "instructions": [
            "Cắt phô mai thành miếng nhỏ.",
            "Đun chảy phô mai trên chảo hoặc lò vi sóng ở nhiệt độ thấp.",
            "Dùng nóng với bánh mì hoặc rau củ."
        ]
        },
        {
        "name": "Thịt xá xíu",
        "image": "/images/foods/char-siu-pork.jpg",
        "calories": 280,
        "protein": 18,
        "carbs": 5,
        "fat": 20,
        "preferences": ["high_fat", "savory"],
        "restrictions": ["gluten_free"],
        "context": {
            "mealTime": ["dinner"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Thịt heo vai", "quantity": 100, "unit": "g"},
            {"name": "Mật ong", "quantity": 10, "unit": "g"},
            {"name": "Dầu ăn", "quantity": 5, "unit": "ml"}
        ],
        "instructions": [
            "Ướp thịt với mật ong và dầu trong 1 giờ.",
            "Nướng ở 200°C trong 25 phút, quét thêm nước ướp giữa chừng.",
            "Cắt lát, dùng nóng với cơm hoặc rau."
        ]
        },
        {
        "name": "Hạt điều rang",
        "image": "/images/foods/roasted-cashews.jpg",
        "calories": 180,
        "protein": 5,
        "carbs": 9,
        "fat": 15,
        "preferences": ["high_fat", "healthy", "vegan"],
        "restrictions": ["gluten_free", "low_carb"],
        "context": {
            "mealTime": ["snack"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Hạt điều", "quantity": 100, "unit": "g"}
        ],
        "instructions": [
            "Rửa sạch hạt điều, để ráo nước.",
            "Rang trên chảo không dầu ở lửa vừa trong 5-7 phút đến khi thơm.",
            "Để nguội, dùng làm món ăn vặt."
        ]
        },
        {
        "name": "Sữa chua béo",
        "image": "/images/foods/full-fat-yogurt.jpg",
        "calories": 150,
        "protein": 5,
        "carbs": 7,
        "fat": 12,
        "preferences": ["high_fat", "healthy"],
        "restrictions": ["gluten_free"],
        "context": {
            "mealTime": ["breakfast"],
            "season": "all",
            "weather": ["all"]
        },
        "ingredients": [
            {"name": "Sữa chua béo", "quantity": 100, "unit": "g"}
        ],
        "instructions": [
            "Lấy sữa chua béo ra khỏi tủ lạnh.",
            "Trộn đều với mật ong hoặc trái cây tùy chọn.",
            "Dùng lạnh để tăng hương vị."
        ]
        }


    
    
]

# Thêm dữ liệu vào database
try:
    result = foods_collection.insert_many(healthy_foods)
    print(f"Đã thêm {len(result.inserted_ids)} món ăn vào database")
except Exception as e:
    print(f"Lỗi khi thêm dữ liệu: {str(e)}")