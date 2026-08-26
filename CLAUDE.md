@AGENTS.md

# Passmate-Frontend 작업 규칙

Next.js 16(App Router, TS) + Tailwind v4 + shadcn/ui. 패키지 매니저는 pnpm, Node 22.

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

커밋 전 `pnpm format && pnpm lint && pnpm build`. 라우트를 건드렸으면 `pnpm check:routes`까지.

## 디자인

- `.pen` 파일은 `design/`에 담당별 분리(`student-teacher.pen`, `admin.pen`). 같은 파일 동시 수정 금지 (머지 불가).
- Pencil MCP 사용 전 Pencil 데스크톱 앱이 실행 중이어야 한다.

## 아직 넣지 않은 것

Zustand, TanStack Query, API 클라이언트, 테스트 프레임워크 — 데이터 연동 시점에 추가.
