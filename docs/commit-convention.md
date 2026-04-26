# Commit Convention

When the user asks Codex to create a commit, use this template.

한국어 설명: 사용자가 Codex에게 커밋 생성을 요청하면 아래 템플릿을 사용한다.

```text
type(scope): subject

body - what and why (optional)

Refs: #issue-number (optional)
```

## Format

```text
type(scope): subject
```

- `type`: one of `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`, `ci`, `perf`
- `scope`: short area of change, such as `auth`, `ui`, `docs`, `config`
- `subject`: concise imperative summary
- `body`: optional explanation of what changed and why
- `Refs`: optional issue reference, such as `Refs: #123`

한국어 설명:

- `type`: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`, `ci`, `perf` 중 하나
- `scope`: 변경 범위를 짧게 작성한다. 예: `auth`, `ui`, `docs`, `config`
- `subject`: 명령형으로 간결하게 요약한다.
- `body`: 무엇을 왜 변경했는지 필요할 때만 작성한다.
- `Refs`: 관련 이슈가 있을 때 `Refs: #123` 형식으로 작성한다.

## Examples

```text
docs(project): add commit convention guide
```

```text
fix(auth): handle expired sessions

Refresh the session state before protected route rendering so stale cookies do not show authenticated UI.

Refs: #42
```
