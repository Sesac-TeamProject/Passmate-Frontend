# Passmate-Frontend 프로젝트 골격 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 두 명이 화면을 나눠 병렬로 채울 수 있도록, 기획서 화면 14개를 빈 페이지로 가진 Next.js + Tailwind + shadcn/ui 골격을 `feature/setup` 브랜치에 만든다.

**Architecture:** `create-next-app`(App Router, `src/`)으로 스캐폴딩하고, `src/config/routes.ts`를 라우트 메타(경로·제목·설명·역할)의 단일 소스로 둔다. 모든 빈 페이지는 `PagePlaceholder`가 그 메타를 읽어 렌더하고, 랜딩 `/`·역할별 사이드바·라우트 검증 스크립트도 같은 소스를 읽는다. 선생님/관리자는 `teacher/`, `admin/` prefix + 전용 레이아웃, 학생/공통은 최상위 라우트 그룹.

**Tech Stack:** Node 22, pnpm, Next.js(latest stable, App Router, TypeScript), Tailwind CSS(v4), shadcn/ui, ESLint(flat config) + Prettier(+tailwind plugin)

**Spec:** `docs/superpowers/specs/2026-08-26-project-setup-design.md`

## Global Constraints

- Node 22 (`.nvmrc` = `22`), 패키지 매니저는 pnpm만 (`package.json`의 `packageManager` 필드로 고정)
- Next.js/Tailwind/shadcn 버전은 고정하지 않고 실행 시점 최신 안정 버전 사용
- Zustand, TanStack Query, API 클라이언트, 테스트 프레임워크는 **추가하지 않는다**
- 모든 사용자 노출 문구는 한국어
- `.pen` 파일은 만들지 않는다 (Pencil 앱에서 생성). `design/README.md`만 작성
- 라우트 목록·제목·설명은 `src/config/routes.ts` 한 곳에만 존재. 다른 파일에 하드코딩 금지
- 라우트 URL/폴더는 스펙 §4 표를 그대로 따른다
- 커밋 메시지는 한국어, `feat:`/`chore:`/`docs:` prefix
- 작업 브랜치: `feature/setup` (이미 생성되어 체크아웃됨). `develop`/`main`에 직접 커밋 금지

---

## File Structure

| 파일 | 책임 |
|---|---|
| `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs` | create-next-app 산출물 (Task 1) |
| `.nvmrc`, `.editorconfig` | 팀 환경 고정 (Task 1) |
| `.prettierrc`, `.prettierignore` | 포맷 규칙 (Task 2) |
| `components.json`, `src/lib/utils.ts`, `src/components/ui/badge.tsx` | shadcn 산출물 (Task 3) |
| `src/config/routes.ts` | 라우트 메타 단일 소스 + 조회 헬퍼 (Task 4) |
| `scripts/check-routes.mjs` | 빌드된 앱을 띄워 모든 라우트 200/redirect 검증 (Task 4) |
| `src/components/common/page-placeholder.tsx` | 빈 페이지 공통 렌더 (Task 5) |
| `src/components/layout/site-header.tsx` | 상단 헤더(로고→`/`) (Task 5) |
| `src/app/layout.tsx`, `src/app/page.tsx` | 루트 레이아웃, 랜딩(라우트 링크 허브) (Task 5) |
| `src/app/(public)/**`, `src/app/(student)/**` | 공통·학생 빈 페이지 (Task 5) |
| `src/components/layout/role-sidebar.tsx` | 역할별 사이드바 (Task 6) |
| `src/app/teacher/**`, `src/app/admin/**` | 선생님·관리자 레이아웃 + 빈 페이지 (Task 6) |
| `src/features/{student,teacher,admin}/README.md`, `src/types/README.md`, `design/README.md` | 폴더 규칙 (Task 7) |
| `README.md`, `CLAUDE.md` | 프로젝트 문서 (Task 7) |

---

### Task 1: Next.js 스캐폴딩

**Files:**
- Create: create-next-app 산출물 전체, `.nvmrc`, `.editorconfig`
- Keep: 기존 `README.md`(Task 7에서 재작성), `.github/`, `docs/`

