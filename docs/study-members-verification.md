# Study Members Page Verification

Use this checklist after changing the study members page.

## Automated checks

```bash
npm run lint
npx tsc --noEmit
npx prisma validate
```

## Manual checks

- A study member can open `/study/[studyId]/members`.
- A non-member cannot open `/study/[studyId]/members`.
- The members page shows the study title and description from the database.
- The member count matches the members shown in the list.
- Owner, leader, and member roles render with distinct labels.
- Search matches member name, role, and last active date.
- Role filtering works for all roles and the all-members view.
- Sorting works by contribution, recent activity, joined date, and name.
- The profile button opens a member detail modal.
- The profile modal closes without changing the list state.
