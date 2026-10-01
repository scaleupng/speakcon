# SPEAK 2026 — Product Requirements (PRD)

## Original problem statement
Web-based multi-page conference site for SPEAK 2026. Features include public marketing pages, registration with email verification (Resend), Google reCAPTCHA, an attendee dashboard (SPEAK COIN balance, QR ticket pass, social share buttons), and an admin dashboard to manage registrations. Dark luxury aesthetic. "SPEAK Conference" is the annual brand; "THE OUTPOST" is the 2026 theme.

## Stack
- Frontend: React 19 + Tailwind + shadcn/ui, Privy wallet, qrcode.react, framer-motion
- Backend: FastAPI + Motor (MongoDB)
- Chain: SPEAK ERC-20 (BEP-20) deployed via Hardhat; BSC testnet + mainnet networks configured
- Integrations: Resend (email), Google reCAPTCHA v2 (checkbox), Privy (embedded wallets)

## Repo
- GitHub: https://github.com/scaleupng/speakcon (branch `main`)
- Current local head: `1d94d46 Add: change onchain buying to unclaim token buying to avoid gas fee`

## Implemented (confirmed by testing agent — iteration_2.json, 2026-02)
### Public site
- Home (looped hero video, SPEAK brand + 2026 theme reframe), Event Details, FAQ, Team, Archive, Leaderboard
### Auth
- Register → Resend verification → Create password → auto-login (JWT)
- Login / Logout
- /admin hidden route with seeded super admin
### Attendee dashboard
- SPEAK coin balances: `pendingSpeakBalance` (unclaimed earnings) + `speakCoinBalance` (claimed to wallet)
- QR ticket pass, referral share links, Privy wallet (send, export, add-to-wallet)
- Claim rewards flow (unclaim → claim to on-chain wallet)
### Admin dashboard
- Overview with stats
- **Vendor POS tab** — QR scanner + manual lookup by email/referral code, attendee card, charge form (amount + note), confirm button writes a `vendor_charge` ledger entry and atomically deducts from `pendingSpeakBalance`
- Registrations table with search, filter, CSV export
- Referrals, Coin Rules, Admins management
- Outpost Control page
### Removed
- `isGasSponsorshipActive` toggle (unset from DB; no reads)
- Attendee-to-attendee sponsored transfer endpoints

## Key endpoints
- Auth: `/api/register`, `/api/verify/{token}`, `/api/create-password`, `/api/login`, `/api/logout`, `/api/me`
- Attendee: `/api/claim-status`, `/api/wallet-address`, `/api/claim-rewards`, `/api/my-ledger`, `/api/leaderboard`
- Admin: `/api/admin/login`, `/api/admin/me`, `/api/admin/stats`, `/api/admin/registrations`, `/api/admin/referrals`, `/api/admin/export`, `/api/admin/settings`, `/api/admin/admins`, `/api/admin/outpost-control`
- Vendor POS: `GET /api/admin/vendor/lookup?query=...`, `POST /api/admin/vendor/charge {userId, amount, note}`

## Data models (Mongo)
- `users`: {id, firstName, lastName, email, passwordHash, isVerified, speakCoinBalance, pendingSpeakBalance, totalSpeakBalance (computed), rewardClaimStatus, walletAddress, ownReferralCode, referredBy, …}
- `pending_registrations`: {firstName, lastName, email, referralCodeUsed, verificationToken, expiresAt, lastSentAt}
- `coin_ledger`: {id, userId, type, amount, reason/note, createdAt, createdBy?} — vendor charges use type=`vendor_charge`, amount<0
- `system_settings`: {directSignUpReward, verificationExpiryHours, resendCooldownSeconds, …}

## Pending / open
- P0 **BSC mainnet token deploy** — waiting on confirmation: (a) BNB funded in treasury `0xC93F1531321115954F27c0365f96130cdAeD5da5`, (b) scope of env rewrite in preview (`REACT_APP_BACKEND_URL`, `MONGO_URL`, `CORS_ORIGINS`), (c) admin seed strategy (idempotent vs env-only)
- P1 Add preview domain to `CORS_ORIGINS` if preview must keep working against production backend
- P1 reCAPTCHA v2 key — current key passes tests via dev-bypass; production key must be whitelisted for the live domain
- P2 Pass download as image, admin camera check-in scanner, past editions section (user backlog)

## Known constraints
- Node 20 in env; `package.json engines` relaxed from `>=22` to `>=20` for supervisor compatibility
- Resend sandbox — only `delivered+<label>@resend.dev` recipients succeed in dev