**Interfaces:**
- Produces: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint` 스크립트; `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`; `@/*` alias

- [ ] **Step 1: 스크래치 디렉토리에 스캐폴딩**

create-next-app은 `README.md`·`.github`가 있는 디렉토리를 거부하므로 빈 디렉토리에 만든 뒤 복사한다.

```bash
SCRATCH="/private/tmp/claude-501/-Users-pocari-workspace-projects-pass-mate-Passmate-Frontend/07f8dbb0-2c2b-43a3-907d-f7a12effb3af/scratchpad"
rm -rf "$SCRATCH/scaffold" && mkdir -p "$SCRATCH/scaffold" && cd "$SCRATCH/scaffold"
pnpm create next-app@latest passmate --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --yes
ls -la passmate
```

Expected: `passmate/` 안에 `package.json`, `src/app/`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`, `.gitignore`, `README.md`, `node_modules/` 생성. 프롬프트가 뜨면 전부 기본값(Enter).

- [ ] **Step 2: 레포로 복사 (README.md 제외)**

```bash
cd /Users/pocari/workspace/projects/pass-mate/Passmate-Frontend
rsync -a --exclude README.md --exclude node_modules "$SCRATCH/scaffold/passmate/" ./
pnpm install
git status --short | head -30
```

Expected: `package.json`, `src/`, `public/`, 설정 파일들이 untracked로 보이고 `node_modules/`, `.next/`는 `.gitignore` 덕에 안 보임.

- [ ] **Step 3: Node/pnpm 고정 + editorconfig**

```bash
echo "22" > .nvmrc
cat > .editorconfig <<'EOF'
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
EOF
node -e '
const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf8"));
p.name="passmate-frontend";p.private=true;
p.packageManager="pnpm@"+require("child_process").execSync("pnpm -v").toString().trim();
p.engines={node:">=22"};
fs.writeFileSync("package.json",JSON.stringify(p,null,2)+"\n");'
cat package.json
```

Expected: `"name": "passmate-frontend"`, `"packageManager": "pnpm@11.x.x"`, `"engines": {"node": ">=22"}`.

- [ ] **Step 4: 루트 레이아웃 단순화 (Geist 폰트 제거, 한국어 lang)**

`src/app/layout.tsx`를 아래로 교체한다 (빌드 시 Google Fonts 네트워크 의존 제거):

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PassMate",
  description: "AI 기반 실전형 교육·문제풀이 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
```

`src/app/globals.css`에서 `--font-geist-*` 참조가 있으면 지운다. 결과 파일은 최소 아래를 포함해야 한다:

```css
@import "tailwindcss";
```

(create-next-app이 넣은 `:root` 색 변수·`@theme inline` 블록은 Task 3에서 shadcn이 덮어쓰므로 지금은 폰트 변수 줄만 제거하면 된다.)

- [ ] **Step 5: 빌드·린트 확인**

```bash
pnpm lint && pnpm build
```

Expected: 린트 오류 0, `✓ Compiled successfully`, 라우트 목록에 `/` 표시.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: Next.js + Tailwind 스캐폴딩 (App Router, src/, pnpm)"
```

---

### Task 2: Prettier + ESLint 연동

**Files:**
- Create: `.prettierrc`, `.prettierignore`
- Modify: `package.json`(scripts, devDependencies), `eslint.config.mjs`

**Interfaces:**
- Produces: `pnpm format`, `pnpm format:check` 스크립트. 이후 모든 Task는 커밋 전 `pnpm format` 실행

- [ ] **Step 1: 의존성 설치**

```bash
pnpm add -D prettier prettier-plugin-tailwindcss eslint-config-prettier
```

- [ ] **Step 2: Prettier 설정**

```bash
cat > .prettierrc <<'EOF'
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/app/globals.css"
}
EOF
cat > .prettierignore <<'EOF'
.next
node_modules
pnpm-lock.yaml
*.pen
docs/superpowers
EOF
```

- [ ] **Step 3: ESLint에 prettier 충돌 규칙 해제 추가**

`eslint.config.mjs`를 열어 현재 내용을 확인한 뒤, `eslint-config-prettier`를 **배열 마지막**에 추가한다. create-next-app 산출물은 대략 아래 형태다(정확한 내용은 파일을 열어 확인하고 `import`와 마지막 원소만 추가):

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

만약 산출물이 `FlatCompat` 기반의 구형 형태라면 `import prettier from "eslint-config-prettier"` 후 배열 마지막에 `prettier`를 넣는 것만 동일하게 적용한다.

- [ ] **Step 4: 스크립트 추가 + 전체 포맷**

```bash
node -e '
const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf8"));
p.scripts.format="prettier --write .";
p.scripts["format:check"]="prettier --check .";
fs.writeFileSync("package.json",JSON.stringify(p,null,2)+"\n");'
pnpm format
pnpm format:check && pnpm lint
```

Expected: `All matched files use Prettier code style!`, 린트 오류 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: Prettier + tailwind 플러그인, ESLint prettier 연동"
```

---

### Task 3: shadcn/ui 초기화

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/badge.tsx`
- Modify: `src/app/globals.css`(shadcn 테마 변수), `package.json`

**Interfaces:**
- Produces: `cn()` from `@/lib/utils`; `<Badge variant="outline" />` from `@/components/ui/badge`; Tailwind 유틸 `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`

- [ ] **Step 1: init**

```bash
pnpm dlx shadcn@latest init -y -b neutral
cat components.json
```

Expected: `components.json` 생성, `"tsx": true`, `"rsc": true`, `aliases.components` = `@/components`, `aliases.utils` = `@/lib/utils`. `src/lib/utils.ts`에 `cn` 함수 생성, `globals.css`에 `:root { --background ... }` 및 `@theme inline` 블록 추가. 프롬프트가 뜨면 기본값.

- [ ] **Step 2: Badge 컴포넌트 추가**

```bash
pnpm dlx shadcn@latest add badge -y
ls src/components/ui
```

Expected: `src/components/ui/badge.tsx` 존재.

- [ ] **Step 3: 검증**

```bash
pnpm format && pnpm lint && pnpm build
```

Expected: 모두 통과. `globals.css`에 `@import "tailwindcss";`가 여전히 맨 위에 있고 `--font-geist` 참조가 없는지 `grep -n geist src/app/globals.css`로 확인 (출력 없어야 함).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: shadcn/ui 초기화 (neutral) + Badge"
```

---

### Task 4: 라우트 메타 단일 소스 + 라우트 검증 스크립트

**Files:**
- Create: `src/config/routes.ts`, `scripts/check-routes.mjs`
- Modify: `package.json`(scripts), `next.config.ts`(redirects)

**Interfaces:**
- Produces:
  - `type Role = "public" | "student" | "teacher" | "admin"`
  - `type RouteMeta = { path: string; sample: string; title: string; description: string; role: Role }`
  - `const ROLE_LABEL: Record<Role, string>`
  - `const ROUTES: readonly RouteMeta[]`
  - `const REDIRECTS: readonly { from: string; to: string }[]`
  - `function getRoute(path: string): RouteMeta` — 없으면 throw
  - `function routesByRole(role: Role): RouteMeta[]`
  - `pnpm check:routes` — 빌드된 앱을 3100 포트로 띄워 전 라우트 검증, 실패 시 exit 1

- [ ] **Step 1: routes.ts 작성**

`src/config/routes.ts` (타입 전용 문법만 사용 — Node가 직접 import하므로 `enum`, 클래스 파라미터 프로퍼티 금지):

```ts
export type Role = "public" | "student" | "teacher" | "admin";

export type RouteMeta = {
  /** app 폴더 기준 URL 패턴. 예: /play/[code] */
  path: string;
  /** 링크·검증용 샘플 URL. 동적 세그먼트를 채운 값 */
  sample: string;
  /** 화면 제목 (기획서 §7) */
  title: string;
  /** 화면 설명 (기획서 §7) */
  description: string;
  role: Role;
};

