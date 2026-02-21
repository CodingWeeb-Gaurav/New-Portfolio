import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]


async def test_connection():
    try:
        await client.server_info()
        print(" ✅ Connected to MongoDB successfully!")
    except Exception as e:
        print(f" ❌ Failed to connect to MongoDB: {e}")


async def create_indexes():
    # Projects
    await db.projects.create_index("category_id")
    await db.projects.create_index("enabled")
    await db.projects.create_index("order")

    # Project Categories
    await db.project_categories.create_index("enabled")
    await db.project_categories.create_index("order")

    # ✅ Profile (single-document but future-safe)
    await db.profile.create_index("_id")
    await db.profile.create_index("image_enabled")
    await db.profile.create_index("data.enabled")
    
    await db.profile_stats.create_index("_id")
    await db.profile_stats.create_index("last_updated")
    # Chat sessions
    # await db.chat_sessions.create_index("_id", unique=True)

# TTL: auto delete chat history after 30 days
    await db.chat_sessions.create_index(
        "updated_at",
        expireAfterSeconds=60 * 60 * 24 * 30
    )