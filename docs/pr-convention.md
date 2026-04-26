# Pull Request Convention

When the user asks Codex to create or describe a pull request, use this template.

한국어 설명: 사용자가 Codex에게 PR 생성 또는 PR 설명 작성을 요청하면 아래 템플릿을 사용한다.

```markdown
# Pull Request

## What

* 작업 내용 요약

## Why

* 작업 이유

## Changes

* 변경 사항 정리

## How to Test

* 테스트 방법

## Issue

* Closes #

## Checklist

* [ ] 명세서 기준으로 작업했는가
* [ ] 불필요한 코드 제거했는가
* [ ] 기존 기능 영향 없는가
* [ ] 기본 테스트 완료했는가
```

## Sections

- `What`: summarize the work in one or more short bullets.
- `Why`: explain the reason or problem this pull request addresses.
- `Changes`: list meaningful code, configuration, documentation, or test changes.
- `How to Test`: include commands or manual verification steps.
- `Issue`: include `Closes #issue-number` when there is a related issue. Remove the placeholder when there is no issue.
- `Checklist`: mark completed items with `[x]` only when they are actually verified.

한국어 설명:

- `What`: 작업 내용을 짧은 bullet로 요약한다.
- `Why`: PR이 해결하는 문제나 작업 이유를 설명한다.
- `Changes`: 코드, 설정, 문서, 테스트 변경 사항을 정리한다.
- `How to Test`: 실행한 명령어나 수동 검증 절차를 작성한다.
- `Issue`: 관련 이슈가 있으면 `Closes #issue-number` 형식으로 작성한다. 없으면 placeholder를 제거한다.
- `Checklist`: 실제로 확인한 항목만 `[x]`로 표시한다.
