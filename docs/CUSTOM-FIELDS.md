# Custom Fields in the Funder / Institution Module

This guide explains how a funder or institution admin adds their own questions
to a DMP form, and gives an example of every available field type.
The same guide is available inside the application at
`/funder/help/custom-fields` (or `/institution/help/custom-fields`) and from the
**Field guide** button on the form builder.

Nothing here is hard-coded: every question, choice and instruction is created
through the interface.

---

## 1. Where custom fields live

```
DMP Projects  ->  (project)  ->  Form builder
```

The builder has four ways to add questions:

| Button | What it does |
| --- | --- |
| Add section | Creates a group of questions, e.g. "Data collection" |
| Add fields from master list | Copies approved questions defined by the Super Admin |
| Use a ready-made template | Applies a full set of sections + questions in one click |
| **Add custom field** | Creates a brand-new question that belongs only to this project |

## 2. Step by step — add a custom field

1. Open **DMP Projects** and click **Form builder** on the project.
2. Create a section first with **Add section** so the question has a home.
3. Click **Add custom field**.
4. **Question / label** — the exact wording the researcher reads.
5. **Field type** — see the table in section 4.
6. **Section** — where the question appears.
7. Optional: **Placeholder**, **Help text**, **Description**, **Default value**,
   **Min length**, **Max length**.
8. Tick **Required** if an answer is mandatory.
9. If the type needs choices, the **Answer options** box appears — click
   **Add option** once per choice.
10. **Save field**, then click **Preview** to check it as a researcher sees it.

## 3. Editing, reordering and removing

- **Rename / edit** — pencil icon on the question.
- **Reorder** — drag the handle, or use the up / down arrows. The order is saved
  immediately.
- **Move between sections** — edit the question and change **Section**.
- **Disable instead of delete** — set **Status = Disabled** when researchers have
  already answered. The question disappears from the form and the old answers
  are kept.
- **Delete** — only recommended before the project goes active.
- **Master-list questions** — you can rename, reorder, add help text, make them
  required or disable them for your project. Their type and answer options stay
  as supplied by the Super Admin.

## 4. Every field type, with an example

| Field type | When to use | Example setup | Example answer | Needs options |
| --- | --- | --- | --- | --- |
| Short Text | One-line answers | Question: "Project title", Placeholder: "Enter the full funded project title", Max length 200 | Groundwater quality monitoring in coastal Gujarat | No |
| Long Text | Paragraph answers | Question: "Describe the data you will collect", Help: "Cover type, format and expected volume", Min 200 / Max 2000 | We will collect weekly water samples from 40 wells… | No |
| Number | Whole numbers | Question: "Number of datasets you expect to produce", Default 1 | 12 | No |
| Decimal | Amounts with decimals | Question: "Estimated data volume in GB", Placeholder "e.g. 25.5" | 25.5 | No |
| Date | A calendar date | Question: "Data collection start date" | 2026-04-01 | No |
| Date and Time | Date plus time | Question: "Scheduled deposit date and time" | 2026-04-01 10:30 | No |
| Email | Email address (format checked) | Question: "Data steward email", Placeholder "name@university.edu" | steward@university.edu | No |
| Mobile Number | Phone entry | Question: "Contact mobile number" | +91 9876543210 | No |
| URL | Link to repository / DOI | Question: "Repository link where data will be deposited" | https://zenodo.org/communities/coastal-water | No |
| Single Select | One choice, drop-down | Question: "Primary data type", Options: Observational, Experimental, Simulation, Survey | Survey | Yes |
| Multi Select | Several choices from a list | Question: "File formats you will use", Options: CSV, XLSX, JSON, NetCDF, TIFF | CSV, JSON | Yes |
| Radio Button | One choice, all visible (2–5) | Question: "Who owns the data?", Options: Funder, Institution, Researcher, Shared | Institution | Yes |
| Checkbox | Tick all that apply | Question: "Which approvals are in place?", Options: Ethics committee, Data sharing agreement, Consent forms | Ethics committee, Consent forms | Yes |
| Yes / No | Simple confirmation (options built in) | Question: "Does the project involve personal data?" | Yes | No |
| File Upload | Supporting document | Question: "Attach the ethics approval letter", Help: "PDF, up to 10 MB" | ethics-approval.pdf | No |
| Rich Text | Formatted long answers | Question: "Data management and preservation strategy" | Formatted text with headings and bullets | No |
| Information / Instruction | A note, no answer collected | Label: "Before you continue", Description: "Sections 3 and 4 are mandatory." | — | No |
| Section Heading | Visual heading inside a section | Label: "Part B — Storage and backup" | — | No |
| Table | Grid; each option is a column | Question: "Dataset inventory", Options: Dataset name, Format, Size, Owner | Rows of dataset details | Yes |
| Repeating Field | Block the researcher repeats | Question: "Add each collaborating organisation", Options: Organisation name, Country, Role | Entry 1, Entry 2, Entry 3 | Yes |
| Researcher / Person Selector | Pick a person on the DMP | Question: "Who is responsible for data quality?" | Dr. A. Mehta (Principal Investigator) | No |

> The list of types is itself configurable. A Super Admin can add or retire types
> under **Field Types**, and new types appear automatically in this drop-down.

## 5. Conditional questions

Use **Conditional question** in the builder to show a field only when an earlier
answer matches.

Example:

- Trigger question: "Does the project involve personal data?" (Yes / No)
- Trigger answer: `Yes`
- Target question: "Describe your anonymisation method" (Long Text)

The target question stays hidden until the researcher answers `Yes`.

## 6. Good practice

- One question per field; split long compound questions.
- Put instructions in **Help text**, not in the question label.
- Prefer choice types where you plan to compare answers in reports.
- Keep option labels short and consistent ("Yes", "No", "Not applicable").
- Always run **Preview** before switching the project to **Active**.
