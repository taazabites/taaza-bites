# Demo dashboard logins

Use these one-click / credential shortcuts to preview each dashboard locally.  
Demo mode is on in **DEV**, or when `VITE_ALLOW_SIMULATED_AUTH=true`.

| Role | App | How to enter | Credentials |
|------|-----|--------------|-------------|
| **Super Admin** | Admin (`/admin` or `:3001`) | Login → **Enter as Super Admin** | `admin@taazabites.in` / `DemoAdmin!234` |
| **Admin** | Admin (`/admin` or `:3001`) | Login → **Enter as Admin** | `demo.admin@taazabites.in` / `DemoAdmin!234` |
| **Customer** | Customer (`/app` or `:3000`) | Login → **Enter Demo Customer Dashboard** | Phone `9876543210`, OTP `123456` (sandbox) |
| **Delivery Partner** | Partner (`/partner` or `:3003`) | Login → **Enter as Demo Partner** | Phone preview `+91 9876543210` |

## Notes

- Buttons create a **local demo session** if Firebase Auth create/sign-in is unavailable.
- Some live API actions may fail without real Firebase tokens — enough to **inspect UI/layouts**.
- Restart Vite after changing `.env`.
- Do **not** use these passwords in production.
