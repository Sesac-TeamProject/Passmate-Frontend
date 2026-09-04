# QA 백로그 — 백엔드 연동 후 다 같이 잡을 것

> 2026-09-03 작성. `feature/backend-contract-v2` 기준.
> 로컬 백엔드(develop) 연동으로 S1~S7을 눈으로 돌리며 찾은 것 + `/code-review`가 짚은 것 중
> **확인이 끝난 것만** 적는다. 추측은 넣지 않는다.

---

## 1. 백엔드에 넘길 것

> **2026-09-04 전수 재확인.** 백엔드 `9e39ce3`(9/3) 소스와 로컬 실서버로 항목을 하나씩 다시 봤다.
> **옛 목록 중 다섯이 이미 해소돼 있었다** — 낡은 목록을 회의에 들고 가지 않으려고 전부 대조했다.
> 살아남은 항목은 번호를 그대로 두고(B-1·B-3·B-4), 새로 확인한 것에 B-5부터 붙였다.
>
> ⚠️ 이 문서의 B-번호와 `DESIGN_GAPS.md` §4-3의 B-번호는 **서로 다른 체계**다. 원래 겹쳐 있었고,
> 옮겨 적다 엉뚱한 항목을 가리킨 적이 있다. 백엔드에 보낼 때는 **이 문서 번호로 통일한다.**

### ✅ 해소 — 더 요청하지 않는다 (2026-09-04 확인)

| 옛 항목                                        | 무엇으로 확인했나                                                                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~B-2~~ WebSocket 허용 origin이 `passmate.app` | `WebSocketConfig.kt:35`가 `corsProperties.originPatterns`(=`WEB_BASE_URL`)를 쓴다. 커밋 `dc64fbe` "WS 허용 오리진을 CORS 설정과 공유해 하드코딩 제거" |
| ~~D-13~~ 참가비 이중 차감                      | `EntryPaymentService.pay`가 `activePaymentOf`로 막고 409 `ALREADY_PAID`를 던진다. 요청했던 그대로다                                                   |
| ~~D-14~~ 로그인 토큰이 URL에 남음              | 리다이렉트가 아니라 `POST /auth/login/{provider}`로 인가 코드를 교환한다. 토큰이 쿼리스트링에 실리지 않는다                                           |
| ~~D-19~~ 호스트 공개 프로필 아바타 없음        | `HostProfileResponse.defaultAvatarId`가 있다 → **남은 일은 프런트 쪽**(지금 이니셜 타일을 쓴다)                                                       |
| ~~D-10~~ 세션 종료 최종 랭킹                   | `SessionService.kt:110`이 `SESSION_ENDED` 봉투에 랭킹 전체를 실어 보낸다                                                                              |

### 🔴 B-5. 방 상세가 남의 PIN을 흘린다 — **가장 급하다**

`GET /rooms/{roomId}`에 소유자 검사가 없다. `RoomController.kt:61`에 `@CurrentUser`가 없고
`RoomQueryService.getRoom`에도 검사가 없는데, `RoomResponse`에는 `pin: String`이 들어 있다.

2026-09-04 로컬 실서버 재현 (제3자 계정 토큰):

```
GET /rooms/7            (토큰 없음)        → 401
GET /rooms/7            (남의 계정 토큰)   → 200 {"id":7,"pin":"028627","hostUserId":2,...}
GET /rooms/public       (누구나)           → id 7 이 그대로 실려 있다
```

**로그인만 하면 누구나 남의 방 PIN을 읽는다.** 공개 목록이 id를 뿌리니 요청 한 번 더면 얻어진다.
같은 파일의 `RoomSummaryResponse`(PIN 조회 결과)는 "입장 화면에 필요한 최소 정보만 준다"며
**일부러 pin을 뺐고**, `/rooms/public`도 스웨거에 "게스트도 조회할 수 있어 PIN 은 포함하지 않는다"고
적혀 있다. 즉 **의도는 명확한데 상세 조회 한 곳만 새고 있다.**

> ⚠️ **그냥 막으면 프런트가 깨진다.** 유료 방 결제 화면(`/pay/[roomId]`)이 이 응답의 `pin`을 써서
> 결제 후 `/play/{pin}`으로 보낸다. 참가자는 방 주인이 아니므로 단순 소유자 검사로는 못 지나간다.
> **어느 쪽인지 정해 주세요**: ① 상세 응답에서 pin을 빼고, 참가 자격이 확인된 사람에게만
> (참가비 결제 응답 또는 참가자 등록 응답에) pin을 실어 준다 ② 상세를 호스트 전용으로 막고
> 참가자용 조회를 따로 판다. 프런트는 어느 쪽이든 맞춘다.

### 🔴 B-6. 게스트 토큰이 1시간이라 긴 세션에서 끊긴다