export const ROLE_LABEL: Record<Role, string> = {
  public: "공통",
  student: "학생",
  teacher: "선생님",
  admin: "관리자",
};

export const ROUTES: readonly RouteMeta[] = [
  // 공통
  { path: "/login", sample: "/login", title: "로그인·프로필", description: "OAuth 로그인 (선생님·학생 공용)", role: "public" },
  { path: "/rooms", sample: "/rooms", title: "공개 방 목록", description: "공개 설정된 방 탐색·입장, Lv.4+ 선생님 방 상단 노출", role: "public" },
  { path: "/me", sample: "/me", title: "마이페이지 (학습 기록)", description: "참여 세션 목록, 문제별 결과·피드백, 누적 리포트 — 회원 전용", role: "public" },
  // 학생
  { path: "/join", sample: "/join", title: "입장", description: "PIN 입력·QR 스캔, 닉네임 설정", role: "student" },
  { path: "/play/[code]", sample: "/play/DEMO01", title: "풀이", description: "문항·선택지·서술 입력, 타이머, 제출, 음성 힌트 수신 배너·재생", role: "student" },
  { path: "/result/[sessionId]", sample: "/result/1", title: "결과·리포트", description: "점수·랭킹, 문제별 피드백, 취약점 리포트, 세션 별점·코멘트, 게스트 가입 유도", role: "student" },
  { path: "/pay/[code]", sample: "/pay/DEMO01", title: "유료 방 결제", description: "참가비 확인·결제·실패 안내 (회원 전용, 게스트는 로그인 유도)", role: "student" },
  // 선생님
  { path: "/teacher/dashboard", sample: "/teacher/dashboard", title: "대시보드", description: "내 방·문제 세트·지난 세션 목록", role: "teacher" },
  { path: "/teacher/editor", sample: "/teacher/editor", title: "문제 에디터", description: "AI 생성 조건 입력, 생성 결과 검토·수정, 직접 출제", role: "teacher" },
  { path: "/teacher/rooms/[code]/lobby", sample: "/teacher/rooms/DEMO01/lobby", title: "대기실", description: "PIN/QR 표시, 학생 목록 (프로젝터 투사 가정)", role: "teacher" },
  { path: "/teacher/rooms/[code]/live", sample: "/teacher/rooms/DEMO01/live", title: "진행 화면", description: "문항·타이머·제출 현황·랭킹, PTT 음성 힌트 버튼", role: "teacher" },
  { path: "/teacher/sessions/[sessionId]/review", sample: "/teacher/sessions/1/review", title: "첨삭·리포트", description: "답변별 AI 분석 확인, 코멘트·점수 입력, 통계", role: "teacher" },
  { path: "/teacher/revenue", sample: "/teacher/revenue", title: "수익·정산 내역", description: "유료 방 수익 적립·정산 내역, 내 등급·평가 현황 (Lv.3+)", role: "teacher" },
  // 관리자
  { path: "/admin/settlements", sample: "/admin/settlements", title: "정산 관리", description: "정산 대기·완료·보류 관리", role: "admin" },
  { path: "/admin/refunds", sample: "/admin/refunds", title: "환불 처리", description: "결제 환불 요청 처리", role: "admin" },
  { path: "/admin/branded", sample: "/admin/branded", title: "브랜디드 퀴즈", description: "기업 브랜디드 퀴즈 등록·노출 관리", role: "admin" },
];

