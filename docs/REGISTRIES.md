# Repository and registry integrations (Phase 31)

All lookups go through the DMP server (`/registry/search`, signed-in users only). The browser never contacts third parties directly. Results are cached for one hour. If a registry is offline, researchers can still pick a recommended or common entry, or type a name themselves.

| Registry | Used in | What is stored |
|---|---|---|
| re3data (repositories) | **Repository Picker** questions | name, re3data ID, website, certification (e.g. CoreTrustSeal), PID systems, optional dataset DOI/link |
| ROR (organizations) | new **Organization / Affiliation (ROR lookup)** question; funder/institution setup form | name, ROR ID, city, country, website |
| Crossref Funder Registry | new **Funder (Crossref Funder Registry)** question | name, Funder ID (10.13039/...) |

The answer is saved as a small JSON value. Answer screens, PDF and Word show it as readable text, e.g. "Zenodo (re3data r3d100010468) - https://zenodo.org/".

A Repository Picker that has its own fixed options (set by the funder) still shows a plain drop-down. Without options it becomes the search box.

## maDMP export
- Repository → `distribution.host` (title, url, `certified_with`, `pid_system`, re3data ID in `description`). A dataset link after deposit goes to `distribution.access_url`.
- A Funder question mapped to **Funder (Crossref Funder Registry)** on the maDMP Mapping screen → `project.funding.funder_id` with type `fundref`. If not answered, the funder's ROR link (if set) is used, then its website.
- Import reads these back.

## Storage catalog
Sidebar → **Storage Catalog** (funder, institution, Super Admin per organization). Each entry has a type (repository / active storage / long-term archive), name, website, re3data ID, description and policy. A built-in re3data search fills in the details.
Researchers see the call owner's entries and their own organization's entries first, marked "Recommended".

## Not included
FAIRsharing lookup needs a FAIRsharing account token. Pushing metadata to Zenodo/Dataverse/Figshare/DSpace and ORCID works import are also not included.

## Database
`db/phase31.sql`: `organizations.ror_id`, two new field types, `storage_catalog`.
