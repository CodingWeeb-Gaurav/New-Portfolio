from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.database import db
from app.models.skill import SkillCategory
from bson import ObjectId
import os, uuid

router = APIRouter(prefix="/api/skills", tags=["skills"])

UPLOAD_DIR = "static/uploads/skills"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------
# Helpers
# ---------------------------

async def get_next_order(category: str) -> int:
    last = await db.skills.find(
        {"category": category}
    ).sort("order", -1).limit(1).to_list(1)

    return (last[0]["order"] + 1) if last else 1


async def shift_orders(category: str, from_order: int):
    await db.skills.update_many(
        {
            "category": category,
            "order": {"$gte": from_order}
        },
        {"$inc": {"order": 1}}
    )


def save_logo(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(file.file.read())

    return f"/uploads/skills/{filename}"


def delete_logo(logo_path: str | None):
    if not logo_path:
        return
    path = "static" + logo_path
    if os.path.exists(path):
        os.remove(path)


# ---------------------------
# Routes
# ---------------------------

@router.get("/")
async def get_skills():
    skills = []
    async for skill in db.skills.find({}).sort(
        [("category", 1), ("order", 1)]
    ):
        skill["id"] = str(skill["_id"])
        del skill["_id"]
        skills.append(skill)
    return skills


@router.get("/categories")
async def get_skill_categories():
    return [c.value for c in SkillCategory]


@router.post("/")
async def add_skill(
    name: str = Form(...),
    category: SkillCategory = Form(...),
    order: int | None = Form(None),
    hover_color_primary: str = Form(...),
    hover_color_secondary: str | None = Form(None),
    logo: UploadFile = File(...)
):
    if await db.skills.find_one({"name": name, "category": category.value}):
        raise HTTPException(400, "Skill already exists in this category")

    if order is None:
        order = await get_next_order(category.value)
    else:
        await shift_orders(category.value, order)

    logo_path = save_logo(logo)

    skill_data = {
        "name": name,
        "category": category.value,
        "order": order,
        "hover_color_primary": hover_color_primary,
        "hover_color_secondary": hover_color_secondary,
        "logo_path": logo_path
    }

    result = await db.skills.insert_one(skill_data)
    return {"id": str(result.inserted_id), "message": "Skill added successfully"}


@router.put("/{skill_id}")
async def update_skill(
    skill_id: str,
    name: str | None = Form(None),
    category: SkillCategory | None = Form(None),
    order: int | None = Form(None),
    hover_color_primary: str | None = Form(None),
    hover_color_secondary: str | None = Form(None),
    logo: UploadFile | None = File(None)
):
    skill = await db.skills.find_one({"_id": ObjectId(skill_id)})
    if not skill:
        raise HTTPException(404, "Skill not found")

    update_data = {}

    new_category = category.value if category else skill["category"]

    # 🔁 Handle order change (scoped to category)
    if order is not None:
        if order != skill["order"] or new_category != skill["category"]:
            await shift_orders(new_category, order)
            update_data["order"] = order

    # 🔁 Handle category move
    if category is not None:
        update_data["category"] = category.value
        if order is None:
            update_data["order"] = await get_next_order(category.value)

    for field, value in {
        "name": name,
        "hover_color_primary": hover_color_primary,
        "hover_color_secondary": hover_color_secondary,
    }.items():
        if value is not None:
            update_data[field] = value

    # 🖼 Replace logo
    if logo:
        delete_logo(skill.get("logo_path"))
        update_data["logo_path"] = save_logo(logo)

    if not update_data:
        raise HTTPException(400, "No fields to update")

    await db.skills.update_one(
        {"_id": ObjectId(skill_id)},
        {"$set": update_data}
    )

    return {"message": "Skill updated successfully"}


@router.delete("/{skill_id}")
async def delete_skill(skill_id: str):
    skill = await db.skills.find_one({"_id": ObjectId(skill_id)})
    if not skill:
        raise HTTPException(404, "Skill not found")

    delete_logo(skill.get("logo_path"))
    await db.skills.delete_one({"_id": ObjectId(skill_id)})

    return {"message": "Skill deleted successfully"}
