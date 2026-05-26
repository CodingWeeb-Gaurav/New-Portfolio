from fastapi import FastAPI
from app.database import test_connection, create_indexes
from contextlib import asynccontextmanager
import asyncio
import httpx

#Fetch FRONTEND_URL from env
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
FRONTEND_URL = os.getenv("FRONTEND_URL")

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

from app.routes.auth import router as auth_router


async def keep_alive_self_ping():
    """
    Periodically sends an HTTP request to the /health route to keep the Render free tier container awake.
    Render automatically exposes the public HTTPS address under the RENDER_EXTERNAL_URL environment variable.
    """
    await asyncio.sleep(10)  # Wait 10 seconds after boot to start the ping loop
    
    public_url = os.getenv("RENDER_EXTERNAL_URL")
    if not public_url:
        print("[KEEP-ALIVE] RENDER_EXTERNAL_URL env not set. Skipping self-ping loop (this is normal locally).")
        return
        
    ping_url = f"{public_url.rstrip('/')}/health"
    print(f"[KEEP-ALIVE] Initializing active self-ping loop targeting: {ping_url}")
    
    async with httpx.AsyncClient() as client:
        while True:
            try:
                # Use a quick 10-second timeout to avoid clogging threads
                res = await client.get(ping_url, timeout=10)
                print(f"[KEEP-ALIVE] Self-ping status: {res.status_code}")
            except Exception as e:
                print(f"[KEEP-ALIVE] Self-ping request failed: {e}")
            
            # Sleep 10 minutes (600 seconds) to stay safely inside Render's 15-minute sleep threshold
            await asyncio.sleep(600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await test_connection()
        await create_indexes()
    except Exception as e:
        print(f"[WARN] DB startup tasks failed (server will still run): {e}")
    
    # Start the automated self-ping loop as a background task
    ping_task = asyncio.create_task(keep_alive_self_ping())
    
    yield #giving the control back to fastAPI
    
    # Clean up the task on shutdown
    ping_task.cancel()

app = FastAPI(lifespan=lifespan)
app.add_middleware( # Add CORS or other middleware if needed
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
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

