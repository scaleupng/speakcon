# SPEAK 2026: THE OUTPOST — PRD

## Original Problem Statement
Multi-page conference marketing site for SPEAK 2026 ("THE OUTPOST: A Generation Positioned for Impact"; mission "Solving Problems Existing Anywhere Through Knowledge"). Public marketing pages + attendee registration with email verification + attendee dashboard + hidden admin console for managing registrations and SPEAK COIN rules. Gold-on-dark brand, Poppins headings / Inter body. Stack: React + FastAPI + MongoDB, Resend email, Google reCAPTCHA.

## Architecture
- Frontend: React (CRA + craco), react-router, Tailwind, shadcn/ui, sonner, canvas-confetti. Contexts: AuthContext (attendee), AdminContext. API client in `src/lib/api.js` (Bearer token via localStorage: `speak_token`, `speak_admin_token`).
- Backend: FastAPI single `server.py`, all routes under `/api`. JWT auth (PyJWT), bcrypt hashing. Resend for email (async via `asyncio.to_thread`). reCAPTCHA v3 verify via httpx. Background loop purges expired pending registrations every 10 min.
- MongoDB collections: users, admins, pending_registrations, coin_ledger, referrals, system_settings. UUID string ids (no ObjectId leakage).

## User Personas
- Attendee/registrant, SPEAK organizer, Super admin + invited admins.

## Core Requirements (static)
- Register (firstName, lastName, email, optional referralCode) + reCAPTCHA → pending registration → verification email → create-password → auto-login → dashboard.
- Initial SPEAK COIN credited only after verification/password setup. Referral bonus credited to referrer on referred user's verification.
- Email-only duplicate prevention. Email must send before pending is created (prod). Resend cooldown (60s default). Pending expiry 4h + purge.
- Hidden /admin with seeded super admin; admins view registrations table (verified/pending/expired), search/filter, CSV export, configure coin rules, add admins (superadmin only).

## Implemented (2026-09-01)
- Public site: Home (hero, countdown to Oct 1 2026, mission, coin section, venue, speakers placeholders, FAQ teaser, CTA), Event Details (schedule, tracks, venue+map link, coin explainer), FAQ (search + category filter).
- Registration with confetti + congratulations modal; verification page with password strength; auto-login.
- Attendee dashboard: coin balance, verified badge, profile, referral code + link (copy), referral count, coin ledger, tasks placeholder.
- Admin: /admin login (seeded superadmin admin@speakcon.com), dashboard tabs Overview (stats + recent registrations), Registrations (search/status filter/CSV export), Referrals, Coin Rules (editable settings), Admins (list + add).
- Integrations: Resend (real key, sender onboarding@resend.dev — test mode), Google reCAPTCHA v3 (best-effort; see backlog). DEV_EXPOSE_TOKENS returns dev verification token/link for testing.
- Verified: backend suite 23/23 pass; full API chain register→verify→create-password(100 COIN)→me→login confirmed.

## Known Config Notes / Backlog
- P0 (user action): reCAPTCHA v3 site key `6LewSaMt...` is not authorized for the preview domain, so client `grecaptcha.execute` fails. Currently reCAPTCHA runs in BEST-EFFORT mode (`RECAPTCHA_ENFORCE=false`) so registration still works. To enforce: add `speak-coin-hub-1.preview.emergentagent.com` (and final domain) to the key's allowed domains in Google reCAPTCHA admin, then set `RECAPTCHA_ENFORCE=true`.
- Resend is in test/sandbox mode with onboarding@resend.dev — only delivers to the Resend account owner's verified address; use `delivered+label@resend.dev` for test deliveries. Set a verified domain sender for production.
- P2: manual coin editing deferred; speaker CMS deferred; referral invite sharing beyond code/link deferred.

## Test Credentials
See /app/memory/test_credentials.md. Super admin: admin@speakcon.com / moc.nockaeps@nimda (route /admin).
