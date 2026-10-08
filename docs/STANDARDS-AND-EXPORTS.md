# Standards and exports (Phase 28)

## Researchers
Open a plan → **Review** → **Export & share** (or the download icon on *My DMPs*).

| Format | Use it for |
|---|---|
| PDF | Printing / signing (after submission) |
| maDMP JSON | The RDA DMP Common Standard v1.1 - readable by DMPonline, DMPTool, Argos, RDMO… |
| Word (DOCX) | Editing, pasting into grant portals |
| HTML / Markdown | Web pages, wikis, repositories |
| CSV / XML | Analysis |

A **Version** selector exports any submitted version. Drafts export the current answers.
The page also shows whether the maDMP export passes the official RDA schema check
(the schema file is bundled in `src/standards/maDMP-schema-1.1.json`).

### Import a maDMP
*My DMPs* → **Import maDMP**. Pick an open call, choose or paste the file, check the
table of matched answers, then confirm. A new draft plan is created; nothing is
overwritten. Files exported from this system restore every answer; files from other
tools fill the questions that are mapped (see below).

### Who can see a plan
Private (team, plus the funder's reviewers once submitted) · Funder team (anyone in the
funder signed in, via the link) · Public (anyone with the link; only submitted versions,
never drafts). Public plans also offer `…/plans/<link>.json` in maDMP format.

## Funders / institutions
**Exports & Sharing** in the sidebar:
- **Who can see plans** per call: *Researcher decides* (default), *Always private*,
  *Our team only*, *Always public*. A fixed rule overrides the researcher's choice.
  Administrators only.
- **ZIP** per call: latest submitted version of every plan as PDF / Word / maDMP / HTML,
  plus `index.csv`, `all-answers.csv` and `all-answers.xml`.
- A submission page has **Other formats** next to *Download PDF*.

## Super Admin
- **maDMP Mapping**: choose the maDMP element for each master field (title, ethics,
  personal data, licence, repository, size, keywords…). Unmapped answers are still
  exported in an `extension` block. Project custom fields use the mapping of a master
  field with the same internal name. Common names are pre-mapped by `db/phase28.sql`.
- **PDF Templates**: new options *Accessible (tagged) PDF* (on by default) and
  *Cover page* with title/subtitle. Word exports use the same header, footer, font,
  cover page and the organisation colour.

## Not built in this phase
DOI minting through DataCite (needs a DataCite account) and full PDF/UA certification.
