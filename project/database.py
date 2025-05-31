from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os

# Lấy MongoDB URI từ biến môi trường hoặc sử dụng giá trị mặc định
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Tạo client cho MongoDB
client = AsyncIOMotorClient(MONGODB_URL)

# Lấy database
db = client.menu_app 