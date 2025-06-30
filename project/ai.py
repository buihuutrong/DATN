import google.generativeai as genai
import os

# Thay bằng API key bạn lấy từ https://aistudio.google.com/app/apikey
genai.configure(api_key="AIzaSyBQTAW8w-iNkbX0PvfsFdECdGhBSlIwZOY")

generation_config = {
    "temperature": 0.0,
    "top_p": 0.1,
    "top_k": 1,
    "max_output_tokens": 2048
}

try:
    # Liệt kê các model khả dụng
    print("Các model bạn có thể dùng:")
    models = genai.list_models()
    for m in models:
        print("-", m.name)
    # Sử dụng model đúng tên (ví dụ: "models/gemini-pro")
    model = genai.GenerativeModel("models/gemini-1.5-pro-latest", generation_config=generation_config)
    response = model.generate_content("tạo thực đơn hôm nay")
    print("Gemini trả lời:", response.text)
except Exception as e:
    print("Lỗi:", e)