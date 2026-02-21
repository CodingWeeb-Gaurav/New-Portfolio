from fastapi import APIRouter
from app.database import db
from app.services.profile_stats_fetcher import (
    fetch_leetcode,
    fetch_codeforces,
    fetch_github,
)
from datetime import datetime

router = APIRouter(prefix="/profile/stats", tags=["Profile Stats"])

@router.get("")
async def get_profile_stats():

    cached = await db.profile_stats.find_one({"_id": "stats"}) or {}

    result = {
        "leetcode": cached.get("leetcode"),
        "codeforces": cached.get("codeforces"),
        "github": cached.get("github"),
        "last_updated": cached.get("last_updated"),
        "cached": True,
    }

    return result

    updated = False

async def refresh_profile_stats():
    leetcode_username = "gkg11092002"
    codeforces_username = "Gaurav_KG"
    github_username = "CodingWeeb-Gaurav"
    result = {}
    try:
        result["leetcode"] = fetch_leetcode(leetcode_username)
    except Exception as e:
        print("LeetCode error:", e)

    try:
        result["codeforces"] = fetch_codeforces(codeforces_username)
    except Exception as e:
        print("Codeforces error:", e)

    try:
        result["github"] = fetch_github(github_username)
    except Exception as e:
        print("GitHub error:", e)

    
    await db.profile_stats.update_one(
        {"_id": "stats"},
        {
            "$set": {
                **result,
                "last_updated": datetime.utcnow(),
            }
        },
        upsert=True,
    )
    #function returns nothing bcz its a routine job to save

