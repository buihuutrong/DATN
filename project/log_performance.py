import json
from datetime import datetime

def log_performance(user_id, execution_time, actual_calories, target_calories, generations_used):
    log_data = {
        "user_id": user_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "timestamp": datetime.now().isoformat(),
        "execution_time": round(execution_time, 3),
        "actual_calories": round(actual_calories, 2),
        "target_calories": round(target_calories, 2),
        "accuracy": round(1.0 - abs(actual_calories - target_calories) / target_calories, 3) if target_calories > 0 else 1.0,
        "generations": generations_used
    }
    with open("performance_log.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(log_data, ensure_ascii=False) + "\n") 