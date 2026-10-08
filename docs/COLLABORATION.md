# Collaboration on a DMP (Phase 23)

Open any plan and use the **Team**, **Team discussion** and **Activity** buttons at the top.

## Roles (checked by the server on every save)
| Role | Read | Comment | Write answers | Invite / assign / submit |
|---|---|---|---|---|
| Owner | yes | yes | yes | yes |
| Editor | yes | yes | yes | no |
| Commenter | yes | yes | no | no |
| Viewer | yes | no | no | no |

## Inviting co-authors
Team > *Invite a co-author*: enter an email and a role. An email with a link is sent, and the link is also shown under *Pending invitations* with a **Copy** button.
New people register with that same email, then open the link. The invite only works for the invited email address. Shared plans appear on the co-author's dashboard under **Shared with me**.

## Section assignments
The owner picks who answers each section. That person is notified, and the section shows "Assigned to ...".

## Not losing each other's work
- Opening a section locks it for you. Anyone else sees "X is editing this section" and it is read-only for them.
- Locks refresh while you keep saving and clear after 5 minutes without activity, or when you move to the next section.
- Saving from the full form skips sections someone else is editing, so it never overwrites them.
- Each answer remembers who changed it last.

## Team discussion
These are internal comments on the whole plan or on one question, and reviewers never see them. Reply, **Resolve** or **Reopen** a thread. Type `@FirstName`, `@FullNameWithoutSpaces` or `@email` to notify someone. The owner is told about every new comment.

## Activity
This shows who saved, submitted, invited, assigned, commented or changed roles, and when.

## Ownership
The owner can **Transfer ownership** to a team member and then stays on as an editor. Co-authors can **Leave plan**. Only the owner can submit.

## Upgrade
Run **SETUP.bat** once — it applies `db/phase23.sql` safely.
