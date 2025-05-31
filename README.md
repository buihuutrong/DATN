# Hệ thống tạo thực đơn thông minh sử dụng thuật toán di truyền

Hệ thống tạo thực đơn thông minh sử dụng thuật toán di truyền để tối ưu hóa thực đơn dựa trên nhu cầu dinh dưỡng và sở thích của người dùng.

## Tính năng chính

- Tạo thực đơn tối ưu dựa trên nhu cầu dinh dưỡng
- Điều chỉnh khối lượng món ăn để đạt mục tiêu dinh dưỡng
- Tùy chỉnh số lượng món ăn cho từng bữa
- Hỗ trợ nhiều loại chế độ ăn và hạn chế
- Giao diện người dùng thân thiện

## Cấu trúc dự án

```
.
├── project/           # Backend Python
├── Mfrontend/        # Frontend React
└── BackEnd/          # API và Database
```

## Yêu cầu hệ thống

- Python 3.8+
- Node.js 14+
- MongoDB

## Cài đặt

1. Clone repository:
```bash
git clone [repository-url]
```

2. Cài đặt backend:
```bash
cd project
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

3. Cài đặt frontend:
```bash
cd Mfrontend
npm install
```

## Chạy ứng dụng

1. Khởi động backend:
```bash
cd project
python menu_ga.py
```

2. Khởi động frontend:
```bash
cd Mfrontend
npm start
```

## Đóng góp

Mọi đóng góp đều được hoan nghênh. Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy phép

MIT License 