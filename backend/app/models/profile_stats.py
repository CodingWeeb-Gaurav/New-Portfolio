from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class LeetCodeStats(BaseModel):
    username: str
    totalSolved: int
    easySolved: int
    mediumSolved: int
    hardSolved: int


class CodeforcesRatingPoint(BaseModel):
    contestId: int
    contestName: str
    rating: int
    rank: int
    date: str


class CodeforcesStats(BaseModel):
    username: str
    rating: str | int
    maxRating: str | int
    rank: str
    profile: str
    avatar_url: str
    ratingHistory: List[CodeforcesRatingPoint]


class GithubRepo(BaseModel):
    name: str
    url: str
    language: str | None


class GithubStats(BaseModel):
    username: str
    avatar_url: str
    public_repos: List[GithubRepo]
    total_commits_last_30_days: int
    top_languages: Dict[str, int]


class ProfileStats(BaseModel):
    leetcode: Optional[LeetCodeStats]
    codeforces: Optional[CodeforcesStats]
    github: Optional[GithubStats]
    last_updated: datetime
