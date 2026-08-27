@AGENTS.md

# Passmate-Frontend 작업 규칙

Next.js 16(App Router, TS) + Tailwind v4 + shadcn/ui + TanStack Query + Zustand. 패키지 매니저는 pnpm, Node 22.

## 설계·코드 규칙 문서 (필독)

- `Passmate_Web_아키텍처_설계.md` — 3층 구조(전송 `lib/api` → 상태 `lib/queries`·`lib/stores` → UI `app`·`components`), 상태 3분류, 인증·실시간 설계.
- `Passmate_Web_코드_패턴_규칙.md` — 레이어 경계, 네이밍, `AppError`·서버 `code` 기준 에러 처리, page/`*View` 2단 구성, 코드 배치 순서, 금지 규칙.
- 코드를 쓰기 전에 두 문서를 읽고 따른다. 아래는 이 리포에 맞춘 요약이다.

## 레이어

- `src/lib/api/` — fetch 래퍼(`client.ts`: 인증 헤더·401 refresh 1회·`AppError` 변환·다운로드)와 기능별 api 함수. **컴포넌트·page에서 `fetch` 직접 호출 금지.**
- `src/lib/types/` — 계약 1:1 DTO(`dto.ts`)와 `AppError`. 계약에 없는 필드를 임의 추가하지 않는다 (계약 갱신이 먼저).
- `src/lib/queries/` — TanStack Query 훅(서버 상태). 쿼리 키는 배열 계층 `['admin', 'users', filter]`. 뮤테이션 성공 시 `invalidateQueries`.
- `src/lib/stores/` — Zustand(`auth-store`, 추후 `session-store`). 서버 상태를 스토어·useState에 복사하지 않는다.
- `src/lib/mocks/` — `NEXT_PUBLIC_API_BASE_URL`이 비어 있을 때만 쓰는 목 응답. 백엔드 연동 시 통째로 걷어낸다.
- 화면: `app/**/page.tsx`는 `'use client'` 컨테이너(쿼리·스토어·효과·다이얼로그 소유), `features/<role>/**/*-view.tsx`는 props만 받는 렌더 전용.
- 라우트 가드: `components/common/require-auth.tsx`. `/admin/*`은 `role="ADMIN"`.
- 색상 hex 하드코딩 금지 — `globals.css`의 시맨틱 토큰(`text-foreground`, `bg-success-soft`, `text-label-lg` 등)만 쓴다.

## Git

- `main`(배포) / `develop`(통합) / `feature/<이름>`(작업). 작업은 항상 `develop`에서 브랜치를 파고 `develop`으로 PR. `main` 직접 커밋·푸시 금지.
- 커밋 메시지는 한국어, `feat:` `fix:` `chore:` `docs:` prefix.

## 폴더

- 라우트 메타(경로·제목·설명·역할)는 `src/config/routes.ts` 한 곳에만. 랜딩·사이드바·검증 스크립트가 여기서 읽는다.
- `src/components/ui`는 shadcn 생성물만. 공용 컴포넌트는 `components/common`, 역할별 도메인은 `src/features/<role>`.
- 학생·공통 화면은 최상위 URL(`/join`, `/login`), 선생님은 `/teacher/*`, 관리자는 `/admin/*`.

## 라우트 추가

1. `routes.ts`의 `ROUTES`에 추가 → 2. `src/app/<경로>/page.tsx` 생성 → 3. `pnpm build && pnpm check:routes`.

## 검증

커밋 전 `pnpm format && pnpm lint && pnpm test && pnpm build`. 라우트를 건드렸으면 `pnpm check:routes`까지.

## 디자인

- `.pen` 파일은 `design/`에 담당별 분리(`student-teacher.pen`, `admin.pen`). 같은 파일 동시 수정 금지 (머지 불가).
- Pencil MCP 사용 전 Pencil 데스크톱 앱이 실행 중이어야 한다.

## 아직 넣지 않은 것

STOMP 클라이언트(`lib/stomp.ts`)·`session-store`, Playwright E2E — 실시간 화면 착수 시점에 추가.
