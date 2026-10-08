# Template engine (Phase 27)

Upgrade: run `SETUP.bat` — applies `db/phase27.sql` (safe to re-run) and adds three field types.

## Versions (Form builder → Versions)
- **Publish vN** freezes the current form (sections, questions, options, guidance, validation, conditional rules).
- New plans start on the latest version. Plans in progress keep their version, so later edits cannot break them.
- First publish pins plans already started to v1. Optional tick: "Also move open drafts to this version".
- Shows the changes since the last version and lets you compare any two versions.
- Researchers on an older version see a notice with **Switch to latest version** (answers to questions that still exist are kept).
- Deleting a question removes its answers in every version; disable it instead if older plans need it.
- Until a project publishes its first version, plans use the live form (previous behaviour).

## Clone project (Form builder → Share → Clone project)
Copies sections, questions, options, guidance, validation and rules into a new draft project. Plans are not copied. Super Admin can create the copy for another funder or institution.

## JSON export / import (Share → Export as JSON / Import a template)
Export downloads `template-<slug>.json`. Import: choose or paste a file → **Check file** shows a table (ready / warning / error per question, rules that will be skipped) → **Confirm import** creates a draft project. Nothing is created if any row has an error.

## Validation rules (edit a field → Validation rules)
Min/max words, min/max characters (Min/Max length), min/max value (numbers; GB for storage size), earliest/latest date, and a pattern (regular expression) with your own message. Answers are checked in the Submission check; drafts can still be saved. Researchers see live word/character counters.

## New field types
- **Licence Picker** — preset list (CC BY, CC0, ODbL, MIT…); add your own options to replace it.
- **Repository Picker** — Zenodo, Figshare, Dryad, Dataverse…; own options replace the list.
- **Storage Size** — number + MB/GB/TB, stored as e.g. `2 TB`; limits in GB.

The conditional-logic builder (show/hide/require if X equals Y) already exists as "Conditional question" in the builder.

## Not built yet
Calculated fields and template marketplace (P2), dataset table presets and funder-grant lookup.