export const REDIRECTS: readonly { from: string; to: string }[] = [
  { from: "/teacher", to: "/teacher/dashboard" },
  { from: "/admin", to: "/admin/settlements" },
];

export function getRoute(path: string): RouteMeta {
  const route = ROUTES.find((r) => r.path === path);
  if (!route) {
    throw new Error(`routes.ts에 등록되지 않은 경로: ${path}`);
  }
  return route;
}

export function routesByRole(role: Role): RouteMeta[] {
  return ROUTES.filter((r) => r.role === role);
}
```

- [ ] **Step 2: next.config.ts에 redirect 연결**

`next.config.ts`를 아래로 교체:

```ts
import type { NextConfig } from "next";
import { REDIRECTS } from "./src/config/routes";

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECTS.map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: false,
    }));
  },
};

export default nextConfig;
```

- [ ] **Step 3: 검증 스크립트 작성 (= 이 계획의 테스트)**

`scripts/check-routes.mjs`:

```js
// 빌드된 앱(pnpm build 선행)을 임시 포트로 띄우고 routes.ts의 모든 라우트를 검사한다.
// 사용: pnpm build && pnpm check:routes
import { spawn } from "node:child_process";
import { ROUTES, REDIRECTS } from "../src/config/routes.ts";

const PORT = process.env.PORT ?? "3100";
const BASE = `http://localhost:${PORT}`;

const server = spawn("pnpm", ["exec", "next", "start", "-p", PORT], {
  stdio: "ignore",
  detached: true,
});
const stop = () => {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {}
};
process.on("exit", stop);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${BASE} 가 30초 안에 응답하지 않음`);
}

const failures = [];

async function expectOk(url) {
  const res = await fetch(BASE + url, { redirect: "follow" });
  const ok = res.status === 200;
  console.log(`${ok ? "OK " : "FAIL"} ${res.status} ${url}`);
  if (!ok) failures.push(`${url} → ${res.status}`);
}

async function expectRedirect(from, to) {
  const res = await fetch(BASE + from, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  const ok = res.status >= 300 && res.status < 400 && location.endsWith(to);
  console.log(`${ok ? "OK " : "FAIL"} ${res.status} ${from} → ${location || "(없음)"}`);
  if (!ok) failures.push(`${from} → 기대 ${to}, 실제 ${res.status} ${location}`);
}

try {
  await waitForServer();
  await expectOk("/");
  for (const r of ROUTES) await expectOk(r.sample);
  for (const r of REDIRECTS) await expectRedirect(r.from, r.to);
} finally {
  stop();
}

if (failures.length) {
  console.error(`\n${failures.length}개 실패:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`\n모든 라우트 통과 (${ROUTES.length + REDIRECTS.length + 1}개)`);
