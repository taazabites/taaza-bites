<p align="center">
  <img src="apps/landing/public/icons/icon-192x192.png" alt="Taaza Bites" width="96" height="96" />
</p>

<h1 align="center">Taaza Bites</h1>

<p align="center">
  <strong>Multi-app healthy meal subscription platform</strong><br/>
  Landing · Customer · Admin · Delivery — one monorepo, shared Auth, role-based portals, Gemini AI
</p>

<p align="center">
  <a href="https://github.com/iamsunku/Taaza-bites-company"><img src="https://img.shields.io/badge/GitHub-Taaza--bites--company-181717?logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Monorepo-npm%20workspaces-CB3837?logo=npm&logoColor=white" alt="Monorepo" />
</p>

---

## Why this project

Taaza Bites is a **food-tech product system**, not a single marketing page. Customers subscribe to chef-crafted meals, staff run operations, and delivery partners fulfill routes — each in a dedicated app, connected through one authentication layer and a Super Admin control plane.

Built to demonstrate real-world skills in:

- Full-stack product architecture  
- Role-based access (RBAC) across multiple apps  
- Firebase Auth + Firestore data design  
- Payments & communication integrations  
- In-product AI with Google Gemini  
- Clean monorepo packaging for demos and deployment  

---

## Apps at a glance

| App | Package | Port | Purpose |
|-----|---------|------|---------|
| **Landing** | `@taazabites/landing` | `3002` | Marketing hub, CTAs, Sign-in → portal picker |
| **Admin** | `@taazabites/admin` | `3001` | Ops console + **Super Admin** (`/super-admin`) |
| **Customer** | `@taazabites/customer` | `3000` | Subscriptions, meals, wallet, account |
| **Delivery** | `@taazabites/delivery` | `3003` | Partner deliveries, earnings, profile |

```text
taaza-bites/
├── apps/
│   ├── landing/
│   ├── admin/
│   ├── customer/
│   └── delivery/
├── package.json          # npm workspaces
└── README.md
```

---

## System flow

```mermaid
flowchart LR
  L[Landing Hub] --> Auth[Firebase Auth]
  Auth --> R{Role resolve}
  R -->|admins / Super Admin| A[Admin App]
  R -->|approved partner| D[Delivery App]
  R -->|customer| C[Customer App]
  R -->|optional| L
  SA[Super Admin] -->|invite staff| A
  SA -->|approve partners| D
  SA -->|portal URLs & flags| L
```

**From the website**

| User action | Destination |
|-------------|-------------|
| Subscribe / Order | Customer app |
| Sign in | Role check → Admin / Delivery / Customer / Stay |
| Footer → Staff Login | Admin `/admin/login` |
| Footer → Delivery Partner | Delivery `/login` |
| Footer → Customer Login | Customer `/login` |

---

## Key features

### Portal & identity
- Shared Firebase Auth across all four apps  
- Landing post-login **portal picker** with priority: Admin → Delivery → Customer  
- Optional role API: `GET /api/me` on Admin (with client-side Firestore fallback)  

### Super Admin control plane
- Invite staff → `adminInvites` → claimed as `admins/{uid}` on first login  
- Approve / block delivery partners on the partner Firestore database  
- Map customer accounts across CRM ↔ customer app  
- Configure portal URLs & feature flags in `systemSettings`  
- UI: `http://localhost:3001/super-admin`  

### Operations & product
- Kitchen, orders, subscriptions, finance modules (admin)  
- Customer subscription & meal experience  
- Delivery partner app (OTP) — **no open self-registration**  

### Integrations
| Area | Tech |
|------|------|
| Payments | Razorpay |
| WhatsApp | Gupshup |
| Email | Brevo / SMTP |
| Maps | Google Maps Platform |
| AI | Google Gemini (`@google/genai`) |

---

## Tech stack

| Layer | Choices |
|-------|---------|
| UI | React 19, TypeScript, Vite, Tailwind CSS, Motion |
| Server | Node.js, Express (landing / admin / customer) |
| Auth & DB | Firebase Auth, Firestore (named DBs per domain) |
| AI | Google Gemini |
| Tooling | npm workspaces monorepo |

---

## Getting started

### Prerequisites
- **Node.js 20+**
- Firebase project with **Authentication** enabled  
- Copy `.env.example` → `.env` in each app and fill keys  

### Install

```bash
cd apps/landing && npm install
cd ../admin && npm install
cd ../customer && npm install
cd ../delivery && npm install
```

### Run locally (PowerShell)

```powershell
# Terminal 1 — Landing
cd apps/landing; $env:PORT='3002'; npm run dev

# Terminal 2 — Admin
cd apps/admin; $env:PORT='3001'; npm run dev

# Terminal 3 — Customer UI
cd apps/customer; npx vite --port=3000 --host=0.0.0.0

# Terminal 4 — Delivery
cd apps/delivery; npm run dev
```

### Local URLs

| App | URL |
|-----|-----|
| Landing | http://localhost:3002 |
| Admin login | http://localhost:3001/admin/login |
| Super Admin | http://localhost:3001/super-admin |
| Customer | http://localhost:3000 |
| Delivery | http://localhost:3003 |

### Landing portal env

`apps/landing/.env`:

```env
VITE_CUSTOMER_URL=http://localhost:3000
VITE_ADMIN_URL=http://localhost:3001
VITE_DELIVERY_URL=http://localhost:3003
VITE_LANDING_URL=http://localhost:3002
VITE_ROLE_API_URL=http://localhost:3001/api/me
```

### Root workspace scripts

```bash
npm run dev:landing
npm run dev:admin
npm run dev:customer
npm run dev:delivery
```

---

## Super Admin setup

1. Open [Admin login](http://localhost:3001/admin/login)  
2. Sign in with a Firebase user that is allowlisted for Super Admin bootstrap  
3. First successful login creates `admins/{uid}` with role **Super Admin**  
4. Invite staff from **Admin Management**  
5. Approve partners & set portals under **Super Admin**  

> Passwords are stored only in **Firebase Auth** — none are hardcoded in this repository.

For full Admin server APIs (`/api/me`, partner dual-write), add a service account to `apps/admin/.env`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Deploy `apps/admin/firestore.rules` to Firebase before production.

---

## Security highlights

- `.env` and secrets are gitignored  
- Delivery access requires an approved `deliveryPartners/{uid}` document  
- Admin access requires `admins/{uid}` (or invite claim / Super Admin allowlist)  
- Role checks span Auth + Firestore; partner self-signup is disabled by design  

---

## Demo script (portfolio / interviews)

1. **Landing** → Subscribe → Customer app  
2. **Sign in** → portal picker by role  
3. **Admin** → Super Admin → register a delivery partner  
4. **Delivery** → OTP login (only after approval)  
5. Show one **Gemini AI** flow inside the product  

---

## Project status

| Area | Status |
|------|--------|
| Monorepo layout | Done |
| Portal linking (Phase 1) | Done |
| Role-based login routing (Phase 2) | Done |
| Gates + `/api/me` (Phase 3) | Done |
| Super Admin hub (Phase 4) | Done |
| Single shared Firestore DB | Optional / future |
| Cross-domain SSO cookies | Optional / future |

---

## Author

Built and documented as a full-stack / AI product case study.

- GitHub: [iamsunku/Taaza-bites-company](https://github.com/iamsunku/Taaza-bites-company)

---

## License

Private / proprietary unless the repository owner states otherwise.
