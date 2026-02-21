from pydantic import BaseModel
from typing import Optional

class TimelineBase(BaseModel):
    header: str
    subheader: str
    date: str
    description: str
    order: int
    logo_path: str


class TimelineCreate(BaseModel):
    header: str
    subheader: str
    date: str
    description: str
    order: int
    # logo comes via UploadFile (not here)


class TimelineUpdate(BaseModel):
    header: Optional[str] = None
    subheader: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    logo_path: Optional[str] = None


class TimelineResponse(TimelineBase):
    id: str
