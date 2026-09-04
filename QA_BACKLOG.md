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
- **2026-09-03 갱신**: 코인·참가비 API가 붙어 결제 흐름 자체는 살아 있다(`/pay/[code]`·`/join`).
  **이제 이 링크 하나가 유료 방으로 가는 길을 막는 마지막 걸림돌이다.** 어느 쪽으로 풀지는
  팀 결정이 필요하다 — 카드에 PIN을 달아 달라고 백엔드에 요청할지, `/join`으로 통일할지.

### ✅ F-2. `/me`가 실서버에서 통째로 실패 — **해결(2026-09-03)**

- **무엇이었나**: 코인 잔액(`GET /users/me/coins`)이 `@draft`라 실서버 404인데
  컨테이너가 그 오류로 마이페이지 전체를 에러 화면으로 바꿨다.
- **어떻게 풀렸나**: 백엔드 PR #29~#32로 지갑 API가 실제로 생겼다. 404가 나지 않으므로
  분기 자체가 발화하지 않는다. 잔액의 원천도 `GET /users/me`의 `coinBalance`에서
  `GET /users/me/coins`로 옮겼다(`features/me/adapt.ts`의 `toCoinSummary`).

### 🟡 F-3. 비활성 쿼리 때문에 무한 로딩 2곳

TanStack Query v5에서 `enabled: false`인 쿼리는 `isPending === true`다.
pending 가드가 먼저 오면 뒤의 분기가 **도달 불가**가 된다.

| 파일                                             | 증상                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `app/host/(nav)/rooms/[code]/timing/page.tsx:41` | 세트가 안 붙은 방을 열면 "연결된 문제 세트를 찾지 못했어요" 대신 영원히 로딩 |
| `app/host/(flow)/rooms/[code]/lobby/page.tsx:75` | 잘못된 PIN으로 대기실에 들어가면 에러 대신 영원히 로딩                       |

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

## 6. 계속 `@draft`인 11개 (백엔드에도 없음)

관리자 10 · 파일 기반 출제 1. 실서버 404가 정상이고 화면은 "준비 중"으로 접는다.

**2026-09-04 갱신** — 코인/결제 6은 PR #18로 붙었고, 그때까지 `@draft`였던 13경로(평가 제출 ·
게스트 기록 이관 · 첨삭 저장 · 세트 복제 · 음성 힌트 2 · 마이페이지 확장 5 · 신고)도 백엔드에
구현돼 실계약 대조를 마쳤다. 대조에서 나온 어긋남은 아래 F-9~F-11로 적고 모두 고쳤다.

### 🟡 F-12. 코인이 충분해도 "충전한다"고 말한다 — **시안 대기(2026-09-04)**

- **어디**: `src/features/participant/pay/coin-charge-card.tsx:143`(포트원 결제 금액) · `:165`(CTA 문구)
- **무엇**: 부족분이 0이어도 충전 카드가 그대로 그려진다. 잔액 12,000 C · 참가비 10,000 C인데
  "포트원 결제 금액 ₩10,000", 버튼은 "₩10,000 충전 → 10,000 C 차감하고 입장"이다.
  충전 프리셋도 `CHARGE_OPTIONS.find((a) => a >= 0)`이라 가장 작은 10,000을 고른다.
- **실제 동작은 맞다**: `pay/[roomId]/page.tsx`가 `shortfall <= 0`이면 충전을 건너뛰고 참가비만
  차감한다. **돈이 더 나가지는 않고 문구만 틀렸다** — 결제창을 기대한 사용자가 그냥 입장된다.
- **왜 이제 보이나**: F-1 때문에 목록에서 이 화면에 닿을 수 없었다. 길을 열자 드러났다.
- **왜 아직 안 고쳤나**: **시안에 이 상태가 없다**(부족분 0인 결제 화면). 지어내면 시안과
  어긋나므로 디자이너 요청 후에 붙인다 — `DESIGN_GAPS.md` §3 W-11 행에 적었다.

### 🟢 F-13. 목의 단건 방 조회가 공개 목록을 못 따라간다 — **목 전용(2026-09-04)**

- **어디**: `src/lib/mocks/rooms.ts:35` — `let rooms = [{ ...DEMO_ROOM }]`
- **무엇**: 목의 `GET /rooms/public`은 `PUBLIC_ROOMS` 7개를 뿌리는데 `GET /rooms/{roomId}`가
  아는 방은 `DEMO_ROOM`(id 1) 하나다. 그래서 목 모드의 `/rooms` 목록에서 유료 카드
  "인덱스와 실행 계획 실전"(id 204)을 누르면 "없는 방이에요"가 뜬다.
- **실서버는 정상**이다 — 목록에 실린 방은 단건 조회도 된다.
- **왜 고쳐야 하나**: `CLAUDE.md`의 "목은 계약 거울" 규칙 위반이다. 목이 실서버보다 좁으면
  목에서만 깨지고, 그걸 실제 버그로 오인하게 된다.

### ✅ F-9. 별점 태그 enum 3개가 서버와 다름 — **해결(2026-09-04)**

목을 보고 짠 이름이라 `GOOD_DIFFICULTY`·`HELPFUL_HINTS`·`GOOD_QUALITY`가 서버의
`FAIR_DIFFICULTY`·`HELPFUL_HINT`·`GOOD_QUESTIONS`와 어긋나 있었다. 태그를 고르고 별점을 내면
400이 났고 `CLEAR_EXPLANATION`·`GOOD_PACING`만 우연히 통과했다. 문구도 서버 enum의 label로 맞췄다.
계약 테스트: `src/lib/types/dto/ratings.test.ts`.

### ✅ F-10. 음성 힌트 업로드가 서버 시그니처와 다름 — **해결(2026-09-04)**

multipart 파트 이름이 `audio`였는데 서버는 `@RequestPart("file")`이고(→ 400),
`durationMs`는 `@RequestParam`이라 쿼리인데 폼에 담고 있었다(→ 길이가 빈 채 저장).
`requestMultipart`에 쿼리 인자를 더해 고쳤다. 계약 테스트: `src/lib/api/sessions.test.ts`.

### ✅ F-11. 오류 코드 6개 어긋남 — **해결(2026-09-04)**

`RECORD_PURGED`는 서버에 없는 이름이었고(실제는 `GUEST_RECORD_EXPIRED`) 화면이 영영 타지 않는
분기를 들고 있었다. `RATING_NOT_ALLOWED`·`RATING_WINDOW_CLOSED`·`SESSION_NOT_ENDED`·
`GUEST_RECORD_ALREADY_CLAIMED`가 빠져 있었다. 서버 enum은 47개 → **53개**다.