`JwtTokenProvider.issueGuestToken`이 `properties.accessTokenValiditySeconds`(3600초)를 그대로 쓴다.
게스트에게는 리프레시 토큰이 없다(`JoinResult.accessToken`·`guestToken`뿐).

**1시간을 넘기는 수업에서 게스트가 답을 못 내게 된다.** 방 종료 시각까지로 늘리거나
게스트 전용 재발급 경로가 필요하다.

### 🟡 B-1. 로컬 실행에서만 서버가 KST를 UTC인 척 보낸다 — **범위가 줄었다**

**운영은 문제없다.** `docker/Dockerfile`·`Dockerfile.runtime` 둘 다
`ENV JAVA_OPTS="… -Duser.timezone=UTC"`이고 MySQL도 `--default-time-zone=+00:00`이다.

남은 건 **README의 로컬 실행법**이다. `./gradlew bootRun --args='--spring.profiles.active=local'`에는
타임존 플래그가 없어 맥에서 띄우면 JVM이 KST로 뜨고, 계약이 "오프셋 없는 UTC"라 웹이 9시간을
잘못 읽는다(문항 타이머 540분, 학생이 답을 못 냄 — 눈으로 재현했다).

**요청**: `build.gradle.kts`의 `bootRun`에 `systemProperty("user.timezone", "UTC")`를 넣어 주세요.
README만 고치면 읽지 않은 사람에게 그대로 재현된다.
(이 맥에서는 백엔드 `.env`에 `TZ=UTC`를 넣어 임시로 덮어 뒀다 — **다른 사람 로컬에서는 그대로다.**)

### 🟡 B-3. 대기실 입·퇴장 이벤트 미발행

`PARTICIPANT_JOINED`·`PARTICIPANT_LEFT`가 `SessionEventType.kt:32-33`에 있으나 **발행하는 코드가
어디에도 없다**(2026-09-04 재확인, grep 결과 enum 정의 두 줄뿐).
프런트는 **3초 폴링**으로 버티고 있다 — 발행이 들어오면 폴링을 지운다.

### 🟡 B-4. 끝난 방도 404라 문구를 가를 수 없다

없는 PIN과 끝난 방이 모두 404 `ROOM_NOT_FOUND`다(`ErrorCode.kt:39`, 410은 없다).
`/join`에서 PIN을 친 학생에게 "없는 방"과 "이미 끝난 방"을 구분해 안내하지 못한다.
`ROOM_ENDED`(410)를 주면 문구를 가를 수 있다.

> 결제 화면(`/pay/[roomId]`)은 이제 방 상세의 `status`로 직접 가르므로 이 항목의 영향에서 벗어났다.
> 남은 자리는 **PIN 입장 흐름 하나**다.

### 🟡 B-7. AI 잔여 무료 횟수를 주는 응답이 없다 — **구현은 이미 있다**

`AiQuestionService.remainingFreeCount(userId)`가 **이미 있는데**(`AiQuestionService.kt:49`,
주석에 "화면에 'AI 생성 n회 남음'을 띄우는 데 쓴다"고까지 적혀 있다) **어떤 컨트롤러도 부르지
않는다.** 그래서 화면은 429가 날 때까지 남은 횟수를 모른다 — 지금은 표시를 감춰 뒀다.

**요청**: 서술형 분석 쪽이 이미 하는 방식(`remainingFreeAnalysis`,
`AnswerAnalysisController.kt:61`)과 똑같이, 세트 상세나 생성 응답에 `remainingFreeGeneration`을
실어 주세요. 계산은 이미 되어 있어 필드만 붙이면 된다.

> **정책은 소스로 확정됐다** — `application.yml:65` `ai-free-limit: 5 # (호스트, 누적 — 명세 "최초 5회 무료")`,
> `successCount`에 **날짜 필터가 없다.** 즉 **계정당 1회성 누적 5회이고 매일 리셋되지 않는다.**
> 시안의 "오늘 다 썼어요 / 내일 다시 5회가 채워져요"는 구현과 어긋난다 → 디자이너 항목
> (`DESIGN_GAPS.md` G-1의 세 질문 중 1번은 이걸로 답이 났다).

### 🟡 B-8. 유료 방을 만들 수 있는 테스트 계정이 필요하다

`GET /rooms/public?type=PAID` → **0건**이고 우리가 만들 수도 없다.
유료 방 개설은 Lv.3부터인데(`RoomService.kt:127`, `PAID_ROOM_MIN_LEVEL = 3`) 요건이 이렇다:

| Lv.3 요건                | 필요 | 지금 계정 |
| ------------------------ | ---- | --------- |
| 방 운영 횟수             | 20   | 3         |
| 누적 학생 수             | 150  | 4         |
| 평균 별점(평가 5건 이상) | 4.0  | 5.0 ✅    |

