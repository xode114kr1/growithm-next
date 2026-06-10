# Growithm Next.js App Router 디렉터리 구조 가이드

이 문서는 Growithm 프로젝트의 디렉터리 구조와 파일 배치 기준을 정의한다.
Next.js App Router의 범용 구조를 기반으로 하며, Growithm에서 사용하는 feature-first 구조,
PostgreSQL, Prisma, Auth.js, GitHub 연동 기준을 함께 정리한다.

## 기본 전제

- Next.js App Router 사용
- React / TypeScript 사용
- `src` 디렉터리 기반 구조 사용
- 절대 경로 별칭 사용 권장
  - 예: `@/*` → `src/*`

## 권장 디렉터리 구조

```text
project-root/
├─ docs/                         # 기획, 설계, 기록 문서
├─ public/                       # 이미지, 아이콘 등 정적 파일
├─ src/
│  ├─ app/                       # 페이지, 레이아웃, API 라우트
│  │  ├─ (main)/                # URL에 포함되지 않는 라우트 그룹
│  │  │  ├─ page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ api/                    # API 라우트
│  │  │  └─ [resource]/
│  │  │     ├─ route.ts          # 리소스 목록 API
│  │  │     └─ [id]/route.ts     # 단일 리소스 API
│  │  ├─ globals.css             # 전역 스타일
│  │  └─ layout.tsx              # 최상위 레이아웃
│  ├─ components/                # 여러 곳에서 재사용하는 공용 컴포넌트
│  ├─ hooks/                     # 공용 React 커스텀 훅
│  ├─ lib/                       # 외부 라이브러리 설정 및 공용 인스턴스
│  ├─ services/                  # 데이터 요청 및 비즈니스 로직
│  ├─ types/                     # 여러 곳에서 공유하는 타입
│  └─ utils/                     # 순수 유틸 함수
├─ .env.example                  # 환경 변수 예시
├─ next.config.ts
├─ package.json
└─ tsconfig.json
```

## 디렉터리별 역할

### `src/app`

페이지, 레이아웃, API 라우트를 관리한다.
URL 구조와 직접적으로 연결되는 파일은 이곳에 둔다.

주요 파일과 폴더는 다음과 같다.

```text
app/
├─ page.tsx          # 페이지 컴포넌트
├─ layout.tsx        # 레이아웃 컴포넌트
├─ route.ts          # API 라우트
├─ loading.tsx       # 로딩 UI
├─ error.tsx         # 에러 UI
├─ not-found.tsx     # 404 UI
├─ (group)/          # URL에 포함되지 않는 라우트 그룹
├─ [id]/             # 동적 라우트
└─ _components/      # 해당 라우트에서만 사용하는 컴포넌트
```

라우트에서만 사용하는 컴포넌트, 타입, 상수는 해당 라우트 가까이에 둔다.

```text
app/example/
├─ page.tsx
├─ _components/
├─ constants.ts
└─ types.ts
```

### `src/components`

여러 페이지나 기능에서 재사용하는 공용 UI 컴포넌트를 둔다.
한 페이지에서만 사용하는 컴포넌트는 `src/components`로 바로 올리지 않고, 해당 라우트의 `_components`에 먼저 둔다.

```text
components/
├─ button/
│  └─ Button.tsx
├─ modal/
│  └─ Modal.tsx
└─ header/
   └─ Header.tsx
```

### `src/hooks`

여러 컴포넌트에서 재사용하는 React 커스텀 훅을 둔다.
훅 이름은 `use`로 시작한다.

```text
hooks/
├─ useDebounce.ts
├─ useMediaQuery.ts
└─ useClickOutside.ts
```

### `src/lib`

애플리케이션 전역에서 사용하는 라이브러리 설정, 클라이언트 인스턴스, 외부 SDK 초기화 코드를 둔다.

```text
lib/
├─ auth.ts
├─ db.ts
└─ client.ts
```

### `src/services`

데이터 요청, 서버 액션, API 호출 함수, 도메인 단위 비즈니스 로직을 둔다.
컴포넌트 안에 데이터 요청 로직이 길어지는 것을 방지하기 위한 계층이다.

```text
services/
├─ user.ts
├─ post.ts
└─ comment.ts
```

서버에서만 실행되어야 하는 로직은 파일명으로 구분하는 것을 권장한다.

```text
services/
├─ user.ts
└─ user.server.ts
```

### `src/types`

