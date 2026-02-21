from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class Highlight(BaseModel):
    title: str
    subtitle: str
    enabled: bool = True

class WhatIDo(BaseModel):
    title: str
    subtitle: str
    enabled: bool = True

class Contact(BaseModel):
    email: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    enabled: bool = True

class ProfileData(BaseModel):
    github_url: Optional[str]
    linkedin_url: Optional[str]
    resume_webdev: Optional[str]
    resume_ai_ml: Optional[str]

    description1: Optional[str]
    description2: Optional[str]

    highlights: List[Highlight] = []
    what_i_do: List[WhatIDo] = []
    soft_skills: List[str] = []

    contact: Optional[Contact]

    enabled: bool = True
