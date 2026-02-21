- go to the backend directory (not portfolio)
- This project has venv so activate it first : venv/Scripts/activate
- Then start: uvicorn app.main:app --reload
- update requirements: pip freeze > requirements.txt


# To Do later (after deployment):
## Step 1 — Create a Lightweight Health Endpoint (done)
DO NOT ping /profile/stats.
Create a minimal endpoint:
@app.get("/health")
async def health():
    return {"status": "healthy"}
This ensures:
No DB access
No external APIs
No heavy processing
Fast wake-up trigger.
## Step 2 — Deploy Backend
Example URL:
https://your-backend.onrender.com/health
Test it manually in browser.
## Step 3 — Create UptimeRobot Monitor
Go to https://uptimerobot.com
Create free account
Click “Add New Monitor”
Monitor Settings
Monitor Type: HTTP(s)
Friendly Name: Portfolio Backend Keep Warm
URL: https://your-backend.onrender.com/health
Monitoring Interval (Free Plan): 5 minutes
(Free plan allows 5-min interval — perfect)
Click Save.
🎯 What Happens Now
Every 5 minutes:
UptimeRobot → hits /health
Render → stays active
No cold start
Users → never see delay
💰 Is This Safe?
Yes.

# All APIs schemas
FastAPI
 0.1.0 
OAS 3.1
/openapi.json
skills


GET
/api/skills/
Get Skills


POST
/api/skills/
Add Skill


GET
/api/skills/categories
Get Skill Categories


PUT
/api/skills/{skill_id}
Update Skill


DELETE
/api/skills/{skill_id}
Delete Skill

timelines


GET
/api/timelines/
Get Timelines


POST
/api/timelines/
Add Timeline


PUT
/api/timelines/{timeline_id}
Update Timeline


DELETE
/api/timelines/{timeline_id}
Delete Timeline

project_categories


GET
/api/project-categories/
Get Categories


POST
/api/project-categories/
Add Category


GET
/api/project-categories/with-projects
Get Categories With Projects


PUT
/api/project-categories/{category_id}
Update Category


DELETE
/api/project-categories/{category_id}
Delete Category

projects


GET
/api/projects/
Get Projects


POST
/api/projects/
Add Project


PUT
/api/projects/{project_id}
Update Project


DELETE
/api/projects/{project_id}
Delete Project

Profile Image


GET
/profile/image
Get Image


PUT
/profile/image
Upload Or Update Image


DELETE
/profile/image
Delete Image

Profile About Me


GET
/profile/aboutme
Get Aboutme


PUT
/profile/aboutme
Update Aboutme

Profile Embeddings


PUT
/profile/embeddings
Upload Embeddings


DELETE
/profile/embeddings
Delete Embeddings

Profile Data


GET
/profile/data
Get Profile Data


PUT
/profile/data
Update Profile Data


DELETE
/profile/data
Delete Profile Data

Profile Stats


GET
/profile/stats
Get Profile Stats

default


GET
/
Read Root


GET
/health
Health


Schemas
Body_add_category_api_project_categories__postCollapse allobject
namestring
descriptionExpand all(string | null)
orderExpand allinteger
enabledExpand allboolean
imageExpand all(string | null)
Body_add_project_api_projects__postCollapse allobject
namestring
category_idstring
orderExpand all(integer | null)
difficultyinteger
datestring
github_urlExpand all(string | null)
demo_urlExpand all(string | null)
skillsExpand allstring
enabledExpand allboolean
imageExpand all(string | null)
Body_add_skill_api_skills__postCollapse allobject
namestring
categoryExpand allstring
orderExpand all(integer | null)
hover_color_primarystring
hover_color_secondaryExpand all(string | null)
logostringbinary
Body_add_timeline_api_timelines__postCollapse allobject
headerstring
subheaderstring
datestring
descriptionstring
orderinteger
logostringbinary
Body_update_aboutme_profile_aboutme_putCollapse allobject
contentstring
Body_update_skill_api_skills__skill_id__putCollapse allobject
nameExpand all(string | null)
categoryExpand all(string | null)
orderExpand all(integer | null)
hover_color_primaryExpand all(string | null)
hover_color_secondaryExpand all(string | null)
logoExpand all(string | null)
Body_update_timeline_api_timelines__timeline_id__putCollapse allobject
headerExpand all(string | null)
subheaderExpand all(string | null)
dateExpand all(string | null)
descriptionExpand all(string | null)
orderExpand all(integer | null)
logoExpand all(string | null)
Body_upload_embeddings_profile_embeddings_putCollapse allobject
filestringbinary
Body_upload_or_update_image_profile_image_putCollapse allobject
filestringbinary
ContactCollapse allobject
emailExpand all(string | null)
phoneExpand all(string | null)
locationExpand all(string | null)
enabledExpand allboolean
HTTPValidationErrorCollapse allobject
detailExpand allarray<object>
HighlightCollapse allobject
titlestring
subtitlestring
enabledExpand allboolean
ProfileDataCollapse allobject
github_urlExpand all(string | null)
linkedin_urlExpand all(string | null)
resume_webdevExpand all(string | null)
resume_ai_mlExpand all(string | null)
description1Expand all(string | null)
description2Expand all(string | null)
highlightsExpand allarray<object>
what_i_doExpand allarray<object>
soft_skillsExpand allarray<string>
contactExpand all(object | null)
enabledExpand allboolean
ProjectCategoryUpdateCollapse allobject
nameExpand all(string | null)
descriptionExpand all(string | null)
orderExpand all(integer | null)
enabledExpand all(boolean | null)
image_linkExpand all(string | null)
ProjectUpdateCollapse allobject
nameExpand all(string | null)
category_idExpand all(string | null)
orderExpand all(integer | null)
difficultyExpand all(integer | null)
dateExpand all(string | null)
github_urlExpand all(string | null)
demo_urlExpand all(string | null)
skillsExpand all(array<string> | null)
enabledExpand all(boolean | null)
image_linkExpand all(string | null)
SkillCategoryCollapse allstring
EnumExpand allarray
ValidationErrorCollapse allobject
locExpand allarray<(string | integer)>
msgstring
typestring
WhatIDoCollapse allobject
titlestring
subtitlestring
enabledExpand allboolean