# Growithm

Growithm은 알고리즘 문제 풀이 기록을 GitHub 웹훅으로 수집하고, 개인과 스터디 단위로 풀이 현황을 관리하는 Next.js 애플리케이션입니다.

GitHub OAuth로 로그인한 뒤 BaekjoonHub가 업로드한 풀이 저장소를 Growithm에 연결하면, GitHub push 이벤트를 기반으로 문제 풀이 데이터를 저장하고 대시보드, 문제 목록, 스터디 공유 기능에서 활용합니다.

## 주요 기능

- GitHub OAuth 로그인
- BaekjoonHub 연동 가이드와 GitHub Repository Webhook 등록
- GitHub Webhook 수신 및 Queue 기반 풀이 데이터 처리
- 백준, 프로그래머스 풀이 기록 조회와 필터링
- 풀이 코드, 메모, 제출 상태 관리
- 개인 풀이 통계와 티어 분포 대시보드
- 스터디 생성, 초대, 멤버 관리, 풀이 공유
- 친구 검색, 친구 요청, 친구 목록 관리

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Auth.js / NextAuth
- Prisma 7
- PostgreSQL
- Vercel Queue
- Vitest
- Docker / Docker Compose

## 아키텍처

![Growithm 시스템 아키텍처](public/images/architecture.png)

## 프로젝트 구조

```text
src/
├─ app/                 # Next.js 페이지, 레이아웃, API Route, Server Action 경계
├─ components/          # 공용 UI와 앱 레이아웃 컴포넌트
├─ hooks/               # 공용 React 훅
├─ lib/                 # 인증, Prisma, Queue 등 전역 인프라 설정
├─ server/              # 도메인별 비즈니스 로직, repository, schema, gateway
├─ types/               # 공유 타입
└─ utils/               # 화면 공통 표시/포맷 유틸

prisma/
├─ schema.prisma        # Prisma generator, datasource, 공통 모델
├─ models/              # 도메인별 Prisma 모델
└─ migrations/          # PostgreSQL 마이그레이션
```

자세한 파일 배치 규칙은 `docs/project-structure.md`를 참고합니다.

## 시작하기

### 1. 요구사항

- Node.js 20.9 이상
- npm
- Docker Desktop 또는 로컬 PostgreSQL
- GitHub OAuth App

### 2. 의존성 설치

```shell
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

```shell
cp .env.example .env
```

Windows PowerShell에서는 아래 명령을 사용할 수 있습니다.

```powershell
Copy-Item .env.example .env
```

필수 환경 변수는 다음과 같습니다.

| 이름                    | 설명                                        |
| ----------------------- | ------------------------------------------- |
| `AUTH_SECRET`           | Auth.js 세션 암호화에 사용할 긴 랜덤 문자열 |
| `AUTH_GITHUB_ID`        | GitHub OAuth App Client ID                  |
| `AUTH_GITHUB_SECRET`    | GitHub OAuth App Client Secret              |
| `GITHUB_WEBHOOK_URL`    | GitHub Webhook을 받을 공개 URL              |
| `GITHUB_WEBHOOK_SECRET` | GitHub Webhook 서명 검증용 secret           |
| `DATABASE_URL`          | PostgreSQL 연결 문자열                      |

로컬 개발용 GitHub OAuth callback URL은 보통 아래 값을 사용합니다.

```text
http://localhost:3000/api/auth/callback/github
```

### 4. 데이터베이스 실행

Docker Compose로 PostgreSQL만 실행하려면 아래 명령을 사용합니다.

```shell
docker compose up -d postgres
```

기본 로컬 연결 문자열은 `.env.example`에 정의되어 있습니다.

```text
postgresql://growithm:growithm1234@localhost:5432/growithm_db?schema=public
```

### 5. Prisma 준비

```shell
npx prisma generate
npx prisma migrate deploy
```

개발 중 Prisma 모델을 변경했다면 새 마이그레이션을 만든 뒤 생성 클라이언트를 갱신합니다.

```shell
npx prisma migrate dev
npx prisma generate
```

### 6. 개발 서버 실행

```shell
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## Docker로 실행

앱과 PostgreSQL을 함께 실행하려면 아래 명령을 사용합니다.

```shell
docker compose up --build
```

컨테이너 실행 후 `http://localhost:3000`에서 앱을 확인할 수 있습니다.

## 스크립트

| 명령            | 설명                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| `npm run dev`   | 로컬 개발 서버를 실행합니다.                                                 |
| `npm run build` | Prisma generate, DB migration deploy, Next.js production build를 실행합니다. |
| `npm run start` | production 서버를 실행합니다.                                                |
| `npm run lint`  | ESLint 검사를 실행합니다.                                                    |
| `npm run test`  | Vitest 테스트를 실행합니다.                                                  |

## 주요 화면

- `/`: 서비스 소개와 시작 CTA
- `/dashboard`: 개인 풀이 통계, 티어 분포, 처리 대기 중인 풀이
- `/problem`: 수집된 풀이 목록, 필터, 상세 보기, 메모
- `/study`: 스터디 목록, 초대, 생성
- `/study/[studyId]`: 스터디 개요, 멤버, 공유 문제, 관리자 설정
- `/friend`: 친구 검색, 친구 요청, 친구 목록
- `/webhook-guide`: GitHub Repository와 BaekjoonHub 연동 가이드

## GitHub Webhook 연동 흐름

1. 사용자가 GitHub OAuth로 로그인합니다.
2. `/webhook-guide`에서 알고리즘 풀이 저장소를 등록합니다.
3. Growithm이 GitHub Repository Webhook을 등록합니다.
4. BaekjoonHub가 문제 풀이를 GitHub 저장소에 push합니다.
5. Growithm API가 GitHub Webhook을 수신하고 Queue에 처리 작업을 등록합니다.
6. Queue consumer가 GitHub 파일을 조회해 문제 풀이 데이터를 저장합니다.
7. 저장된 데이터가 대시보드, 문제 목록, 스터디 공유 화면에 반영됩니다.

로컬에서 GitHub Webhook을 테스트하려면 `GITHUB_WEBHOOK_URL`이 GitHub에서 접근 가능한 HTTPS URL이어야 합니다. 필요하면 ngrok 같은 터널링 도구로 `http://localhost:3000/api/github/webhook-receiver`를 외부에 노출합니다.

## 검증

문서 또는 코드 변경 후 필요한 범위에 따라 아래 명령을 실행합니다.

```shell
npm run lint
npm run test
npx tsc --noEmit
```

Prisma 스키마를 변경한 경우 아래 검증도 함께 실행합니다.

```shell
npx prisma validate
```
