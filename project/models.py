from pydantic import BaseModel
from datetime import datetime
from typing import Optional
 
class WeightRecord(BaseModel):
    userId: str
    date: datetime
    weight: float
    note: Optional[str] = None 