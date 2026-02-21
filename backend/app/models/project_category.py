from pydantic import BaseModel
from typing import Optional

class ProjectCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    order: int = 0
    enabled: bool = True
    image_link: Optional[str] = None


class ProjectCategoryCreate(ProjectCategoryBase):
    pass


class ProjectCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    enabled: Optional[bool] = None
    image_link: Optional[str] = None
