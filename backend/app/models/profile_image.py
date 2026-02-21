from pydantic import BaseModel
from typing import Optional

class ProfileImage(BaseModel):
    image_url: Optional[str]
    enabled: bool = True