여러 라우트나 기능에서 공유하는 타입을 둔다.
특정 페이지에서만 사용하는 타입은 해당 라우트 내부에 둔다.

```text
types/
├─ user.ts
├─ api.ts
└─ common.ts
```

### `src/utils`

프레임워크나 상태에 의존하지 않는 순수 함수를 둔다.
날짜 포맷팅, 문자열 처리, 숫자 계산, 색상 변환 등 재사용 가능한 유틸 함수가 여기에 해당한다.

```text
utils/
├─ formatDate.ts
├─ formatNumber.ts
└─ cn.ts
```

### `public`

정적 파일을 둔다.
이미지, 아이콘, 폰트, robots.txt, favicon 등이 해당한다.

```text
public/
├─ images/
├─ icons/
└─ favicon.ico
```

### `docs`

프로젝트 문서를 둔다.
요구사항, 기획, 설계, API 명세, 회의 기록, 트러블슈팅 기록 등을 관리한다.

```text
docs/
├─ requirements.md
├─ architecture.md
└─ troubleshooting.md
```

## 파일 배치 기준

새 파일을 추가할 때는 아래 순서로 위치를 결정한다.

1. 특정 라우트에서만 사용하는가?
   - 해당 라우트 내부에 둔다.
   - 예: `app/example/_components`

2. 여러 라우트에서 재사용하는 UI인가?
   - `src/components`에 둔다.

3. 여러 컴포넌트에서 재사용하는 훅인가?
   - `src/hooks`에 둔다.

4. 데이터 요청이나 도메인 로직인가?
   - `src/services`에 둔다.

5. 외부 라이브러리 설정이나 공용 인스턴스인가?
   - `src/lib`에 둔다.

6. 여러 곳에서 공유하는 타입인가?
   - `src/types`에 둔다.

7. 프레임워크에 의존하지 않는 순수 함수인가?
   - `src/utils`에 둔다.

## 네이밍 규칙

| 대상                  | 규칙                      | 예시                         |
| --------------------- | ------------------------- | ---------------------------- |
| React 컴포넌트 파일   | PascalCase                | `UserCard.tsx`               |
| 컴포넌트 디렉터리     | kebab-case                | `user-card/`                 |
| 커스텀 훅             | `use` + PascalCase        | `useDebounce.ts`             |
| 서비스 파일           | camelCase                 | `userService.ts`             |
| 서버 전용 파일        | `.server` 접미사          | `user.server.ts`             |
| 타입 파일             | camelCase 또는 kebab-case | `user.ts`, `api-response.ts` |
| 유틸 함수 파일        | camelCase                 | `formatDate.ts`              |
| 동적 라우트           | 대괄호                    | `[id]/`                      |
| 라우트 그룹           | 소괄호                    | `(dashboard)/`               |
| 라우트 전용 내부 폴더 | 밑줄 접두사               | `_components/`               |

## 새 프로젝트 적용 순서

1. Next.js 프로젝트를 생성한다.
2. `src` 디렉터리 기반 구조를 사용한다.
3. `src/app`, `src/components`, `src/hooks`, `src/lib`, `src/services`, `src/types`, `src/utils`를 생성한다.
4. `tsconfig.json`에 절대 경로 별칭을 설정한다.
5. 페이지 전용 코드는 해당 라우트 가까이에 둔다.
6. 실제로 여러 곳에서 사용될 때만 공용 디렉터리로 이동한다.
7. 서버 전용 코드와 클라이언트 코드를 명확히 구분한다.
8. 자동 생성 파일은 직접 수정하지 않고 별도 디렉터리로 분리한다.

## 구조 관리 원칙

- 처음부터 모든 코드를 공용 디렉터리에 넣지 않는다.
- 특정 페이지에서만 사용하는 코드는 해당 페이지 가까이에 둔다.
- 재사용이 확인된 코드만 공용 디렉터리로 이동한다.
- 서버 전용 코드를 클라이언트 컴포넌트에서 import하지 않는다.
- 라우트 그룹을 사용해 URL을 변경하지 않고 레이아웃과 관심사를 분리한다.
- 디렉터리를 새로 만들기 전에 기존 계층으로 역할을 설명할 수 있는지 확인한다.
- 자동 생성 파일과 직접 작성한 파일을 분리한다.

## 최소 구조 예시

작은 프로젝트라면 처음부터 복잡하게 나누지 않고 아래 정도로 시작해도 충분하다.

