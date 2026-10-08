# Insights and FAIR (Phase 30)

Sidebar → **Insights & FAIR** (`/admin/insights`, `/funder/insights`, `/institution/insights`).
Funders and institutions see only their own calls. Super Admin sees everything and can filter by organization.
Every tab can be filtered by call and date range.

## Tabs
1. **Overview**: how many plans were started, the submission rate, the average days from start to first submission, and the share submitted before the call deadline. It also shows a monthly chart of submissions and approvals, a status funnel (started → submitted → reviewed → approved) and a per-call table. Exports: Excel, CSV.
2. **Field analytics**: pick any choice-type question (select, multi-select, licence, repository…). You see how many plans chose each answer and what percentage of plans that is. There's also an "open licence" figure (CC0, CC-BY, CC-BY-SA, ODbL, MIT…; NC/ND licences are not counted as open). Questions are matched across calls and template versions by their internal name. Drafts can be included. Exports: Excel, CSV, PDF.
3. **FAIR score**: each submitted plan gets a score in four parts: Findable, Accessible, Interoperable and Reusable. The tab shows the average score, how scores are spread (≥75 / 40–74 / <40), how often each rule is met, and a list of plans. Export: Excel, CSV.
4. **Data volume & cost**: adds up every "Storage Size (GB/TB)" answer for each call and each institution (taken from the researcher's profile). It then estimates storage cost per year and for the whole period data must be kept.

## FAIR rules (configurable, no code)
A rule is made of a principle (F/A/I/R), a question's internal name, a condition and a number of points.
Conditions: is answered · equals · contains · is one of (comma list) · is an open licence · has at least N words.
Score = points earned ÷ points possible.
- Super Admin edits the **platform rules**. Every organization uses these unless it has its own rules.
- A funder or institution admin clicks **Start from platform rules** to copy them, then edits its own set.
- Changes apply immediately to all scores.

## Cost settings
Price per TB per year, currency and how many years data is kept. Super Admin sets the platform default; organizations can save their own.

## Database
`db/phase30.sql` (run by SETUP.bat): `fair_rules` (with 7 starter rules) and `analytics_settings`.