**그래서 결제 흐름을 실서버에서 한 번도 못 탔다**(목 모드로만 확인). 시딩 계정이든 등급을 올린
테스트 계정이든 하나 주시면 실서버에서 끝까지 확인할 수 있다. 로컬 DB를 우리가 직접 고치는 건
하지 않는다.

### 🟢 B-9. 정산 예금주 실명 확인이 죽어 있다

`SettlementAccount`에 `verifiedAt`·`verified`가 있고 스웨거에도 "예금주 실명 확인 여부"라고
적혀 있는데, **`verifiedAt`을 채우는 코드가 없다.** 계좌를 바꿀 때 `null`로 되돌리는 곳
(`SettlementAccount.kt:60`)만 있다 → **항상 `false`로 나간다.**

시안(W-10)은 "은행 조회 결과 ○○○"을 보여준다. 실명 조회를 붙일 계획인지, 아니면 필드를 빼고
시안에서도 지울지 정해 주세요.

### 🟢 B-10. 서술형 시안이 요구하는 계약 3종

v6 시안 `W-05/W-06 서술형 케이스`가 지금 계약으로는 못 채운다. 상세는 `DESIGN_GAPS.md` G-3.

| 필요한 것                                                     | 지금                                                                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 진행 중 학생별 3상태(미시작 / 작성 중 + 글자 수 / 제출 완료)  | 이벤트에 타이핑 상태·글자 수가 없다. 제출 여부만 안다                                                     |
| AI 첨삭 **3분류 집계**("모두 담음 3명 / 일부 2명 / 누락 1명") | `EssayAnalysisView`는 `keyPoints`·`missingPoints`·`suggestions`·`summary` 자유 텍스트다. 분류 enum이 없다 |
| **채점 기준**(rubric)                                         | 없다                                                                                                      |

> ✅ **모범답안은 있다** — `question.answer`를 `ReviewTargetResponse.modelAnswer`로 호스트에게 준다.
> 시안 요구 중 이 한 줄만 이미 채울 수 있다.

### 🟢 B-11. 시안에 버튼은 있는데 부를 API가 없는 것 3종

넷 중 하나(공개 목록 "오늘" 칩)는 해소됐고 셋이 남았다. 상세는 `DESIGN_GAPS.md` G-4.

| 시안                                 | 필요한 것                      | 확인                                                  |
| ------------------------------------ | ------------------------------ | ----------------------------------------------------- |
| `W-06e` **[시간 30초 더 주기]**      | 진행 중 문항 제한시간 **연장** | 세션 컨트롤러에 연장 없음(`/current/end` 수동 마감만) |
| `E-500` 칩 "예상 완료 · 오늘 14:30"  | 점검 정보                      | 헬스체크성 엔드포인트도 없음                          |
| `P-Web 공개 방 목록` **[알림 받기]** | 시작 예정 방 알림 구독         | `notification`에 구독 개념 없음(설정 토글 3종뿐)      |

셋 다 "**만들 계획이 있는가, 시안에서 뺄 것인가**"를 먼저 정해야 한다. 특히 `E-500`은 서버가
죽었을 때 보여줄 화면이라 API로 받는 게 오히려 앞뒤가 안 맞는다 — 정적 파일·CDN 쪽이 맞을 수 있다.

### 🔴 B-12. 문항 자동 마감이 DB에 안 남아 `QUESTION_ENDED`가 **매초** 다시 나간다 (2026-09-04 실서버 확인)

`QuestionTimeoutScheduler.closeExpiredQuestions()`가 `@Transactional(readOnly = true)`인데 그 안에서 부르는
`SessionService.endByTimeout()`(REQUIRED)이 같은 읽기 전용 트랜잭션에 **합류**한다. `sq.end(...)`의 변경이 flush되지
않아 `endedAt`이 계속 null이고, 다음 1초 틱에 같은 문항을 또 찾아 `closeQuestion` → `QUESTION_ENDED` + `RANKING_UPDATED`를
다시 발행한다. 호스트가 "다음 문항"을 눌러 `next()`가 쓰기 트랜잭션에서 닫아 줄 때까지 반복된다(브라우저 콘솔에서 20초 문항
하나에 1,500건 넘게 찍혔다).

- 프런트 영향: 다음 문항이 열린 뒤에도 1번 문항 `QUESTION_ENDED`가 계속 와서 진행 화면이 결과 화면으로 되돌아갔다(DESIGN_DIFF_20260904 Z1).
  프런트는 지나간 문항의 마감 이벤트를 버리도록 방어했지만(`session-reducer.ts`), 이벤트 홍수 자체는 서버에서 막아야 한다.
