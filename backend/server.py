from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import csv
import asyncio
import logging
import secrets
import string
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import uuid
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
import resend
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
RESEND_API_KEY = os.environ['RESEND_API_KEY']
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
RECAPTCHA_SECRET_KEY = os.environ['RECAPTCHA_SECRET_KEY']
RECAPTCHA_ENFORCE = os.environ.get('RECAPTCHA_ENFORCE', 'false').lower() == 'true'
PUBLIC_APP_URL = os.environ.get('PUBLIC_APP_URL', 'http://localhost:3000')
DEV_EXPOSE_TOKENS = os.environ.get('DEV_EXPOSE_TOKENS', 'false').lower() == 'true'

resend.api_key = RESEND_API_KEY

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("speak")


# ----------------------- Helpers -----------------------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(subject_id: str, email: str, role: str, hours: int = 24 * 7) -> str:
    payload = {
        "sub": subject_id,
        "email": email,
        "role": role,
        "exp": now_utc() + timedelta(hours=hours),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def gen_referral_code() -> str:
    return "SPK" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")


def bearer_token(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return request.cookies.get("access_token")


async def get_current_user(request: Request) -> dict:
    token = bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if payload.get("role") != "attendee":
        raise HTTPException(status_code=403, detail="Not an attendee account")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.pop("passwordHash", None)
    return user


async def get_current_admin(request: Request) -> dict:
    token = bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if payload.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    admin = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    admin.pop("passwordHash", None)
    return admin


async def get_settings() -> dict:
    s = await db.system_settings.find_one({"id": "global"}, {"_id": 0})
    if not s:
        s = {
            "id": "global",
            "initialSpeakCoinReward": 500,
            "referralBonusReward": 2000,
            "verificationExpiryHours": 4,
            "resendCooldownSeconds": 60,
        }
        await db.system_settings.insert_one(dict(s))
    return s


async def verify_recaptcha(token: str, expected_action: str = "register") -> bool:
    if not token:
        return False
    if DEV_EXPOSE_TOKENS and token == "dev-bypass":
        return True
    try:
        async with httpx.AsyncClient(timeout=10) as hc:
            r = await hc.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={"secret": RECAPTCHA_SECRET_KEY, "response": token},
            )
            data = r.json()
            logger.info(f"reCAPTCHA verify result: {data}")
            if not data.get("success"):
                return False
            if data.get("score", 0.0) < 0.5:
                return False
            if data.get("action") != expected_action:
                return False
            return True
    except Exception as e:
        logger.error(f"reCAPTCHA verification error: {e}")
        return False


async def send_verification_email(email: str, first_name: str, link: str) -> bool:
    html = f"""
    <div style="background:#07080B;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#0E1117;border:1px solid rgba(230,184,0,0.25);border-radius:16px;padding:40px;">
            <tr><td style="color:#E6B800;font-size:14px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">SPEAK 2026 &bull; THE OUTPOST</td></tr>
            <tr><td style="color:#F9FAFB;font-size:26px;font-weight:800;padding-top:12px;">Confirm your registration, {first_name}</td></tr>
            <tr><td style="color:#9CA3AF;font-size:15px;line-height:1.7;padding-top:16px;">
              You are one step away from securing your seat at <b style="color:#F9FAFB;">THE OUTPOST</b> and claiming your free <b style="color:#E6B800;">SPEAK COIN</b> reward. Click the button below to verify your email and create your password.
            </td></tr>
            <tr><td style="padding-top:28px;">
              <a href="{link}" style="background:#E6B800;color:#07080B;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:999px;display:inline-block;font-size:15px;">Verify &amp; Create Password</a>
            </td></tr>
            <tr><td style="color:#6B7280;font-size:12px;padding-top:28px;line-height:1.6;">
              This link expires in a few hours. If the button doesn't work, paste this URL into your browser:<br>
              <span style="color:#9CA3AF;word-break:break-all;">{link}</span>
            </td></tr>
            <tr><td style="color:#6B7280;font-size:12px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);margin-top:24px;">
              Royal Event Center, behind Niger Motel, Suleja, Niger State &bull; October 1, 2026
            </td></tr>
          </table>
        </td></tr>
      </table>
    </div>
    """
    params = {
        "from": f"SPEAK 2026 <{SENDER_EMAIL}>",
        "to": [email],
        "subject": "Verify your SPEAK 2026 registration",
        "html": html,
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Resend email sent to {email}: {result}")
        return True
    except Exception as e:
        logger.error(f"Resend send failed for {email}: {e}")
        return False


# ----------------------- Models -----------------------
class RegisterRequest(BaseModel):
    firstName: str = Field(min_length=1, max_length=60)
    lastName: str = Field(min_length=1, max_length=60)
    email: EmailStr
    whatsappNumber: str = Field(min_length=7, max_length=30)
    referralCode: Optional[str] = None
    recaptchaToken: str = ""


class ResendRequest(BaseModel):
    email: EmailStr


class CreatePasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SettingsUpdate(BaseModel):
    initialSpeakCoinReward: Optional[int] = None
    referralBonusReward: Optional[int] = None
    verificationExpiryHours: Optional[int] = None
    resendCooldownSeconds: Optional[int] = None


class AddAdminRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# ----------------------- Registration -----------------------
@api_router.get("/")
async def root():
    return {"message": "SPEAK 2026 API", "status": "ok"}


@api_router.post("/register")
async def register(req: RegisterRequest):
    email = req.email.lower().strip()
    whatsapp_number = req.whatsappNumber.strip()
    if len(whatsapp_number) < 7:
        raise HTTPException(status_code=422, detail="Enter a valid WhatsApp number.")

    recaptcha_ok = await verify_recaptcha(req.recaptchaToken)
    if not recaptcha_ok:
        if RECAPTCHA_ENFORCE:
            raise HTTPException(status_code=400, detail="reCAPTCHA verification failed. Please try again.")
        logger.warning(f"reCAPTCHA not verified for {email} (enforcement off) — allowing.")
    recaptcha_result = "success" if recaptcha_ok else "unverified"

    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="This email is already registered. Try logging in instead.")

    # Purge/ignore expired pending, block active pending
    existing_pending = await db.pending_registrations.find_one({"email": email, "status": "pending"})
    if existing_pending:
        if datetime.fromisoformat(existing_pending["expiresAt"]) > now_utc():
            raise HTTPException(status_code=409, detail="A verification email was already sent to this address. Please check your inbox or resend.")
        await db.pending_registrations.delete_one({"id": existing_pending["id"]})

    # Validate referral code (optional)
    referred_by = None
    if req.referralCode:
        code = req.referralCode.strip().upper()
        referrer = await db.users.find_one({"ownReferralCode": code}, {"_id": 0})
        if not referrer:
            raise HTTPException(status_code=400, detail="Invalid referral code. Leave it blank if you don't have one.")
        referred_by = code

    settings = await get_settings()
    token = secrets.token_urlsafe(32)
    expires_at = now_utc() + timedelta(hours=settings["verificationExpiryHours"])
    link = f"{PUBLIC_APP_URL}/verify/{token}"

    # Email must succeed before creating the pending registration (except in dev mode)
    sent = await send_verification_email(email, req.firstName.strip(), link)
    if not sent and not DEV_EXPOSE_TOKENS:
        raise HTTPException(status_code=502, detail="We couldn't send the verification email right now. Please try again in a moment.")
    if not sent:
        logger.warning(f"Email delivery failed for {email}, continuing (DEV mode).")

    pending = {
        "id": str(uuid.uuid4()),
        "firstName": req.firstName.strip(),
        "lastName": req.lastName.strip(),
        "email": email,
        "whatsappNumber": whatsapp_number,
        "referralCodeUsed": referred_by,
        "recaptchaResult": recaptcha_result,
        "status": "pending",
        "verificationToken": token,
        "expiresAt": iso(expires_at),
        "lastSentAt": iso(now_utc()),
        "createdAt": iso(now_utc()),
    }
    await db.pending_registrations.insert_one(dict(pending))
    logger.info(f"Verification link for {email}: {link}")

    resp = {
        "status": "pending",
        "message": "Registration received! Check your email to verify and claim your free SPEAK COIN.",
        "email": email,
    }
    if DEV_EXPOSE_TOKENS:
        resp["devVerificationToken"] = token
        resp["devVerificationLink"] = link
    return resp


@api_router.post("/resend-verification")
async def resend_verification(req: ResendRequest):
    email = req.email.lower().strip()
    pending = await db.pending_registrations.find_one({"email": email, "status": "pending"})
    if not pending:
        raise HTTPException(status_code=404, detail="No pending registration found for this email.")

    settings = await get_settings()
    cooldown = settings["resendCooldownSeconds"]
    last_sent = datetime.fromisoformat(pending["lastSentAt"])
    elapsed = (now_utc() - last_sent).total_seconds()
    if elapsed < cooldown:
        wait = int(cooldown - elapsed)
        raise HTTPException(status_code=429, detail=f"Please wait {wait} seconds before requesting another email.")

    # refresh token + expiry
    token = secrets.token_urlsafe(32)
    expires_at = now_utc() + timedelta(hours=settings["verificationExpiryHours"])
    link = f"{PUBLIC_APP_URL}/verify/{token}"
    sent = await send_verification_email(email, pending["firstName"], link)
    if not sent:
        raise HTTPException(status_code=502, detail="Email service unavailable. Please try again shortly.")

    await db.pending_registrations.update_one(
        {"id": pending["id"]},
        {"$set": {"verificationToken": token, "expiresAt": iso(expires_at), "lastSentAt": iso(now_utc())}},
    )
    logger.info(f"Resent verification link for {email}: {link}")
    resp = {"status": "sent", "message": "Verification email resent."}
    if DEV_EXPOSE_TOKENS:
        resp["devVerificationToken"] = token
        resp["devVerificationLink"] = link
    return resp


@api_router.get("/verify/{token}")
async def verify_token(token: str):
    pending = await db.pending_registrations.find_one({"verificationToken": token}, {"_id": 0})
    if not pending:
        raise HTTPException(status_code=404, detail="This verification link is invalid or has already been used.")
    if pending["status"] != "pending":
        raise HTTPException(status_code=410, detail="This link has already been used.")
    if datetime.fromisoformat(pending["expiresAt"]) < now_utc():
        raise HTTPException(status_code=410, detail="This verification link has expired. Please register again.")
    return {
        "valid": True,
        "firstName": pending["firstName"],
        "lastName": pending["lastName"],
        "email": pending["email"],
    }


@api_router.post("/create-password")
async def create_password(req: CreatePasswordRequest):
    pending = await db.pending_registrations.find_one({"verificationToken": req.token})
    if not pending or pending["status"] != "pending":
        raise HTTPException(status_code=404, detail="This verification link is invalid or has already been used.")
    if datetime.fromisoformat(pending["expiresAt"]) < now_utc():
        raise HTTPException(status_code=410, detail="This verification link has expired. Please register again.")

    email = pending["email"]
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="This account has already been verified. Please log in.")

    settings = await get_settings()
    user_id = str(uuid.uuid4())
    referral_code = gen_referral_code()
    while await db.users.find_one({"ownReferralCode": referral_code}):
        referral_code = gen_referral_code()

    has_referral = bool(pending.get("referralCodeUsed"))
    initial_reward = 1000 if has_referral else 500
    referral_bonus = 2000
    user = {
        "id": user_id,
        "firstName": pending["firstName"],
        "lastName": pending["lastName"],
        "email": email,
        "whatsappNumber": pending.get("whatsappNumber"),
        "passwordHash": hash_password(req.password),
        "isVerified": True,
        "speakCoinBalance": initial_reward,
        "ownReferralCode": referral_code,
        "referredBy": pending.get("referralCodeUsed"),
        "createdAt": iso(now_utc()),
        "verifiedAt": iso(now_utc()),
        "lastLoginAt": iso(now_utc()),
    }
    await db.users.insert_one(dict(user))

    # initial reward ledger
    await db.coin_ledger.insert_one({
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "type": "initial_reward",
        "amount": initial_reward,
        "reason": "Initial SPEAK COIN reward for verified registration",
        "createdBy": "system",
        "createdAt": iso(now_utc()),
    })

    # referral reward -> credit the referrer
    if pending.get("referralCodeUsed"):
        referrer = await db.users.find_one({"ownReferralCode": pending["referralCodeUsed"]}, {"_id": 0})
        if referrer and referrer["id"] != user_id:
            await db.users.update_one({"id": referrer["id"]}, {"$inc": {"speakCoinBalance": referral_bonus}})
            await db.coin_ledger.insert_one({
                "id": str(uuid.uuid4()),
                "userId": referrer["id"],
                "type": "referral_reward",
                "amount": referral_bonus,
                "reason": f"Referral bonus: {email} joined using your code",
                "createdBy": "system",
                "createdAt": iso(now_utc()),
            })
            await db.referrals.insert_one({
                "id": str(uuid.uuid4()),
                "referrerId": referrer["id"],
                "referredUserId": user_id,
                "referralCode": pending["referralCodeUsed"],
                "createdAt": iso(now_utc()),
            })

    await db.pending_registrations.update_one({"id": pending["id"]}, {"$set": {"status": "completed"}})

    token = create_token(user_id, email, "attendee")
    return {
        "status": "verified",
        "message": f"You're verified! {initial_reward} SPEAK COIN credited to your account.",
        "access_token": token,
        "user": {k: v for k, v in user.items() if k != "passwordHash"},
    }


