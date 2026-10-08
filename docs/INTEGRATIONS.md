# Integrations: FAIRsharing, repositories, ORCID publications (Phase 32 add-on)

Run `SETUP.bat` (or `npm run db:setup`) once to apply `db/phase32.sql`.

## FAIRsharing (metadata standards)
1. Create a free account at https://fairsharing.org.
2. Super Admin → **Integrations** → turn on FAIRsharing, enter username/email and password (stored encrypted), **Save**, then **Test connection**.
3. Funders add the question type **Metadata Standard (FAIRsharing lookup)**. Researchers search and pick a standard; if FAIRsharing is off or unreachable they can still type a name ("Not listed?").

## Sending plans to repositories
Supported: **Zenodo, Dataverse, Figshare, DSpace 7+**. Super Admin chooses which are available (Integrations page) and can switch on Zenodo Sandbox for testing.

Researchers add their own account under **My profile → My repository accounts** (or on the send page):
| Repository | What to enter |
|---|---|
| Zenodo | Personal access token with `deposit:write` |
| Dataverse | Address, API token, collection alias |
| Figshare | Personal token |
| DSpace | Address, email, password, collection UUID |

Then **Export & share → Send to a repository**. Two files are uploaded: maDMP JSON and Word. The record stays an **unpublished draft** (DSpace: workspace item) for the researcher to review and publish; Zenodo can optionally publish immediately. Every attempt, with DOI/link or error, is kept in the history. Only the plan owner can send. Repository addresses must be public `https://` URLs.

## ORCID publications
Researchers save their ORCID iD on the profile and click **Import from ORCID** (public API, no key). Funders can add the question type **Publication (from my ORCID works)**, which lets researchers pick from their imported list.

## Not tested against live accounts
Live checks confirmed ORCID import and that FAIRsharing/Zenodo reject bad credentials correctly. Actual uploads need real accounts; DSpace installations vary (submission form section names `traditionalpageone/two` are the DSpace default) and may need adjusting.
