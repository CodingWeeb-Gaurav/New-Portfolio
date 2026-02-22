from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from app.database import db
from bson import ObjectId
import os
import uuid
from app.core.security import get_current_admin

public_router = APIRouter(prefix="/api/timelines", tags=["timelines"])
admin_router = APIRouter(prefix="/api/timelines", tags=["timelines"], dependencies=[Depends(get_current_admin)])
UPLOAD_DIR = "static/uploads/timelines"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@public_router.get("/")
async def get_timelines():
    timelines = []
    async for timeline in db.timelines.find({}).sort("order", 1):
        timeline["id"] = str(timeline["_id"])
        del timeline["_id"]
        timelines.append(timeline)
    return timelines

@admin_router.post("/")
async def add_timeline(
    header: str = Form(...),
    subheader: str = Form(...),
    date: str = Form(...),
    description: str = Form(...),
    order: int = Form(...),
    logo: UploadFile = File(...)
):
    # Check duplicate
    existing = await db.timelines.find_one({"header": header, "date": date})
    if existing:
        raise HTTPException(status_code=400, detail="Timeline entry already exists")

    # 🔁 Shift orders >= new order
    await db.timelines.update_many(
        {"order": {"$gte": order}},
        {"$inc": {"order": 1}}
    )

    # Save image
    ext = logo.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(await logo.read())

    timeline_data = {
        "header": header,
        "subheader": subheader,
        "date": date,
        "description": description,
        "order": order,
        "logo_path": f"/uploads/timelines/{filename}"
    }

    result = await db.timelines.insert_one(timeline_data)
    return {"id": str(result.inserted_id), "message": "Timeline added successfully"}

@admin_router.put("/{timeline_id}")
async def update_timeline(
    timeline_id: str,
    header: str | None = Form(None),
    subheader: str | None = Form(None),
    date: str | None = Form(None),
    description: str | None = Form(None),
    order: int | None = Form(None),
    logo: UploadFile | None = File(None)
):
    timeline = await db.timelines.find_one({"_id": ObjectId(timeline_id)})
    if not timeline:
        raise HTTPException(status_code=404, detail="Timeline not found")

    update_data = {}

    for field, value in {
        "header": header,
        "subheader": subheader,
        "date": date,
        "description": description,
        "order": order
    }.items():
        if value is not None:
            update_data[field] = value

    # Replace image if new one uploaded
    if logo:
        # delete old image
        old_path = timeline.get("logo_path")
        if old_path:
            old_file = os.path.join("static", old_path.replace("/uploads/", "uploads/"))
            if os.path.exists(old_file):
                os.remove(old_file)

        ext = logo.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            f.write(await logo.read())

        update_data["logo_path"] = f"/uploads/timelines/{filename}"

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.timelines.update_one(
        {"_id": ObjectId(timeline_id)},
        {"$set": update_data}
    )

    return {"message": "Timeline updated successfully"}

@admin_router.delete("/{timeline_id}")
async def delete_timeline(timeline_id: str):
    timeline = await db.timelines.find_one({"_id": ObjectId(timeline_id)})
    if not timeline:
        raise HTTPException(status_code=404, detail="Timeline not found")

    # delete image
    logo_path = timeline.get("logo_path")
    if logo_path:
        file_path = os.path.join("static", logo_path.replace("/uploads/", "uploads/"))
        if os.path.exists(file_path):
            os.remove(file_path)

    await db.timelines.delete_one({"_id": ObjectId(timeline_id)})
    return {"message": "Timeline deleted successfully"}

