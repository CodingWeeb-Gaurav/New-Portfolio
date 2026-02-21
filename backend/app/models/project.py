from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List

class ProjectBase(BaseModel):
    name: str
    category_id: str
    order: int = 0
    difficulty: int = Field(..., ge=1, le=3)
    date: str  # MM/YYYY
    github_url: Optional[HttpUrl] = None
    demo_url: Optional[HttpUrl] = None
    skills: List[str] = []
    enabled: bool = True
    image_link: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    order: Optional[int] = None
    difficulty: Optional[int] = Field(None, ge=1, le=3)
    date: Optional[str] = None
    github_url: Optional[HttpUrl] = None
    demo_url: Optional[HttpUrl] = None
    skills: Optional[List[str]] = None
    enabled: Optional[bool] = None
    image_link: Optional[str] = None
