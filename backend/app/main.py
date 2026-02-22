from fastapi import FastAPI
from app.database import test_connection, create_indexes
from contextlib import asynccontextmanager

from app.routes.skills import public_router as skills_public
from app.routes.skills import admin_router as skills_admin
from app.routes.timelines import public_router as timelines_public
from app.routes.timelines import admin_router as timelines_admin
from app.routes.project_categories import public_router as project_categories_public
from app.routes.project_categories import admin_router as project_categories_admin
from app.routes.projects import public_router as projects_public
from app.routes.projects import admin_router as projects_admin
from app.routes.chat import router as chat_router

# ✅ NEW profile routers
from app.routes.profile_image import public_router as profile_image_public
from app.routes.profile_image import admin_router as profile_image_admin
from app.routes.profile_aboutme import public_router as profile_aboutme_public
from app.routes.profile_aboutme import admin_router as profile_aboutme_admin
from app.routes.profile_embeddings import admin_router as profile_embeddings_admin
from app.routes.profile_data import public_router as profile_data_public
from app.routes.profile_data import admin_router as profile_data_admin
from app.routes.profile_stats import router as profile_stats_router
from fastapi.staticfiles import StaticFiles


@asynccontextmanager
async def lifespan(app: FastAPI):
    await test_connection()
    await create_indexes()   
    yield #giving the control back to fastAPI

app = FastAPI(lifespan=lifespan)

app.include_router(skills_admin)
app.include_router(skills_public)
app.include_router(timelines_admin)
app.include_router(timelines_public)
app.include_router(project_categories_public)
app.include_router(project_categories_admin)
app.include_router(projects_public)
app.include_router(projects_admin)
app.include_router(chat_router) # CHAT ROUTER IS WEBSOCKET. Will be masked with security later

# ✅ Profile Routers
app.include_router(profile_image_public)
app.include_router(profile_image_admin)
app.include_router(profile_aboutme_public)
app.include_router(profile_aboutme_admin)
app.include_router(profile_embeddings_admin)
app.include_router(profile_data_public)
app.include_router(profile_data_admin)
app.include_router(profile_stats_router) # Profile stats need a GET api only so keep it as is
# Static files (profile images, aboutme.md, embeddings)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