```

`package.json`에 스크립트 추가:

```bash
node -e '
const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf8"));
p.scripts["check:routes"]="node scripts/check-routes.mjs";
fs.writeFileSync("package.json",JSON.stringify(p,null,2)+"\n");'
```

- [ ] **Step 4: 실행해서 실패 확인 (페이지가 아직 없음)**

```bash
pnpm build && pnpm check:routes; echo "exit=$?"
```

Expected: `OK  200 /` 1줄, 나머지 16개 라우트는 `FAIL 404`, redirect 2개는 `OK` (next.config가 처리). 마지막에 `16개 실패`, `exit=1`.
만약 `import ... routes.ts` 단계에서 `ERR_UNKNOWN_FILE_EXTENSION`이 나면 Node 버전이 22.18 미만인 것이다 — `node -v`로 확인하고 `nvm use 22` 후 재실행.

- [ ] **Step 5: Commit**

```bash
pnpm format && pnpm lint
git add -A
git commit -m "feat: 라우트 메타 단일 소스(routes.ts) + 라우트 검증 스크립트"
```

---

### Task 5: PagePlaceholder, 헤더, 랜딩, 공통·학생 빈 페이지

**Files:**
- Create: `src/components/common/page-placeholder.tsx`, `src/components/layout/site-header.tsx`
- Create: `src/app/(public)/{login,rooms,me}/page.tsx`
- Create: `src/app/(student)/join/page.tsx`, `src/app/(student)/play/[code]/page.tsx`, `src/app/(student)/result/[sessionId]/page.tsx`, `src/app/(student)/pay/[code]/page.tsx`
- Modify: `src/app/layout.tsx`(헤더 삽입), `src/app/page.tsx`(랜딩 교체)

**Interfaces:**
- Consumes: `getRoute`, `ROUTES`, `ROLE_LABEL`, `routesByRole` from `@/config/routes`; `Badge` from `@/components/ui/badge`
- Produces: `<PagePlaceholder path="/login" />` — `path`는 `routes.ts`의 `path`와 정확히 일치해야 함(아니면 렌더 시 throw)

- [ ] **Step 1: PagePlaceholder**

`src/components/common/page-placeholder.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import { getRoute, ROLE_LABEL } from "@/config/routes";

type Props = {
  /** routes.ts에 등록된 path. 예: "/teacher/dashboard" */
  path: string;
};

