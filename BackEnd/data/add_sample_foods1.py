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
    "name": "Ức gà hấp lá chanh",
    "image": "/images/foods/chicken-lemongrass.jpg",
    "calories": 165,
    "protein": 31,  
    "carbs": 0,     
    "fat": 3.6,     
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Ức gà", "quantity": 100, "unit": "g"},
      {"name": "Lá chanh", "quantity": 5, "unit": "lá"},
      {"name": "Muối", "quantity": 2, "unit": "g"}
    ],
    "instructions": [
      "Ướp ức gà với muối và lá chanh thái nhỏ, 15 phút.",
      "Hấp gà trong 20 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Cá thu hấp gừng",
    "image": "/images/foods/mackerel-ginger.jpg",
    "calories": 189,
    "protein": 25,  
    "carbs": 0,     
    "fat": 10,      
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Cá thu", "quantity": 100, "unit": "g"},
      {"name": "Gừng", "quantity": 10, "unit": "g"},
      {"name": "Muối", "quantity": 2, "unit": "g"}
    ],
    "instructions": [
      "Ướp cá với gừng thái sợi và muối, 10 phút.",
      "Hấp cá trong 15 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Thịt bò áp chảo ít mỡ",
    "image": "/images/foods/lean-beef-pan-seared.jpg",
    "calories": 179,
    "protein": 28,  
    "carbs": 0,     
    "fat": 7,       
    "preferences": ["high_protein", "healthy"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Thịt bò thăn", "quantity": 100, "unit": "g"},
      {"name": "Muối", "quantity": 2, "unit": "g"},
      {"name": "Tiêu", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp bò với muối và tiêu, 10 phút.",
      "Áp chảo bò 3 phút mỗi mặt, phục vụ nóng."
    ]
  },
  {
    "name": "Đậu hũ hấp nấm đông cô",
    "image": "/images/foods/tofu-shiitake.jpg",
    "calories": 76,
    "protein": 8,   
    "carbs": 2,     
    "fat": 4,       
    "preferences": ["vegan", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Đậu hũ", "quantity": 100, "unit": "g"},
      {"name": "Nấm đông cô", "quantity": 20, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Thái đậu hũ và nấm, ướp với muối.",
      "Hấp trong 10 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Tôm hấp sả",
    "image": "/images/foods/shrimp-lemongrass.jpg",
    "calories": 99,
    "protein": 21,  
    "carbs": 0,     
    "fat": 1.4,     
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Tôm tươi", "quantity": 100, "unit": "g"},
      {"name": "Sả", "quantity": 10, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp tôm với sả băm và muối, 10 phút.",
      "Hấp tôm trong 10 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Cá basa hấp hành",
    "image": "/images/foods/basa-onion.jpg",
    "calories": 90,
    "protein": 15,  
    "carbs": 0,     
    "fat": 3,       
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Cá basa", "quantity": 100, "unit": "g"},
      {"name": "Hành lá", "quantity": 10, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp cá với hành lá và muối, 10 phút.",
      "Hấp cá trong 15 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Thịt heo nạc luộc",
    "image": "/images/foods/lean-pork-boiled.jpg",
    "calories": 143,
    "protein": 27,  
    "carbs": 0,     
    "fat": 3,       
    "preferences": ["high_protein", "healthy"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Thịt heo nạc", "quantity": 100, "unit": "g"},
      {"name": "Muối", "quantity": 2, "unit": "g"}
    ],
    "instructions": [
      "Luộc thịt heo với muối trong 20 phút.",
      "Thái lát mỏng, phục vụ nóng."
    ]
  },
  {
    "name": "Trứng hấp nấm rơm",
    "image": "/images/foods/egg-mushroom.jpg",
    "calories": 155,
    "protein": 13,  
    "carbs": 1,     
    "fat": 11,      
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["breakfast", "lunch"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Trứng gà", "quantity": 100, "unit": "g"},
      {"name": "Nấm rơm", "quantity": 20, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Đánh tan trứng, trộn với nấm rơm và muối.",
      "Hấp trong 10 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Cá lóc hấp sả",
    "image": "/images/foods/snakehead-lemongrass.jpg",
    "calories": 105,
    "protein": 20,  
    "carbs": 0,     
    "fat": 2.5,    
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Cá lóc", "quantity": 100, "unit": "g"},
      {"name": "Sả", "quantity": 10, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp cá với sả băm và muối, 10 phút.",
      "Hấp cá trong 20 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Thịt gà ta luộc",
    "image": "/images/foods/free-range-chicken-boiled.jpg",
    "calories": 170,
    "protein": 29,  
    "carbs": 0,     
    "fat": 6,       
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Gà ta", "quantity": 100, "unit": "g"},
      {"name": "Muối", "quantity": 2, "unit": "g"}
    ],
    "instructions": [
      "Luộc gà với muối trong 25 phút.",
      "Thái lát mỏng, phục vụ nóng."
    ]
  },
  {
    "name": "Ức gà nướng muối ớt",
    "image": "/images/foods/grilled-chicken-chili.jpg",
    "calories": 165,
    "protein": 31,  
    "carbs": 0,     
    "fat": 3.6,     
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Ức gà", "quantity": 100, "unit": "g"},
      {"name": "Muối ớt", "quantity": 5, "unit": "g"},
      {"name": "Tiêu", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp ức gà với muối ớt và tiêu, để thấm 15 phút.",
      "Nướng trên vỉ hoặc lò nướng ở 200°C trong 20 phút, trở mặt để chín đều.",
      "Phục vụ nóng."
    ]
  },
  {
    "name": "Cá thu nướng giấy bạc",
    "image": "/images/foods/mackerel-foil-grilled.jpg",
    "calories": 189,
    "protein": 25,  
    "carbs": 0,     
    "fat": 10,      
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Cá thu", "quantity": 100, "unit": "g"},
      {"name": "Gừng", "quantity": 10, "unit": "g"},
      {"name": "Muối", "quantity": 2, "unit": "g"}
    ],
    "instructions": [
      "Ướp cá với gừng thái lát và muối, để thấm 10 phút.",
      "Bọc cá trong giấy bạc, nướng ở 200°C trong 25 phút.",
      "Phục vụ nóng."
    ]
  },
  {
    "name": "Thịt bò nướng lá lốt",
    "image": "/images/foods/beef-lot-leaf-grilled.jpg",
    "calories": 179,
    "protein": 28,  
    "carbs": 0,     
    "fat": 7,       
    "preferences": ["high_protein", "healthy"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Thịt bò thăn", "quantity": 100, "unit": "g"},
      {"name": "Lá lốt", "quantity": 10, "unit": "lá"},
      {"name": "Muối", "quantity": 2, "unit": "g"}
    ],
    "instructions": [
      "Ướp bò với muối, để thấm 10 phút.",
      "Cuốn thịt bò trong lá lốt, nướng trên vỉ ở 200°C trong 15 phút.",
      "Phục vụ nóng."
    ]
  },
  {
    "name": "Đậu hũ nướng sả",
    "image": "/images/foods/tofu-lemongrass-grilled.jpg",
    "calories": 76,
    "protein": 8,   
    "carbs": 2,    
    "fat": 4,       
    "preferences": ["vegan", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Đậu hũ", "quantity": 100, "unit": "g"},
      {"name": "Sả", "quantity": 10, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp đậu hũ với sả băm và muối, để thấm 10 phút.",
      "Nướng đậu hũ trên vỉ ở 180°C trong 15 phút, trở mặt để vàng đều.",
      "Phục vụ nóng."
    ]
  },
  {
    "name": "Tôm nướng muối tiêu",
    "image": "/images/foods/shrimp-grilled-salt-pepper.jpg",
    "calories": 99,
    "protein": 21,  
    "carbs": 0,     
    "fat": 1.4,     
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Tôm tươi", "quantity": 100, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"},
      {"name": "Tiêu", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp tôm với muối và tiêu, để thấm 10 phút.",
      "Nướng tôm trên vỉ ở 200°C trong 10 phút, trở mặt để chín đều.",
      "Phục vụ nóng."
    ]
  },
  {
    "name": "Cá basa nướng riềng",
    "image": "/images/foods/basa-galangal-grilled.jpg",
    "calories": 90,
    "protein": 15, 
    "carbs": 0,     
    "fat": 3,       
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Cá basa", "quantity": 100, "unit": "g"},
      {"name": "Riềng", "quantity": 10, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp cá với riềng băm và muối, để thấm 15 phút.",
      "Nướng cá trên vỉ ở 200°C trong 20 phút, trở mặt để chín đều.",
      "Phục vụ nóng."
    ]
  },
  {
    "name": "Thịt heo nạc áp chảo rồi nướng",
    "image": "/images/foods/pork-pan-seared-grilled.jpg",
    "calories": 143,
    "protein": 27,  
    "carbs": 0,     
    "fat": 3,      
    "preferences": ["high_protein", "healthy"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Thịt heo nạc", "quantity": 100, "unit": "g"},
      {"name": "Muối", "quantity": 2, "unit": "g"},
      {"name": "Tiêu", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp thịt heo với muối và tiêu, để thấm 10 phút.",
      "Áp chảo thịt trên chảo nóng 2 phút mỗi mặt.",
      "Nướng thịt trong lò ở 200°C trong 10 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Trứng nướng lá chuối",
    "image": "/images/foods/egg-banana-leaf-grilled.jpg",
    "calories": 155,
    "protein": 13,  
    "carbs": 1,     
    "fat": 11,      
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["breakfast", "lunch"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Trứng gà", "quantity": 100, "unit": "g"},
      {"name": "Lá chuối", "quantity": 1, "unit": "lá"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Đánh tan trứng với muối.",
      "Đổ trứng vào lá chuối, gói kín.",
      "Nướng trên vỉ ở 180°C trong 15 phút, phục vụ nóng."
    ]
  },
  {
    "name": "Cá lóc nướng trui",
    "image": "/images/foods/snakehead-grilled.jpg",
    "calories": 105,
    "protein": 20,  
    "carbs": 0,     
    "fat": 2.5,    
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb", "low_fat"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Cá lóc", "quantity": 100, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Làm sạch cá, ướp với muối, để thấm 10 phút.",
      "Nướng cá trên than hồng trong 20 phút, trở đều để chín vàng.",
      "Phục vụ nóng."
    ]
  },
  {
    "name": "Thịt gà ta nướng mật ong",
    "image": "/images/foods/chicken-honey-grilled.jpg",
    "calories": 170,
    "protein": 29,  
    "carbs": 1,     
    "fat": 6,       
    "preferences": ["healthy", "high_protein"],
    "restrictions": ["gluten_free", "low_carb"],
    "context": {
      "mealTime": ["lunch", "dinner"],
      "season": "all",
      "weather": ["all"]
    },
    "ingredients": [
      {"name": "Gà ta", "quantity": 100, "unit": "g"},
      {"name": "Mật ong", "quantity": 5, "unit": "g"},
      {"name": "Muối", "quantity": 1, "unit": "g"}
    ],
    "instructions": [
      "Ướp gà với mật ong và muối, để thấm 15 phút.",
      "Nướng gà trên vỉ ở 200°C trong 25 phút, trở mặt để vàng đều.",
      "Phục vụ nóng."
    ]
  }

    
    
    
]

# Thêm dữ liệu vào database
try:
    result = foods_collection.insert_many(healthy_foods)
    print(f"Đã thêm {len(result.inserted_ids)} món ăn vào database")
except Exception as e:
    print(f"Lỗi khi thêm dữ liệu: {str(e)}")