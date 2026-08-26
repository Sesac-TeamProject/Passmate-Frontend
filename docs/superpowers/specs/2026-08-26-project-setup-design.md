# Passmate-Frontend 프로젝트 골격 설계 (feature/setup)

- 날짜: 2026-08-26
- 브랜치: `feature/setup` (base: `develop`)
- 목적: 두 명이 화면을 나눠 "깡통 사이트"를 만들기 전에, 충돌 없이 병렬 작업할 수 있는 공통 골격을 잡는다.

## 1. 배경

- 기획서 §8.2 기술 스택: Next.js + React + TypeScript, Tailwind CSS + shadcn/ui, (이후) Zustand + TanStack Query
- 기획서 §7 화면 목록 14개를 라우트로 1:1 매핑한다.
- 기획서 §9.2 브랜치 규칙: `main`(배포) / `develop`(통합) / `feature/*`(기능)
- 담당 분배(A: 학생+선생님, B: 관리자)는 아직 미정. 오늘은 폴더 구조와 빈 페이지까지만.

## 2. 범위

### 포함
- `create-next-app` 기반 스캐폴딩 (TypeScript, App Router, Tailwind, ESLint, `src/`, `@/*` alias, pnpm)
- shadcn/ui 초기화
- Prettier + `prettier-plugin-tailwindcss`, `.nvmrc`(22), `.editorconfig`
- 아래 §4 라우트 전부를 빈 페이지(`PagePlaceholder`)로 생성
- 루트 랜딩 `/`에 전체 라우트 링크 목록 (깡통 사이트맵)
- 역할별 레이아웃 껍데기 (`teacher/layout.tsx`, `admin/layout.tsx`)
- `design/README.md` — `.pen` 파일 관리 규칙
- `README.md`, `CLAUDE.md` — 실행 방법·브랜치 규칙·폴더 규칙

### 제외 (YAGNI)
- Zustand, TanStack Query, API 클라이언트 (D5 이후 필요 시)
- 테스트 프레임워크 (검증할 로직 없음)
- 실제 디자인 반영, 인증, 데이터 연동
- `.pen` 파일 자체 (암호화 포맷이라 Pencil 앱에서 생성)

## 3. 기술 결정

| 항목 | 결정 | 이유 |
|---|---|---|
| 패키지 매니저 | pnpm | 로컬에 설치됨, 빠름. `packageManager` 필드로 고정 |
| Next.js 버전 | `create-next-app@latest` 안정 버전 | 시작 시점 최신, 버전 고정 안 함 |
| 라우터 | App Router | Next.js 기본, 라우트 그룹으로 역할 분리 가능 |
| 스타일 | Tailwind + shadcn/ui | 기획서 스택 |
| 포맷터 | Prettier + tailwind 플러그인 | 두 명의 클래스 순서·포맷 통일 |
| 상태관리 | 보류 | 깡통 단계에 불필요 |

## 4. 라우트 구조

역할 prefix 방식. 학생·공통 화면은 최상위(QR/PIN 공유 URL이 짧아야 함), 선생님·관리자는 prefix.

| 그룹 | URL | 폴더 | 기획서 화면 |
|---|---|---|---|
| public | `/login` | `app/(public)/login` | 로그인·프로필 |
| public | `/rooms` | `app/(public)/rooms` | 공개 방 목록 |
| public | `/me` | `app/(public)/me` | 마이페이지(학습 기록) |
| student | `/join` | `app/(student)/join` | 입장(PIN/QR·닉네임) |
| student | `/play/[code]` | `app/(student)/play/[code]` | 풀이 화면 |
| student | `/result/[sessionId]` | `app/(student)/result/[sessionId]` | 결과·리포트 (+세션 평가 포함) |
| student | `/pay/[code]` | `app/(student)/pay/[code]` | 유료 방 결제 |
| teacher | `/teacher/dashboard` | `app/teacher/dashboard` | 대시보드 |
| teacher | `/teacher/editor` | `app/teacher/editor` | 문제 에디터 |
| teacher | `/teacher/rooms/[code]/lobby` | `app/teacher/rooms/[code]/lobby` | 대기실 |
| teacher | `/teacher/rooms/[code]/live` | `app/teacher/rooms/[code]/live` | 진행 화면 |
| teacher | `/teacher/sessions/[sessionId]/review` | `app/teacher/sessions/[sessionId]/review` | 첨삭·리포트 |
| teacher | `/teacher/revenue` | `app/teacher/revenue` | 수익·정산 내역 |
| admin | `/admin/settlements` | `app/admin/settlements` | 관리자 콘솔 — 정산 관리 |
| admin | `/admin/refunds` | `app/admin/refunds` | 관리자 콘솔 — 환불 처리 |
| admin | `/admin/branded` | `app/admin/branded` | 관리자 콘솔 — 브랜디드 퀴즈 |

