# API 레이어 연결 준비 설계 (feature/api-layer)

- 날짜: 2026-08-31
- 브랜치: `feature/api-layer` (base: `origin/develop` = PR #3 머지 직후)
- 목적: 화면(A 담당: 학생·선생님·회원 전 구역)은 완성돼 있으니, **백엔드가 열리는 순간 env 한 줄로 붙도록** 전송·상태 층을 미리 만든다. 화면은 목 데이터 import 대신 쿼리 훅을 통해 데이터를 받는다.
- 관계 문서: `Passmate_Web_아키텍처_설계.md`(3층·상태 3분류·STOMP), `Passmate_Web_코드_패턴_규칙.md`(레이어 경계·네이밍·AppError). 이 스펙은 두 문서를 **이 리포의 현재 코드에 적용하는 방법**만 적는다.

## 1. 배경 — 계약의 실제 소재

- 두 설계 문서가 단일 진실로 지목한 `specs/001-passmate-mvp/contracts/rest-api.md`·`websocket-events.md`는 **어디에도 없다**(프론트·KMP·`../docs`, 백엔드 리포는 README뿐 — 2026-08-31 확인).
- 살아 있는 계약은 **KMP 앱의 `shared` 모듈**(`../Passmate-KMP/shared/src/commonMain/.../*/data/{dto,remote}`)이다. 팀장이 같은 계약으로 짠 코드라, 웹 DTO는 여기와 **이름·필드 1:1**로 맞춘다. 추출 결과: 세션 스크래치패드 `kmp-contract-inventory.md` → 요약은 §4.
- KMP에 없는 호스트 전용 호출(세션 제어·에디터·첨삭·정산·코인 충전 등)은 `../docs/tasks.md`의 백엔드 태스크에 적힌 `METHOD /path`를 따르고, 응답 모양은 화면이 필요로 하는 최소로 **초안** 표시(`@draft` 주석)한다. 계약이 오면 이 파일들만 고친다.

## 2. 범위

### 포함

1. `lib/types/` — 계약 1:1 DTO를 도메인별 파일로 분할(`dto.ts`가 363줄 → 300줄 규칙). `dto.ts`는 re-export 허브로 유지해 기존 import를 깨지 않는다.
2. `lib/api/` — 도메인별 api 함수: `rooms` · `question-sets` · `sessions`(제어·스냅샷·답변·힌트) · `participations`(결과·리포트·claim) · `me`(프로필·참여·리포트·AI 사용량·등급·정산·코인) · `payments` · `ratings` · `materials`. 전송·DTO 반환·AppError까지만.
3. `lib/queries/` — 조회 `use<대상>`, 뮤테이션 `use<동사><대상>`, 키 상수는 훅 파일 상단. 성공 시 `invalidateQueries`.
4. `lib/mocks/` — 목 라우트 표 확장. **`features/**/mock.ts`의 데이터는 DTO 모양으로 옮겨 `lib/mocks/<domain>.ts`로 이동**하고 feature 폴더의 mock.ts는 삭제한다(목 모드에서 화면이 지금과 똑같이 보여야 한다).
5. `lib/stomp.ts` + `lib/types/events.ts` + `lib/stores/session-store.ts` — T020 + 설계 §5. 이벤트 리듀서와 재접속 스냅샷 교체는 순수 함수로 두고 Vitest로 검증.
6. 화면 연결 — `TODO(API)`가 있는 page 컨테이너를 쿼리 훅/뮤테이션으로 교체. `*View`는 props만 받는 규칙 유지.
7. 검증 — 기존 5개 + 신규 테스트(session-store 리듀서·스냅샷, 목 라우트 커버리지) 통과, `pnpm build`·`check:routes` 통과.

### 제외 (YAGNI)

- 실제 STOMP 브로커 연결 검증(백엔드 없음) — `@stomp/stompjs` 의존성은 추가하되 연결은 목 모드에서 no-op.
- 포트원 실결제(`lib/portone.ts` 목 유지), Sentry, Playwright.
- 관리자(`/admin/*`) 구역 — 이미 연결돼 있고 팀원 B 소유.
- 시안에 없는 화면(A-1 학생 결과 등, `DESIGN_GAPS.md`) 구현 — 시안이 오면 별도 브랜치.

## 3. 기술 결정

| 항목 | 결정 | 이유 |
| --- | --- | --- |
| DTO 원천 | KMP `shared` DTO 1:1(직렬화 이름 그대로) | 유일한 실물 계약. 백엔드도 같은 문서로 만든다 |
| KMP에 없는 호출 | tasks.md 경로 + 화면 최소 응답을 `@draft`로 표시 | 임의 설계는 금지지만 화면 연결은 지금 해야 함 → 초안임을 코드에 남겨 계약 도착 시 한 곳만 수정 |
| 화면 전용 파생 | 쿼리 훅의 `select`에서 계산 | 규칙 §5 — 전송 층은 가공 금지. 기존 View의 prop 모양은 최대한 유지해 리스크 최소화 |
| 목 데이터 위치 | `lib/mocks/<domain>.ts` 하나로 통합, feature `mock.ts` 삭제 | CLAUDE.md "백엔드 연동 시 lib/mocks 통째로 걷어낸다"를 지키려면 목이 한 폴더에 있어야 함 |
| 목 모드 판별 | 기존 `IS_MOCK`(env 비면 목) 유지 | 이미 admin이 이 방식 |
| 실시간 상태 | Zustand `session-store` + 순수 리듀서 `reduce(state, event)` | 설계 ADR-2. 리듀서를 스토어 밖 순수 함수로 두면 테스트에 목이 필요 없다 |
| 호스트 진행 라우트 | 기존 3라우트(`lobby`/`live`/`result`) 유지 | 설계 문서는 단일 페이지 상태 머신을 권하지만 시안·routes·랜딩 목업이 3라우트에 의존. 대신 **세 페이지가 같은 `session-store`를 구독**하고 phase 전환 시 `router.replace`로만 이동해 "서버 이벤트만이 화면을 바꾼다" 원칙은 지킨다 |
| 코인 vs 직접 결제 | KMP에 `CoinDto`·`ChargeDto`·`EntryPaymentDto`가 있으면 그 모양대로, 없으면 `@draft` | §4에서 확정 |
| 에러 코드 상수 | `lib/types/error-codes.ts`에 서버 `code` 문자열 모음 | 화면이 문자열 리터럴을 흩뿌리지 않게 |

## 4. 계약 대조 요약 (KMP 인벤토리 반영)

KMP `shared`가 실제 호출·직렬화하는 것: REST 46 호출 · DTO 71 · STOMP 이벤트 19종 · 구독 4개. 코드 주석 기준 "2026-08-28 백엔드 API 명세서"에 정합화됨. 실서버 검증은 아직 없음.

### 4-1. 전송 규칙 (웹 client.ts에 반영할 차이)

| 항목 | KMP | 현재 웹 | 조치 |
| --- | --- | --- | --- |
| base | `http://host:8080/api/v1`, WS `ws://host:8080/ws` | `NEXT_PUBLIC_API_BASE_URL` 그대로 prefix | env 값에 `/api/v1`까지 넣는다. `NEXT_PUBLIC_WS_URL` 추가(없으면 base에서 유도) |
| 프로필 | `GET /users/me` → `UserProfileResponse`(role·id 없음) | `GET /me` → `MeResponse{id,name,email,role,hostLevel}` | 경로를 `/users/me`로. `MeResponse` = `UserProfileResponse` + `userId?`·`role?`(`@draft`, D-9) |
| refresh | `{accessToken, refreshToken?}` — 미회전 시 생략 | 둘 다 필수로 가정하고 저장 | 생략 시 기존 refresh 유지 |
| 401 | `code=LOGIN_REQUIRED`는 refresh 대상 아님(게스트 유료 방) · 회원 access 있을 때만 refresh | 401이면 무조건 refresh | 회원 토큰 있을 때만 refresh, `LOGIN_REQUIRED`는 코드 보존해 즉시 throw |
| 402 | `PaymentRequired`(코인 부족) | 매핑 없음(Unknown) | `AppErrorKind`에 `PaymentRequired` 추가 |
| 인증 헤더 | access ?? **guestToken** | access만 | 게스트 토큰(입장 응답 `participantToken`) 보관·첨부 |
| multipart | PTT 클립 `POST …/session/hints` (part `audio`, `durationMs`) | 없음 | `requestMultipart` 헬퍼 |
| 페이지네이션 | `?cursor=` · `{items, nextCursor, hasNext}` | — | `useInfiniteQuery` 대신 1페이지만 우선(화면이 페이지네이션 없음) |

### 4-2. 도메인별 커버리지

| 도메인 | KMP에 있음 (그대로 1:1) | 없음 → `@draft` (tasks.md 경로) |
| --- | --- | --- |
| auth | refresh · logout · Google OAuth(`client=mobile`) | 웹 콜백(`client=web`), 이메일 로그인 |
| rooms | `GET /rooms/pin/{pin}` · `POST /rooms` · hosted 목록 · 참가자 입장/목록/퇴장 · `GET /rooms/public` | 호스트용 `GET /rooms/{roomId}` · 취소 · 강퇴 |
| session | 스냅샷 · 답 제출 · 힌트 목록 · start/next/current-end/end/lock · submissions · 힌트 업로드 | — |
| question-sets | 목록(`status`·`cursor`) | generate · 생성 · 상세/PATCH · 문항 CRUD · confirm · clone · `GET /me/ai-usage` · materials |
| results | 내 결과 · 내 리포트 · 방 전체 결과 | 서술형 답안 목록 · 첨삭 저장 · 내보내기 |
| me | 프로필 GET/PUT/DELETE · 마이페이지(참여) · 등급 · 뱃지 · 알림 설정 · 게스트 기록 claim · 호스트 프로필 · 차단 · 신고 | 비밀번호 변경 |
| payments | 코인 잔액·내역 · 충전 생성/확인(포트원 V2) · 참가비 차감 · 수익/정산 · 정산 계좌 · 기본 결제수단 | — |
| ratings | 제출(`stars, tags[5종], comment`) | — |
| STOMP | `/topic/rooms/{id}` · `/topic/rooms/{id}/host` · `/user/queue/feedback` · `/user/queue/errors`, envelope `{type,ts,data}`, 19 이벤트, 선형 백오프 재연결 → `GET /rooms/{id}/session` 스냅샷(404=WAITING) → `frame.ts < snapshot.ts` 폐기 | — |

이벤트 이름은 **코드 기준**(`SESSION_STARTED`/`SESSION_ENDED`/`HINT_PUBLISHED`)을 따른다 — 설계 문서의 `GAME_STARTED`/`GAME_FINISHED`/`VOICE_HINT`는 구버전.

### 4-3. 웹 라우트 `[code]`의 의미

계약은 `roomId`(숫자)와 `pin`(6자리)을 구분하고 세션 API는 전부 `roomId`를 쓴다. 웹 URL의 `[code]`는 **PIN**으로 정하고(`/play/482913`, `/host/rooms/482913/lobby`), 컨테이너가 `GET /rooms/pin/{pin}`으로 `roomId`를 얻어 하위 훅에 넘긴다(`useRoomByPin`). 호스트 화면은 hosted 목록에도 `roomId`가 있으므로 같은 훅으로 통일한다.

## 5. 파일 배치

```
src/lib/
├── types/
│   ├── dto.ts                # re-export 허브 (기존 import 유지)
│   ├── dto/auth.ts           # TokenPair·MeResponse·UserProfile…
│   ├── dto/rooms.ts          # RoomInfo·CreateRoom·Join·Participants·PublicRoom·HostedRooms
│   ├── dto/question-sets.ts  # QuestionSet·Question·Generate·Confirm·Clone
│   ├── dto/sessions.ts       # Snapshot·SubmitAnswer·Submissions·VoiceHints·제어 응답
│   ├── dto/results.ts        # SessionResult·LearningReport·RoomReport·Review
│   ├── dto/me.ts             # MyPage·Grade·Badges·HostLevel·AiUsage·Participations
│   ├── dto/payments.ts       # Coin·Charge·EntryPayment·Earnings·Settlements
│   ├── dto/ratings.ts
│   ├── dto/admin.ts          # 기존 관리자 DTO 그대로 이동
│   ├── events.ts             # STOMP ServerEvent 판별 유니온 (계약 type 이름 그대로)
│   ├── error-codes.ts
│   └── app-error.ts          # 기존
├── api/
│   ├── client.ts             # 기존 + multipart 업로드 헬퍼
│   ├── auth.ts · admin.ts    # 기존
│   ├── rooms.ts · question-sets.ts · sessions.ts · participations.ts
│   ├── me.ts · payments.ts · ratings.ts · materials.ts
├── queries/
│   ├── use-rooms.ts · use-question-sets.ts · use-session.ts(제어 뮤테이션)
│   ├── use-participations.ts · use-me.ts · use-payments.ts · use-ratings.ts
│   └── (기존 admin 훅 유지)
├── stores/
│   ├── auth-store.ts         # 기존
│   └── session-store.ts      # phase·participants·currentQuestion·endsAt·submissions·ranking·hints + reduce()
├── stomp.ts                  # connect/subscribe/reconnect → snapshot → store 교체. 목 모드 no-op
└── mocks/
    ├── handlers.ts           # 라우트 표 (METHOD path → 응답)
    ├── auth.ts · admin.ts    # 기존
    ├── rooms.ts · question-sets.ts · sessions.ts · results.ts · me.ts · payments.ts
    └── fixtures.ts           # 화면 목업에서 옮긴 공용 값(회원 이한결·방 DEMO01·문제 세트…)
```

## 6. 데이터 흐름 (예: 방 만들기 → 대기실)

1. `new-room-form` `onSubmit` → page 컨테이너 `useCreateRoom().mutate(body)`
2. `api/rooms.createRoom` → `POST /rooms` → `RoomInfoResponse`
3. `onSuccess`: `invalidateQueries(['rooms','hosted'])` → `router.push('/host/rooms/{pin}/lobby')`
4. lobby 컨테이너: `useRoom(pin)`(REST) + `useSessionConnection(pin)`(STOMP 구독) → `session-store`
5. `PARTICIPANT_JOINED` → `reduce()` → participants 갱신 → `LobbyView` 리렌더
6. "세션 시작" → `useStartSession(pin).mutate()` (REST만) → 서버 `GAME_STARTED` → phase RUNNING → 컨테이너 `useEffect`가 `router.replace('/host/rooms/{pin}/live')`

## 7. 오류 처리

- 전송 층은 기존 `AppError` 그대로. 화면은 `error.code`로 분기: `HOST_LEVEL_REQUIRED`·`FREE_QUOTA_EXCEEDED`·`AI_GENERATION_FAILED`·`NICKNAME_TAKEN`·`RECORD_PURGED`·`ALREADY_RATED`·`LOGIN_REQUIRED`·`PAYMENT_REQUIRED` (`error-codes.ts`).
- 조회 실패 = `ScreenError`+재시도, 뮤테이션 실패 = 토스트/인라인. 시안이 없는 상태는 기존 공용 컴포넌트로 처리하고 `DESIGN_GAPS.md`에 기록.

## 8. 테스트

| 대상 | 방법 |
| --- | --- |
| `session-store` `reduce()` 8종 이벤트 + 스냅샷 교체(ts 이전 이벤트 폐기) | Vitest, 순수 함수 |
| 목 라우트 표가 모든 api 함수 경로를 덮는지 | Vitest: `handlers.ts` 키 ↔ api 함수가 만드는 경로 대조 |
| 기존 `client.test.ts` 5개 | 유지 |
| 화면 | `pnpm build` + `check:routes`(40경로) + 목 모드 수동 확인(Chrome) |

## 9. 가정 (사용자 부재 중 내가 정한 것 — 확인 필요)

1. KMP DTO를 계약으로 삼는다. 백엔드 계약이 다르게 오면 `lib/types/dto/*`·`lib/mocks/*`만 수정.
2. 호스트 세션 제어·에디터·첨삭·코인 충전·정산·프로필 수정 등 KMP에 없는 호출은 `@draft`로 만든다.
3. 호스트 진행 3라우트를 유지한다(단일 페이지로 합치지 않음).
4. 이메일 로그인·회원가입·비밀번호 변경·결제 수단 관리·알림 설정·탈퇴는 계약이 전혀 없으므로 **UI는 그대로 두고 api 함수를 `@draft`로만** 둔다(연결 시도 안 함).
5. 커밋은 작업 단위로 나눠 남기고 푸시하지 않는다.

### 실행 결과 (Task 1~13 완료 후, 2026-08-31)

1. **KMP DTO를 계약으로 삼음** — 그대로 진행. `lib/types/dto/*`(auth·rooms·question-sets·sessions·results·me·payments·ratings·admin·common)로 분할하고 `dto.ts`는 re-export 허브로 유지해 기존 import를 깨지 않았다. 백엔드 계약이 실제로 오면 이 폴더와 `lib/mocks/*`만 손댈 수 있는 상태.
2. **KMP에 없는 호출은 `@draft`** — 그대로 진행. Task 13 기준 `@draft` 35건이 `lib/api/{auth,question-sets,results}.ts`·`lib/types/dto/{auth,question-sets,results}.ts`·`lib/mocks/{question-sets,results}.ts`에 남아 있다(문제 세트 에디터 생성·문항 CRUD·confirm·clone·`GET /me/ai-usage`·자료 업로드, 서술형 답안 목록·첨삭 저장, `client=web` 로그인 콜백, `MeResponse.role`/`userId`). 각 주석은 `tasks.md` 태스크 번호 또는 `DESIGN_GAPS.md` 항목(D-1·D-9 등)을 인용한다. `TODO(API)` 마커는 8건이 남았고 전부 `DESIGN_GAPS.md`(C-1·C-4·C-5·D-11) 또는 아직 계약이 없는 구체적 사유를 적었다.
3. **호스트 진행 3라우트 유지** — 그대로 진행하되, §6 데이터 흐름 예시(“lobby 컨테이너가 `useSessionConnection` 호출”)에서 한 가지 벗어났다: 실시간 연결은 세 page.tsx가 각자 잡지 않고 **`src/app/host/(flow)/rooms/[code]/layout.tsx` 한 곳**에서 잡아 세 화면이 공유한다. 페이지 전환마다 훅이 재마운트되면 `session-store.reset()`이 방금 받은 `QUESTION_ENDED`(reveal)를 지워버려 화면이 깜빡이고 스냅샷을 다시 받아오는 문제가 있었기 때문(레이아웃 파일 상단 주석에 리뷰 결정으로 기록).
4. **이메일 로그인·비밀번호 변경·결제 수단 관리·알림 설정·탈퇴는 연결 시도 안 함** — 그대로 진행. `me/password`·`me/payment-methods`·`me/notifications`·`login`(이메일 로그인부) 화면은 UI만 남기고 각각 `TODO(API)`로 DESIGN_GAPS C-1/C-4/C-5/D-11을 인용한다. 탈퇴(`DELETE /users/me`)는 KMP 계약이 있어 정상 연결됨(가정 4의 "탈퇴"는 실제로는 계약이 있었다).
5. **커밋은 작업 단위로, 푸시 안 함** — 그대로 진행. Task 1~13이 각각 최소 1개 커밋으로 남았고(`git log`), Task 13 완료 시점까지 `origin/develop`으로 푸시하지 않았다.
