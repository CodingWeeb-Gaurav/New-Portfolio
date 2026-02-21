from fastapi import FastAPI
from app.database import test_connection, create_indexes
from contextlib import asynccontextmanager

from app.routes.skills import router as skills_router
from app.routes.timelines import router as timelines_router
from app.routes.project_categories import router as project_categories_router
from app.routes.projects import router as projects_router
from app.routes.chat import router as chat_router

# ✅ NEW profile routers
from app.routes.profile_image import router as profile_image_router
from app.routes.profile_aboutme import router as profile_aboutme_router
from app.routes.profile_embeddings import router as profile_embeddings_router
from app.routes.profile_data import router as profile_data_router
from app.routes.profile_stats import router as profile_stats_router
from fastapi.staticfiles import StaticFiles


@asynccontextmanager
async def lifespan(app: FastAPI):
    await test_connection()
    await create_indexes()   
    yield #giving the control back to fastAPI

app = FastAPI(lifespan=lifespan)

app.include_router(skills_router)
app.include_router(timelines_router)
app.include_router(project_categories_router)
app.include_router(projects_router)
app.include_router(chat_router)

# ✅ Profile Routers
app.include_router(profile_image_router)
app.include_router(profile_aboutme_router)
app.include_router(profile_embeddings_router)
app.include_router(profile_data_router)
app.include_router(profile_stats_router)
# Static files (profile images, aboutme.md, embeddings)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

