# 폰 폭 회원(마이 계열) 대응 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 웹을 768px 미만에서 볼 때 회원 13경로가 앱 시안대로 서게 하고, 그 화면들이 기대는 공용 셸을 사이드바에서 하단 4탭 바로 바꾼다. PC(768px 이상) 렌더 결과는 그대로 둔다.

**Architecture:** 같은 컴포넌트에 `max-md:` 클래스를 얹는 혼합 방식(학생 흐름 7경로와 동일). 셸은 새 부품 `MobileTabBar` 하나가 맡고, 마이 하위 9장은 공통 뼈대 `MeFormPage` 한 곳을 고쳐 함께 움직인다. 순수 로직(활성 탭 계산·탭 설정)만 단위 테스트로 잠그고, 시각 변경은 390px·1440px 캡처로 확인한다.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind v4 · lucide-react · Vitest(node 환경, `src/**/*.test.ts`)

**Spec:** `docs/superpowers/specs/2026-09-16-mobile-member-flow-design.md`

## Global Constraints

- **PC 불변** — 768px 이상 렌더 결과가 달라지면 안 된다. 폰 전용 변경은 전부 `max-md:` 또는 `md:hidden`으로 건다.
- **색 hex 금지** — `src/app/globals.css`의 시맨틱 토큰만 쓴다(`text-ink`, `text-muted-foreground`, `bg-card`, `border`, `text-mint` 등).
- **타이포는 10종 토큰에만 스냅** — 토큰 밖 크기·굵기를 새로 쓰지 않는다. 앱의 11sp 라벨은 `text-label-md`(12px)로 스냅한다.
- **서버가 비워 보낸 값은 채우지 않는다** — `0`·`Lv.1`로 메우지 말고 자리를 감춘다.
- **레이어 경계** — `features/**/*-page.tsx`는 props만 받는 렌더 전용, 쿼리·스토어·다이얼로그는 `app/**/page.tsx`가 쥔다.
- **앱에 있고 웹에 없는 기능은 만들지 않는다.** 배치만 앱을 따르고 내용은 웹이 가진 것만 쓴다.
- **테스트 범위** — 이 리포의 Vitest는 `environment: "node"` · `include: ["src/**/*.test.ts"]`라 **컴포넌트 렌더 테스트가 없다.** jsdom·testing-library 도입은 이번 범위 밖이다. 단위 테스트는 순수 TS 로직(Task 1·2)에만 붙이고, 나머지는 캡처로 검증한다.
- **커밋 전 매번**: `pnpm format && pnpm lint && pnpm test && pnpm build`. 라우트 수는 안 늘어나므로 `pnpm check:routes`는 46 그대로여야 한다.
- `pnpm format`이 무관한 테스트 파일 2개(`src/features/me/adapt.test.ts`, `src/features/participant/result/adapt.test.ts`)를 매번 건드린다 — 커밋 전 `git checkout --`으로 되돌린다.
- **`HANDOVER.md`·`design/design.pen`·`.claude/`는 커밋하지 않는다. `git add -A` 금지.**
- 브랜치는 `feature/mobile-member-flow` 하나에 쌓는다. **푸시는 전부 끝난 뒤 한 번, PR은 사용자가 말할 때만.**

## 앱 근거 파일 (읽기 전용 참고)

`../Passmate-KMP/composeApp/src/commonMain/kotlin/org/sesacteamproject/passmate/`

| 웹 화면 | 앱 파일 |
|---|---|
| 셸 | `component/PassmateBottomTabBar.kt` · `navigation/AppTab.kt` |
| 상단 줄 | `component/PassmateTopBar.kt` (px 20 · 위 12 · 아래 16 · 간격 12) |
| `/me` | `ui/mypage/MyInfoScreen.kt` |
| `/me/account` | `ui/mypage/EditProfileScreen.kt` |
| `/me/character` | `ui/mypage/CharacterEditScreen.kt` |
| `/me/notifications` | `ui/mypage/NotificationSettingsScreen.kt` |
| `/me/withdraw` | `ui/mypage/DeleteAccountScreen.kt` |
| `/me/coins` | `ui/payment/CoinHistoryScreen.kt` |
| `/me/coins/charge` | `ui/payment/CoinChargeScreen.kt` |
| `/me/settlement-account` | `ui/payment/SettlementAccountScreen.kt` |
| `/me/settlement` | `ui/payment/EarningsScreen.kt` |
| `/me/joined` | `ui/mypage/JoinedRoomsScreen.kt` |
| `/home` | `ui/home/RoomListScreen.kt` |

## 파일 구조

**새로 만드는 파일**

- `src/components/layout/active-path.ts` — 현재 pathname에 맞는 내비 항목을 고르는 순수 함수. 사이드바와 탭바가 함께 쓴다.
- `src/components/layout/active-path.test.ts` — 위 함수 단위 테스트.
- `src/components/layout/mobile-tab-bar.tsx` — 폰 폭 하단 4탭 바 + 높이 상수.
- `src/config/routes.test.ts` — `MOBILE_TABS` 설정이 실재하는 라우트를 가리키는지 보는 단위 테스트.

**고치는 파일 (책임)**

- `src/config/routes.ts` — `MOBILE_TABS` 추가, `mobileBare` 주석을 "폰 폭에서 회원 셸(탭바)을 감춘다"로 고침, `/me/settlement`에 `mobileBare` 추가.
- `src/components/layout/role-sidebar.tsx` — `findActivePath` 제거(모듈로 이동), `className` prop 추가, `bareOnMobile` 분기 제거.
- `src/components/layout/sidebar-account.tsx` — `max-md:hidden` 전달.
- `src/app/(member)/layout.tsx` · `src/app/host/(nav)/layout.tsx` — 탭바 삽입 + 본문 아래 여백.
- `src/components/common/mobile-action-bar.tsx` — 탭바 위로 올리는 선택 값 추가.
- `src/features/me/settings/me-form-page.tsx` — 마이 하위 9장의 폰 뼈대.
- 화면별 파일 — Task 7~13에서 각각 지정.

