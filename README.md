# Taaza Bites Platform

Multi-app healthy meal subscription system — **landing**, **customer**, **admin**, and **delivery partner** — connected through shared Firebase Auth and role-based portal routing.

> Full-stack food-tech product architecture: one monorepo, four apps, Super Admin control plane, payments/comms integrations, and Gemini AI features.

---

## Architecture

```
taaza-bites/
├── apps/
│   ├── landing/     # Marketing hub + Sign-in portal picker     :3002
│   ├── admin/       # Ops console + Super Admin                 :3001
│   ├── customer/    # Subscriptions, meals, account             :3000
│   └── delivery/    # Delivery partner app                      :3003
├── package.json     # npm workspaces
└── README.md
```

```text
Landing (hub)
    │
    ├── Subscribe / Order ──────────► Customer app
    ├── Staff Login ────────────────► Admin app
    ├── Delivery Partner ───────────► Delivery app
    └── Sign in → role check ───────► Admin | Delivery | Customer | Stay
         │
         ▼
   Firebase Auth (shared project)
         │
         ├── admins/{uid}            → Admin / Super Admin
         ├── deliveryPartners/{uid}  → Delivery (approved only)
         └── users/{uid}             → Customer (default)
```

---

## Features

### Portal system
- Landing CTAs route to the correct sibling app
- Post-login **role-aware portal picker** (Admin → Delivery → Customer)
- Shared Firebase Auth across apps

### Super Admin
- Staff invites (`adminInvites`) claimed as `admins/{uid}` on first login
- Approve / block delivery partners (partner Firestore DB)
- Customer account mapping
- Portal URLs & feature flags (`systemSettings`)
- Control UI: `/super-admin`

### Product integrations
- **Payments:** Razorpay
- **WhatsApp:** Gupshup
- **Email:** Brevo / SMTP
- **Maps:** Google Maps
- **AI:** Google Gemini (in-product assistance / content flows)

### Delivery hardening
- Partners cannot self-register
- Super Admin must approve before OTP login works

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express (admin / customer / landing servers) |
| Auth & data | Firebase Auth, Firestore (named DBs per app) |
| AI | Google Gemini (`@google/genai`) |
| Tooling | npm workspaces monorepo |

**Packages:** `@taazabites/landing` · `@taazabites/admin` · `@taazabites/customer` · `@taazabites/delivery`

---

## Quick start

### Prerequisites
- Node.js 20+
- Firebase project (Auth enabled)
- Copy each app’s `.env.example` → `.env` and fill keys

### Install

```bash
# From repo root (workspaces) OR install per app
cd apps/landing && npm install
cd ../admin && npm install
cd ../customer && npm install
cd ../delivery && npm install
```

### Run (Windows PowerShell)

```powershell
# Landing
cd apps/landing; $env:PORT=3002; npm run dev

# Admin
cd apps/admin; $env:PORT=3001; npm run dev

# Customer UI
cd apps/customer; npx vite --port=3000 --host=0.0.0.0

# Delivery
cd apps/delivery; npm run dev
```

### Local URLs

| App | URL |
|-----|-----|
| Landing | http://localhost:3002 |
| Admin | http://localhost:3001/admin/login |
| Super Admin | http://localhost:3001/super-admin |
| Customer | http://localhost:3000 |
| Delivery | http://localhost:3003 |

### Landing portal env (`apps/landing/.env`)

```env
VITE_CUSTOMER_URL=http://localhost:3000
VITE_ADMIN_URL=http://localhost:3001
VITE_DELIVERY_URL=http://localhost:3003
VITE_LANDING_URL=http://localhost:3002
VITE_ROLE_API_URL=http://localhost:3001/api/me
```

### Root scripts (after workspace install)

```bash
npm run dev:landing
npm run dev:admin
npm run dev:customer
npm run dev:delivery
```

---

## Super Admin setup

1. Open Admin login: http://localhost:3001/admin/login  
2. Sign in with a Firebase Auth user whose email is allowlisted for Super Admin bootstrap  
3. First login creates `admins/{uid}` with role **Super Admin**  
4. Use **Admin Management** to invite staff and **Super Admin** page for partners / portals  

> Passwords live in Firebase Auth only — none are hardcoded in this repo.

For full server APIs (`/api/me`, partner approve), add Firebase Admin SDK credentials to `apps/admin/.env`:

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Deploy updated `apps/admin/firestore.rules` to your Firebase project when going live.

---

## Security notes

- Never commit `.env` or service account JSON (see `.gitignore`)
- Delivery partners are gated by Firestore profile + approval
- Admin access requires `admins/{uid}` (or Super Admin invite claim)

---

## Portfolio / demo flow

1. Landing → Subscribe → Customer  
2. Landing → Sign in → portal picker  
3. Admin → Super Admin → register a delivery partner  
4. Delivery app → OTP login (approved partner only)  
5. Show one Gemini-powered AI flow in customer/admin  

---

## License

Private / proprietary unless otherwise stated by the owner.