# ----------------------- Attendee auth -----------------------
@api_router.post("/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    await db.users.update_one({"id": user["id"]}, {"$set": {"lastLoginAt": iso(now_utc())}})
    token = create_token(user["id"], email, "attendee")
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    user.pop("_id", None)
    user.pop("passwordHash", None)
    return {"status": "ok", "access_token": token, "user": user}


@api_router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    referral_count = await db.referrals.count_documents({"referrerId": user["id"]})
    user["referralCount"] = referral_count
    return user


@api_router.get("/my-ledger")
async def my_ledger(user: dict = Depends(get_current_user)):
    entries = await db.coin_ledger.find({"userId": user["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return entries


@api_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"status": "ok"}


# ----------------------- Admin -----------------------
@api_router.post("/admin/login")
async def admin_login(req: LoginRequest, response: Response):
    email = req.email.lower().strip()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(req.password, admin["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid admin credentials.")
    token = create_token(admin["id"], email, admin["role"])
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    admin.pop("_id", None)
    admin.pop("passwordHash", None)
    return {"status": "ok", "access_token": token, "admin": admin}


@api_router.get("/admin/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    return admin


@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    total_verified = await db.users.count_documents({})
    total_pending = await db.pending_registrations.count_documents({"status": "pending"})
    total_referrals = await db.referrals.count_documents({})
    coins_agg = await db.users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$speakCoinBalance"}}}]).to_list(1)
    total_coins = coins_agg[0]["total"] if coins_agg else 0
    return {
        "verifiedAttendees": total_verified,
        "pendingRegistrations": total_pending,
        "totalReferrals": total_referrals,
        "totalCoinsIssued": total_coins,
    }


async def build_registration_rows():
    rows = []
    users = await db.users.find({}, {"_id": 0, "passwordHash": 0}).sort("createdAt", -1).to_list(5000)
    for u in users:
        rc = await db.referrals.count_documents({"referrerId": u["id"]})
        rows.append({
            "firstName": u["firstName"],
            "lastName": u["lastName"],
            "email": u["email"],
            "whatsappNumber": u.get("whatsappNumber"),
            "status": "verified",
            "speakCoinBalance": u.get("speakCoinBalance", 0),
            "ownReferralCode": u.get("ownReferralCode"),
            "referredBy": u.get("referredBy"),
            "referralCount": rc,
            "createdAt": u.get("createdAt"),
            "verifiedAt": u.get("verifiedAt"),
        })
    pendings = await db.pending_registrations.find({"status": "pending"}, {"_id": 0}).sort("createdAt", -1).to_list(5000)
    for p in pendings:
        expired = datetime.fromisoformat(p["expiresAt"]) < now_utc()
        rows.append({
            "firstName": p["firstName"],
            "lastName": p["lastName"],
            "email": p["email"],
            "whatsappNumber": p.get("whatsappNumber"),
            "status": "expired" if expired else "pending",
            "speakCoinBalance": 0,
            "ownReferralCode": None,
            "referredBy": p.get("referralCodeUsed"),
            "referralCount": 0,
            "createdAt": p.get("createdAt"),
            "verifiedAt": None,
        })
    return rows


@api_router.get("/admin/registrations")
async def admin_registrations(
    admin: dict = Depends(get_current_admin),
    search: Optional[str] = None,
    status: Optional[str] = None,
):
    rows = await build_registration_rows()
    if status and status != "all":
        rows = [r for r in rows if r["status"] == status]
    if search:
        s = search.lower().strip()
        rows = [r for r in rows if s in r["firstName"].lower() or s in r["lastName"].lower() or s in r["email"].lower() or (r.get("ownReferralCode") or "").lower().find(s) >= 0]
    return rows


@api_router.get("/admin/export")
async def admin_export(admin: dict = Depends(get_current_admin)):
    rows = await build_registration_rows()
    output = io.StringIO()
    fields = ["firstName", "lastName", "email", "whatsappNumber", "status", "speakCoinBalance", "ownReferralCode", "referredBy", "referralCount", "createdAt", "verifiedAt"]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for r in rows:
        writer.writerow({k: r.get(k, "") for k in fields})
    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=speak2026_registrations.csv"},
    )


@api_router.get("/admin/settings")
async def admin_get_settings(admin: dict = Depends(get_current_admin)):
    return await get_settings()


@api_router.put("/admin/settings")
async def admin_update_settings(req: SettingsUpdate, admin: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if updates:
        await db.system_settings.update_one({"id": "global"}, {"$set": updates}, upsert=True)
    return await get_settings()


@api_router.get("/admin/admins")
async def list_admins(admin: dict = Depends(get_current_admin)):
    admins = await db.admins.find({}, {"_id": 0, "passwordHash": 0}).to_list(500)
    return admins


@api_router.post("/admin/admins")
async def add_admin(req: AddAdminRequest, admin: dict = Depends(get_current_admin)):
    if admin["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only the super admin can add new admins.")
    email = req.email.lower().strip()
    if await db.admins.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An admin with this email already exists.")
    new_admin = {
        "id": str(uuid.uuid4()),
        "name": req.name.strip(),
        "email": email,
        "passwordHash": hash_password(req.password),
        "role": "admin",
        "createdAt": iso(now_utc()),
    }
    await db.admins.insert_one(dict(new_admin))
    new_admin.pop("passwordHash", None)
    return new_admin


@api_router.get("/admin/referrals")
async def admin_referrals(admin: dict = Depends(get_current_admin)):
    refs = await db.referrals.find({}, {"_id": 0}).sort("createdAt", -1).to_list(2000)
    result = []
    for r in refs:
        referrer = await db.users.find_one({"id": r["referrerId"]}, {"_id": 0})
        referred = await db.users.find_one({"id": r["referredUserId"]}, {"_id": 0})
        result.append({
            "referralCode": r["referralCode"],
            "referrerName": f"{referrer['firstName']} {referrer['lastName']}" if referrer else "—",
            "referrerEmail": referrer["email"] if referrer else "—",
            "referredName": f"{referred['firstName']} {referred['lastName']}" if referred else "—",
            "referredEmail": referred["email"] if referred else "—",
            "createdAt": r["createdAt"],
        })
    return result


# ----------------------- Startup / background -----------------------
async def seed_super_admin():
    email = os.environ.get("SUPER_ADMIN_EMAIL", "admin@speakcon.com").strip().lower()
    password = os.environ.get("SUPER_ADMIN_PASSWORD", "moc.nockaeps@nimda").strip()
    name = os.environ.get("SUPER_ADMIN_NAME", "Super Admin").strip()
    existing = await db.admins.find_one({"email": email})
    if existing is None:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "passwordHash": hash_password(password),
            "role": "superadmin",
            "createdAt": iso(now_utc()),
        })
        logger.info(f"Seeded super admin: {email}")
    elif not verify_password(password, existing["passwordHash"]):
        await db.admins.update_one({"email": email}, {"$set": {"passwordHash": hash_password(password), "role": "superadmin"}})
        logger.info(f"Updated super admin password: {email}")


async def cleanup_expired_loop():
    while True:
        try:
            res = await db.pending_registrations.delete_many({
                "status": "pending",
                "expiresAt": {"$lt": iso(now_utc())},
            })
            if res.deleted_count:
                logger.info(f"Purged {res.deleted_count} expired pending registrations")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        await asyncio.sleep(600)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("ownReferralCode")
    await db.admins.create_index("email", unique=True)
    await db.pending_registrations.create_index("verificationToken")
    await db.pending_registrations.create_index("email")
    await get_settings()
    await seed_super_admin()
    asyncio.create_task(cleanup_expired_loop())


app.include_router(api_router)


def configured_cors_origins() -> List[str]:
    configured = os.environ.get("CORS_ORIGINS", PUBLIC_APP_URL)
    return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=configured_cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
