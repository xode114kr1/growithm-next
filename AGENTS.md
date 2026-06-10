<!-- BEGIN:nextjs-agent-rules -->
# 기존 지식과 다른 Next.js 버전

이 프로젝트의 Next.js 버전에는 기존 버전과 호환되지 않는 변경 사항이 있다. API, 규칙, 파일 구조가 학습 데이터와 다를 수 있으므로 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽고 지원 중단 안내를 따른다.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-docs-agent-rules -->
# 프로젝트 문서

코드를 변경하기 전에 항상 `docs/` 안의 Markdown 파일 목록을 확인하고, 현재 요청과 관련된 문서를 실제로 읽은 후 작업한다.

작업 유형에 따라 최소한 아래 문서를 확인한다.

- 코드 생성 또는 리팩터링: `docs/project-structure.md`
- 커밋 생성: `docs/commit-convention.md`
- 풀 리퀘스트 생성 또는 설명 작성: `docs/pr-convention.md`

코드를 생성하거나 리팩터링할 때는 `docs/project-structure.md`를 따른다.

사용자가 Codex에게 커밋 생성을 요청하면 `docs/commit-convention.md`를 따른다.

사용자가 Codex에게 풀 리퀘스트 생성 또는 설명 작성을 요청하면 `docs/pr-convention.md`를 따른다.
<!-- END:project-docs-agent-rules -->
