import requests
import json
from datetime import datetime, timedelta

# Cấu hình
BASE_URL = "http://localhost:8000"
USER_ID = "test_user_123"
TODAY = datetime.now().strftime("%Y-%m-%d")
YESTERDAY = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
TOMORROW = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

def test_date_issue():
    """Test để kiểm tra vấn đề với ngày của thực đơn"""
    
    print("=== TEST DATE ISSUE ===")
    print(f"User ID: {USER_ID}")
    print(f"Today: {TODAY}")
    print(f"Yesterday: {YESTERDAY}")
    print(f"Tomorrow: {TOMORROW}")
    print()
    
    # 1. Kiểm tra vấn đề với ngày
    print("1. Kiểm tra vấn đề với ngày:")
    try:
        response = requests.get(f"{BASE_URL}/menu/check-date-issue?userId={USER_ID}")
        if response.status_code == 200:
            data = response.json()
            print(f"   - Ngày hiện tại: {data['current_date']}")
            print(f"   - Thực đơn hôm nay: {data['today_menus']['count']}")
            print(f"   - Thực đơn hôm qua: {data['yesterday_menus']['count']}")
            print(f"   - Thực đơn ngày mai: {data['tomorrow_menus']['count']}")
            print(f"   - Phát hiện vấn đề: {'CÓ' if data['issue_detected'] else 'KHÔNG'}")
            
            if data['issue_detected']:
                print("   - CÓ VẤN ĐỀ: Thực đơn được lưu cho ngày mai!")
                print("   - Chi tiết thực đơn ngày mai:")
                for menu in data['tomorrow_menus']['menus']:
                    print(f"     + ID: {menu['_id']}, Created: {menu['createdAt']}")
        else:
            print(f"   - Lỗi: {response.status_code}")
    except Exception as e:
        print(f"   - Lỗi kết nối: {e}")
    
    print()
    
    # 2. Tạo thực đơn test với ngày hôm nay
    print("2. Tạo thực đơn test với ngày hôm nay:")
    test_menu = {
        "userId": USER_ID,
        "date": TODAY,  # Sử dụng ngày hôm nay
        "meals": [
            {
                "mealName": "Bữa sáng test ngày",
                "foods": [
                    {
                        "_id": "test_food_date",
                        "name": "Bánh mì ngày",
                        "calories": 300,
                        "protein": 12,
                        "carbs": 45,
                        "fat": 4
                    }
                ],
                "completed": False,
                "mealTime": "08:00"
            }
        ],
        "totalNutrition": {
            "calories": 300,
            "protein": 12,
            "carbs": 45,
            "fat": 4
        },
        "compliance": 0,
        "streak": 0
    }
    
    try:
        response = requests.post(f"{BASE_URL}/save-menu", json=test_menu)
        if response.status_code == 200:
            data = response.json()
            print(f"   - Đã tạo thực đơn: {data['menuId']}")
            print(f"   - Ngày được lưu: {data['savedDate']}")
            print(f"   - Ngày hiện tại: {data['currentDate']}")
        else:
            print(f"   - Lỗi tạo thực đơn: {response.status_code}")
    except Exception as e:
        print(f"   - Lỗi kết nối: {e}")
    
    print()
    
    # 3. Kiểm tra lại sau khi tạo thực đơn
    print("3. Kiểm tra lại sau khi tạo thực đơn:")
    try:
        response = requests.get(f"{BASE_URL}/menu/check-date-issue?userId={USER_ID}")
        if response.status_code == 200:
            data = response.json()
            print(f"   - Thực đơn hôm nay: {data['today_menus']['count']}")
            print(f"   - Thực đơn hôm qua: {data['yesterday_menus']['count']}")
            print(f"   - Thực đơn ngày mai: {data['tomorrow_menus']['count']}")
            print(f"   - Phát hiện vấn đề: {'CÓ' if data['issue_detected'] else 'KHÔNG'}")
        else:
            print(f"   - Lỗi: {response.status_code}")
    except Exception as e:
        print(f"   - Lỗi kết nối: {e}")
    
    print()
    
    # 4. Nếu có vấn đề, sửa lại
    print("4. Sửa vấn đề nếu có:")
    try:
        response = requests.get(f"{BASE_URL}/menu/check-date-issue?userId={USER_ID}")
        if response.status_code == 200:
            data = response.json()
            if data['issue_detected']:
                print("   - Phát hiện vấn đề, đang sửa...")
                fix_response = requests.post(f"{BASE_URL}/menu/fix-date-issue?userId={USER_ID}&from_date={TOMORROW}&to_date={TODAY}")
                if fix_response.status_code == 200:
                    fix_data = fix_response.json()
                    print(f"   - {fix_data['message']}")
                else:
                    print(f"   - Lỗi sửa vấn đề: {fix_response.status_code}")
            else:
                print("   - Không có vấn đề cần sửa")
        else:
            print(f"   - Lỗi: {response.status_code}")
    except Exception as e:
        print(f"   - Lỗi kết nối: {e}")

if __name__ == "__main__":
    test_date_issue() 