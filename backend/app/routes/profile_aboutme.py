from fastapi import APIRouter, HTTPException, Body
import os

router = APIRouter(prefix="/profile/aboutme", tags=["Profile About Me"])

ABOUT_PATH = "static/profile/aboutme.md"

@router.get("")
async def get_aboutme():
    if not os.path.exists(ABOUT_PATH):
        return {"content": ""}

    with open(ABOUT_PATH, "r", encoding="utf-8") as f:
        return {"content": f.read()}

@router.put("")
async def update_aboutme(content: str = Body(..., embed=True)):
    os.makedirs(os.path.dirname(ABOUT_PATH), exist_ok=True)

    with open(ABOUT_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    return {"message": "aboutme.md updated"}