/** 깡통 단계의 모든 페이지가 렌더하는 공통 자리표시자. 실제 화면 구현 시 이 컴포넌트를 교체한다. */
export function PagePlaceholder({ path }: Props) {
  const route = getRoute(path);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
      <div>
        <Badge variant="outline">{ROLE_LABEL[route.role]}</Badge>
      </div>
      <h1 className="text-2xl font-bold">{route.title}</h1>
      <p className="text-muted-foreground">{route.description}</p>
      <p className="font-mono text-xs text-muted-foreground">{route.path}</p>
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        구현 예정
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 헤더 + 루트 레이아웃**

`src/components/layout/site-header.tsx`:

```tsx
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-12 max-w-6xl items-center px-4">
        <Link href="/" className="font-bold">
          PassMate
        </Link>
      </div>
    </header>
  );
}
```

`src/app/layout.tsx`의 `<body>` 내부를 아래로 교체:

```tsx
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SiteHeader />
        {children}
      </body>
```

파일 상단에 `import { SiteHeader } from "@/components/layout/site-header";` 추가.

- [ ] **Step 3: 랜딩 = 라우트 허브**

`src/app/page.tsx`를 아래로 교체:

```tsx
import Link from "next/link";
import { ROLE_LABEL, ROUTES, type Role } from "@/config/routes";

const ROLE_ORDER: Role[] = ["public", "student", "teacher", "admin"];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">PassMate 화면 목록</h1>
        <p className="text-muted-foreground">
          깡통 단계 사이트맵. 각 화면은 <code>src/config/routes.ts</code>에서 관리한다.
        </p>
      </div>
      {ROLE_ORDER.map((role) => (
        <section key={role} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{ROLE_LABEL[role]}</h2>
          <ul className="divide-y rounded-lg border">
            {ROUTES.filter((r) => r.role === role).map((r) => (
              <li key={r.path}>
                <Link href={r.sample} className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted">
                  <span className="font-medium">{r.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">{r.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
```

- [ ] **Step 4: 공통·학생 페이지 생성 (쉘 루프)**

`gen <app 폴더 경로> <routes.ts path>` 형태. 폴더 경로에 괄호·대괄호가 있으니 반드시 따옴표로 감싼다.

```bash
gen() {
  mkdir -p "src/app/$1"
  cat > "src/app/$1/page.tsx" <<EOF
import { PagePlaceholder } from "@/components/common/page-placeholder";

export default function Page() {
  return <PagePlaceholder path="$2" />;
}
EOF
}
gen "(public)/login" "/login"
gen "(public)/rooms" "/rooms"
gen "(public)/me" "/me"
gen "(student)/join" "/join"
gen "(student)/play/[code]" "/play/[code]"
gen "(student)/result/[sessionId]" "/result/[sessionId]"
gen "(student)/pay/[code]" "/pay/[code]"
find src/app -name page.tsx | sort
```

Expected: 위 7개 + `src/app/page.tsx` = 8개 파일.

- [ ] **Step 5: 검증**

```bash
pnpm format && pnpm lint && pnpm build && pnpm check:routes; echo "exit=$?"
```

Expected: `/`, 공통 3개, 학생 4개 = `OK 200` 8줄, 선생님 6개 + 관리자 3개 = `FAIL 404` 9줄, redirect 2개 `OK`. `9개 실패`, `exit=1`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: PagePlaceholder·헤더·랜딩 허브, 공통·학생 빈 페이지"
```

---

### Task 6: 역할 사이드바 + 선생님·관리자 레이아웃·빈 페이지

**Files:**
- Create: `src/components/layout/role-sidebar.tsx`
- Create: `src/app/teacher/layout.tsx`, `src/app/admin/layout.tsx`
- Create: `src/app/teacher/{dashboard,editor,revenue}/page.tsx`, `src/app/teacher/rooms/[code]/{lobby,live}/page.tsx`, `src/app/teacher/sessions/[sessionId]/review/page.tsx`
- Create: `src/app/admin/{settlements,refunds,branded}/page.tsx`

**Interfaces:**
- Consumes: `routesByRole`, `ROLE_LABEL`, `type Role` from `@/config/routes`; `PagePlaceholder`
- Produces: `<RoleSidebar role="teacher" />`

- [ ] **Step 1: RoleSidebar**

`src/components/layout/role-sidebar.tsx`:

```tsx
import Link from "next/link";
import { ROLE_LABEL, routesByRole, type Role } from "@/config/routes";

type Props = { role: Role };

/** 선생님·관리자 레이아웃 좌측 내비게이션. routes.ts에서 해당 역할 라우트를 읽어 그린다. */
export function RoleSidebar({ role }: Props) {
  return (
    <aside className="w-56 shrink-0 border-r p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">{ROLE_LABEL[role]}</p>
      <nav className="flex flex-col gap-1">
        {routesByRole(role).map((r) => (
          <Link
            key={r.path}
            href={r.sample}
            className="rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            {r.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: 레이아웃 2개**

`src/app/teacher/layout.tsx`:

```tsx
import { RoleSidebar } from "@/components/layout/role-sidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3rem)]">
      <RoleSidebar role="teacher" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

`src/app/admin/layout.tsx`:

```tsx
import { RoleSidebar } from "@/components/layout/role-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3rem)]">
      <RoleSidebar role="admin" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: 선생님·관리자 페이지 생성**

```bash
gen() {
  mkdir -p "src/app/$1"
  cat > "src/app/$1/page.tsx" <<EOF
import { PagePlaceholder } from "@/components/common/page-placeholder";

export default function Page() {
  return <PagePlaceholder path="$2" />;
}
EOF
}
gen "teacher/dashboard" "/teacher/dashboard"
gen "teacher/editor" "/teacher/editor"
gen "teacher/rooms/[code]/lobby" "/teacher/rooms/[code]/lobby"
gen "teacher/rooms/[code]/live" "/teacher/rooms/[code]/live"
gen "teacher/sessions/[sessionId]/review" "/teacher/sessions/[sessionId]/review"
gen "teacher/revenue" "/teacher/revenue"
gen "admin/settlements" "/admin/settlements"
gen "admin/refunds" "/admin/refunds"
gen "admin/branded" "/admin/branded"
find src/app -name page.tsx | wc -l
```

Expected: `17` (랜딩 1 + 라우트 16).

- [ ] **Step 4: 검증 — 전부 통과해야 함**

```bash
pnpm format && pnpm lint && pnpm build && pnpm check:routes; echo "exit=$?"
```

Expected: 모든 줄 `OK`, 마지막 `모든 라우트 통과 (19개)`, `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 선생님·관리자 레이아웃(사이드바) + 빈 페이지"
```

---

### Task 7: 폴더 규칙 README, 프로젝트 README, CLAUDE.md, PR

**Files:**
- Create: `src/features/student/README.md`, `src/features/teacher/README.md`, `src/features/admin/README.md`, `src/types/README.md`, `design/README.md`, `CLAUDE.md`
- Modify: `README.md`(전면 재작성)

- [ ] **Step 1: features / types README**

```bash
for role in student teacher admin; do
  mkdir -p "src/features/$role"
  cat > "src/features/$role/README.md" <<EOF
# features/$role

\`$role\` 역할 화면에서만 쓰는 도메인 컴포넌트·훅·유틸을 둔다.

- 화면 하나가 커지면 \`src/app/.../page.tsx\`는 조립만 하고 실제 UI는 여기로 뺀다.
- 역할 무관 공용 컴포넌트는 \`src/components/common\`, shadcn 생성물은 \`src/components/ui\`.
- 예: \`src/features/$role/<화면명>/<컴포넌트>.tsx\`
EOF
done
mkdir -p src/types
cat > src/types/README.md <<'EOF'
# types

여러 feature가 함께 쓰는 공용 타입(API 응답, 도메인 엔티티)을 둔다. 한 feature 안에서만 쓰는 타입은 그 feature 폴더에 둔다.
EOF
```

- [ ] **Step 2: design/README.md**

```bash
mkdir -p design
cat > design/README.md <<'EOF'
# design — .pen 파일 규칙

Figma 디자인을 Pencil(.pen)로 옮긴 원본을 둔다. Pencil MCP로 읽고 코드로 변환한다.

## 파일 분리 (필수)

| 파일 | 담당 | 화면 |
|---|---|---|
| `student-teacher.pen` | A | 공통·학생·선생님 화면 |
| `admin.pen` | B | 관리자 화면 |

- `.pen`은 암호화 포맷이라 **git 머지가 불가능**하다. 같은 파일을 두 명이 동시에 수정하지 않는다.
- 공통 토큰(색·폰트·간격)은 각 파일에 복제한다. 토큰을 바꾸면 팀에 공지하고 각자 반영한다.
- 파일은 Pencil 데스크톱 앱에서 생성한다. 이 폴더에 두고 커밋한다.

## 작업 흐름

1. Pencil 데스크톱 앱 실행 (MCP 연결 필수)
2. Figma → 담당 `.pen` 파일로 화면 옮기기
3. Pencil MCP로 `.pen` → 코드 생성, `src/app/<라우트>/page.tsx` 및 `src/features/<역할>/`에 반영
EOF
```

- [ ] **Step 3: README.md 재작성**

`README.md` 전체를 아래로 교체:

````markdown
# Passmate-Frontend

패스메이트(PassMate) 웹 프론트엔드 — AI 기반 실전형 교육·문제풀이 플랫폼.
선생님 대시보드·문제 에디터·진행 화면, 학생 웹 화면, 관리자 콘솔을 담당한다.

## 실행

```bash
nvm use            # Node 22
pnpm install
pnpm dev           # http://localhost:3000
```

| 스크립트 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` / `pnpm start` | 프로덕션 빌드 / 실행 |
| `pnpm lint` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm check:routes` | 빌드 후 모든 라우트 응답 검증 (`pnpm build` 선행) |

## 기술 스택

Next.js (App Router, TypeScript) · Tailwind CSS · shadcn/ui · pnpm
(상태관리 Zustand + TanStack Query는 데이터 연동 시점에 추가)

## 브랜치 규칙

- `main` — 배포. `develop`에서 PR로만 병합
- `develop` — 통합. 완성 + 테스트 완료 후 `main`에 PR
- `feature/<이름>` — `develop`에서 생성 → 작업 → `develop`에 PR (리뷰 1인 이상)

## 폴더 구조

```
src/
├─ app/            라우트 (아래 표)
│  ├─ (public)/    공통 화면 (로그인·방 목록·마이페이지)
│  ├─ (student)/   학생 화면
│  ├─ teacher/     선생님 화면 (전용 레이아웃·사이드바)
│  └─ admin/       관리자 화면 (전용 레이아웃·사이드바)
├─ components/
│  ├─ ui/          shadcn 생성물만
│  ├─ layout/      헤더·사이드바
│  └─ common/      역할 무관 공용 컴포넌트
├─ features/       역할별 도메인 컴포넌트 (student / teacher / admin)
├─ config/routes.ts 라우트 메타 단일 소스 (경로·제목·설명·역할)
├─ lib/            유틸 (shadcn cn 등)
└─ types/          공용 타입
design/            .pen 디자인 파일 (design/README.md 참고)
```

## 라우트

| 역할 | URL | 화면 |
|---|---|---|
| 공통 | `/login` | 로그인·프로필 |
| 공통 | `/rooms` | 공개 방 목록 |
| 공통 | `/me` | 마이페이지 (학습 기록) |
| 학생 | `/join` | 입장 (PIN/QR·닉네임) |
| 학생 | `/play/[code]` | 풀이 |
| 학생 | `/result/[sessionId]` | 결과·리포트 (+세션 평가) |
| 학생 | `/pay/[code]` | 유료 방 결제 |
| 선생님 | `/teacher/dashboard` | 대시보드 |
| 선생님 | `/teacher/editor` | 문제 에디터 |
| 선생님 | `/teacher/rooms/[code]/lobby` | 대기실 |
| 선생님 | `/teacher/rooms/[code]/live` | 진행 화면 |
| 선생님 | `/teacher/sessions/[sessionId]/review` | 첨삭·리포트 |
| 선생님 | `/teacher/revenue` | 수익·정산 내역 |
| 관리자 | `/admin/settlements` | 정산 관리 |
| 관리자 | `/admin/refunds` | 환불 처리 |
| 관리자 | `/admin/branded` | 브랜디드 퀴즈 |

`/`는 위 라우트 전체 링크 목록(사이트맵). `/teacher`, `/admin`은 각각 첫 화면으로 redirect.

### 라우트 추가 절차

1. `src/config/routes.ts`의 `ROUTES`에 한 줄 추가
2. `src/app/<경로>/page.tsx` 생성 → `<PagePlaceholder path="<경로>" />` 렌더
3. `pnpm build && pnpm check:routes` 통과 확인

## 담당 분배

| 담당 | 이름 | 범위 |
|---|---|---|
| A | (미정) | `(public)`, `(student)`, `teacher/`, `features/student`, `features/teacher`, `design/student-teacher.pen` |
| B | (미정) | `admin/`, `features/admin`, `design/admin.pen` |

`components/`, `config/`, `lib/` 등 공용 영역을 고칠 땐 상대에게 먼저 알린다.
````

- [ ] **Step 4: CLAUDE.md**

```bash
cat > CLAUDE.md <<'EOF'
# Passmate-Frontend 작업 규칙

Next.js(App Router, TS) + Tailwind + shadcn/ui. 패키지 매니저는 pnpm, Node 22.

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
EOF
```

- [ ] **Step 5: 최종 검증 + Commit + Push**

```bash
pnpm format && pnpm format:check && pnpm lint && pnpm build && pnpm check:routes && git status --short
```

Expected: 모두 통과, `git status`에 `node_modules`·`.next` 없음.

```bash
git add -A
git commit -m "docs: README·CLAUDE.md·폴더 규칙 문서"
git push -u origin feature/setup
```

- [ ] **Step 6: develop으로 PR**

```bash
gh pr create --base develop --head feature/setup --title "[setup] 프로젝트 기본 골격" --body "$(cat <<'EOF'
## #️⃣ 연관된 이슈

> 없음 (초기 셋업)

## 📝 작업 내용

- Next.js(App Router, TS) + Tailwind + shadcn/ui + Prettier/ESLint 스캐폴딩
- 기획서 §7 화면 14개 → 라우트 16개 빈 페이지 (`src/config/routes.ts` 단일 소스)
- `/` 랜딩에 전체 라우트 링크, 선생님·관리자 전용 레이아웃(사이드바)
- `pnpm check:routes` 라우트 응답 검증 스크립트
- README / CLAUDE.md / design/README.md 규칙 문서

설계: `docs/superpowers/specs/2026-08-26-project-setup-design.md`

## 💬 리뷰 요구사항(선택)

- 라우트 URL·폴더 이름이 앞으로 작업하기 편한지 (`README.md` 라우트 표)
- `.pen` 담당별 분리 규칙(`design/README.md`) 동의 여부
EOF
)"
```

Expected: PR URL 출력.
