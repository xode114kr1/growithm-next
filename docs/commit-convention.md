# 커밋 규칙

사용자가 Codex에게 커밋 생성을 요청하면 아래 템플릿을 사용한다.

```text
type(scope): subject

body - 변경 내용과 이유 (선택)

Refs: #issue-number (선택)
```

## 형식

```text
type(scope): subject
```

- `type`: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`, `ci`, `perf` 중 하나를 사용한다.
- `scope`: 변경 범위를 짧게 작성한다. 예: `auth`, `ui`, `docs`, `config`
- `subject`: 명령형으로 간결하게 요약한다.
- `body`: 무엇을 왜 변경했는지 필요할 때만 작성한다.
- `Refs`: 관련 이슈가 있을 때 `Refs: #123` 형식으로 작성한다.

## 예시

```text
docs(project): 커밋 규칙 가이드 추가
```

```text
fix(auth): 만료된 세션 처리

보호된 라우트를 렌더링하기 전에 세션 상태를 갱신하여 오래된 쿠키로 인증 UI가 표시되지 않도록 한다.

Refs: #42
```
