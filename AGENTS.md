<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-docs-agent-rules -->
# Project Docs

Before making code changes, always list the Markdown files in `docs/`, then read the files relevant to the current request before editing.

한국어 설명: 코드 변경 전에 항상 `docs/` 안의 Markdown 파일 목록을 확인한 다음, 현재 요청과 관련된 문서를 실제로 읽고 작업한다.

At minimum, use these docs by task type:

- Code creation or refactoring: `docs/project-structure.md`
- Commit creation: `docs/commit-convention.md`
- Pull request creation or PR description: `docs/pr-convention.md`

한국어 설명: 작업 유형에 따라 최소한 위 문서들을 확인한다.

When creating or refactoring code, follow `docs/project-structure.md`.

한국어 설명: 코드를 생성하거나 리팩토링할 때 `docs/project-structure.md`를 따른다.

When the user asks Codex to create a commit, follow `docs/commit-convention.md`.

한국어 설명: 사용자가 Codex에게 커밋 생성을 요청하면 `docs/commit-convention.md`를 따른다.

When the user asks Codex to create or describe a pull request, follow `docs/pr-convention.md`.

한국어 설명: 사용자가 Codex에게 PR 생성 또는 PR 설명 작성을 요청하면 `docs/pr-convention.md`를 따른다.
<!-- END:project-docs-agent-rules -->
