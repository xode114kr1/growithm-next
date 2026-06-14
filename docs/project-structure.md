# Growithm Next.js App Router 디렉터리 구조 가이드

이 문서는 Growithm 프로젝트의 디렉터리 구조와 파일 배치 기준을 정의한다.
Next.js App Router의 범용 구조를 기반으로 하며, Growithm에서 사용하는 PostgreSQL,
Prisma, Auth.js, GitHub 연동 기준을 함께 정리한다.

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
│  └─ utils/                     # 프론트엔드 공용 포맷 및 표시 함수
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
클라이언트 컴포넌트나 form에서 호출하는 Next.js Server Action은 해당 라우트의 `actions.ts`에 둔다.

```text
app/example/
├─ page.tsx
├─ actions.ts
├─ _components/
├─ constants.ts
└─ types.ts
```

라우트의 `actions.ts`는 Next.js 실행 경계만 담당한다.

- `"use server"` 선언, `FormData` 파싱, 세션 조회를 담당한다.
- 서비스 command에 필요한 사용자 ID와 입력값을 전달한다.
- 처리 완료 후 `revalidatePath`, `redirect` 등 Next.js 후처리를 수행한다.
- Prisma, 외부 API, 재사용 가능한 비즈니스 규칙을 직접 작성하지 않는다.

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

조회와 상태 변경 유스케이스, 외부 API 호출, 도메인 단위 비즈니스 로직을 리소스별 디렉터리에 둔다.
서비스 구현을 보조하는 함수와 입력 검증 함수도 같은 리소스 디렉터리에서 관리한다.

```text
services/
└─ [resource]/
   ├─ [resource].query.ts
   ├─ [resource].command.ts
   ├─ [resource].client.ts
   ├─ [resource].persistence.server.ts
   ├─ [resource].helper.ts
   └─ [resource].validator.ts
```

서비스 파일의 역할은 다음과 같이 구분한다.

- `[resource].query.ts`
  - 상태를 변경하지 않는 조회 유스케이스를 조합한다.
  - validator, client, persistence, helper를 호출하고 처리 결과를 반환한다.
  - 생성, 수정, 삭제 로직과 Prisma 쿼리, 외부 API 요청을 직접 작성하지 않는다.
- `[resource].command.ts`
  - 생성, 수정, 삭제 등 상태를 변경하는 명령 유스케이스를 조합한다.
  - Next.js Server Action, Route Handler, Queue callback 등 호출 진입점과 관계없이 상태를 변경하면 이 파일에 둔다.
  - 인증된 사용자 ID와 검증된 입력값을 받아 validator, client, persistence, helper를 호출한다.
  - `FormData`, `revalidatePath`, `redirect` 같은 Next.js 전용 기능을 사용하지 않는다.
  - Prisma 쿼리와 외부 API 요청을 직접 작성하지 않는다.
- `[resource].client.ts`
  - GitHub 등 애플리케이션 외부 시스템에 요청하는 함수만 둔다.
  - HTTP 요청, 응답 상태 확인, 타임아웃과 외부 API 오류 변환을 담당한다.
  - DB에 접근하거나 비즈니스 흐름을 조합하지 않는다.
- `[resource].persistence.server.ts`
  - Prisma를 사용하는 조회, 저장, 상태 변경, 트랜잭션을 담당한다.
  - DB 저장 형태와 동시성 제어처럼 영속성에 종속된 로직을 둔다.
  - 외부 API를 호출하거나 전체 서비스 흐름을 조합하지 않는다.
- `[resource].helper.ts`
  - 서비스 내부에서 사용하는 순수 데이터 변환과 계산 함수를 둔다.
  - DB, 외부 API, 환경 변수 등 외부 상태에 의존하지 않는다.
- `[resource].validator.ts`
  - 서비스 입력값과 외부에서 전달받은 데이터의 형식을 검증한다.
  - 검증 결과를 타입 가드 또는 파싱 결과로 반환하고 비즈니스 처리를 수행하지 않는다.

HTTP 메서드 이름만으로 파일을 구분하지 않는다.
데이터를 조회하고 상태를 변경하지 않으면 `[resource].query.ts`,
데이터를 생성, 수정, 삭제하거나 상태를 전환하면 `[resource].command.ts`에 둔다.

서비스의 query와 command는 모두 서버에서 실행되는 일반 TypeScript 모듈이다.
`"use server"`와 `"use client"` 지시어를 사용하지 않는다.
`"use client"`는 브라우저에서 렌더링되는 React Client Component 경계를 선언하므로 서비스 command에 사용하지 않는다.

서비스의 `[resource].command.ts`와 라우트의 `actions.ts`는 역할이 다르다.