- 요청: 스케줄러의 `readOnly = true`를 빼거나, `endByTimeout`을 `REQUIRES_NEW`로. 재현: 문항 하나 시작 → 제한시간 뒤 WS 프레임 관찰.

### 🔴 B-13. 호스트 REST(`session/start`·`next`)가 브라우저에서 **간헐적으로 503**을 돌려준다

같은 요청을 curl로 보내면 204인데, 오늘 13:22·14:49·14:50에 웹에서 누른 `POST /rooms/{id}/session/start`·`/next`가 503으로
왔다(동작 자체는 서버에서 수행됐다 — 스냅샷은 넘어가 있었다). 앱 코드에는 503을 내는 곳이 없고(`ErrorCode`에 503 없음,
`GlobalExceptionHandler`는 500) 프로세스 재시작도 없었다(PID 35949, 11:47 기동). **그 시각의 서버 로그**를 봐야 한다.
프런트는 503을 "점검 중"(E-500)으로 올리므로 오판이 커진다.

### 🟡 B-14. 방 리포트의 **문항 단위** 선생님 코멘트를 저장할 곳이 없다 (2026-09-04 소스 확인)

시안 W-07 우측 패널의 "선생님 코멘트"는 **문항 하나에 대해 학생 전체에게 남기는 첨삭**이다.
서버에 있는 첨삭은 `PUT /rooms/{roomId}/answers/{answerId}/review` — **답안(학생) 단위**뿐이고
(`TeacherReviewController.kt:49`), 문항 단위로 저장할 자리가 엔티티에도 없다.

- 지금 화면: 버튼을 잠그고 "지금은 학생별 답안에만 첨삭을 남길 수 있어요"로 안내한다.
- 정할 것: **문항 단위 코멘트를 만들 것인가**(예: `PUT /rooms/{roomId}/questions/{questionId}/comment`),
  아니면 **시안에서 이 칸을 빼고** 학생별 첨삭으로 일원화할 것인가. 디자이너 확인도 함께 필요하다.

---

## 2. 프런트 — 화면이 안 열리는 것 (우선)

### ✅ F-1. 유료 방 카드가 전부 열리지 않는다 — **해결(2026-09-04, PR #19)**

- **무엇이었나**: 공개 방 계약에 `pin`이 없어 카드가 식별자로 방 id를 실었는데
  (`code: String(room.id)`), 링크는 PIN 시절 그대로 `/pay/{code}`였다.
  결제 화면이 그 값을 PIN으로 조회하니 `GET /rooms/pin/7` → 404. 서버 PIN은 항상 6자리라
  id가 우연히 맞을 일도 없어 **간헐이 아니라 100% 실패**였다.
- **어떻게 풀렸나**: 호출자 넷이 이미 전부 방 id를 쥐고 있어서 형식 판별 분기 없이
  **라우트의 뜻을 하나로 정했다** — `/pay/[code]` → `/pay/[roomId]`, `useRoomByPin` → `useRoom`.
  카드 뷰 타입의 `code: string`도 `roomId: number`로 바꿨다(이 이름이 착각의 원인이었다).
  `/login?next=` 두 자리도 같이 고쳤다.
- **같이 세운 것**: PIN 조회(`findByPinAndStatusIn`)가 끝난 방을 404로 막아 주던 안전망이
  id 조회에는 없다(ENDED·CANCELED도 200). `toPayGate(room)`이 `payable`/`free`/`closed`를
  가르고, 상태를 유·무료보다 **먼저** 본다. 계약 테스트 `features/participant/pay/adapt.test.ts`.
- **남은 것**: 결제 화면에 닿게 되자 드러난 표시 오류가 **F-12**다.

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

### ✅ F-4. AI 분석 요청 버튼이 `DONE`에도 보인다 — **해결(2026-09-04)**

- **어디**: `app/(participant)/result/[sessionId]/report/[questionNo]/page.tsx:69`
- `canRequest`가 `analysisStatus !== "PENDING"`이라 **이미 끝난 분석에도 버튼이 남았다.**
  `NOT_REQUESTED`·`FAILED`일 때만 보이도록 고쳤다.
- ⚠️ **처음 적은 근거는 틀렸다.** "다시 누르면 무료 횟수를 더 쓰거나 코인을 또 낸다"고 적었는데,
  서버가 이미 막고 있다 — `EssayAnalysisService.request`가 `existing != null && !existing.isFailed`면
  **차감 없이 기존 상태를 그대로 돌려준다**(백엔드 주석: "버튼을 두 번 눌렀다고 코인을 두 번 받지 않는다").
  돈이 새는 문제가 아니라, **눌러도 아무 일이 없는 버튼**이 남아 있던 화면 문제였다.

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
