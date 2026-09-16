"""
Backend tests for SPEAK 2026 THE OUTPOST.

Notes:
- reCAPTCHA is bypassed with recaptchaToken='dev-bypass' (DEV_EXPOSE_TOKENS=true).
- Resend is in test mode, so we send to `delivered+<uniq>@resend.dev` addresses,
  which Resend accepts (its official sandbox recipient).
- Uses -n 2 --dist loadscope from /app/backend/pytest.ini => classes/modules pinned
  to a single worker. Shared state below is done via a module-level dict populated
  by the ordered top-level flow tests, all in this same module.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@speakcon.com"
ADMIN_PASSWORD = "moc.nockaeps@nimda"

# Shared state across tests in this module (ok because loadscope pins module to one worker).
STATE = {}


def _resend_email(prefix="test"):
    # Resend sandbox: delivered+label@resend.dev — always accepted in test mode.
    return f"delivered+TEST_{prefix}_{uuid.uuid4().hex[:8]}@resend.dev"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---------------- Health ----------------
def test_health(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------------- Registration ----------------
def test_register_success_and_dev_token(s):
    email = _resend_email("reg")
    r = s.post(f"{API}/register", json={
        "firstName": "Ada",
        "lastName": "Lovelace",
        "email": email,
        "whatsappNumber": "+2348012345678",
        "recaptchaToken": "dev-bypass",
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "pending"
    assert d["email"] == email.lower()
    assert d.get("devVerificationToken")
    assert d.get("devVerificationLink")
    STATE["reg_email"] = email
    STATE["reg_token"] = d["devVerificationToken"]


def test_register_duplicate_pending_returns_409(s):
    r = s.post(f"{API}/register", json={
        "firstName": "Ada",
        "lastName": "Lovelace",
        "email": STATE["reg_email"],
        "whatsappNumber": "+2348012345678",
        "recaptchaToken": "dev-bypass",
    })
    assert r.status_code == 409


def test_register_invalid_referral_returns_400(s):
    r = s.post(f"{API}/register", json={
        "firstName": "Bad",
        "lastName": "Ref",
        "email": _resend_email("badref"),
        "whatsappNumber": "+2348012345678",
        "referralCode": "NOPE12345",
        "recaptchaToken": "dev-bypass",
    })
    assert r.status_code == 400


# ---------------- Verify + Create Password ----------------
def test_verify_token_valid(s):
    r = s.get(f"{API}/verify/{STATE['reg_token']}")
    assert r.status_code == 200
    d = r.json()
    assert d["valid"] is True
    assert d["email"] == STATE["reg_email"].lower()


def test_verify_token_invalid(s):
    r = s.get(f"{API}/verify/not-a-real-token-xxxx")
    assert r.status_code == 404


def test_create_password_success(s):
    r = s.post(f"{API}/create-password", json={
        "token": STATE["reg_token"],
        "password": "StrongPass123!",
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "verified"
    assert d.get("access_token")
    u = d["user"]
    assert u["email"] == STATE["reg_email"].lower()
    assert u["isVerified"] is True
    assert u["speakCoinBalance"] == 500
    assert u["ownReferralCode"].startswith("SPK")
    STATE["user_a_token"] = d["access_token"]
    STATE["user_a_ref_code"] = u["ownReferralCode"]
    STATE["user_a_email"] = STATE["reg_email"]


def test_create_password_reuse_fails(s):
    r = s.post(f"{API}/create-password", json={
        "token": STATE["reg_token"],
        "password": "AnotherPass123",
    })
    assert r.status_code in (404, 409, 410)


# ---------------- Login + /me + /my-ledger ----------------
def test_login_wrong_password():
    # Use a fresh session so we don't carry over cookies/state.
    r = requests.post(f"{API}/login", json={
        "email": STATE["user_a_email"], "password": "WrongPassX"
    })
    assert r.status_code == 401


def test_login_success(s):
    r = s.post(f"{API}/login", json={
        "email": STATE["user_a_email"], "password": "StrongPass123!"
    })
    assert r.status_code == 200
    STATE["user_a_token"] = r.json()["access_token"]


def test_me(s):
    r = requests.get(f"{API}/me",
                     headers={"Authorization": f"Bearer {STATE['user_a_token']}"})
    assert r.status_code == 200
    d = r.json()
    assert d["email"] == STATE["user_a_email"].lower()
    assert d.get("referralCount") == 0
    assert "passwordHash" not in d
    assert "_id" not in d


def test_my_ledger_has_initial_reward():
    r = requests.get(f"{API}/my-ledger",
                     headers={"Authorization": f"Bearer {STATE['user_a_token']}"})
    assert r.status_code == 200
    entries = r.json()
    assert isinstance(entries, list) and entries
    types = [e["type"] for e in entries]
    assert "initial_reward" in types
    for e in entries:
        assert "_id" not in e


# ---------------- Referral flow ----------------
def test_referral_flow_credits_referrer(s):
    email_b = _resend_email("refb")
    r = s.post(f"{API}/register", json={
        "firstName": "Bob",
        "lastName": "Referred",
        "email": email_b,
        "whatsappNumber": "+2348012345679",
        "referralCode": STATE["user_a_ref_code"],
        "recaptchaToken": "dev-bypass",
    })
    assert r.status_code == 200, r.text
    token_b = r.json()["devVerificationToken"]

    r2 = s.post(f"{API}/create-password", json={"token": token_b, "password": "BobStrong123!"})
    assert r2.status_code == 200

    me = requests.get(f"{API}/me",
                      headers={"Authorization": f"Bearer {STATE['user_a_token']}"})
    assert me.status_code == 200
    md = me.json()
    assert md["speakCoinBalance"] == 2500, md
    assert md["referralCount"] == 1


# ---------------- Resend cooldown ----------------
def test_resend_cooldown_returns_429(s):
    email = _resend_email("resend")
    r = s.post(f"{API}/register", json={
        "firstName": "Rick",
        "lastName": "Send",
        "email": email,
        "whatsappNumber": "+2348012345680",
        "recaptchaToken": "dev-bypass",
    })
    assert r.status_code == 200, r.text
    r2 = s.post(f"{API}/resend-verification", json={"email": email})
    assert r2.status_code == 429


# ---------------- Admin ----------------
@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def test_admin_login_and_me(admin_token):
    r = requests.get(f"{API}/admin/me",
                     headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert r.json()["role"] == "superadmin"


def test_admin_endpoints_reject_no_token():
    # Use fresh requests (no cookies) — bearer_token also falls back to cookie.
    for path in ["/admin/stats", "/admin/registrations", "/admin/settings",
                 "/admin/export", "/admin/admins", "/admin/referrals"]:
        r = requests.get(f"{API}{path}")
        assert r.status_code in (401, 403), f"{path} => {r.status_code}"


def test_admin_endpoints_reject_attendee_token():
    # Attendee token should be rejected on admin routes (403).
    r = requests.get(f"{API}/admin/stats",
                     headers={"Authorization": f"Bearer {STATE['user_a_token']}"})
    assert r.status_code == 403


def test_admin_stats(admin_token):
    r = requests.get(f"{API}/admin/stats",
                     headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    d = r.json()
    for k in ["verifiedAttendees", "pendingRegistrations", "totalReferrals", "totalCoinsIssued"]:
        assert k in d
    assert d["verifiedAttendees"] >= 2  # A and B


def test_admin_registrations_search_and_filter(admin_token):
    h = {"Authorization": f"Bearer {admin_token}"}
    r = requests.get(f"{API}/admin/registrations", headers=h)
    assert r.status_code == 200 and isinstance(r.json(), list)

    r2 = requests.get(f"{API}/admin/registrations?status=verified", headers=h)
    assert r2.status_code == 200
    assert all(row["status"] == "verified" for row in r2.json())

    # Search by first name we know we created (Ada)
    r3 = requests.get(f"{API}/admin/registrations?search=Ada", headers=h)
    assert r3.status_code == 200
    assert any(row["firstName"].lower() == "ada" for row in r3.json())


def test_admin_settings_get_and_update(admin_token):
    h = {"Authorization": f"Bearer {admin_token}"}
    r = requests.get(f"{API}/admin/settings", headers=h)
    assert r.status_code == 200
    orig = r.json()["directSignUpReward"]

    r2 = requests.put(f"{API}/admin/settings", headers=h,
                      json={"directSignUpReward": orig + 10})
    assert r2.status_code == 200
    assert r2.json()["directSignUpReward"] == orig + 10

    # Restore
    requests.put(f"{API}/admin/settings", headers=h,
                 json={"directSignUpReward": orig})


def test_admin_export_csv(admin_token):
    r = requests.get(f"{API}/admin/export",
                     headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
    assert "firstName" in r.text.splitlines()[0]


def test_admin_referrals_lists_relationship(admin_token):
    r = requests.get(f"{API}/admin/referrals",
                     headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()
    assert any(row["referrerEmail"] == STATE["user_a_email"].lower() for row in data)


def test_admin_add_admin_superadmin(admin_token):
    email = f"TEST_admin_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/admin/admins",
                      headers={"Authorization": f"Bearer {admin_token}"},
                      json={"name": "TEST Admin", "email": email, "password": "AdminPass123"})
    assert r.status_code == 200
    d = r.json()
    assert d["email"] == email.lower()
    assert d["role"] == "admin"
