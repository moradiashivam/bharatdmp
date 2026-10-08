# AI assistance (Phase 32)

Optional and off by default. Two switches must both be on before any text is sent to an AI service:
1. **Super Admin → AI Assistance**: turn on, choose the service (OpenAI, Google Gemini, or a local **Ollama** server that keeps data on your machines), model, API key (stored encrypted), daily limit per organization, and which features are available.
2. **Funder/Institution → AI Assistance** (or the organization list on the Super Admin page): allow AI for that organization's calls.

Use **Test connection** after saving.

| Feature | Who | Where | Notes |
|---|---|---|---|
| Draft suggestion | Researcher | "Suggest a draft" under text questions | Uses call, domain, guidance and earlier answers. Shown in a labelled box; only inserted on "Use this". Unknown details become [placeholders]. |
| Plan check | Researcher | Submission check → AI plan check | Advisory only. Rates each question Good / Could improve / Missing with the reason and a next step. |
| Translation help | Researcher | "Translate from English" in language tabs | Fills the tab; must be checked by a person. |
| Translations pre-fill | Super Admin | Translations → "Pre-fill missing (AI)" | Reuses identical earlier translations first (translation memory), then AI; up to 60 items per click, saved for review. |
| Reviewer summary | Funder/institution reviewers | Submission page → "Summarise this plan" | Neutral, advisory; not saved. |

Every call is counted in `ai_usage_log` (no plan text stored); the Super Admin page shows 30-day usage. Run `SETUP.bat` once to apply `db/phase32.sql`.
