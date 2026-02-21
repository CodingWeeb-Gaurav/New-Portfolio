import requests
from datetime import datetime, timezone
from github import Github
import os
from collections import defaultdict
from datetime import timedelta


# -------- LeetCode --------
def fetch_leetcode(username: str):
    url = f"https://leetcode-stats-api.herokuapp.com/{username}"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()

    return {
        "username": username,
        "totalSolved": data.get("totalSolved", 0),
        "easySolved": data.get("easySolved", 0),
        "mediumSolved": data.get("mediumSolved", 0),
        "hardSolved": data.get("hardSolved", 0),
    }


def fetch_codeforces(username: str):
    user_url = f"https://codeforces.com/api/user.info?handles={username}"
    rating_url = f"https://codeforces.com/api/user.rating?handle={username}"

    user_resp = requests.get(user_url, timeout=10)
    user_resp.raise_for_status()
    user_info = user_resp.json()["result"][0]

    rating_resp = requests.get(rating_url, timeout=10)
    rating_data = rating_resp.json().get("result", []) if rating_resp.ok else []

    history = sorted(
        [
            {
                "contestId": r["contestId"],
                "contestName": r["contestName"],
                "rating": r["newRating"],
                "rank": r["rank"],
                "date": datetime.fromtimestamp(
                    r["ratingUpdateTimeSeconds"], tz=timezone.utc
                ).strftime("%Y-%m-%d"),
            }
            for r in rating_data
        ],
        key=lambda x: x["date"],
    )

    return {
        "username": user_info["handle"],
        "rating": user_info.get("rating", "Unrated"),
        "maxRating": user_info.get("maxRating", "Unrated"),
        "rank": user_info.get("rank", "Unknown"),
        "profile": f"https://codeforces.com/profile/{username}",
        "avatar_url": user_info.get("titlePhoto", ""),
        "ratingHistory": history,  # 👈 graph-ready
    }


def fetch_github(username: str):
    token = os.getenv("GITHUB_TOKEN")

    # ---------- AUTHENTICATED ----------
    if token:
        g = Github(token)
        user = g.get_user(username)
        repos = user.get_repos()

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        summary = {
            "username": user.login,
            "avatar_url": user.avatar_url,
            "public_repos": [],
            "total_commits_last_30_days": 0,
            "top_languages": defaultdict(int),
            "auth_used": True,
        }

        for repo in repos:
            if repo.fork:
                continue

            summary["public_repos"].append({
                "name": repo.name,
                "url": repo.html_url,
                "language": repo.language,
            })

            try:
                summary["total_commits_last_30_days"] += repo.get_commits(
                    since=thirty_days_ago
                ).totalCount
            except:
                pass

            try:
                for lang, bytes_count in repo.get_languages().items():
                    summary["top_languages"][lang] += bytes_count
            except:
                pass

        summary["top_languages"] = dict(
            sorted(summary["top_languages"].items(), key=lambda x: x[1], reverse=True)
        )

        return summary

    # ---------- PUBLIC FALLBACK ----------
    else:
        user_resp = requests.get(
            f"https://api.github.com/users/{username}", timeout=10
        )
        user_resp.raise_for_status()
        user_data = user_resp.json()

        repos_resp = requests.get(
            f"https://api.github.com/users/{username}/repos?per_page=100",
            timeout=10,
        )
        repos = repos_resp.json() if repos_resp.ok else []

        return {
            "username": user_data["login"],
            "avatar_url": user_data["avatar_url"],
            "public_repos": [
                {
                    "name": r["name"],
                    "url": r["html_url"],
                    "language": r["language"],
                }
                for r in repos if not r["fork"]
            ],
            "total_commits_last_30_days": None,  # ❗ unavailable
            "top_languages": {},                 # ❗ unreliable
            "auth_used": False,
        }