```text
app/[route]/actions.ts
  -> 인증, FormData 파싱, Next.js 캐시 갱신
  -> services/[resource]/[resource].command.ts 호출
     -> services/[resource]/[resource].persistence.server.ts 호출
        -> PostgreSQL
```

- `app/[route]/actions.ts`는 클라이언트에서 호출 가능한 Next.js Server Action 진입점이다.
- `services/[resource]/[resource].command.ts`는 프레임워크에 의존하지 않는 상태 변경 유스케이스다.
- 라우트 action에서 service persistence를 직접 호출하지 않는다.
- service query와 service command는 persistence, client, validator, helper를 호출할 수 있다.
- persistence, client, validator, helper는 service query나 service command를 호출하지 않는다.

각 역할의 함수가 실제로 있을 때만 해당 파일을 생성한다.
같은 리소스의 조회 목적이 다르더라도 `invite.query.ts`, `layout.query.ts`처럼 화면이나 조회 목적별 파일로 나누지 않고 리소스의 `*.query.ts`에 통합한다.
같은 리소스의 변경 목적이 다르더라도 `create.command.ts`, `delete.command.ts`처럼 명령별 파일로 나누지 않고 리소스의 `*.command.ts`에 통합한다.

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

프론트엔드에서 여러 화면이 공통으로 요청하는 순수 함수를 둔다.
날짜 포맷팅, 문자열 표시 변환, 숫자 표시 변환, 공용 UI 표시값 계산 등이 여기에 해당한다.
특정 도메인의 서비스 구현을 보조하는 함수나 검증 함수는 `src/utils`에 두지 않는다.

```text
utils/
├─ date.ts
├─ number.ts
└─ string.ts
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

7. 프론트엔드 여러 화면에서 공통으로 요청하는 순수 함수인가?
   - `src/utils`에 둔다.

## 네이밍 규칙

| 대상                  | 규칙                      | 예시                         |
| --------------------- | ------------------------- | ---------------------------- |
| React 컴포넌트 파일   | PascalCase                | `UserCard.tsx`               |
| 컴포넌트 디렉터리     | kebab-case                | `user-card/`                 |
| 커스텀 훅             | `use` + PascalCase        | `useDebounce.ts`             |
| 서비스 조회 파일      | `[resource].query.ts`     | `user.query.ts`              |
| 서비스 변경 파일      | `[resource].command.ts`   | `user.command.ts`            |
| DB 접근 파일          | `.persistence.server.ts`  | `user.persistence.server.ts` |
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
- 서버 전용 코드를 클라이언트 컴포넌트에서 가져오지 않는다.
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

Growithm은 범용 구조를 기반으로 라우트 전용 UI와 서비스 로직을 분리한다.

- 페이지에서만 사용하는 UI는 해당 라우트의 `_components`에 둔다.
- 데이터 요청과 비즈니스 로직은 `src/services`에 둔다.
- 여러 영역에서 공유하는 타입은 `src/types`에 둔다.
- 프론트엔드 공용 포맷 및 표시 함수는 `src/utils`에 둔다.
- 외부 라이브러리 설정과 공용 인스턴스는 `src/lib`에 둔다.
- `src/features`는 사용하지 않는다.

### 전체 구조

```text
project-root/
├─ docs/                              # 프로젝트 규칙 및 기능 검증 문서
├─ prisma/
│  ├─ schema.prisma                   # 공통 모델, 열거형, 생성기, 데이터 소스
│  ├─ models/                         # 도메인별로 분리한 Prisma 모델
│  └─ migrations/                     # PostgreSQL 마이그레이션 이력
├─ public/                            # 정적 파일
├─ src/
│  ├─ app/                            # Next.js 라우팅 경계
│  │  ├─ (app)/                       # 공통 앱 레이아웃을 사용하는 라우트 그룹
│  │  │  ├─ (home)/
│  │  │  │  ├─ _components/
│  │  │  │  └─ actions.ts
│  │  │  ├─ dashboard/
│  │  │  │  └─ _components/
│  │  │  ├─ friend/
│  │  │  │  ├─ _components/
│  │  │  │  └─ actions.ts
│  │  │  ├─ problem/
│  │  │  │  ├─ _components/
│  │  │  │  └─ [id]/
│  │  │  │     └─ actions.ts
│  │  │  ├─ profile/
│  │  │  │  └─ [userId]/
│  │  │  └─ study/
│  │  │     └─ [studyId]/
│  │  │        ├─ members/
│  │  │        ├─ overview/
│  │  │        ├─ owner/
│  │  │        └─ problems/
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/       # Auth.js 포괄 라우트 핸들러
│  │     ├─ github/
│  │     │  ├─ webhook/
│  │     │  └─ webhook-receiver/
│  │     └─ queue/
│  │        └─ webhook-delivery/
│  ├─ components/
│  │  ├─ layout/                      # 헤더, 내비게이션 등 앱 셸
│  │  └─ ui/                          # 도메인에 종속되지 않는 기초 UI
│  ├─ generated/
│  │  └─ prisma/                      # Prisma가 생성한 클라이언트와 타입
│  ├─ hooks/                          # 여러 화면에서 재사용하는 React 커스텀 훅
│  ├─ lib/
│  │  ├─ auth/                        # 전역 인증 설정
│  │  └─ prisma.ts                    # PostgreSQL용 PrismaClient 인스턴스
│  ├─ services/                       # 리소스별 데이터 요청과 비즈니스 로직
│  │  ├─ friends/
│  │  │  ├─ friend.query.ts
│  │  │  ├─ friend.command.ts
│  │  │  ├─ friend.persistence.server.ts
│  │  │  ├─ friend.helper.ts
│  │  ├─ problems/
│  │  ├─ studies/
│  │  │  ├─ study.query.ts
│  │  │  ├─ study.command.ts
│  │  │  ├─ study.persistence.server.ts
│  │  │  ├─ study.helper.ts
│  │  │  └─ study.validator.ts
│  │  ├─ users/
│  │  ├─ webhook-delivery-processing/
│  │  ├─ webhook-receiver/
│  │  └─ webhook-registration/
│  ├─ types/                          # 공유 타입 및 라이브러리 타입 확장
│  └─ utils/                          # 프론트엔드 공용 포맷 및 표시 함수
├─ .env.example                       # 필수 환경 변수 예시
├─ docker-compose.yml                 # 앱과 PostgreSQL 로컬 실행 환경
├─ Dockerfile                         # 앱 컨테이너 이미지 정의
├─ prisma.config.ts                   # Prisma 스키마, 마이그레이션, DB URL 설정
└─ vitest.config.ts                   # 단위 테스트 설정
```

### `src/app`: 얇은 라우팅 경계

`src/app`은 URL 구조와 Next.js 특수 파일을 담당한다.

- `page.tsx`는 파라미터를 읽고 라우트 전용 컴포넌트를 조합한다.
- `route.ts`는 요청을 읽고 서비스 함수에 처리를 위임한 뒤 `Response`를 반환한다.
- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`는 라우트 단위 UI 경계를 담당한다.
- 큰 Prisma 쿼리, 재사용 가능한 비즈니스 규칙, 외부 API 연동 로직은 `src/app`에 두지 않는다.
- 서로 독립적인 화면 영역은 각각 필요한 서비스 함수를 호출한다.

