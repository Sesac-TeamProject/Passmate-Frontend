# Passmate-Frontend

패스메이트(PassMate) 웹 프론트엔드 — AI 기반 실전형 교육·문제풀이 플랫폼.
선생님 대시보드·문제 에디터·진행 화면, 학생 웹 화면, 관리자 콘솔을 담당한다.

## 실행

```bash
nvm use            # Node 22
pnpm install
pnpm dev           # http://localhost:3000
```

| 스크립트                            | 설명                                              |
| ----------------------------------- | ------------------------------------------------- |
| `pnpm dev`                          | 개발 서버                                         |
| `pnpm build` / `pnpm start`         | 프로덕션 빌드 / 실행                              |
| `pnpm lint`                         | ESLint                                            |
| `pnpm format` / `pnpm format:check` | Prettier                                          |
| `pnpm test`                         | Vitest 단위 테스트 (`lib/api` 등)                 |
| `pnpm check:routes`                 | 빌드 후 모든 라우트 응답 검증 (`pnpm build` 선행) |

`.env.example`을 `.env.local`로 복사해 `NEXT_PUBLIC_API_BASE_URL`을 채운다. 비워 두면 `src/lib/mocks`의 목 응답으로 동작한다 (백엔드 없이 화면 확인용, 운영자 계정으로 자동 로그인).

## 기술 스택

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · TanStack Query · Zustand · Vitest · pnpm

## 설계 문서

- [Passmate_Web_아키텍처_설계.md](Passmate_Web_아키텍처_설계.md) — 3층 구조·상태 분류·인증·실시간 설계
- [Passmate_Web_코드_패턴_규칙.md](Passmate_Web_코드_패턴_규칙.md) — 코드 레벨 규칙 (레이어 경계, 네이밍, 에러 처리, page/View 2단 구성)

## 브랜치 규칙

- `main` — 배포. `develop`에서 PR로만 병합
- `develop` — 통합. 완성 + 테스트 완료 후 `main`에 PR
- `feature/<이름>` — `develop`에서 생성 → 작업 → `develop`에 PR (리뷰 1인 이상)

## 폴더 구조

```
src/
├─ app/              라우트 (아래 표)
│  ├─ (public)/      공통 화면 (로그인·방 목록·마이페이지)
│  ├─ (student)/     학생 화면
│  ├─ teacher/       선생님 화면 (전용 레이아웃·사이드바)
│  └─ admin/         관리자 화면 (전용 레이아웃·사이드바)
├─ components/
│  ├─ ui/            shadcn 생성물만
│  ├─ layout/        헤더·사이드바
│  ├─ common/        역할 무관 공용 컴포넌트 (RequireAuth, ScreenLoading, ScreenError …)
│  └─ providers/     QueryProvider
├─ features/         역할별 도메인 컴포넌트 (student / teacher / admin) — `*-view.tsx`는 렌더 전용
├─ config/routes.ts  라우트 메타 단일 소스 (경로·제목·설명·역할)
└─ lib/
   ├─ api/           전송 층: client.ts(fetch 래퍼·401 refresh·AppError) + 기능별 api 함수
   ├─ types/         계약 1:1 DTO(dto.ts), AppError
   ├─ queries/       TanStack Query 훅 (서버 상태)
   ├─ stores/        Zustand (auth-store …)
   ├─ mocks/         목 응답 (NEXT_PUBLIC_API_BASE_URL 미설정 시)
   └─ format.ts, token-storage.ts, env.ts, utils.ts
design/              .pen 디자인 파일 (design/README.md 참고)
scripts/             check-routes.mjs
```

데이터 흐름은 한 방향이다: `page`(컨테이너) → `lib/queries`·`lib/stores` → `lib/api`. 컴포넌트에서 `fetch`를 직접 부르지 않는다.

## 라우트

| 역할   | URL                                    | 화면                     |
| ------ | -------------------------------------- | ------------------------ |
| 공통   | `/login`                               | 로그인·프로필            |
| 공통   | `/rooms`                               | 공개 방 목록             |
| 공통   | `/me`                                  | 마이페이지 (학습 기록)   |
| 학생   | `/join`                                | 입장 (PIN/QR·닉네임)     |
| 학생   | `/play/[code]`                         | 풀이                     |
| 학생   | `/result/[sessionId]`                  | 결과·리포트 (+세션 평가) |
| 학생   | `/pay/[code]`                          | 유료 방 결제             |
| 선생님 | `/teacher/dashboard`                   | 대시보드                 |
| 선생님 | `/teacher/editor`                      | 문제 에디터              |
| 선생님 | `/teacher/rooms/[code]/lobby`          | 대기실                   |
| 선생님 | `/teacher/rooms/[code]/live`           | 진행 화면                |
| 선생님 | `/teacher/sessions/[sessionId]/review` | 첨삭·리포트              |
| 선생님 | `/teacher/revenue`                     | 수익·정산 내역           |
| 관리자 | `/admin/dashboard`                     | 대시보드 (A-01)          |
| 관리자 | `/admin/users`                         | 사용자 관리 (A-02)       |
| 관리자 | `/admin/rooms`                         | 방 · 문제 관리 (A-03)    |
| 관리자 | `/admin/reports`                       | 신고 · 제재 관리 (A-04)  |
| 관리자 | `/admin/payments`                      | 결제 · 정산 (A-05)       |
| 관리자 | `/admin/branded`                       | 광고 · 브랜디드 (A-06)   |

`/`는 위 라우트 전체 링크 목록(사이트맵). `/teacher`, `/admin`은 각각 첫 화면으로 redirect.

### 라우트 추가 절차

1. `src/config/routes.ts`의 `ROUTES`에 한 줄 추가
2. `src/app/<경로>/page.tsx` 생성 → `<PagePlaceholder path="<경로>" />` 렌더
3. `pnpm build && pnpm check:routes` 통과 확인

## 담당 분배

| 담당 | 이름   | 범위                                                                                                      |
| ---- | ------ | --------------------------------------------------------------------------------------------------------- |
| A    | (미정) | `(public)`, `(student)`, `teacher/`, `features/student`, `features/teacher`, `design/design.pen`(공용) |
| B    | (미정) | `admin/`, `features/admin`                       |

`components/`, `config/`, `lib/` 등 공용 영역을 고칠 땐 상대에게 먼저 알린다.
