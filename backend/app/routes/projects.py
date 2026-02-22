from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.database import db
from app.models.project import ProjectUpdate
from bson import ObjectId
import os, uuid
from fastapi import Depends
from app.core.security import get_current_admin

public_router = APIRouter(prefix="/api/projects", tags=["projects"])
admin_router = APIRouter(prefix="/api/projects", tags=["projects"], dependencies=[Depends(get_current_admin)])
UPLOAD_DIR = "static/uploads/projects"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------
# Helpers
# ---------------------------

async def shift_orders(category_id: str, from_order: int):
    await db.projects.update_many(
        {
            "category_id": category_id,
            "order": {"$gte": from_order}
        },
        {"$inc": {"order": 1}}
    )


async def get_next_order(category_id: str) -> int:
    last = await db.projects.find(
        {"category_id": category_id}
    ).sort("order", -1).limit(1).to_list(1)

    return (last[0]["order"] + 1) if last else 1


def save_image(image: UploadFile) -> str:
    ext = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(image.file.read())

    return f"/uploads/projects/{filename}"


def delete_image(image_link: str | None):
    if not image_link:
        return
    path = "static" + image_link
    if os.path.exists(path):
        os.remove(path)


# ---------------------------
# Routes
# ---------------------------

@public_router.get("/")
async def get_projects():
    projects = []
    async for p in db.projects.find({}).sort(
        [("category_id", 1), ("order", 1)]
    ):
        p["id"] = str(p["_id"])
        del p["_id"]
        projects.append(p)
    return projects


@admin_router.post("/")
async def add_project(
    name: str = Form(...),
    category_id: str = Form(...),
    order: int | None = Form(None),
    difficulty: int = Form(...),
    date: str = Form(...),
    github_url: str | None = Form(None),
    demo_url: str | None = Form(None),
    skills: str = Form(""),
    enabled: bool = Form(True),
    image: UploadFile | None = File(None)
):
    if not await db.project_categories.find_one({"_id": ObjectId(category_id)}):
        raise HTTPException(400, "Invalid category")

    if order is None:
        order = await get_next_order(category_id)
    else:
        await shift_orders(category_id, order)

    data = {
        "name": name,
        "category_id": category_id,
        "order": order,
        "difficulty": difficulty,
        "date": date,
        "github_url": github_url,
        "demo_url": demo_url,
        "skills": [s.strip() for s in skills.split(",") if s.strip()],
        "enabled": enabled
    }

    if image:
        data["image_link"] = save_image(image)

    result = await db.projects.insert_one(data)
    return {"id": str(result.inserted_id)}


@admin_router.put("/{project_id}")
async def update_project(project_id: str, payload: ProjectUpdate):
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(404, "Project not found")

    update_data = {k: v for k, v in payload.dict().items() if v is not None}

    if "image" in update_data:
        delete_image(project.get("image_link"))
        update_data["image_link"] = save_image(update_data.pop("image"))

    if not update_data:
        raise HTTPException(400, "No fields to update")

    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data}
    )

    return {"message": "Project updated"}


@admin_router.delete("/{project_id}")
async def delete_project(project_id: str):
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(404, "Project not found")

    delete_image(project.get("image_link"))
    await db.projects.delete_one({"_id": ObjectId(project_id)})

    return {"message": "Project deleted"}
