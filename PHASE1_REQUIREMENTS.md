# Phase 1 requirements — status

Customer asked for a large delivery + CRM suite. Phase 1 shipped below. Later phases still open.

## Done now

| Area | What landed |
|------|-------------|
| **Order UI** | Landing `/order` real cart drawer + sticky bar; detail Add polished |
| **Tiffin deposit** | Dummy **₹299** on first checkout (`Checkout.tsx`) — changeable later |
| **Expiry notifs** | 1 day before expiry + 3 days after (inactive) → Firestore `notifications` |
| **Partner Home** | Online/Offline, pending/completed/failed, earnings, km, success %, score, next delivery, shift |
| **Today's deliveries** | Breakfast/Lunch/Dinner tabs, rich cards, Call/WhatsApp/Can't reach, GPS mismatch, slot timing |
| **Smart route** | `/partner/route` — optimize stops + Google Directions multi-stop |
| **Kitchen QR** | `/partner/kitchen-handover` — batch `TB-YYYYMMDD-XXXX` confirm |
| **Report problem** | Help page writes `partnerIssueReports` for admin |
| **OTP + photo** | Existing OrderDetail flow kept as completion path |
| **CRM prototype** | Admin `/crm-command` — scores, churn list, ask-CRM queries |

## Next phases (not fully built yet)

- Live customer tracking map + FCM device push (scaffolding only)
- Incentive engine + payout ledger polish
- Persist delivery slots; real admin live GPS (not simulated)
- Full Gemini agents / WhatsApp AI / demand forecast
- Mid-route reassign + temporary partner block workflows

Demo partner login: **Enter as Demo Partner** on `/partner/login`.
