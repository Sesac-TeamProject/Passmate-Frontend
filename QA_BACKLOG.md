# QA 백로그 — 백엔드 연동 후 다 같이 잡을 것

> 2026-09-03 작성. `feature/backend-contract-v2` 기준.
> 로컬 백엔드(develop) 연동으로 S1~S7을 눈으로 돌리며 찾은 것 + `/code-review`가 짚은 것 중
> **확인이 끝난 것만** 적는다. 추측은 넣지 않는다.

---

## 1. 백엔드에 넘길 것

### 🔴 B-1. 서버가 KST를 UTC인 척 보낸다 — 학생이 답을 못 낸다

계약은 "오프셋 없는 **UTC**"인데 서버는 오프셋 없는 **KST**를 보낸다.

```
실제 UTC     : 2026-09-03T02:20:00
실제 KST     : 2026-09-03T11:20:00
서버 endsAt  : 2026-09-03T11:19:31   ← KST 값을 오프셋 없이
```

프런트는 계약대로 UTC로 읽으므로 9시간이 어긋난다. 증상:

- 문항 타이머가 **540분**(=9시간)으로 표시된다 (제한 30초인데)
- 별점 화면이 "**32시간** 안에 남길 수 있어요"라고 한다 (실제 24시간)
- **학생이 답을 낼 수 없다** — 화면은 시간이 남았다고 하는데 서버는 이미 마감해 409
  `QUESTION_NOT_RUNNING`을 준다. 눈으로 재현했다.

원인은 JVM 시간대다. 백엔드 README의 로컬 실행법에 `-Duser.timezone=UTC`가 빠져 있다.
운영 컨테이너는 UTC로 뜨지만, 로컬에서 `./gradlew bootRun`으로 띄우면 KST가 된다.

**요청**: README 실행법에 타임존 플래그를 넣거나, 앱이 기동 시 UTC를 강제하게 해 주세요.

### 🔴 B-2. WebSocket 허용 origin이 `passmate.app` — 운영에서 실시간이 전면 실패

```kotlin
// common/config/WebSocketConfig.kt
registry.addEndpoint(ENDPOINT)
    .setAllowedOriginPatterns("http://localhost:*", "https://*.passmate.app")
```

REST의 CORS는 `WEB_BASE_URL`(= `https://passmate.kr`)을 허용하는데 **WS만 `passmate.app`** 이다.
운영 배포에서 STOMP 핸드셰이크가 거부되어 실시간 세션이 통째로 동작하지 않는다.
(REST CORS처럼 `WEB_BASE_URL`을 읽게 하면 도메인이 바뀌어도 코드를 안 고쳐도 된다.)

### 🟡 B-3. 대기실 입·퇴장 이벤트 미발행

`PARTICIPANT_JOINED`·`PARTICIPANT_LEFT`가 enum에는 있으나 발행 코드가 없다.
프런트는 **3초 폴링**으로 버티고 있다 — 발행이 들어오면 폴링을 지운다.

### 🟡 B-4. 끝난 방도 404

없는 PIN과 끝난 방이 모두 404 `ROOM_NOT_FOUND`라 화면이 "없는 방"과 "이미 끝난 방"을
구분해 안내하지 못한다. 410을 주면 문구를 가를 수 있다.

---

## 2. 프런트 — 화면이 안 열리는 것 (우선)

### 🔴 F-1. 유료 방 카드가 전부 열리지 않는다

- **어디**: `src/features/home/popular-rooms.tsx:16`, `src/features/participant/rooms/rooms-page.tsx:20`
- **무엇**: 공개 방 계약에 `pin`이 없어 카드의 `code`를 `String(room.id)`로 바꿨는데
  (`features/home/adapt.ts:12`, `features/participant/rooms/adapt.ts:44`),
  유료 방 링크는 아직 `/pay/${room.code}`다.
  `/pay/[code]`는 `useRoomByPin`으로 조회하므로 `GET /rooms/pin/1` → 404.
- **결과**: 홈 인기 방·공개 방 목록의 **모든 유료 방이 에러 화면**으로 간다.
- **메모**: 무료 방은 `/join`으로 우회했는데 유료 경로만 남았다. PIN 없이 결제 화면으로 갈
  방법이 없으므로 `/join` 경유로 통일하거나, 서버에 공개 방 카드의 PIN을 요청해야 한다.

### 🔴 F-2. `/me`가 실서버에서 통째로 실패

- **어디**: `src/app/(member)/me/page.tsx:48`
- **무엇**: 코인 잔액(`GET /users/me/coins`)은 `@draft`라 실서버 404인데,
  `useCoinBalance`에 `retry: false`가 없고 컨테이너가 `if (coins.isError) return <ScreenError/>`다.
