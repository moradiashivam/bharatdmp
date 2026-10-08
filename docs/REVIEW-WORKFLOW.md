# Review workflow 2.0 (Phase 24)

## 1. Set up the review for a call (funder / institution admin)
Projects > **Review** button on a project:
- **Scoring rubric** – add the criteria reviewers score, each with a maximum score and a weight. The total is a weighted percentage.
- **Approval stages** – for example Screening > Technical review > Final approval, each with the number of completed reviews it needs. Leave this empty for a single-step review.
- **Reviewers** – assign them by hand, or automatically to the reviewers with the fewest open reviews. You also set how many reviewers each plan gets and how many days they have.
- **Anonymous reviewers** – researchers see "Reviewer" instead of names.

## 2. Assign reviewers
Open a submission > *Reviewers & scores* > choose one or more people (and a stage) > **Assign**. Each reviewer gets a notification with a due date, and the submission moves to *Under review*.

## 3. Review (any assigned reviewer)
The submission page shows **My review**:
1. Confirm you have no conflict of interest, or declare one with a reason. A conflict stops the review so an admin can reassign it.
2. Score each criterion and add optional notes.
3. Choose a recommendation (Approve / Request changes / Reject) and write a summary.
4. **Save draft** any time, or **Submit review**. Submitting requires every score, a recommendation and a summary.

**My reviews** in the sidebar lists your assignments, with overdue reviews highlighted. Admins also see **Team workload**: open, overdue, completed and conflict counts for each reviewer.

## 4. Stages and the final decision (admin)
- **Move to next stage** – allowed once the stage has enough completed reviews. A checkbox lets you move anyway.
- **Final decision** – *Request changes*, *Reject* or *Approve*. A reason is required for every decision, and the researcher sees it. *Approve* is only available in the last stage.
- **Changes since V1** – shows only the answers that changed since the previous version, before and after, side by side.

## 5. What the researcher sees
In Version history, the **Changes** or **Decision** button shows the decision, the reason and what changed between versions. The researcher is notified of every decision and stage move.

## Overdue reviews
When a review passes its due date, the reviewer is reminded once. This uses the same hourly check as Phase 22.

## Upgrade
Run **SETUP.bat** once — it applies `db/phase24.sql` safely.