- `/` : 랜딩. 위 라우트 전체 링크 목록을 렌더한다.
- `/admin`, `/teacher` 루트는 각각 `/admin/settlements`, `/teacher/dashboard`로 redirect.
- 담당 경계: `(public)`, `(student)`, `teacher/` ↔ `admin/` 폴더가 서로 겹치지 않는다.

## 5. 폴더 구조

```
src/
├─ app/
│  ├─ layout.tsx            # 루트 레이아웃 (html/body, 폰트, globals.css)
│  ├─ page.tsx              # 랜딩 = 라우트 링크 허브
│  ├─ globals.css
│  ├─ (public)/  (student)/ teacher/  admin/   # §4
├─ components/
│  ├─ ui/                   # shadcn 생성물만
│  ├─ layout/               # Header, TeacherSidebar, AdminSidebar (껍데기)
│  └─ common/               # PagePlaceholder 등 역할 무관 공용
├─ features/
│  ├─ student/  teacher/  admin/   # 화면별 도메인 컴포넌트·훅 (README만)
├─ lib/
│  └─ utils.ts              # shadcn cn()
├─ config/
│  └─ routes.ts             # §4 라우트 메타데이터(경로·제목·설명·역할) 단일 소스
└─ types/                   # 공용 타입 (README만)
design/
└─ README.md                # .pen 규칙
docs/superpowers/specs/     # 이 문서
```

`config/routes.ts`가 단일 소스: 랜딩 링크 목록, 각 PagePlaceholder의 제목/설명이 여기서 나온다. 라우트를 추가할 때 이 파일에 한 줄 추가하면 랜딩에 자동 반영된다.

## 6. 컴포넌트 규약

- `PagePlaceholder({ title, description, role })`: 화면 제목, 기획서 설명, 역할 배지, "구현 예정" 문구를 렌더. 모든 빈 페이지는 이것 하나만 렌더한다.
- `teacher/layout.tsx`, `admin/layout.tsx`: 좌측 사이드바(해당 역할 라우트 링크) + 본문. 사이드바는 `config/routes.ts`에서 역할로 필터해서 그린다.
- `(public)`, `(student)` 는 루트 레이아웃만 사용 (모바일 우선 화면이라 사이드바 없음).

## 7. `.pen` 관리 규칙 (design/README.md 내용)

- 파일은 담당별로 분리: `design/student-teacher.pen`, `design/admin.pen`
- 같은 `.pen` 파일을 두 명이 동시에 수정하지 않는다 (암호화 포맷, 머지 불가)
- 공통 토큰(색·폰트)은 각 파일에 복제. 토큰 변경은 팀 공지 후 각자 반영
- Figma → `.pen` 옮기기와 `.pen` → 코드 생성은 Pencil MCP로 수행 (Pencil 데스크톱 앱 실행 필요)

## 8. 문서

- `README.md`: 실행(`pnpm i`, `pnpm dev`), 브랜치 규칙, 폴더 규칙, 라우트 표(§4), 담당 분배 표(빈칸), `.pen` 규칙 링크
- `CLAUDE.md`: 위 규칙의 요약 (브랜치·폴더·라우트 추가 절차·`.pen` 규칙)

## 9. 검증 기준

1. `pnpm lint` 오류 0
2. `pnpm build` 성공
3. `pnpm dev` 실행 후 §4의 모든 URL + `/`가 HTTP 200 (redirect 라우트는 3xx → 최종 200)
4. `/` 랜딩에서 §4 라우트 전체가 링크로 보인다
5. `git status` 기준 불필요한 파일(`.next`, `node_modules`) 미추적

## 10. 완료 후

- `feature/setup` → `develop` PR (PR 템플릿 사용)
- 머지 후 A/B가 각자 `develop`에서 `feature/<화면>` 브랜치 생성