---

## Checkpoint ① 셸 (Task 1~5)

### Task 1: 활성 경로 계산 함수를 순수 모듈로 분리

지금 `findActivePath`는 `role-sidebar.tsx`(`.tsx`) 안에 있어 테스트가 닿지 않는다(Vitest가 `.ts`만 읽는다). 탭바도 같은 규칙이 필요하므로 `.ts`로 뺀다.

**Files:**
- Create: `src/components/layout/active-path.ts`
- Create: `src/components/layout/active-path.test.ts`
- Modify: `src/components/layout/role-sidebar.tsx` (파일 끝 `findActivePath` 삭제 + import)

**Interfaces:**
- Produces: `findActivePath(pathname: string, patterns: readonly string[]): string | undefined`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/components/layout/active-path.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { findActivePath } from "./active-path";

describe("findActivePath", () => {
  const patterns = ["/home", "/host/rooms", "/me/joined", "/me"] as const;

  it("정확히 일치하는 항목을 고른다", () => {
    expect(findActivePath("/me", patterns)).toBe("/me");
    expect(findActivePath("/me/joined", patterns)).toBe("/me/joined");
  });

  it("일치가 없으면 하위 경로 중 가장 긴 항목을 고른다", () => {
    // /me/account 는 "마이페이지"(/me) 아래다 — /me 와 /me/joined 둘 다 후보가 아니라 /me 만 맞다
    expect(findActivePath("/me/account", patterns)).toBe("/me");
    expect(findActivePath("/me/coins/charge", patterns)).toBe("/me");
  });

  it("동적 세그먼트는 아무 값이나 받는다", () => {
    expect(findActivePath("/host/rooms/ABC123/timing", ["/host/rooms/[code]/timing"])).toBe(
      "/host/rooms/[code]/timing",
    );
  });

  it("해당하는 항목이 없으면 undefined", () => {
    expect(findActivePath("/login", patterns)).toBeUndefined();
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm vitest run src/components/layout/active-path.test.ts`
Expected: FAIL — `Failed to resolve import "./active-path"`

- [ ] **Step 3: 모듈을 만든다**

`src/components/layout/active-path.ts` — 지금 `role-sidebar.tsx` 맨 아래에 있는 함수를 주석까지 그대로 옮긴다:

```ts
/**
 * 현재 pathname에 해당하는 내비 항목의 path. 정확히 일치하는 항목이 없으면 하위 경로(prefix)로 가장 긴 항목을 고른다
 * — /me/account 는 "마이페이지"(/me), /me/joined 는 자기 항목이 활성. 동적 세그먼트([code] 등)는 아무 값이나 허용.
 *
 * 사이드바(PC)와 하단 탭바(폰)가 같은 규칙을 써야 해서 부품 밖 순수 함수로 둔다.
 */
export function findActivePath(
  pathname: string,
  patterns: readonly string[],
): string | undefined {
  const toRegExp = (pattern: string, tail: string) =>
    new RegExp("^" + pattern.replace(/\[[^\]]+\]/g, "[^/]+") + tail);
  const exact = patterns.find((p) => toRegExp(p, "$").test(pathname));
  if (exact) return exact;
  return patterns
    .filter((p) => toRegExp(p, "/").test(pathname))
    .sort((a, b) => b.length - a.length)[0];
}
```

- [ ] **Step 4: 사이드바가 새 모듈을 쓰게 한다**

`src/components/layout/role-sidebar.tsx`에서 파일 맨 아래 `findActivePath` 정의를 지우고, 상단에 import를 더한다:

```tsx
import { findActivePath } from "@/components/layout/active-path";
```

- [ ] **Step 5: 통과를 확인한다**

Run: `pnpm vitest run src/components/layout/active-path.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: 커밋하지 않는다 — Task 5까지 묶어 ① 체크포인트에서 한 번에 커밋한다**

---

### Task 2: `MOBILE_TABS` 설정 + 테스트

**Files:**
- Modify: `src/config/routes.ts`
- Create: `src/config/routes.test.ts`

**Interfaces:**
- Consumes: `ROUTES`, `getRoute` (기존)
- Produces: `MOBILE_TABS: readonly { path: string; label: string; icon: "home" | "hosted" | "joined" | "me" }[]`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/config/routes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getRoute, MOBILE_TABS, ROUTES } from "./routes";

describe("MOBILE_TABS", () => {
  it("앱 시안 v6의 하단 4탭과 같은 수·순서다", () => {
    expect(MOBILE_TABS.map((t) => t.label)).toEqual([
      "홈",
      "내가 만든 방",
      "참여한 방",
      "마이",
    ]);
  });

  it("모든 탭이 실재하는 라우트를 가리킨다", () => {
    for (const tab of MOBILE_TABS) {
      expect(() => getRoute(tab.path)).not.toThrow();
    }
  });

  it("탭 경로는 동적 세그먼트가 없다 — 폰 탭바는 값 없이 바로 이동한다", () => {
    for (const tab of MOBILE_TABS) {
      expect(tab.path).not.toContain("[");
    }
  });

  it("탭 경로는 사이드바가 서는 구역(member · host)에만 있다", () => {
    for (const tab of MOBILE_TABS) {
      const area = ROUTES.find((r) => r.path === tab.path)?.area;
      expect(["member", "host"]).toContain(area);
    }
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm vitest run src/config/routes.test.ts`
Expected: FAIL — `MOBILE_TABS` export 없음

- [ ] **Step 3: `MOBILE_TABS`를 더한다**

`src/config/routes.ts`의 `SIDEBAR_NAV` 정의 바로 아래에 둔다:

```ts
/**
 * 폰 폭(768px 미만) 하단 탭바 4개 — 앱 `navigation/AppTab.kt`와 같은 수·순서·뜻.
 * 사이드바 `MEMBER_NAV`(5개)와 일부러 다르다: 앱에 "문제 세트" 화면이 없어 탭에서 빠진다
 * (폰에서 /host/sets 진입점은 선생님 조각에서 방 만들기 안으로 옮긴다).
 * 아이콘 이름은 부품이 lucide 아이콘으로 옮긴다 — 설정에 컴포넌트를 두지 않는다.
 */
export const MOBILE_TABS = [
  { path: "/home", label: "홈", icon: "home" },
  { path: "/host/rooms", label: "내가 만든 방", icon: "hosted" },
  { path: "/me/joined", label: "참여한 방", icon: "joined" },
  { path: "/me", label: "마이", icon: "me" },
] as const satisfies readonly { path: string; label: string; icon: string }[];
```

- [ ] **Step 4: 통과를 확인한다**

Run: `pnpm vitest run src/config/routes.test.ts`
Expected: PASS (4 tests)

---

### Task 3: `MobileTabBar` 부품

**Files:**
- Create: `src/components/layout/mobile-tab-bar.tsx`

**Interfaces:**
- Consumes: `findActivePath` (Task 1), `MOBILE_TABS`·`getRoute`·`matchRoute` (Task 2·기존)
- Produces: `MobileTabBar` 컴포넌트, `MOBILE_TAB_BAR_H`(본문 여백·액션바 위치가 함께 쓰는 높이 문자열)

- [ ] **Step 1: 부품을 만든다**

```tsx
"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoorOpen, Home, SquarePlus, User, type LucideIcon } from "lucide-react";
import { findActivePath } from "@/components/layout/active-path";
import { getRoute, matchRoute, MOBILE_TABS } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * 탭바가 먹는 높이(안전영역 제외). 본문 아래 여백과 MobileActionBar 위치가 이 값을 함께 쓰므로
 * 숫자를 화면마다 적지 않고 여기 한 곳에 둔다.
 * 구분선 1 + 위 10 + 아이콘 24 + 간격 4 + 라벨 줄 17 + 항목 위아래 4·2 = 64
 */
export const MOBILE_TAB_BAR_H = "64px";

/** 시안 v6 nav/4탭 아이콘 — 앱 `PassmateIcons`의 Home·PlusSquare·DoorOpen·User와 1:1 */
const ICONS: Record<(typeof MOBILE_TABS)[number]["icon"], LucideIcon> = {
  home: Home,
  hosted: SquarePlus,
  joined: DoorOpen,
  me: User,
};

// 앱 탭바는 남는 폭을 바깥 6 : 사이 5 로 나눈다 — 라벨 길이가 달라도 비율이 유지된다
const OUTER_GAP = "grow-[6]";
const INNER_GAP = "grow-[5]";

/**
 * 폰 폭(768px 미만) 하단 4탭 바 — 앱 `component/PassmateBottomTabBar.kt`를 옮긴 것.
 * PC는 사이드바가 같은 일을 하므로 **md 이상에서는 그리지 않는다.**
 * 앱이 탭바 없이 그리는 화면(routes.ts의 `mobileBare`)에서는 아무것도 그리지 않는다.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  if (matchRoute(pathname)?.mobileBare === true) return null;

  const activePath = findActivePath(
    pathname,
    MOBILE_TABS.map((tab) => tab.path),
  );

  return (
    <nav
      aria-label="주요 화면"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card pt-2.5 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <span className={OUTER_GAP} />
      {MOBILE_TABS.map((tab, index) => {
        const Icon = ICONS[tab.icon];
        const active = tab.path === activePath;
        return (
          <Fragment key={tab.path}>
            <Link
              href={getRoute(tab.path).sample}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 py-1 transition-colors",
                active ? "text-mint" : "text-muted-foreground",
              )}
            >
              <Icon className="size-6" strokeWidth={2} aria-hidden />
              <span className={cn("text-label-md", active && "font-bold")}>{tab.label}</span>
            </Link>
            <span className={index === MOBILE_TABS.length - 1 ? OUTER_GAP : INNER_GAP} />
          </Fragment>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: 타입·린트를 확인한다**

Run: `pnpm lint`
Expected: 오류 0 (경고도 새로 생기지 않아야 한다)

---

### Task 4: 셸 연결 — 사이드바 감추고 탭바 세우기

**Files:**
- Modify: `src/components/layout/role-sidebar.tsx` (`className` prop 추가, `bareOnMobile` 제거)
- Modify: `src/components/layout/sidebar-account.tsx` (`max-md:hidden` 전달)
- Modify: `src/app/(member)/layout.tsx`
- Modify: `src/app/host/(nav)/layout.tsx`
- Modify: `src/config/routes.ts` (`mobileBare` 주석 교체 + `/me/settlement`에 추가)

**Interfaces:**
- Consumes: `MobileTabBar`·`MOBILE_TAB_BAR_H` (Task 3)

- [ ] **Step 1: `RoleSidebar`에 `className`을 열고 폰 분기를 걷는다**

`Props`에 `className?: string`을 더하고, 본문에서 `bareOnMobile` 선언 두 줄(주석 포함)을 지운 뒤 `aside`를 이렇게 바꾼다. **`matchRoute` import는 그대로 둔다** — 바로 위 `activePath` 계산이 `matchRoute(pathname)?.nav`로 아직 쓴다.

```tsx
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-1 bg-sidebar px-3.5 pt-6 pb-5 shadow-[inset_-1px_0_0_0_var(--color-border)]",
        className,
      )}
    >
```

`bareOnMobile`은 더 필요 없다 — 폰에서는 사이드바가 늘 사라지고, 화면별 예외는 이제 탭바 쪽(`MobileTabBar`)이 `mobileBare`로 판단한다.

**주의: `max-md:hidden`을 여기 박지 않는다.** 랜딩의 PC 목업(`src/features/landing/mockups/interactive-mockups.tsx`)이 같은 부품으로 "PC는 이렇게 생겼다"를 그리므로, 부품에 박으면 폰에서 그 그림의 사이드바가 사라진다.

- [ ] **Step 2: `SidebarAccount`가 폰에서 숨긴다**

```tsx
  return <RoleSidebar nav={nav} user={user} className="max-md:hidden" />;
```

- [ ] **Step 3: 두 레이아웃에 탭바를 넣는다**

`src/app/(member)/layout.tsx` — `host/(nav)/layout.tsx`도 `nav="host"`만 다르고 똑같이 고친다:

```tsx
import { RequireAuth } from "@/components/common/require-auth";
import { MobileTabBar, MOBILE_TAB_BAR_H } from "@/components/layout/mobile-tab-bar";
import { SidebarAccount } from "@/components/layout/sidebar-account";

/** 회원 전용 화면(마이페이지) — 로그인 가드 + 사이드바(PC) · 하단 탭바(폰) 레이아웃 */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {/* 탭바 높이를 CSS 변수로 한 번만 내려보낸다 — 본문 여백·아래 버튼 줄·FAB이 같은 값을 읽는다 */}
      <div
        className="flex flex-1"
        style={{ "--mobile-tab-bar-h": MOBILE_TAB_BAR_H } as React.CSSProperties}
      >
        <SidebarAccount nav="member" />
        {/* 탭바는 fixed라 자리를 먹지 않는다 — 본문 끝이 탭바에 가리지 않게 그만큼 띄운다 */}
        <div className="min-w-0 flex-1 max-md:pb-[var(--mobile-tab-bar-h)]">{children}</div>
        <MobileTabBar />
      </div>
    </RequireAuth>
  );
}
```

숫자는 `mobile-tab-bar.tsx` 한 곳에만 산다 — 화면이 `64px`를 직접 적는 일이 없어야 한다.

- [ ] **Step 4: `mobileBare`의 뜻을 고쳐 적고 `/me/settlement`에 켠다**

`src/config/routes.ts`의 `RouteMeta` 주석을 바꾼다:

```ts
  /**
   * 폰 폭(768px 미만)에서 회원 셸(하단 탭바)을 그리지 않는 화면. 앱 시안이 탭바 없이 한 화면으로
   * 그린 곳만 켠다 (예: /pay/[roomId] = 앱 M-11, /me/settlement = 앱 M-T4). PC는 그대로 사이드바가 선다.
   * 켜는 화면은 반드시 자체 뒤로가기 줄(MobileTopBar)을 둔다 — 아니면 폰에서 빠져나갈 길이 없다.
   */
  mobileBare?: boolean;
```

`/me/settlement` 라우트에 `mobileBare: true`를 더한다. **`/host/reputation`에는 켜지 않는다** — 본문이 아직 폰용이 아니라 탭바까지 걷으면 나갈 길이 없어진다(선생님 조각에서 뒤로가기 줄과 함께 켠다).

- [ ] **Step 5: 검증**

```bash
pnpm lint && pnpm test && pnpm build && pnpm check:routes
```
Expected: lint 오류 0 · 테스트 전부 통과(기존 307 + 새 8) · 빌드 성공 · 라우트 46

---

### Task 5: `MobileActionBar`를 탭바 위로

앱은 마이 하위 화면에서 탭바를 유지한 채 아래 버튼을 둔다(`AppTab.DETAIL_ROUTE_OWNERS`). 지금 `MobileActionBar`는 `sticky bottom-0`이라 그대로 두면 탭바 뒤로 들어간다.

**Files:**
- Modify: `src/components/common/mobile-action-bar.tsx`

**Interfaces:**
- Produces: `MobileActionBar`에 `aboveTabBar?: boolean` prop 추가 (기본 `false` — 학생 흐름 화면은 탭바가 없어 지금 모습 그대로다)

- [ ] **Step 1: prop을 더한다**

```tsx
type Props = {
  children: ReactNode;
  /**
   * 하단 탭바가 서는 화면(회원 셸 안)에서 true. 탭바 높이만큼 위로 올려 버튼이 탭 뒤로 들어가지 않게 한다.
   * 탭바가 없는 화면(학생 흐름·mobileBare)은 기본값 그대로 바닥에 붙는다.
   */
  aboveTabBar?: boolean;
  className?: string;
};
```

`div`의 `bottom-0`을 조건부로 바꾼다:

```tsx
      className={cn(
        "sticky z-30 mt-auto flex flex-col gap-2.5 bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden",
        aboveTabBar ? "bottom-[var(--mobile-tab-bar-h)] pb-3" : "bottom-0",
        className,
      )}
```

탭바가 이미 안전영역을 먹으므로 `aboveTabBar`일 때는 아래 여백을 `pb-3`으로 줄인다.

- [ ] **Step 2: 기존 화면이 안 변한 것을 확인한다**

Run: `grep -rn "MobileActionBar" src/features | grep -v "aboveTabBar"`
Expected: 학생 흐름 화면들이 prop 없이 그대로 — 기본값 `false`라 렌더 결과가 같다.

- [ ] **Step 3: 검증하고 ① 체크포인트를 커밋한다**

```bash
pnpm format && git checkout -- src/features/me/adapt.test.ts src/features/participant/result/adapt.test.ts
pnpm lint && pnpm test && pnpm build && pnpm check:routes
```

브라우저로 `localhost:3000/me`를 390px·1440px에서 나란히 띄워 확인한다:
- 폰: 사이드바가 없고 아래 4탭이 선다. "마이" 탭이 활성.
- 폰: `/me/account`로 들어가도 탭바가 남고 "마이"가 활성이다.
- 폰: `/me/settlement`에서는 탭바가 없다.
- PC: 사이드바·본문이 이전과 같다.

```bash
git add src/components/layout src/components/common/mobile-action-bar.tsx src/config/routes.ts "src/app/(member)/layout.tsx" "src/app/host/(nav)/layout.tsx"
git commit -m "feat: 폰 폭 회원 셸을 사이드바에서 하단 4탭 바로"
```

**여기서 멈추고 사용자 로컬 확인을 받는다.**

---

## Checkpoint ② 마이 뼈대·하위 (Task 6~9)

### Task 6: `MeFormPage` 폰 뼈대 — 마이 하위 9장 공통

`MeFormPage`는 account · settlement-account · character · coins · charge · charge-complete · payment-methods · withdraw · notifications **9장의 뼈대**다. 여기를 고치면 9장이 함께 움직인다.

**Files:**
- Modify: `src/features/me/settings/me-form-page.tsx`

**Interfaces:**
- Consumes: `MobileTopBar` (기존 `src/components/common/mobile-top-bar.tsx`)
- Produces: `MeFormPage`에 `backHref?: string` prop 추가 — 폰 "← 제목" 줄이 갈 곳. 기본값 `/me`.

- [ ] **Step 1: 앱 상단 줄 규격을 확인한다**

Read: `../Passmate-KMP/composeApp/src/commonMain/kotlin/org/sesacteamproject/passmate/component/PassmateTopBar.kt`
확인할 값: 좌우 20 · 위 12 · 아래 16 · 아이콘·제목 간격 12 · Detail 스타일은 뒤로 화살표 있음.

- [ ] **Step 2: 뼈대를 고친다**

```tsx
import type { ReactNode } from "react";
import { MobileTopBar } from "@/components/common/mobile-top-bar";
import { cn } from "@/lib/utils";

type Props = {
  /** "마이페이지 › " 뒤에 붙는 화면명. 예: "계정 정보 변경" */
  title: string;
  children: ReactNode;
  /** 카드 클래스 덮어쓰기 (완료 화면은 py-12 · items-center 등) */
  cardClassName?: string;
  /** 폰 폭 "←"가 갈 곳. 앱은 마이 하위 화면에서 마이로 돌아간다 */
  backHref?: string;
};

/**
 * 마이페이지 서브화면 공통 뼈대 (디자인 C-02-1 ~ C-02-12) —
 * main padding [28,36] gap 20 · 제목 heading-lg "마이페이지 › …" · 흰 카드 640px r20 padding 28 gap 16
 *
 * 폰 폭(768px 미만)은 앱 시안 M-12-x — 좌우 20, "← 화면명" 줄(PC의 "마이페이지 › " 접두사는 빼고
 * 화면명만), 카드는 폭을 꽉 채우고 안쪽 여백을 18/16으로 줄인다.
 */
export function MeFormPage({ title, children, cardClassName, backHref = "/me" }: Props) {
  return (
    // 폰에서 화면 높이를 채워야 아래 버튼 줄(MobileActionBar)이 바닥에 붙는다 — 탭바 높이를 뺀 만큼이 본문 몫이다
    <main className="flex flex-col gap-5 px-9 py-7 max-md:min-h-[calc(100dvh-var(--mobile-tab-bar-h))] max-md:gap-3.5 max-md:px-5 max-md:pt-3 max-md:pb-6">
      <MobileTopBar title={title} backHref={backHref} className="-mx-5 px-5 pb-1" />
      <h1 className="text-heading-lg text-foreground max-md:hidden">마이페이지 › {title}</h1>
      <section
        className={cn(
          "flex w-[640px] max-w-full flex-col gap-4 rounded-[20px] border bg-card p-7 max-md:w-full max-md:gap-3.5 max-md:px-[18px] max-md:py-4",
          cardClassName,
        )}
      >
        {children}
      </section>
    </main>
  );
}
```

- [ ] **Step 3: 9장을 390px에서 훑는다**

`pnpm dev`를 띄우고 390px 폭으로 아래를 차례로 연다. 이 단계는 **넘치는 곳을 찾는 것이 목적**이다 — 고치는 건 Task 7~9다.

`/me/account` · `/me/character` · `/me/notifications` · `/me/withdraw` · `/me/coins` · `/me/coins/charge` · `/me/coins/charge/complete` · `/me/payment-methods` · `/me/settlement-account`

가로 스크롤이 생기는 화면을 적어 둔다.

- [ ] **Step 4: 검증**

```bash
pnpm lint && pnpm build
```
1440px에서 위 9장이 이전과 같은지 캡처로 확인한다(제목 줄·카드 폭 640·여백 28).

---

### Task 7: 하단 버튼이 있는 4장

`account` · `settlement-account` · `character` · `withdraw` — 지금은 카드 안에 버튼이 있다. 앱은 화면 아래 고정 버튼이다.

**Files:**
- Modify: `src/features/me/settings/account-page.tsx`
- Modify: `src/features/me/settings/settlement-account-page.tsx`
- Modify: `src/features/me/settings/character-page.tsx`
- Modify: `src/features/me/withdraw/withdraw-page.tsx`

**Interfaces:**
- Consumes: `MobileActionBar`·`MOBILE_PRIMARY_BUTTON`·`MOBILE_SECONDARY_BUTTON` (`src/components/common/mobile-action-bar.tsx`), `aboveTabBar` (Task 5)

- [ ] **Step 1: 앱 4장의 버튼 자리를 확인한다**

Read: `EditProfileScreen.kt` · `SettlementAccountScreen.kt` · `CharacterEditScreen.kt` · `DeleteAccountScreen.kt`
확인할 것: 버튼이 스크롤 안인지 화면 아래 고정인지, 라벨 문구, 보조 버튼 유무.

- [ ] **Step 2: 화면마다 폰 버튼 줄을 단다**

각 파일에서 기존 버튼 블록에 `max-md:hidden`을 걸고, `</MeFormPage>` 바로 앞에 폰용 줄을 더한다. `account-page.tsx` 예:

```tsx
      <MobileActionBar aboveTabBar>
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className={MOBILE_PRIMARY_BUTTON}
        >
          저장하기
        </button>
      </MobileActionBar>
```

**문구·비활성 조건은 지금 PC 버튼이 쓰는 것을 그대로 옮긴다.** 새 문구를 짓지 않는다.

바닥에 붙는 데 필요한 `min-h`는 Task 6에서 `MeFormPage`에 이미 걸었다 — 화면마다 따로 주지 않는다.

- [ ] **Step 3: 캐릭터 격자를 폰 폭에 맞춘다**

`character-page.tsx:58`의 `grid-cols-6`은 390px에서 칸이 50px 아래로 눌린다. 앱은 4열이다(`CharacterEditScreen.kt`의 `AVATARS_PER_ROW = 4`):

```tsx
        className="grid grid-cols-6 gap-3 max-md:grid-cols-4"
```

- [ ] **Step 4: 검증**

390px에서 4장을 열어 확인한다: 버튼이 탭바 위에 떠 있고, 카드 안 버튼은 폰에서 안 보이고, 내용이 길 때 버튼이 본문 끝을 가리지 않는다. 1440px에서 4장이 그대로다.

```bash
pnpm lint && pnpm test && pnpm build
```

---

### Task 8: 코인·결제 수단·알림 3장

**Files:**
- Modify: `src/features/me/coins/coins-page.tsx` (내역)
- Modify: `src/features/me/coins/charge-page.tsx` (금액 선택 + 하단 버튼)
- Modify: `src/features/me/coins/charge-complete-page.tsx` (웹 전용 — 결과 화면)
- Modify: `src/features/me/payment-methods/payment-methods-page.tsx` (웹 전용 — 줄 목록)
- Modify: `src/features/me/notifications/notifications-page.tsx` (토글 줄 목록)

- [ ] **Step 1: 앱 근거를 읽는다**

Read: `CoinHistoryScreen.kt` · `CoinChargeScreen.kt` · `NotificationSettingsScreen.kt`
`charge-complete` · `payment-methods`는 **앱에 없다** — 같은 규격(카드 r20 · 안쪽 18/16 · 줄 세로 14)으로 웹 내용을 그대로 세운다.

- [ ] **Step 2: 고정 폭·가로 배열을 폰에서 푼다**

각 파일에서 폰에서 넘치는 자리를 `max-md:`로 덮는다. 자주 나오는 세 가지:
- 가로로 늘어선 필터·칩 → `max-md:overflow-x-auto max-md:flex-nowrap` 또는 줄바꿈
- 고정 폭 열(`w-[...]`) → `max-md:w-full`
- 금액 선택 격자 → 앱 열 수에 맞춰 `max-md:grid-cols-2`

- [ ] **Step 3: 충전 버튼을 아래 줄로**

`charge-page.tsx`의 충전 버튼을 Task 7과 같은 방식으로 `MobileActionBar aboveTabBar`에 넣는다. `charge-complete-page.tsx`의 확인 버튼도 같게 한다.

- [ ] **Step 4: 검증**

390px에서 5장, 1440px에서 5장을 캡처로 확인한다. 가로 스크롤이 남아 있으면 안 된다.

```bash
pnpm lint && pnpm test && pnpm build
```

---

### Task 9: `/me` 루트

**Files:**
- Modify: `src/features/me/my-page.tsx`

- [ ] **Step 1: 앱 배치를 확인한다**

Read: `MyInfoScreen.kt`의 `LoadedMyInfo` — 한 단, 좌우 20, 카드 사이 14, 카드 차례는 **프로필 → 계정 → 코인 → 정산 → 알림·기타**. 웹의 4개 카드와 차례가 같다.

- [ ] **Step 2: 두 단을 한 단으로 풀고 상단 줄을 단다**

`my-page.tsx:55`:

```tsx
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-3.5">
```

`main`과 머리 줄:

```tsx
    <main className="flex flex-col gap-5 px-9 py-7 max-md:gap-3.5 max-md:px-5 max-md:pt-3 max-md:pb-6">
      {/* 앱 M-12는 탭 루트라 뒤로 화살표가 없다 — 제목만 둔다 */}
      <MobileTopBar title="마이" />
      <div className="flex items-center justify-between max-md:hidden">
        <h1 className="text-heading-lg text-ink">내 정보 관리</h1>
        ...
      </div>
```

PC 머리 줄의 안내 문구("방과 기록은 왼쪽 메뉴의 …")는 **폰에서 거짓말이 된다**(왼쪽 메뉴가 없다). `max-md:hidden`으로 함께 감추는 것이 이 처리다.

- [ ] **Step 3: 두 단 기준으로 짜인 카드 안쪽을 훑는다**

`SettingsRow`의 `action`(변경 ›·코인 충전 버튼 등)이 390px에서 제목과 겹치는지 본다. 겹치면 행을 `max-md:flex-wrap` 또는 `max-md:items-start`로 푼다.

- [ ] **Step 4: 검증하고 ② 체크포인트를 커밋한다**

```bash
pnpm format && git checkout -- src/features/me/adapt.test.ts src/features/participant/result/adapt.test.ts
pnpm lint && pnpm test && pnpm build
```

390px에서 `/me` → 하위 9장을 차례로 돌며 캡처, 1440px에서 같은 10장이 그대로인지 확인.

```bash
git add src/features/me
git commit -m "feat: 폰 폭 마이페이지와 하위 9장을 앱 시안 배치로"
```

**여기서 멈추고 사용자 로컬 확인을 받는다.**

---

## Checkpoint ③ 목록·정산 (Task 10~11)

### Task 10: `/me/joined` 참여한 방

**Files:**
- Modify: `src/features/me/joined/joined-page.tsx`
- Modify: `src/features/me/joined/session-row.tsx`
- Modify: `src/features/me/joined/record-stat-card.tsx`
- Modify: `src/features/me/joined/active-session-card.tsx`

- [ ] **Step 1: 앱 배치를 확인한다**

Read: `JoinedRoomsScreen.kt` (M-08) — 요약 통계와 세션 목록의 차례·행 모양.

- [ ] **Step 2: 통계 3칸 격자를 앱의 요약 한 카드로 접는다**

`joined-page.tsx:35`의 `grid-cols-3`은 390px에서 칸이 110px로 눌린다. **앱은 3칸을 쓰지 않는다** — `JoinedRoomsScreen.kt`의 `SummaryCard`는 한 카드 안에 **정답률 링(지름 70 · 테두리 6 민트 · 안에 "N%"와 "평균") + 오른쪽 요약 문장 + 추이 문장**이고, 그 아래 약한 주제 칩이 줄바꿈되며 깔린다.

폰에서는 3칸 격자에 `max-md:hidden`을 걸고 같은 값을 쓰는 요약 카드를 낸다. **정답 링은 이미 있다** — 리포트에서 쓴 `src/features/participant/result/report-summary-card.tsx`의 링을 보고 같은 방식으로 그린다(링 그리는 코드를 새로 짓지 말고 그 파일의 방식을 따른다).

웹이 가진 값만 싣는다 — `record-stat-card.tsx`에 지금 들어가는 세 값이 무엇인지 열어 보고, 앱 요약문에 대응하는 것만 옮긴다. 대응이 없는 값은 링 아래 보조 줄로 남긴다.

- [ ] **Step 3: 세션 행을 폰 줄 목록으로**

`session-row.tsx`가 가로로 여러 값을 늘어놓고 있으면, 폰에서는 앱처럼 **제목 줄 + 보조 줄** 두 줄로 접는다(`max-md:flex-col max-md:items-start`). 리포트(M-06)에서 쓴 방식과 같다.

- [ ] **Step 4: 상단 줄을 단다**

앱 M-08은 탭 루트다 — `MobileTopBar title="참여한 방"`을 뒤로 화살표 없이 둔다.

- [ ] **Step 5: 검증**

390px·1440px 캡처. 진행 중인 방 카드(`active-session-card.tsx`)의 "다시 들어가기" 버튼이 폰에서 잘리지 않는지 함께 본다.

---

### Task 11: `/me/settlement` 정산

표(고정 7열 그리드)를 폰에서 줄 목록으로 바꾸는 유일한 화면이다. 탭바가 없으므로 **뒤로가기 줄이 반드시 있어야 한다**(Task 4에서 `mobileBare`를 켰다).

**Files:**
- Modify: `src/features/me/settlement/settlement-page.tsx`
- Modify: `src/features/me/settlement/settlement-table.tsx`

- [ ] **Step 1: 앱 배치를 확인한다**

Read: `EarningsScreen.kt` (M-T4) — 수익 요약 카드와 내역 줄의 모양, 한 줄에 어떤 값을 싣는지.

- [ ] **Step 2: 표를 폰에서 감추고 줄 목록을 낸다**

`settlement-table.tsx:10`의 `grid-cols-[90px_1fr_90px_130px_170px_150px_120px]`은 합이 800px을 넘어 390px에서 가로 스크롤이 난다. 표 컨테이너에 `max-md:hidden`을 걸고, 같은 데이터를 받는 폰 목록을 같은 파일에 더한다:

```tsx
/** 폰 폭(768px 미만) 정산 내역 — 앱 M-T4처럼 표 대신 줄 목록. 한 줄에 방 이름·날짜·금액·상태만 싣는다 */
function SettlementRowsMobile({ rows }: { rows: SettlementRow[] }) {
  return (
    <ul className="flex flex-col divide-y rounded-2xl border bg-card md:hidden">
      {rows.map((row) => (
        <li key={row.id} className="flex items-center gap-3 px-[18px] py-3.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-label-lg text-foreground">{row.roomTitle}</span>
            <span className="text-label-md text-muted-foreground">{row.dateLabel}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-label-lg text-foreground">{formatWon(row.amount)}</span>
            <span className="text-label-md text-muted-foreground">{row.statusLabel}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

**필드 이름은 `src/features/me/settlement/types.ts`의 실제 타입을 열어 맞춘다** — 위 `roomTitle`·`dateLabel`·`statusLabel`은 그 파일에 있는 이름으로 바꿔 쓴다.

- [ ] **Step 3: 뒤로가기 줄을 단다**

```tsx
      <MobileTopBar title="정산" backHref="/me" />
```

탭바가 없는 화면이므로 이 줄이 유일한 출구다. 빠뜨리면 폰에서 갇힌다.

- [ ] **Step 4: 하단 버튼 처리**

이 화면에 폰 하단 버튼을 둔다면 `aboveTabBar`를 **주지 않는다**(탭바가 없다).

- [ ] **Step 5: 검증하고 ③ 체크포인트를 커밋한다**

```bash
pnpm format && git checkout -- src/features/me/adapt.test.ts src/features/participant/result/adapt.test.ts
pnpm lint && pnpm test && pnpm build
```

390px에서 `/me/joined`·`/me/settlement` 캡처 — 가로 스크롤 없음, 정산에서 뒤로가기가 `/me`로 간다. 1440px 두 장 불변.

```bash
git add src/features/me/joined src/features/me/settlement
git commit -m "feat: 폰 폭 참여한 방·정산 — 표를 줄 목록으로"
```

**여기서 멈추고 사용자 로컬 확인을 받는다.**

---

## Checkpoint ④ 홈 (Task 12)

### Task 12: `/home`

**Files:**
- Modify: `src/features/home/home-page.tsx`
- Modify: `src/features/home/pin-entry-card.tsx`
- Modify: `src/features/home/popular-rooms.tsx`
- Modify: `src/features/home/room-card.tsx`
- Modify: `src/features/home/fab.tsx`

- [ ] **Step 1: 앱 배치를 확인한다**

Read: `RoomListScreen.kt` — 홈 탭의 좌우 여백·카드 폭·인기 방 목록 모양.

**내용은 웹 그대로 둔다**(배너 · PIN 입장 카드 · 인기 방 · 새 방 FAB). 앱에 없는 것을 빼거나 앱에 있는 것을 가져오지 않는다.

- [ ] **Step 2: 좌우 여백과 상단 줄**

`home-page.tsx`의 `px-24 py-7`(96px)은 390px에서 본문을 198px로 만든다:

```tsx
    <main className="flex flex-col gap-6 px-24 py-7 max-md:gap-3.5 max-md:px-5 max-md:pt-3 max-md:pb-6">
```

**상단 줄은 두지 않는다** — 앱 `RoomListScreen.kt`에는 `PassmateTopBar`가 없다(배너부터 시작한다). 웹도 배너가 그 자리를 대신한다.

- [ ] **Step 3: PIN 칸·인기 방 캐러셀을 폰 폭에 맞춘다**

학생 흐름에서 이미 겪은 자리다 — **PIN 6칸이 390px에서 넘친다.** `src/features/participant/join/`의 PIN 입력이 폰에서 쓰는 칸 크기·간격을 그대로 가져온다(같은 값을 두 번 짓지 않는다). 인기 방 캐러셀은 폰에서 가로 스크롤 한 줄로 두되 카드 폭을 `max-md:w-[280px]` 수준으로 줄인다.

- [ ] **Step 4: FAB이 탭바를 가리지 않게**

`fab.tsx`가 `bottom-*`으로 고정돼 있으면 폰에서 탭바 위로 올린다:

```tsx
  className="... max-md:bottom-[calc(var(--mobile-tab-bar-h)+16px)]"
```

- [ ] **Step 5: 검증하고 ④ 체크포인트를 커밋한다**

```bash
pnpm format && git checkout -- src/features/me/adapt.test.ts src/features/participant/result/adapt.test.ts
pnpm lint && pnpm test && pnpm build && pnpm check:routes
```

390px에서 `/home` 캡처 — PIN 6칸이 한 줄에 들어가고, FAB이 탭바를 안 가리고, 인기 방이 넘치지 않는다. 1440px 불변.

```bash
git add src/features/home
git commit -m "feat: 폰 폭 홈 — PIN 입장·인기 방·새 방 버튼"
```

**여기서 멈추고 사용자 로컬 확인을 받는다.**

---

## 마무리 (Task 13)

### Task 13: 13경로 훑기 + 핸드오버

- [ ] **Step 1: 13경로를 390px에서 차례로 연다**

`/home` · `/me` · `/me/joined` · `/me/settlement` · `/me/account` · `/me/settlement-account` · `/me/character` · `/me/coins` · `/me/coins/charge` · `/me/coins/charge/complete` · `/me/payment-methods` · `/me/notifications` · `/me/withdraw`

화면마다 확인: 가로 스크롤 없음 · 탭바가 본문 끝을 안 가림 · 활성 탭이 맞음 · 버튼이 탭바 뒤로 안 들어감.

- [ ] **Step 2: 셸이 새는 자리를 확인한다**

폰에서 "내가 만든 방" 탭 → `/host/rooms`가 **아직 PC 모습인 것이 정상이다**(선생님 조각 범위). 탭바가 그 화면에서도 서고 다시 돌아올 수 있는지만 본다.

- [ ] **Step 3: PC 회귀 확인**

1440px에서 13경로 + `/host/rooms` + 랜딩(`/`)을 훑는다. 랜딩의 PC 목업 사이드바가 **폰에서도 그대로 보이는지** 특히 확인한다(Task 4에서 일부러 남긴 것).

- [ ] **Step 4: 최종 검증**

```bash
pnpm format && git checkout -- src/features/me/adapt.test.ts src/features/participant/result/adapt.test.ts
pnpm lint && pnpm test && pnpm build && pnpm check:routes
```
Expected: 테스트 전부 통과 · 빌드 성공 · lint 오류 0 · 라우트 46

- [ ] **Step 5: 푸시**

```bash
git push -u origin feature/mobile-member-flow
```

**PR은 만들지 않는다** — 사용자가 말할 때만.
