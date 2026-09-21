# 폰 폭 회원(마이 계열) 대응 — 설계

> 작성: 2026-09-16 · 대상 브랜치: `feature/mobile-member-flow`
> 한 줄: **웹을 768px 미만에서 볼 때 회원 13경로를 앱 시안대로 세우고, 그 화면들이 기대는 공용 셸(사이드바 → 하단 4탭 바)을 먼저 바꾼다. PC는 건드리지 않는다.**

## 1. 배경

폰 폭 대응은 학생 흐름 7경로(`/join`·`/play/[code]`·`/result/*`·`/pay/[roomId]`)에서 끝났다(PR #47).
남은 33경로 중 이번 조각은 **회원(마이 계열) 13경로**다. 나머지(선생님 11 · 공개 5 · 관리자 6)는 다음 조각으로 남긴다.

`/home`·`/me` 계열은 240px 사이드바 위에 서 있다. 390px에서 사이드바가 본문을 150px로 만들기 때문에,
**공용 셸을 폰용 내비로 바꾸지 않으면 이 13장은 성립하지 않는다.** 셸이 이 조각의 전제다.

### 무엇을 보고 그리는가

피그마 좌석이 Starter·View라 호출이 이번 달 **9회**밖에 남지 않았다. 대신 **KMP 앱 코드**(`../Passmate-KMP`)를
1차 근거로 쓴다. 앱 화면 코드는 같은 시안(UI 디자인 v6)을 구현한 것이고, 프레임 id·dp 값·시안 주석을
그대로 들고 있다(예: `MyInfoScreen.kt`의 `// Figma "UI 디자인 v6" M-12(349:9683)`). 앱 코드로 판단이
서지 않는 화면이 나오면 그때만 피그마를 연다.

## 2. 셸 — 하단 4탭 바

### 2-1. 새 부품 `src/components/layout/mobile-tab-bar.tsx`

앱 `component/PassmateBottomTabBar.kt`를 웹으로 옮긴다.

| 항목 | 값 (앱 기준) |
|---|---|
| 위 구분선 | 1px `border` 토큰 |
| 안쪽 여백 | 위 10 · 항목 세로 4 · 아래는 `env(safe-area-inset-bottom)` |
| 아이콘 | 24 |
| 아이콘·라벨 간격 | 4 |
| 라벨 | 11px · 선택 Bold / 비선택 Medium · 자간 -0.22 |
| 색 | 선택 `mint` · 비선택 `muted-foreground` |
| 가로 배분 | 바깥 6 : 사이 5 : 5 : 5 : 바깥 6 (앱과 같은 비율 분배) |
| 배경 | `bg-card` |

높이는 값에서 따라 나온다(구분선 1 + 위 10 + 아이콘 24 + 간격 4 + 라벨 줄 15 + 항목 세로 4·2 = **62px**)
+ 안전영역. 이 62는 본문 아래 여백과 `MobileActionBar` 위치에 다시 쓰이므로 **파일에서 상수로 내보낸다**
(`MOBILE_TAB_BAR_H`). 구현할 때 앱 실제 렌더값과 한 번 대조한다.

### 2-2. 탭 4개

앱 `AppTab`과 같은 순서·같은 뜻으로 둔다.

| 탭 | 경로 | 아이콘 (lucide ← 앱) |
|---|---|---|
| 홈 | `/home` | `Home` ← `Home` |
| 내가 만든 방 | `/host/rooms` | `SquarePlus` ← `PlusSquare` |
| 참여한 방 | `/me/joined` | `DoorOpen` ← `DoorOpen` |
| 마이 | `/me` | `User` ← `User` |

목록은 `src/config/routes.ts`에 `MOBILE_TABS`로 **한 곳에만** 둔다. 사이드바 `MEMBER_NAV`(5항목)와
별개다 — 앱에 `문제 세트` 탭이 없다. 활성 표시는 `RoleSidebar`의 `findActivePath`와 같은 규칙
(정확히 일치 → 없으면 가장 긴 prefix)을 쓴다. 이 함수를 `role-sidebar.tsx`에서 공용 자리로 옮겨 둘이 함께 쓴다.

### 2-3. 어디에 붙고, 어디서 사라지는가

- 붙는 자리: `src/app/(member)/layout.tsx`, `src/app/host/(nav)/layout.tsx` — 지금 사이드바가 서는 두 곳 전부.
- 사이드바는 `SidebarAccount`에서만 `max-md:hidden`으로 감춘다. **`RoleSidebar` 자체에는 걸지 않는다** —
  랜딩의 PC 목업(`features/landing/mockups/interactive-mockups.tsx`)이 같은 부품으로 "PC는 이렇게 생겼다"를
  그리고 있어, 부품에 박으면 폰에서 그 그림의 사이드바가 사라진다. `RoleSidebar`에 `className` prop을 열어
  `SidebarAccount`가 넘긴다.
- 탭바를 그리지 않는 화면: `routes.ts`의 기존 `mobileBare` 플래그를 쓴다. 뜻을 **"폰 폭에서 회원 셸을 감춘다"**로
  고쳐 적는다(지금 주석은 사이드바만 말한다). `RoleSidebar` 안의 `bareOnMobile` 분기는 사이드바가 폰에서
  늘 사라지므로 **지운다**.
- 이번에 `mobileBare`를 켜는 곳: `/me/settlement`(앱 M-T4에 탭바 없음). `/pay/[roomId]`는 이미 켜져 있다.
  `/host/reputation`도 앱 M-09에 탭바가 없지만 **이번엔 켜지 않는다** — 본문이 아직 폰용이 아니라서
  탭바까지 걷으면 폰에서 빠져나갈 길이 없어진다. ③ 선생님 조각에서 뒤로가기 줄과 함께 켠다.

### 2-4. 하단 버튼과 겹치는 문제

앱은 마이 하위 화면(계정·캐릭터·알림·탈퇴·코인·충전·정산 계좌)에서 **탭바를 유지한 채** 아래 버튼을 둔다
(`AppTab.DETAIL_ROUTE_OWNERS`). 웹도 같게 간다.

- 탭바: `fixed bottom-0` (스크롤과 무관하게 늘 보인다 — 앱과 같다)
- `MobileActionBar`: 지금 `sticky bottom-0`이라 그대로 두면 탭바 뒤로 들어간다. 탭바가 있는 화면에서는
  `bottom`을 `MOBILE_TAB_BAR_H`만큼 올린다. 부품에 `offsetForTabBar` 같은 선택 값을 두고, 화면이 직접
  숫자를 적지 않게 한다.
- 본문: 탭바가 `fixed`라 자리를 먹지 않으므로 레이아웃이 `max-md:pb-[MOBILE_TAB_BAR_H]`를 준다.

## 3. 화면 공통 규격

앱에서 그대로 옮긴다.

- 좌우 여백 20 · 카드 모서리 20 · 테두리 1 · 카드 안쪽 가로 18 / 세로 16
- 목록 행 세로 14 · 행 사이 구분선 1
- 상단 "← 제목" 줄은 **기존 `MobileTopBar`를 그대로 쓴다**(새로 만들지 않는다)
- 버튼은 **기존 `MobileActionBar`의 규격 상수 4종**을 쓴다(주 54 / 보조 50 / 시트 52 / 상태 52)
- **표는 폰에서 줄 목록으로 바꾼다** — 코인 내역·정산 내역. 리포트(M-06)에서 이미 쓴 방식과 같다.

## 4. 13경로 처리

| 웹 경로 | 앱 근거 | 폰에서 하는 일 |
|---|---|---|
| `/me` | `MyInfoScreen` (M-12) | 프로필 카드 · 계정/코인/정산/알림/로그아웃 줄 목록 |
| `/me/account` | `EditProfileScreen` | 한 단 폼 + 아래 저장 버튼 |
| `/me/character` | `CharacterEditScreen` | 캐릭터 12종 격자 + 아래 저장 버튼 |
| `/me/notifications` | `NotificationSettingsScreen` | 토글 줄 목록 |
| `/me/withdraw` | `DeleteAccountScreen` | 안내 + 아래 탈퇴 버튼 |
| `/me/coins` | `CoinHistoryScreen` | 보유 코인 카드 + 내역 줄 목록(표 아님) |
| `/me/coins/charge` | `CoinChargeScreen` | 금액 선택 + 아래 충전 버튼 |
| `/me/settlement-account` | `SettlementAccountScreen` | 은행·계좌 폼 + 아래 저장 버튼 |
| `/me/settlement` | `EarningsScreen` (M-T4) | 수익 요약 + 내역 줄 목록. **탭바 없음**, 뒤로가기 줄 |
| `/me/joined` | `JoinedRoomsScreen` (M-08) | 참여한 방 카드 목록 |
| `/home` | 앱 홈 탭 | 배치는 앱 폭·여백, 내용은 웹 그대로(배너·PIN 카드·인기 방·FAB) |
| `/me/coins/charge/complete` | **없음(웹 전용)** | 같은 규격으로 웹 내용 재배치 — 결과 아이콘·문구·아래 버튼 |
| `/me/payment-methods` | **없음(웹 전용)** | 같은 규격으로 웹 내용 재배치 — 카드 줄 목록 |

## 5. 지키는 규칙

- **배치는 앱대로, 내용은 웹이 가진 것만.** 앱에 있고 웹에 없는 기능은 이번에 만들지 않는다.
- **PC 불변.** 768px 이상 렌더 결과가 달라지면 안 된다.
- 색 hex 금지 — `globals.css` 시맨틱 토큰만.
- **서버가 비워 보낸 값은 채우지 않는다.** `0`·`Lv.1`로 메우지 말고 자리를 감춘다.
- 레이어 경계 유지 — 화면은 props만 받는 `*-view.tsx`, 쿼리·스토어는 `page.tsx`.
- 구현은 **혼합 방식**: 같은 컴포넌트에 `max-md:` 클래스로 폰 모습을 얹고, 구조가 크게 다른 덩어리만
  폰 전용 부품으로 뗀다(학생 흐름 7경로와 같은 방식).

## 6. 검증

- 화면마다 **390×844 iframe**으로 캡처해 앱 화면과 대조한다. 같은 캡처에서 **1440px**도 함께 띄워
  PC가 그대로인지 본다(브라우저 창 크기를 바꿀 수 없는 제약을 우회하는 기존 방법).
- 로컬 확인 계정은 `qa-host`. `127.0.0.1`은 확장 권한이 없어 `localhost`를 쓴다.
- 커밋 전 매번 `pnpm format && pnpm lint && pnpm test && pnpm build`.
  라우트 수는 안 늘어나므로 `check:routes`는 46 그대로여야 한다.
- `MOBILE_TABS`의 네 경로가 `ROUTES`에 실재하는지 보는 단위 테스트를 하나 더한다(오타로 죽는 걸 막는다).
- 커밋 단위: **① 셸 → ② 마이 루트+하위 → ③ 목록·정산 → ④ 홈·웹 전용 2장.**
  커밋마다 멈춰 사용자 로컬 확인을 받는다. 푸시는 전부 끝난 뒤 한 번, **PR은 요청이 있을 때만.**

## 7. 이번 범위 밖으로 새는 것

1. **`host/(nav)` 5화면(내가 만든 방·명성·문제 세트·타이밍·첨삭)에도 탭바가 선다.** 같은 셸을 쓰기
   때문이다. 본문은 ③ 전까지 PC 그대로라, 폰에서 "내가 만든 방" 탭을 누르면 아직 넓은 화면이 나온다.
   사이드바를 남기는 것보다 낫다고 보고 받아들인다(390px에서 240px 사이드바는 본문을 150px로 만든다).
2. **폰 탭바에 `문제 세트`가 없다.** 앱에 그 화면이 없어서다. 폰에서 `/host/sets`로 가는 길이 이번 조각
   동안 사라진다. ③에서 방 만들기 안이나 마이 안에 넣는다.

## 8. 다음 조각 (이번 범위 아님)

③ 선생님 11경로 · ④ 공개 5경로 · ⑤ 관리자 6경로. 피그마 호출 9회는 ③에 쓰려고 아껴 둔다.