```text
src/
├─ app/
├─ components/
├─ lib/
├─ services/
├─ types/
└─ utils/
```

프로젝트가 커지면서 필요한 경우에만 `hooks`, `constants`, `styles`, `store` 등의 디렉터리를 추가한다.

## Growithm 프로젝트 확장 구조

Growithm은 범용 구조를 기반으로 하되, 기능이 많고 PostgreSQL 데이터베이스와 외부 연동을 사용하므로
feature-first 구조를 적용한다.

범용 가이드의 `src/services`, `src/hooks`, `src/utils` 역할은 최상위 디렉터리로 분리하지 않고,
대부분 해당 기능의 `src/features/[feature]` 내부에 둔다. 여러 기능에서 실제로 공유하는
저수준 코드만 `src/lib` 또는 `src/components`로 이동한다.

### 전체 구조

```text
project-root/
├─ docs/                              # 프로젝트 규칙 및 기능 검증 문서
├─ prisma/
│  ├─ schema.prisma                   # 공통 모델, enum, generator, datasource
│  ├─ models/                         # 도메인별로 분리한 Prisma 모델
│  └─ migrations/                     # PostgreSQL 마이그레이션 이력
├─ public/                            # 정적 파일
├─ src/
│  ├─ app/                            # Next.js 라우팅 경계
│  │  ├─ (app)/                       # 공통 앱 레이아웃을 사용하는 라우트 그룹
│  │  │  ├─ (home)/
│  │  │  ├─ dashboard/
│  │  │  ├─ friend/
│  │  │  ├─ problem/
│  │  │  │  └─ [id]/
│  │  │  ├─ profile/
│  │  │  │  └─ [userId]/
│  │  │  └─ study/
│  │  │     └─ [studyId]/
│  │  │        ├─ members/
│  │  │        ├─ overview/
│  │  │        ├─ owner/
│  │  │        └─ problems/
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/       # Auth.js catch-all Route Handler
│  │     └─ github/
│  │        ├─ webhook/
│  │        └─ webhook-receiver/
│  ├─ components/
│  │  ├─ layout/                      # 헤더, 내비게이션 등 앱 셸
│  │  └─ ui/                          # 도메인에 종속되지 않는 UI primitive
│  ├─ features/                       # 기능별 UI와 비즈니스 로직
│  │  ├─ dashboard/
│  │  ├─ friend/
│  │  ├─ github/
│  │  ├─ home/
│  │  ├─ problem/
│  │  ├─ score/
│  │  └─ study/
│  ├─ generated/
│  │  └─ prisma/                      # Prisma가 생성한 클라이언트와 타입
│  ├─ lib/
│  │  ├─ auth/                        # 전역 인증 설정
│  │  └─ prisma.ts                    # PostgreSQL용 PrismaClient 인스턴스
│  └─ types/                          # 전역 타입 선언 및 라이브러리 타입 확장
├─ .env.example                       # 필수 환경 변수 예시
├─ docker-compose.yml                 # 앱과 PostgreSQL 로컬 실행 환경
├─ Dockerfile                         # 앱 컨테이너 이미지 정의
├─ prisma.config.ts                   # Prisma 스키마, migration, DB URL 설정
└─ vitest.config.ts                   # 단위 테스트 설정
```

### `src/app`: 얇은 라우팅 경계

`src/app`은 URL 구조와 Next.js 특수 파일을 담당한다.

- `page.tsx`는 파라미터를 읽고 feature의 서버 함수와 컴포넌트를 조합한다.
- `route.ts`는 요청을 읽고 feature의 서버 함수에 처리를 위임한 뒤 `Response`를 반환한다.
- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`는 라우트 단위 UI 경계를 담당한다.
- 큰 Prisma 쿼리, 재사용 가능한 비즈니스 규칙, 외부 API 연동 로직은 `src/app`에 두지 않는다.

예를 들어 GitHub 웹훅 Route Handler는 요청 처리의 진입점만 담당한다.

```text
src/app/api/github/webhook-receiver/route.ts
  -> src/features/github/server/webhooks/receiver.ts
  -> src/features/github/server/webhooks/payload-parser.ts
  -> PostgreSQL
