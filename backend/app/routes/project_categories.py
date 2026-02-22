from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Depends
from app.database import db
from app.models.project_category import ProjectCategoryUpdate
from bson import ObjectId
import os, uuid
from app.core.security import get_current_admin

public_router = APIRouter(prefix="/api/project-categories", tags=["project_categories"])
admin_router = APIRouter(prefix="/api/project-categories", tags=["project_categories"], dependencies=[Depends(get_current_admin)])

UPLOAD_DIR = "static/uploads/project_categories/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

OTHER_CATEGORY_NAME = "Other"


async def get_other_category_id():
    other = await db.project_categories.find_one({"name": OTHER_CATEGORY_NAME})
    if not other:
        result = await db.project_categories.insert_one({
            "name": OTHER_CATEGORY_NAME,
            "description": "Fallback category",
            "order": 999,
            "enabled": True
        })
        return str(result.inserted_id)
    return str(other["_id"])


@public_router.get("/")
async def get_categories():
    categories = []
    async for c in db.project_categories.find({}).sort("order", 1):
        c["id"] = str(c["_id"])
        del c["_id"]
        categories.append(c)
    return categories


@public_router.get("/with-projects")
async def get_categories_with_projects(
    enabled_only: bool = Query(False)
):
    pipeline = [
        {
            "$lookup": {
                "from": "projects",
                "localField": "_id",
                "foreignField": "category_id",
                "as": "projects"
            }
        }
    ]

    if enabled_only:
        pipeline.insert(0, {"$match": {"enabled": True}})
        pipeline.append({
            "$addFields": {
                "projects": {
                    "$filter": {
                        "input": "$projects",
                        "as": "p",
                        "cond": {"$eq": ["$$p.enabled", True]}
                    }
                }
            }
        })

    results = []
    async for cat in db.project_categories.aggregate(pipeline):
        cat["id"] = str(cat["_id"])
        del cat["_id"]
        for p in cat["projects"]:
            p["id"] = str(p["_id"])
            del p["_id"]
        results.append(cat)

    return results


@admin_router.post("/")
async def add_category(
    name: str = Form(...),
    description: str | None = Form(None),
    order: int = Form(0),
    enabled: bool = Form(True),
    image: UploadFile | None = File(None)
):
    data = {
        "name": name,
        "description": description,
        "order": order,
        "enabled": enabled
    }

    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            f.write(await image.read())
        data["image_link"] = f"/uploads/project_categories/{filename}"

    result = await db.project_categories.insert_one(data)
    return {"id": str(result.inserted_id)}


@admin_router.put("/{category_id}")
async def update_category(category_id: str, payload: ProjectCategoryUpdate):
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "No fields to update")

    await db.project_categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": update_data}
    )

    return {"message": "Category updated"}

@admin_router.delete("/{category_id}")
async def delete_category(category_id: str):
    category = await db.project_categories.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(404, "Category not found")

    others = await db.project_categories.find_one({"slug": "others"})
    if not others:
        raise HTTPException(500, "Others category missing")

    next_order = await db.projects.find(
        {"category_id": str(others["_id"])}
    ).sort("order", -1).limit(1).to_list(1)

    start_order = (next_order[0]["order"] + 1) if next_order else 1

    projects = await db.projects.find(
        {"category_id": category_id}
    ).sort("order", 1).to_list(None)

    for i, p in enumerate(projects):
        await db.projects.update_one(
            {"_id": p["_id"]},
            {
                "$set": {
                    "category_id": str(others["_id"]),
                    "order": start_order + i
                }
            }
        )

    await db.project_categories.delete_one({"_id": ObjectId(category_id)})
    return {"message": "Category deleted and projects moved to Others"}
