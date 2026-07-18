# HOP — Hauler Operations Platform
## DOT & IFTA Compliance for Owner-Operators (1-5 Trucks)

---

## 1. The Opportunity

**Problem:** 500,000+ US owner-operators (91.5% of carriers operate ≤10 trucks) must comply with DOT/FMCSA regulations or face $1K-$19K fines. They use spreadsheets — 94% of audited carriers get violations.

**Why they can't leave once onboarded:**
- DVIR records: must keep 6 months
- Driver qualification files: keep 3 years after termination
- IFTA fuel tax records: keep 4 years
- CSA scores: accumulate annually, referenced by insurers
- After Year 1, switching means re-entering years of state-mileage history and losing regulatory audit trail

**Competition ignores this segment:**
| Competitor | Problem |
|---|---|
| Samsara/Motive | $35-60/vehicle/mo — enterprise sales, ignore 1-2 truck ops |
| FleetRabbit | $19/vehicle/mo — built for 3-20 fleets, not owner-ops |
| TruckingHub | $100+/mo — feature bloat, not compliance-first |
| Spreadsheets | Free — but 94% fail audits |

---

## 2. Tech Stack

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js (React + API routes) | Free |
| Auth | Supabase Auth (magic link, OAuth) | Free tier |
| Database | Supabase PostgreSQL | Free tier (500MB) |
| Storage | Supabase Storage | Free tier (1GB) |
| File upload | Supabase Storage + direct uploads | Free |
| OCR | Gemini API (receipts, documents) | Free tier |
| Hosting | Vercel | Free tier |
| Monitoring | Sentry (already configured) | Free |
| Payments | Stripe / Lemonsqueezy | Per transaction |
| AI assistance | opencode (already configured) | Free |

---

## 3. Build Plan (6 Weeks)

### Week 1 — Auth & Company Setup
- Supabase project setup + schema design
- Auth: magic link login + company/org creation
- Tables: `orgs`, `users`, `vehicles`, `drivers`
- Basic UI shell (Vercel + Next.js)
- MCP: Supabase + Vercel connected

### Week 2 — DVIR (Daily Vehicle Inspection Reports)
- Digital DVIR forms (pre-trip, post-trip)
- Photo capture for defects
- PDF generation for paper backups
- Signature capture
- Defect tracking & repair status

### Week 3 — IFTA Fuel Tax Calculator
- GPS mileage tracking by state
- Fuel receipt OCR (Gemini API)
- IFTA quarterly report generation
- State-by-state mileage breakdown
- Audit-ready export

### Week 4 — Driver Qualification Files
- License expiry tracking (CDL, medical card)
- Document upload (insurance, MVR, drug tests)
- Expiry alert notifications
- Driver file audit view

### Week 5 — CSA & Compliance Dashboard
- CSA score tracking
- Dashboard: violation alerts, upcoming expiries
- Audit-ready PDF reports
- Record retention enforcement (auto-delete after legal period)

### Week 6 — Monetization & Polish
- Stripe/Lemonsqueezy integration
- Free tier enforcement (1 truck, DVIR only, 30-day retention)
- Pro/Business tier gating
- MCPize marketplace listing (optional)
- Error handling, edge cases, docs

---

## 4. Monetization

| Tier | Price | Lock-in Trigger |
|---|---|---|
| **Free** | $0 — 1 truck, DVIR only, 30-day retention | — |
| **Starter** | $15/mo — 3 trucks, IFTA, driver files, 1yr retention | After 1yr IFTA filings, switching requires re-entering state-mileage history |
| **Pro** | $35/mo — 10 trucks, CSA monitoring, dispatch, 4yr retention | CSA score history + 4yr audit trail = regulatory lock-in |
| **Enterprise** | Custom — unlimited trucks, dedicated support, on-prem | Custom contract |

**Revenue projection (conservative):**
| Month | Free | Starter ($15) | Pro ($35) | MRR |
|---|---|---|---|---|
| 1 | 20 | 3 | 0 | $45 |
| 2 | 80 | 12 | 3 | $285 |
| 3 | 200 | 35 | 10 | $875 |
| 6 | 800 | 120 | 40 | $3,200 |
| 12 | 3,000 | 400 | 150 | $11,250 |

---

## 5. First 10 Customers

1. Post in r/Trucking, r/OwnerOperators, r/FreightBrokers on Reddit
2. DM owner-ops on TruckersReport forum
3. Offer free DOT audit review on Facebook trucking groups
4. Partner with independent trucking insurance agents (they want their clients compliant)
5. List on FMCSA's registered ELD/compliance provider directory
6. Post in trucking Discord servers
7. Write "How to Pass a DOT Audit" — long-form SEO

---

## 6. MCP Servers Added to Config

| MCP | Purpose | Status |
|---|---|---|
| **Supabase** | DB schema, auth, storage, queries | Added |
| **Vercel** | Deployments, environment, logs | Added |
| **Sentry** | Error monitoring | Already had |
| **GitHub** | Code repo, issues, CI | Already had |

---

## 7. First Steps (Today)

1. `opencode mcp auth supabase` — authenticate Supabase MCP
2. `opencode mcp auth vercel` — authenticate Vercel MCP
3. Create a new Next.js project with `npx create-next-app@latest hop`
4. Set up Supabase project at https://supabase.com
5. Link Vercel deployment

Ready to start Week 1?
