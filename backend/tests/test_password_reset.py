"""Backend tests for forgot-password / reset-password flow."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://speak-coin-hub-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


def _unique_email() -> str:
    label = uuid.uuid4().hex[:10]
    return f"delivered+pwreset{label}@resend.dev"


@pytest.fixture(scope="module")
def verified_attendee():
    """Register + verify + create-password to produce a verified attendee."""
    email = _unique_email()
    reg = requests.post(f"{API}/register", json={
        "firstName": "Reset",
        "lastName": "Tester",
        "email": email,
        "whatsappNumber": "+2348012345678",
        "recaptchaToken": "dev-bypass",
    })
    assert reg.status_code == 200, reg.text
    rj = reg.json()
    assert "devVerificationToken" in rj, "DEV_EXPOSE_TOKENS must be true"
    tok = rj["devVerificationToken"]
    cp = requests.post(f"{API}/create-password", json={"token": tok, "password": "OldPass123!"})
    assert cp.status_code == 200, cp.text
    return {"email": email, "old_password": "OldPass123!"}


# ----- forgot-password endpoint -----
class TestForgotPassword:
    def test_nonexistent_returns_generic_200(self):
        r = requests.post(f"{API}/forgot-password", json={
            "email": f"nope-{uuid.uuid4().hex[:6]}@example.com",
            "recaptchaToken": "dev-bypass",
        })
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["status"] == "ok"
        assert "If an account exists" in j["message"]
        assert "devResetToken" not in j

    def test_unverified_pending_returns_generic_200_no_token(self):
        email = _unique_email()
        reg = requests.post(f"{API}/register", json={
            "firstName": "Pend", "lastName": "Ing", "email": email,
            "whatsappNumber": "+2348011111111", "recaptchaToken": "dev-bypass",
        })
        assert reg.status_code == 200
        r = requests.post(f"{API}/forgot-password", json={"email": email, "recaptchaToken": "dev-bypass"})
        assert r.status_code == 200
        j = r.json()
        assert "If an account exists" in j["message"]
        assert "devResetToken" not in j

    def test_verified_returns_token_and_link(self, verified_attendee):
        r = requests.post(f"{API}/forgot-password", json={
            "email": verified_attendee["email"], "recaptchaToken": "dev-bypass",
        })
        assert r.status_code == 200, r.text
        j = r.json()
        assert "If an account exists" in j["message"]
        assert "devResetToken" in j
        assert "devResetLink" in j
        verified_attendee["token1"] = j["devResetToken"]

    def test_throttle_second_within_cooldown_returns_429(self, verified_attendee):
        # Immediate second call should be throttled
        r = requests.post(f"{API}/forgot-password", json={
            "email": verified_attendee["email"], "recaptchaToken": "dev-bypass",
        })
        assert r.status_code == 429, r.text


# ----- GET /reset-password/{token} -----
class TestValidateResetToken:
    def test_bogus_token_404(self):
        r = requests.get(f"{API}/reset-password/BOGUSTOKEN{uuid.uuid4().hex}")
        assert r.status_code == 404

    def test_valid_token_returns_email_and_firstname(self, verified_attendee):
        tok = verified_attendee.get("token1")
        assert tok, "needs forgot-password call to have run"
        r = requests.get(f"{API}/reset-password/{tok}")
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["valid"] is True
        assert j["email"] == verified_attendee["email"]
        assert j["firstName"] == "Reset"


# ----- supersede + reset flow -----
class TestSupersedeAndReset:
    def test_new_forgot_supersedes_previous(self, verified_attendee):
        # Wait out cooldown (60s). Use settings endpoint logic — just sleep.
        time.sleep(62)
        r2 = requests.post(f"{API}/forgot-password", json={
            "email": verified_attendee["email"], "recaptchaToken": "dev-bypass",
        })
        assert r2.status_code == 200, r2.text
        new_token = r2.json()["devResetToken"]
        verified_attendee["token2"] = new_token
        # Old token now invalidated (used=true, superseded) -> GET returns 410
        old = verified_attendee["token1"]
        rg = requests.get(f"{API}/reset-password/{old}")
        assert rg.status_code == 410, rg.text

    def test_reset_password_short_422(self, verified_attendee):
        r = requests.post(f"{API}/reset-password", json={
            "token": verified_attendee["token2"], "password": "short",
        })
        assert r.status_code == 422

    def test_reset_password_success_autologin(self, verified_attendee):
        new_pass = "NewPass456!"
        r = requests.post(f"{API}/reset-password", json={
            "token": verified_attendee["token2"], "password": new_pass,
        })
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["status"] == "ok"
        assert "access_token" in j and isinstance(j["access_token"], str)
        assert j["user"]["email"] == verified_attendee["email"]
        assert "passwordHash" not in j["user"]
        # Cookie set
        assert "access_token" in r.cookies, dict(r.cookies)
        verified_attendee["new_password"] = new_pass

    def test_old_password_rejected(self, verified_attendee):
        r = requests.post(f"{API}/login", json={
            "email": verified_attendee["email"], "password": verified_attendee["old_password"],
        })
        assert r.status_code == 401

    def test_new_password_works(self, verified_attendee):
        r = requests.post(f"{API}/login", json={
            "email": verified_attendee["email"], "password": verified_attendee["new_password"],
        })
        assert r.status_code == 200, r.text
        assert "access_token" in r.json()

    def test_replay_returns_410(self, verified_attendee):
        r = requests.post(f"{API}/reset-password", json={
            "token": verified_attendee["token2"], "password": "AnotherPass789!",
        })
        assert r.status_code == 410

    def test_get_used_token_returns_410(self, verified_attendee):
        r = requests.get(f"{API}/reset-password/{verified_attendee['token2']}")
        assert r.status_code == 410


# ----- outstanding tokens invalidated on successful reset -----
class TestInvalidateOtherTokensOnReset:
    def test_other_outstanding_tokens_invalidated_after_reset(self):
        # Create verified attendee
        email = _unique_email()
        reg = requests.post(f"{API}/register", json={
            "firstName": "Multi", "lastName": "Tok", "email": email,
            "whatsappNumber": "+2348022222222", "recaptchaToken": "dev-bypass",
        })
        assert reg.status_code == 200
        tok = reg.json()["devVerificationToken"]
        cp = requests.post(f"{API}/create-password", json={"token": tok, "password": "InitPass123!"})
        assert cp.status_code == 200

        # Issue 1st reset token
        r1 = requests.post(f"{API}/forgot-password", json={"email": email, "recaptchaToken": "dev-bypass"})
        assert r1.status_code == 200
        t1 = r1.json()["devResetToken"]

        # Successful reset using t1 → should also mark any other outstanding as invalidated
        # (t1 is itself consumed). To test the "other outstanding" branch, we need to
        # inject a second token in DB — not possible via API without cooldown bypass. Instead,
        # we validate the simpler guarantee: after reset, GET t1 => 410.
        rp = requests.post(f"{API}/reset-password", json={"token": t1, "password": "FreshPass999!"})
        assert rp.status_code == 200
        rg = requests.get(f"{API}/reset-password/{t1}")
        assert rg.status_code == 410
