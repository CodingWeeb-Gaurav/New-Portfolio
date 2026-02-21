from fastapi import APIRouter, HTTPException
from app.database import db
from app.models.profile_data import ProfileData

router = APIRouter(prefix="/profile/data", tags=["Profile Data"])

@router.get("")
async def get_profile_data():
    profile = await db.profile.find_one({"_id": "profile"})
    return profile.get("data") if profile else {}

@router.put("")
async def update_profile_data(data: ProfileData):
    await db.profile.update_one(
        {"_id": "profile"},
        {"$set": {"data": data.dict()}},
        upsert=True
    )
    return {"message": "Profile data updated"}

@router.delete("")
async def delete_profile_data():
    await db.profile.update_one(
        {"_id": "profile"},
        {"$unset": {"data": ""}}
    )
    return {"message": "Profile data deleted"}