예를 들어 GitHub 웹훅 수신 라우트와 Queue callback 라우트는 각각의 서비스 진입점만 담당한다.

```text
src/app/api/github/webhook-receiver/route.ts
  -> src/services/webhook-receiver/webhook-receiver.command.ts
  -> WebhookDelivery 최초 저장
  -> Queue 발행

src/app/api/queue/webhook-delivery/route.ts
  -> src/services/webhook-delivery-processing/webhook-delivery-processing.command.ts
  -> GitHub 파일 조회
  -> ProblemSubmission 저장
```

`webhook-receiver`는 GitHub 요청 검증, `WebhookDelivery` 최초 저장, Queue 발행만 담당한다.
`webhook-delivery-processing`은 Queue 메시지 검증, Delivery 처리 권한 획득,
GitHub 파일 조회, 문제 정보 저장, 처리 상태 갱신을 담당한다.
두 서비스는 서로 직접 참조하지 않고 공유 GitHub 로직과 Queue 메시지 타입만 공용 영역에서 사용한다.

### 라우트 전용 UI와 서비스

페이지 전용 UI와 서비스 로직은 아래처럼 분리한다.

```text
src/
├─ app/(app)/dashboard/
│  ├─ _components/                    # dashboard 페이지 전용 UI
│  └─ page.tsx
├─ services/
│  ├─ problems/
│  │  ├─ problem.query.ts             # 문제 조회 유스케이스
│  │  ├─ problem.command.ts           # 문제 변경 유스케이스
│  │  ├─ problem.persistence.server.ts # 문제 DB 접근과 트랜잭션
│  │  ├─ problem.helper.ts            # 문제 데이터 변환과 계산
│  │  └─ problem.validator.ts         # 문제 입력 검증
│  └─ users/
│     ├─ user.query.ts
│     ├─ user.persistence.server.ts
│     └─ user.helper.ts
├─ types/
│  ├─ problem.ts                     # 문제 리소스 타입
│  └─ user.ts                        # 사용자 리소스 타입
└─ utils/date.ts                     # 프론트엔드 공용 날짜 포맷 함수
```

배치 기준은 다음과 같다.

