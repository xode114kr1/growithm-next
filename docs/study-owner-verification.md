# Study Owner Page Verification

Use this checklist after changing the study owner workflow.

## Automated checks

```bash
npm run lint
npx tsc --noEmit
npx prisma validate
```

## Manual checks

- Owner can open `/study/[studyId]/owner`.
- Non-owner cannot open `/study/[studyId]/owner`.
- Owner tab is visible to the owner from the study overview page.
- Owner tab is hidden from non-owner study members.
- Owner can invite an existing user by name or email.
- Invite creation fails for a user that does not exist.
- Invite creation fails for a user that is already a study member.
- Invited user can accept the invite from `/study`.
- Invited user can decline the invite from `/study`.
- Owner can change a member role between `LEADER` and `MEMBER`.
- Owner cannot edit the owner role.
- Owner can remove a non-owner member.
- Owner can update the study name and description.
- Owner can delete the study only after typing the study name exactly.