```

### `src/features`: 기능 소유 코드

기능별 코드는 아래 구조에서 필요한 디렉터리만 만든다.

```text
src/features/[feature]/
├─ actions/                            # 폼과 사용자 상호작용용 Server Actions
├─ components/                         # 해당 기능 전용 UI
├─ hooks/                              # 해당 기능 전용 클라이언트 훅
├─ server/                             # DB 접근, mutation, 외부 API, 서버 로직
├─ validation/                         # 입력, 파라미터, payload 검증
├─ types.ts                            # 해당 기능의 공개 타입
├─ utils.ts                            # 해당 기능의 순수 유틸 함수
└─ *.test.ts                           # 순수 로직 단위 테스트
```

배치 기준은 다음과 같다.

- Prisma 쿼리는 데이터를 소유한 feature의 `server/`에 둔다.
- Server Action은 입력 검증과 권한 확인 후 `server/`의 mutation을 호출한다.
- 한 기능에서만 사용하는 컴포넌트와 훅은 해당 feature가 소유한다.
- 여러 feature가 공유하지만 도메인에 종속되지 않는 코드만 `src/lib` 또는 `src/components`로 이동한다.
- feature 간 import는 의도적이고 안정적인 의존 관계일 때만 허용한다.

### PostgreSQL과 Prisma

데이터베이스 관련 파일은 다음 책임으로 나눈다.

```text
prisma/
├─ schema.prisma                       # generator, PostgreSQL datasource, 공통 모델
├─ models/
│  ├─ friend.prisma
│  ├─ study.prisma
│  ├─ study-invite.prisma
│  ├─ study-member.prisma
│  └─ study-problem-share.prisma
└─ migrations/
   └─ [timestamp]_[description]/
      └─ migration.sql

src/
├─ generated/prisma/                   # 생성 코드, 직접 수정 금지
└─ lib/prisma.ts                       # 애플리케이션에서 공유하는 PrismaClient
```

- PostgreSQL 연결 문자열은 `DATABASE_URL` 환경 변수로 관리한다.
- Prisma 모델 변경 후 migration과 생성 클라이언트를 함께 갱신한다.
- 생성된 타입과 클라이언트는 `@/generated/prisma/*`에서 import한다.
- 컴포넌트와 Route Handler에서 PrismaClient를 직접 생성하지 않는다.
- DB 접근 함수는 `src/features/[feature]/server`에 두고 `@/lib/prisma` 인스턴스를 사용한다.

### 인증과 외부 연동

인증과 외부 서비스는 전역 설정, 라우트 진입점, 기능 로직을 분리한다.

```text
src/
├─ app/api/auth/[...nextauth]/route.ts # Auth.js Route Handler
├─ app/api/github/.../route.ts         # GitHub 요청 진입점
├─ features/github/
│  ├─ components/                      # 웹훅 등록 UI
│  ├─ server/                          # GitHub API 및 웹훅 처리
│  └─ validation/                      # 저장소와 payload 검증
├─ lib/auth/auth.ts                    # Auth.js 및 GitHub provider 설정
└─ types/next-auth.d.ts                # Auth.js 타입 확장
```

환경 변수는 값이 아닌 이름과 용도만 `.env.example`에 기록한다.

```text
AUTH_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
GITHUB_WEBHOOK_URL
GITHUB_WEBHOOK_SECRET
DATABASE_URL
```

### 테스트와 검증

- 순수 도메인 로직 테스트는 대상 파일 가까이에 `*.test.ts`로 둔다.
- 디렉터리 또는 import 경로 변경 후 `npm run lint`와 `npx tsc --noEmit`을 실행한다.
- Prisma 모델 변경 후 `npx prisma validate`를 추가로 실행한다.
- 기능별 수동 검증 절차가 필요하면 `docs/`에 별도 검증 문서를 둔다.

### Growithm 파일 배치 순서

Growithm에서 새 파일을 추가할 때는 아래 순서로 위치를 결정한다.

1. Next.js 라우팅에 필요한 파일인가?
   - `src/app`에 둔다.
2. 특정 기능이 소유하는 UI, 훅, 액션, 서버 로직, 검증, 타입, 유틸인가?
   - `src/features/[feature]`에 둔다.
3. 도메인에 종속되지 않는 공용 UI인가?
   - `src/components/ui`, `src/components/layout`에 둔다.
4. 인증, DB 클라이언트 등 애플리케이션 인프라인가?
   - `src/lib`에 둔다.
5. 도구가 자동 생성한 코드인가?
   - `src/generated`에 두고 직접 수정하지 않는다.
6. Prisma 스키마 또는 migration인가?
   - `prisma`에 둔다.
