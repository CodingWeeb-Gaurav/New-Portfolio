from fastapi import APIRouter, UploadFile, File, HTTPException
from app.database import db
import os, uuid

router = APIRouter(prefix="/profile/image", tags=["Profile Image"])

IMAGE_DIR = "static/profile/image"

@router.put("")
async def upload_or_update_image(file: UploadFile = File(...)):
    os.makedirs(IMAGE_DIR, exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"profile_{uuid.uuid4()}.{ext}"
    filepath = os.path.join(IMAGE_DIR, filename)

    # delete old image if exists
    profile = await db.profile.find_one({"_id": "profile"})
    if profile and profile.get("image_url"):
        old_path = profile["image_url"].replace("/", os.sep)
        if os.path.exists(old_path):
            os.remove(old_path)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    await db.profile.update_one(
        {"_id": "profile"},
        {"$set": {"image_url": filepath, "image_enabled": True}},
        upsert=True
    )

    return {"image_url": filepath}

@router.delete("")
async def delete_image():
    profile = await db.profile.find_one({"_id": "profile"})
    if not profile or not profile.get("image_url"):
        raise HTTPException(status_code=404, detail="No image found")

    path = profile["image_url"].replace("/", os.sep)
    if os.path.exists(path):
        os.remove(path)

    await db.profile.update_one(
        {"_id": "profile"},
        {"$unset": {"image_url": ""}}
    )

    return {"message": "Profile image removed"}

@router.get("")
async def get_image():
    profile = await db.profile.find_one({"_id": "profile"})
    return {
        "image_url": profile.get("image_url") if profile else None,
        "enabled": profile.get("image_enabled", False)
    }
