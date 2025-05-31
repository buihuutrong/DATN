from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from menu_ga import app as menu_app

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8888", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount ứng dụng menu_ga vào prefix /api
app.mount("/api", menu_app)

# Endpoint chính để kiểm tra server
@app.get("/")
async def root():
    return {"message": "Menu Generator API is running", "docs_url": "/api/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000) 