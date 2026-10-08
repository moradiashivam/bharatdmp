# Reviewer panel and double-blind review (Phase 33)

## Two ways in — one reviewer record
| Entry point | Who starts it | Status flow |
|---|---|---|
| Funder invite (`source=funder_invite`) | Funder admin: **Reviewer panel → Invite** (name, email, institution, expertise, calls) | `invited` → reviewer opens the one-time link (7 days), sets a password, accepts confidentiality + COI → `active` |
| Self sign-up (`source=self_signup`) | Reviewer at `/reviewer/apply?funder=<slug>` (captcha protected) | `pending` → funder **Approve** → `active` (or **Reject**) |

Funders can switch self sign-up off under **Reviewer panel → Sign-up settings**. Active reviewers can be suspended / reactivated.

## Data model (`db/phase33.sql`)
- `users` (role `reviewer`) + `reviewer_profiles` — identity, institution, expertise, availability, COI lists. Funder admins only.
- `reviewer_calls` — calls a reviewer may be assigned to.
- `submission_reviewers` — assignments (adds strengths, weaknesses, confidential funder comment, applicant comment, release fields).
- `anon_aliases` — the **only** mapping of an assignment to `APP-XXXX` and `Reviewer #n`.
- `review_messages` — proxied messages (`funder` channel, optional `applicant` channel).
- `blinded_documents` — anonymised proposal PDFs stored in `storage/blinded/` (not public).

## How anonymity is enforced
- **Whitelist DTO**: reviewers receive only section titles, labels and redacted answers. Email, phone, person, affiliation, publication and file answers, and fields labelled name/ORCID/institution/PI/contact, are removed; applicant and team names, institutions, emails and ORCID iDs are replaced with `[redacted]`.
- **Researchers** see only released reviews as "Reviewer 1/2/3", without reviewer names or dates.
- **Release timing**: a completed review is shown to the applicant only after an admin clicks **Release to applicant**.
- **Documents**: PDF metadata (Author, Company, Producer, XMP…) is blanked on upload; the PDF text is scanned for self-identifying content and flagged to the applicant.
- **Messaging**: through the platform only, by alias. Emails contain only the alias and the call name.
- **COI**: assignment is blocked for same institution (word-order tolerant), same non-generic email domain, listed co-authors, or reviewer-declared conflicts. The reason is shown to the funder only, and the block is audited.
- **Review text scrubbing**: before submitting, reviewers are warned about emails, links, ORCID iDs, self-references, named citations and their own name/institution.
- **Reveal identity**: funder admins only, from the submission's review panel; every reveal is written to the audit log.

## Per-call settings (Review setup)
Blinding: double (default) / single / open; allow reviewer ↔ applicant questions by alias.

## Reviewer dashboard (`/reviewer`)
Overview cards (assigned, in progress, completed, overdue, average turnaround); an assignments table with deadline countdown; upcoming deadlines; a workspace with the blinded proposal, a weighted rubric with live total, strengths/weaknesses, applicant and confidential comments, Accept/Revise/Reject, draft save and submit (locked after submit); messages; history; PDF review certificates (all or per year); a private profile with availability and COI declarations. Reminders are sent two days before the due date and when a review is overdue.