- 페이지 전용 컴포넌트는 해당 라우트의 `_components`에 둔다.
- 라우트의 `actions.ts`는 Next.js Server Action 경계만 담당하고 상태 변경 유스케이스를 service command에 위임한다.
- Prisma 쿼리와 비즈니스 로직은 `src/app`에 작성하지 않고 `src/services/[resource]`에 둔다.
- 서비스 디렉터리는 `dashboard`와 같은 화면 이름이 아니라 `problems`, `users`와 같은 리소스 이름으로 구분한다.
- 상태를 변경하지 않는 조회 유스케이스는 `[resource].query.ts`에 둔다.
- 생성, 수정, 삭제와 상태 전환 유스케이스는 `[resource].command.ts`에 둔다.
- 외부 API 호출은 `[resource].client.ts`에 두고 `fetch`를 다른 역할 파일에 작성하지 않는다.
- Prisma를 사용하는 DB 접근과 트랜잭션은 `[resource].persistence.server.ts`에 둔다.
- 입력값과 외부 API 응답값 검증은 `[resource].validator.ts`에 둔다.
- 서비스 데이터 변형은 `[resource].helper.ts`에 둔다.
- 같은 리소스의 조회 함수는 화면이나 조회 목적별 파일로 나누지 않고 하나의 `[resource].query.ts`에 통합한다.
- 같은 리소스의 변경 함수는 명령별 파일로 나누지 않고 하나의 `[resource].command.ts`에 통합한다.
- `src/utils`에는 프론트엔드 여러 화면에서 공통으로 사용하는 포맷 및 표시 함수만 둔다.
- 서로 독립적인 페이지 영역은 하나의 페이지 데이터 객체로 묶지 않고 각 영역에서 필요한 서비스를 호출한다.
- 여러 페이지에서 재사용하는 UI만 `src/components`로 이동한다.
- 도메인 helper는 관련 서비스 디렉터리, 프론트엔드 공용 함수는 `src/utils`, 공유 타입은 `src/types`에 둔다.

### PostgreSQL과 Prisma

데이터베이스 관련 파일은 다음 책임으로 나눈다.

```text
prisma/
├─ schema.prisma                       # 생성기, PostgreSQL 데이터 소스, 공통 모델
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
- Prisma 모델 변경 후 마이그레이션과 생성 클라이언트를 함께 갱신한다.
- 생성된 타입과 클라이언트는 `@/generated/prisma/*`에서 가져온다.
- 컴포넌트와 라우트 핸들러에서 PrismaClient를 직접 생성하지 않는다.
- DB 접근 함수는 `src/services`에 두고 `@/lib/prisma` 인스턴스를 사용한다.

### 인증과 외부 연동

인증과 외부 서비스는 전역 설정, 라우트 진입점, 기능 로직을 분리한다.

```text
src/
├─ app/api/auth/[...nextauth]/route.ts # Auth.js 라우트 핸들러
├─ app/api/github/.../route.ts         # GitHub 요청 진입점
├─ app/api/queue/webhook-delivery/     # Queue callback 진입점
├─ services/github/                    # GitHub 공통 오류와 payload 보조 로직
├─ services/webhook-receiver/          # 웹훅 검증, 최초 저장, Queue 발행
├─ services/webhook-delivery-processing/ # Queue 메시지 기반 Delivery와 GitHub 파일 처리
├─ services/webhook-registration/      # GitHub 웹훅 등록 처리
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
- 디렉터리 또는 가져오기 경로 변경 후 `npm run lint`와 `npx tsc --noEmit`을 실행한다.
- Prisma 모델 변경 후 `npx prisma validate`를 추가로 실행한다.
- 기능별 수동 검증 절차가 필요하면 `docs/`에 별도 검증 문서를 둔다.

### Growithm 파일 배치 순서

Growithm에서 새 파일을 추가할 때는 아래 순서로 위치를 결정한다.

1. Next.js 라우팅에 필요한 파일인가?
   - `src/app`에 둔다.
2. 특정 라우트에서만 사용하는 UI인가?
   - 해당 라우트의 `_components`에 둔다.
3. 데이터 요청이나 비즈니스 로직인가?
   - `src/services`에 둔다.
4. 도메인에 종속되지 않는 공용 UI인가?
   - `src/components/ui`, `src/components/layout`에 둔다.
5. 인증, DB 클라이언트 등 애플리케이션 인프라인가?
   - `src/lib`에 둔다.
6. 여러 영역에서 공유하는 타입인가?
   - `src/types`에 둔다.
7. 프론트엔드 여러 화면에서 공통으로 요청하는 포맷 또는 표시 함수인가?
   - `src/utils`에 둔다.
8. 도구가 자동 생성한 코드인가?
   - `src/generated`에 두고 직접 수정하지 않는다.
9. Prisma 스키마 또는 마이그레이션인가?
   - `prisma`에 둔다.
