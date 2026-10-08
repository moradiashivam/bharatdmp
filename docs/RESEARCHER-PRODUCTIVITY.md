# Researcher productivity (Phase 26)

Upgrade: run `SETUP.bat` (or `node db/setup.js`) — it applies `db/phase26.sql`, safe to re-run.

## Copy a previous plan
Researcher → My DMPs → **Copy a previous plan** (`/researcher/dmp/clone`).
1. Pick one of your plans and an open call you have not started.
2. **Check** shows how many answers will be copied, which have no matching question, and which questions changed type.
3. **Create plan** copies matching answers (and their translations) and opens the submission check.

Matching: same master field first; custom fields match by internal name. Answers with no match are never guessed.

## Prefill from profile
New plans (started or copied) fill empty text questions from the researcher profile: name, email, phone, ORCID, institution, department, designation, research area, country, grant number (new profile field).
In the project builder, each field has **Prefill from researcher profile**: *Automatic* matches common internal names (e.g. `researcher_name`, `orcid`, `institution_name`, `grant_number`), a specific source forces it, *Never prefill* turns it off.

## Guidance panel
Project builder → edit a field → **Guidance panel**: funder guidance, an example answer and links (`Title | https://...`, one per line; only http/https links show). Researchers see a collapsible **Guidance** box under the question. Guidance text and example appear in the Translation Manager under *DMP questions and help text*.

## Progress and submission check
- Progress bar on the form, % per section in the step bar, and a progress bar per plan on My DMPs.
- Counts visible required questions (conditional rules respected), including required translation languages.
- **Submission check** (`/researcher/dmp/:id/check`) lists every blocker per section with a *Fix* link straight to the question, plus plan-level issues (call closed, not the owner, already submitted). Submitting with blockers redirects here.

## Draft recovery
Typed text is kept in the browser until the server confirms the save; if the page is closed first, it is restored on the next visit. Autosave and "Last saved" stay as before.

## Not built yet (P2)
Answer library of institution snippets, shareable read-only link, extra mobile form work.