- **결과**: 마이페이지 전체가 에러 화면이 되어 프로필·참여 기록·정산 요약에 접근할 수 없다.
  바로 아래 정산 계좌 404는 접어서 처리하고 있어 **한 함수 안에서 규칙이 엇갈린다**.

### 🟡 F-3. 비활성 쿼리 때문에 무한 로딩 2곳

TanStack Query v5에서 `enabled: false`인 쿼리는 `isPending === true`다.
pending 가드가 먼저 오면 뒤의 분기가 **도달 불가**가 된다.

| 파일 | 증상 |
| --- | --- |
| `app/host/(nav)/rooms/[code]/timing/page.tsx:41` | 세트가 안 붙은 방을 열면 "연결된 문제 세트를 찾지 못했어요" 대신 영원히 로딩 |
| `app/host/(flow)/rooms/[code]/lobby/page.tsx:75` | 잘못된 PIN으로 대기실에 들어가면 에러 대신 영원히 로딩 |

---

## 3. 프런트 — 값이 틀리거나 낭비되는 것

### 🟡 F-4. AI 분석 요청 버튼이 `DONE`에도 보인다

- **어디**: `app/(participant)/result/[sessionId]/report/[questionNo]/page.tsx:69`
- `canRequest`가 `analysisStatus !== "PENDING"`이라 **이미 끝난 분석에도 버튼이 남는다**.
  다시 누르면 월 5회 무료 중 하나를 더 쓰거나 코인을 또 낸다.
  `NOT_REQUESTED`·`FAILED`일 때만 의미가 있다.

### 🟡 F-5. 객관식 답이 뒤바뀔 수 있다

- **어디**: `features/participant/play/adapt.ts:43` (`toSubmittedValue`)
- `PlayCard`가 이미 보기 **원문**을 넘기는데, 어댑터가 그 값을 다시 `key`로 찾는다.
  보기 텍스트가 `"A"`~`"D"` 같은 한 글자면 **다른 보기가 제출된다.**
  지금은 보기 문구가 키처럼 생기지 않아서 우연히 맞고 있다.

### 🟡 F-6. 진행 화면 제출 수가 최대 3초 낡는다

- **어디**: `app/host/(flow)/rooms/[code]/live/page.tsx:54`
- 폴링 결과를 현재 문항과 대조하지 않아, 새 문항이 열린 직후 **이전 문항의 집계**가
  잠깐 그대로 보인다(교실 프로젝터에 "18/24 제출"이 뜬 채 시작). 두 값 모두
  `sessionQuestionId`를 들고 있으니 그것으로 거르면 된다.

### 🟡 F-7. 렌더 중 부수효과 2곳

React가 금지하는 패턴이고 StrictMode에서 두 번 실행된다.

- `lib/queries/use-rooms.ts:78` — 렌더 본문에서 `writeHostRoomId`(sessionStorage 쓰기)
- `app/(participant)/result/[sessionId]/page.tsx:73` — 렌더 본문에서 `claim.mutate`
  (게스트 기록 이관이 중복 요청될 수 있다)

### 🟡 F-8. 죽은 코드

- `features/me/adapt.ts` `toHostRecord` — 쓰는 화면이 없다(그릴 카드 UI가 아직 없어 의도적).
- `features/participant/pay/adapt.ts:51` — `formatSchedule(undefined, undefined)`는
  항상 빈 문자열이다. 주변 `host.name: ""`·`level: 1`·`rating: 0`도 계약이 없어진 뒤 남은 상수다.

---

## 4. 디자인·문구

- W-07 문항별 탭의 **문항 단위 코멘트**는 계약이 없어 잠근 채로 둔다.
  답안 단위 첨삭은 "학생별" 탭에 붙였다(`c82efad`).
- 정산 계좌의 **은행 코드표**는 금융결제원 표준값을 넣었지만 서버가 검증 없이 저장한다.
  실제 지급 전에 한 번 확인해야 한다(`features/me/types.ts`).

---

## 5. 아직 안 붙인 백엔드 기능 (화면이 없어서)

붙이려면 화면 설계가 먼저다 — 임의로 만들지 않았다.

`POST/DELETE /users/{id}/block`·`GET /users/me/blocks`(차단) ·
`GET /ads`·`POST /ads/{id}/events`(광고) · `GET /rooms/{id}/ratings`(받은 평가 목록) ·
`POST /users/me/devices`(푸시 토큰, 웹은 해당 없을 수 있음) ·
`POST /admin/grades/evaluate`(관리자)

## 6. 계속 `@draft`인 17개 (백엔드에도 없음)

관리자 10 · 코인/결제 6 · 파일 기반 출제 1. 실서버 404가 정상이고 화면은 "준비 중"으로 접는다.
