from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from enum import Enum

class SkillCategory(str, Enum):
    LANGUAGES = "Programming Languages"
    FRAMEWORKS = "Frameworks & Libraries"
    DATABASES = "Databases & Tools"


class SkillBase(BaseModel):
    name:str
    category: SkillCategory
    logo_path: str
    order: int
    hover_color_primary: str
    hover_color_secondary: Optional[str] = None

# NOTE:
# SkillCreate / SkillUpdate are NOT used directly in routes
# because FastAPI does not support UploadFile inside Pydantic models.

class SkillCreate(SkillBase):
    
    name: str
    category: str
    order: int
    hover_color_primary: str
    hover_color_secondary: Optional[str] = None
    # logo_path is required for creation

class SkillUpdate(SkillBase):
    name: Optional[str] = None
    category: Optional[str] = None
    logo_path: Optional[str] = None
    order: Optional[int] = None
    hover_color_primary: Optional[str] = None
    hover_color_secondary: Optional[str] = None

class SkillResponse(SkillBase):
    id: str

