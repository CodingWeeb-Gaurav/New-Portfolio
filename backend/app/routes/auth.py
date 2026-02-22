from fastapi import APIRouter, HTTPException, Response
from app.core.security import verify_password, create_access_token, create_refresh_token, hash_password
from app.database import db
from datetime import datetime, timezone
import random

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(data:dict, response: Response):
    email = data.get("email")
    password = data.get("password")
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(password, admin["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": email})
    refresh_token = create_refresh_token({"sub": email})
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax")
    return {"access_token": access_token}

@router.post("/refresh")
async def refresh_token(refresh_token:str):
    from jose import JWTError, jwt
    from app.core.security import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        new_access = create_access_token({"sub": payload.get("sub")})
        return {"access_token": new_access}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully"}

from fastapi import Depends
from app.core.security import get_current_admin

@router.post("/change-password")
async def change_password(
    data: dict,
    admin = Depends(get_current_admin)
):

    current = data.get("current_password")
    new = data.get("new_password")

    db_admin = await db.admin.find_one({"email": admin["sub"]})

    if not verify_password(current, db_admin["hashed_password"]):
        raise HTTPException(status_code=401, detail="Wrong password")

    new_hash = hash_password(new)

    await db.admin.update_one(
        {"email": admin["sub"]},
        {"$set": {"hashed_password": new_hash}}
    )

    return {"message": "Password updated"}


@router.post("/request-password-reset")
async def request_password_reset(data: dict):

    email = data.get("email")

    admin = await db.admin.find_one({"email": email})
    if not admin:
        return {"message": "If email exists, OTP sent"}  # don't reveal existence

    otp = str(random.randint(100000, 999999))

    await db.otp.insert_one({
        "email": email,
        "otp": otp,
        "expires_at": datetime.now(timezone.utc)
    })

    # send otp via email here

    return {"message": "OTP sent"}


@router.post("/verify-otp")
async def verify_otp(data: dict):

    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    record = await db.otp.find_one({"email": email, "otp": otp})

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    new_hash = hash_password(new_password)

    await db.admin.update_one(
        {"email": email},
        {"$set": {"hashed_password": new_hash}}
    )

    await db.otp.delete_one({"_id": record["_id"]})

    return {"message": "Password reset successful"}
