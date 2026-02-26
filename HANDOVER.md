# RepAudit — Handover Documentation

## Overview

RepAudit is an AI-powered Reputation Intelligence SaaS dashboard. It performs automated online reputation audits for SMB and professional service firms using live web data (Tavily API) analyzed by GPT.

## Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase) — Auth, Database, Edge Functions
- **AI**: OpenAI GPT via AI Gateway
- **Web Search**: Tavily API (6 parallel searches per audit)

## Authentication

- Email + password authentication (Supabase Auth)
- Auto-confirm email is enabled for fast onboarding
- `AuthGuard` component protects all routes
- `Auth.tsx` handles login / signup / password reset
- Trigger `on_auth_user_created` auto-creates `profiles` and `usage_limits` rows

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (id, email, timestamps) |
| `audits` | Audit history (company, result JSONB, score) |
| `usage_limits` | Daily/total audit counters |

All tables have RLS enabled. Users can only access their own data.

## Edge Function: `reputation-research`

1. Receives company info from frontend
2. Performs 6 Tavily searches (news, reviews, complaints, legal, social, competitors)
3. Passes real search results as context to GPT
4. GPT fills 18 report modules with formula-based scoring
5. Returns structured JSON response

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `TAVILY_API_KEY` | Web search API |
| `LOVABLE_API_KEY` | AI Gateway access |
| `SUPABASE_SERVICE_ROLE_KEY` | DB access from edge function |

## 18 Report Modules

1. Score Hero (Reputation Score 0-100)
2. Summary Card
3. Score Breakdown (weighted formula)
4. Risk Index (meter + crisis probability)
5. SERP Control (pie chart + score)
6. Financial Impact (lost revenue estimate)
7. Sentiment Timeline (12 months)
8. Source Analysis (6 categories)
9. Legal & Regulatory
10. Management Reputation
11. Competitor Context
12. Red & Green Flags
13. Recommendations (urgent/mid/long)
14. Negative Exposure Mapping
15. Trust Signal Audit
16. Funnel Friction Analysis
17. Sentiment Heatmap
18. LTV/ROI Model
19. Competitive Trust Gap
20. Priority Matrix
21. Reputation Trajectory
22. Anomaly Alert
23. Data Sources

## Scoring Formulas

**Core Score**: `(RS×0.35) + (RV×0.15) + (SC×0.15) + (MS×0.15) + (SOV×0.10) + (VOL×0.10)`

**Risk Index**: `(NegSentiment×0.4) + (SERPNegative×0.3) + (VolatilitySpike×0.3)`

**SERP Control**: `(Owned×1 + Neutral×0.5 - Negative×1) / 10 × 100`

**Financial Impact**: `Traffic × ConversionRate × AvgDealSize × SentimentGap%`

## i18n

Three languages supported: EN, RU, ES. Controlled via `src/lib/i18n.ts`.

## Export

- **Markdown**: Copy to clipboard or download `.md` file
- **PDF**: Generated via jsPDF, opens in new tab

## TODO — Manual Configuration

- [ ] Configure custom SMTP for branded emails (Settings → Email)
- [ ] Set up custom email domain for auth emails
- [ ] Review and adjust daily audit limits (currently 5/day free tier)
- [ ] Add rate limiting to edge function
- [ ] Configure custom domain for the app
- [ ] Set up monitoring/alerting for edge function errors
