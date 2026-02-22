from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.core.security import get_current_admin
import os

admin_router = APIRouter(prefix="/profile/embeddings", tags=["Profile Embeddings"], dependencies=[Depends(get_current_admin)])

EMBED_DIR = "static/profile/embeddings"

@admin_router.put("")
async def upload_embeddings(file: UploadFile = File(...)):
    os.makedirs(EMBED_DIR, exist_ok=True)

    path = os.path.join(EMBED_DIR, file.filename)
    with open(path, "wb") as f:
        f.write(await file.read())

    return {"message": "Embeddings uploaded", "path": path}

@admin_router.delete("")
async def delete_embeddings(filename: str):
    path = os.path.join(EMBED_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(path)
    return {"message": "Embeddings deleted"}
