from pydantic import BaseModel
from typing import Optional


class Issue(BaseModel):
    description: str
    location_name: Optional[str] = "Unknown"
    lat: Optional[float] = None
    lng: Optional[float] = None
    image_paths: str = "" 

    class Config:
        orm_mode = True