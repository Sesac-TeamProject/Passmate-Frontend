# Passmate Web 코드 패턴 규칙

이 문서는 Passmate-Frontend(선생님 웹, Next.js) 구현 시 작성하는 코드의 고정 규칙이다. KMP 학생 앱의 `Passmate_코드_패턴_규칙.md`와 같은 원칙을 웹(React/Next.js) 관례로 번역했다. 구조·의존 방향·상태 설계는 [Passmate_Web_아키텍처_설계.md](Passmate_Web_아키텍처_설계.md)(이하 "설계 문서")를 따른다.
계약 문서: REST·WebSocket DTO/이벤트의 단일 진실은 `specs/001-passmate-mvp/contracts/`(rest-api.md·websocket-events.md)이다. 구현이 계약과 다르면 계약을 먼저 갱신한다.

## 1. 공통 원칙

- 기능보다 일관성을 우선한다.
- 한 파일/컴포넌트는 하나의 책임만 가진다.
- 예외를 UI까지 전파하지 않고 `AppError`로 변환한다 (전송 층 공통).
- 권한·검증의 최종 권위는 서버다. 클라이언트 가드는 UX 목적이며, 가드를 통과했더라도 서버 4xx를 항상 처리한다.
- 하드코딩 문자열/매직넘버를 최소화하고 상수로 분리한다.
- **서버 권위 원칙**: 점수 계산·타이머 만료·정오 판정은 전부 서버가 한다. 웹은 서버가 준 값을 렌더링만 한다. 남은 시간은 서버 `endsAt`과의 차로만 표시하고, 마감 처리는 `QUESTION_ENDED` 수신으로만 반영한다.

## 2. 레이어 경계 규칙

- 3층 경계(설계 문서 §1)를 지킨다: `app/`·`components/` → `lib/queries`·`lib/stores` → `lib/api.ts`·`lib/stomp.ts`.
- **컴포넌트·page에서 `fetch`/STOMP 직접 호출 금지** — 항상 쿼리 훅 또는 스토어 액션을 경유한다.
- 전송 층(`api.ts`·`stomp.ts`)은 전송만 한다: 요청, 계약 1:1 DTO 반환, `AppError` 변환. 화면용 가공·파생은 상태 층에서 한다.
- DTO 타입은 `lib/types/`에 계약 문서와 1:1로 둔다. 계약에 없는 필드·이벤트를 임의 추가하지 않는다 (계약 갱신이 먼저).

## 2-1. 라우팅 규칙

- App Router 경로는 tasks.md의 web 경로를 그대로 쓴다: `/login`, `/auth/callback`, `/dashboard(:/history/:earnings)`, `/rooms/new`, `/rooms/[pin]/host`, `/question-sets/[id]`, `/sessions/[id]/stats`, `/sessions/[id]/review`, `/admin/settlements`, `/admin/branded`.
- `/login`·`/auth/callback` 외 전 화면은 로그인 필수다. 미로그인 진입은 `/login?next=<원경로>`로 보내고 로그인 성공 시 `next`를 재실행한다.
- `/admin/*`은 프로필 `role=ADMIN`을 추가 확인한다. 서버 403 응답 처리도 항상 둔다.
- **호스트 화면은 단일 페이지 상태 머신이다**: `rooms/[pin]/host` 안에서 `phase`(WAITING/RUNNING/FINISHED)로 대기실→진행→결과를 전환한다. 라우트를 나누지 않는다.
- 화면 전환(phase 전환 포함)의 트리거는 **서버 이벤트만**이다. 제어 버튼(시작/다음/종료)은 REST 호출만 하고 화면을 직접 전환하지 않는다 — 전환은 `GAME_STARTED`/`GAME_FINISHED` 수신으로 일어난다.
- 진행 중(RUNNING) 페이지 이탈은 즉시 허용하지 않고 확인 다이얼로그를 거친다.
- 종료된 방(410)·잘못된 PIN(404)은 안내 후 `/dashboard`로 보낸다.

## 3. 디렉터리/파일 규칙

- 디렉터리 구조는 설계 문서 §2를 따른다. 단일 파일로 시작하고 300줄 초과 시 같은 이름의 폴더로 분할한다.
- 파일명: 컴포넌트 파일은 kebab-case(`ptt-button.tsx`), 컴포넌트명은 PascalCase(`PttButton`). tasks.md에 명시된 파일명은 그대로 쓴다.
- 하나의 파일에 export 컴포넌트는 1개를 기본으로 한다. 보조 컴포넌트는 같은 파일의 비-export로 둔다.
- 공통 컴포넌트는 `components/`, 화면 전용 조각은 해당 라우트 폴더에 둔다. 두 화면 이상에서 쓰이면 `components/`로 승격한다.

## 4. 네이밍 규칙

- 컴포넌트: PascalCase, 화면 렌더 전용은 `*View` (`HostWaitingView`)
- 훅: `use` + 대상 (`useRoomInfo`, `useCreateRoom`) — 쿼리 훅은 조회=`use<대상>`, 뮤테이션=`use<동사><대상>`
- 스토어: `use<이름>Store` (`useAuthStore`, `useSessionStore`)
- api 함수: 동사+대상 (`createRoom`, `generateQuestionSet`, `confirmPayment`)
- STOMP 이벤트 타입: 계약의 `type` 이름 그대로 (`QUESTION_STARTED`, `RANKING_UPDATED`)
- Boolean은 `is/has/can` 접두어를 사용한다.
- 쿼리 키: 배열 계층 `['rooms', pin]`, `['sessions', id, 'stats']` — 키 상수는 기능별 쿼리 훅 파일에 모은다.

## 5. API 레이어 규칙

- `api.ts` 공통 래퍼가 담당하는 것: baseURL, 인증 헤더, **401 → refresh 1회 → 재시도**, 오류 응답 `{code, message}`의 `AppError` 변환, 파일 다운로드 헬퍼.
- 토큰 만료는 401이다. **403을 토큰 만료로 오인하지 않는다** — 403은 권한 거부(`FORBIDDEN`/`HOST_LEVEL_REQUIRED`/`FREE_QUOTA_EXCEEDED`)로만 해석한다.
- 기능별 api 함수는 전송·DTO 반환까지만 한다. 응답 가공은 호출한 쿼리 훅에서 `select`로 한다.
- 요청·응답 타입은 계약 문서 기준으로 명시한다. `any` 금지.

## 6. 상태 관리 규칙

상태를 만들기 전에 설계 문서 §4의 판별표로 분류부터 한다.

- **서버 상태 = TanStack Query만**: 서버가 원본인 데이터를 Zustand·useState에 복사해 두지 않는다.
- **실시간 세션 상태 = `session-store`만**: STOMP로 갱신되는 상태를 컴포넌트 로컬에 흩뜨리지 않는다. 리듀서 매핑은 설계 문서 §5의 표를 따르고, `RANKING_UPDATED` 같은 스냅샷성 페이로드는 병합이 아니라 **전체 교체**한다.
- **로컬 UI 상태 = useState**: 폼 입력·다이얼로그 열림·선택 탭. 전역 스토어에 올리지 않는다.
- 뮤테이션 성공 시 관련 쿼리 키를 `invalidateQueries`한다. 낙관적 갱신은 꼭 필요한 곳(예: 문항 편집)만.
- Zustand 구독은 selector로 필요한 조각만 읽는다 (`useSessionStore(s => s.ranking)`) — 스토어 전체 구독 금지.
- 파생 값(정답률·정렬된 랭킹)은 저장하지 않고 selector 또는 렌더 시 계산한다.

## 7. 단발 효과 규칙 (KMP `event` 미러)

- 토스트·`router.push`·다운로드 시작 같은 단발 효과는 **발생 지점에서 직접 실행**한다: 뮤테이션 `onSuccess/onError`, STOMP 이벤트 처리 `useEffect`.
- 단발 효과를 스토어 상태로 저장했다가 소비하는 구조 금지 (재렌더에 재실행되는 사고 방지 — KMP의 "event를 상태처럼 저장 금지" 미러).
- STOMP 이벤트 → 네비게이션/토스트가 필요하면 page의 `useEffect`에서 스토어의 `phase` 변화를 관찰해 처리한다.

## 8. 인증/권한 규칙

- 선생님 웹에 게스트는 없다. 전 화면 로그인 필수(§2-1), 학생용 게스트 플로우는 KMP 앱 담당이다.
- 토큰: access=메모리(auth-store)·refresh=localStorage(설계 문서 ADR-3). 새로고침 시 refresh 재발급으로 세션을 복원한다.
- 서버 오류 코드 연동 (계약 §공통 오류 코드):
  - `HOST_LEVEL_REQUIRED`(403) → 유료 방 개설 거부 — 필요한 등급 조건 안내
  - `FREE_QUOTA_EXCEEDED`(403) → AI 무료 한도 소진 — "추후 코인 결제 예정" 안내, 직접 작성·세트 복제 경로는 계속 제공
  - `AI_GENERATION_FAILED`(502) → 오류 안내 + 재요청 버튼 (재시도는 서버가 이미 했음)
  - `GONE`(410) → 종료 방·마감 문항 — 안내 후 복귀
- AI 출제 화면은 `GET /me/ai-usage`의 잔여 무료 횟수를 항상 표시한다 (FR-061).

## 9. 비동기/실시간 규칙

- STOMP 구독은 `stomp.ts` 하나로 일원화한다. 컴포넌트가 개별 구독을 만들지 않는다.
- 재연결은 `stomp.ts`+`session-store`가 담당한다: 재연결 → 재구독 → `GET /rooms/{pin}/session/snapshot` → 스토어 통째 교체 → 스냅샷 ts 이전 이벤트 폐기. 화면마다 재연결 로직을 중복 구현하지 않는다.
- 제출성 뮤테이션(세션 제어·첨삭 저장·정산 상태 변경)은 `isPending` 동안 버튼을 비활성화한다. 최종 중복 차단은 서버(409)가 한다.
- 타이머 표시는 `endsAt` 기반 파생 계산만 한다. `setInterval`로 남은 시간을 상태에 적산하는 구현 금지.
- PTT 녹음(MediaRecorder)은 `ptt-button.tsx` 안에 캡슐화한다 — 홀드 중 녹음, 릴리즈 시 업로드 뮤테이션 호출까지. 페이지는 결과만 받는다.

## 10. 오류 처리 규칙

- `AppError`는 KMP와 같은 분류를 쓴다: `Unauthorized`, `PermissionDenied`, `ValidationFailed`, `NetworkError`, `NotFound`, `Conflict`, `Gone`, `Unknown` + 서버 `code` 원문 보존.
- 서버 `code`(예: `NICKNAME_TAKEN`, `HOST_LEVEL_REQUIRED`, `FREE_QUOTA_EXCEEDED`, `RECORD_PURGED`)로 화면 문구를 분기한다. HTTP 상태 숫자로 분기하지 않는다.
- 화면에는 안전한 사용자 문구만, 콘솔·Sentry에는 원인(cause)을 남긴다.
- 쿼리 에러는 화면 단위 에러 상태(재시도 버튼 포함)로, 뮤테이션 에러는 토스트+인라인 안내로 처리한다. 빈 상태/에러 상태 컴포넌트를 항상 제공한다.

## 11. UI 컴포넌트 규칙

- shadcn/ui 컴포넌트를 우선 사용하고, 도메인 공통 컴포넌트(`host-rating-badge` 등)는 `components/`에 승격한다.
- 색상 hex 하드코딩 금지 — Tailwind 테마 토큰(시맨틱)만 사용한다. 토큰 이름은 KMP `PassmateColors`와 의미 단위로 맞춘다(값 동기화는 디자인 시스템 문서에서, 추후 작성).
- 접근성(라벨, 클릭 영역, 색 대비)을 기본 준수한다.

## 11-1. 화면 2단 구성 (KMP Screen/ContentScreen 미러)

- page(컨테이너)는 데이터 연결·효과·네비게이션만: 쿼리 훅·스토어 구독, `useEffect`(이벤트→네비게이션), 다이얼로그·시트 열림 소유.
- `*View`(렌더 전용)는 props(`상태 + 콜백`)만 받는 순수 컴포넌트로 분리한다. 훅(쿼리·스토어) 호출 금지 — `useState` 수준의 순수 UI 상태만 허용.
- 다이얼로그·시트·오버레이의 표시 여부와 수명은 컨테이너(page)가 소유한다.

```tsx
// app/rooms/[pin]/host/page.tsx — 컨테이너
"use client";
export default function HostPage({ params }: { params: { pin: string } }) {
  const phase = useSessionStore((s) => s.phase);
  const participants = useSessionStore((s) => s.participants);
  const { mutate: startSession, isPending } = useStartSession(params.pin);

  useSessionConnection(params.pin); // 구독·재연결·스냅샷 (커스텀 훅)

  if (phase === "WAITING") {
    return (
      <HostWaitingView
        participants={participants}
        isStarting={isPending}
        onStart={() => startSession()}
      />
    );
  }
  if (phase === "RUNNING") {
    return <HostRunningView /* … */ />;
  }
  return <HostFinishedView /* … */ />;
}

// 렌더 전용 — 훅 없음, props만
function HostWaitingView({ participants, isStarting, onStart }: HostWaitingViewProps) {
  return (
    <div>
      {participants.map((p) => (
        <ParticipantChip key={p.id} nickname={p.nickname} />
      ))}
      <Button onClick={onStart} disabled={isStarting}>
        세션 시작
      </Button>
    </div>
  );
}
```

- 핵심: 컨테이너=상태·효과, `*View`=`상태+콜백` 렌더 전용. Storybook/프리뷰·테스트는 `*View` 기준.

## 12. 테스트 규칙

- `session-store` 리듀서와 재접속 스냅샷 교체를 최우선 단위 테스트한다 (순수 함수 — Vitest).
- `api.ts`의 401 refresh 재시도·`AppError` 매핑을 테스트한다.
- 핵심 플로우 E2E(방 생성→출제→진행→통계)는 Playwright `tests/e2e/core-flow.spec.ts` (SC-007, tasks T111).
- 가드 시나리오: 미로그인→`/login?next=` 복귀, ADMIN 아닌 계정의 `/admin` 차단.

## 13. 금지 규칙

- 컴포넌트·page에서 `fetch`/STOMP 직접 호출 금지 (항상 queries/stores 경유)
- 서버 상태를 Zustand·useState에 복사 보관 금지 (원본은 Query 캐시)
- 클라이언트에서 점수 계산·타이머 만료 판정·정오 판정 금지 (서버 권위 — 렌더만)
- 정답을 클라이언트에 캐시하거나 `QUESTION_STARTED` 페이로드에 정답이 있다고 가정하는 구현 금지 (정답은 `QUESTION_ENDED`에서만 온다)
- 단발 효과를 스토어에 저장했다가 소비하는 구조 금지
- HTTP 상태 숫자로 화면 문구 분기 금지 (서버 `code` 기준)
- 계약 문서에 없는 필드·이벤트를 임의 추가하는 구현 금지 (계약 갱신이 먼저)
- Next API Routes·서버 액션으로 백엔드 호출을 우회하는 구현 금지
- `any` 타입, `@ts-ignore` 금지 (불가피하면 사유 주석과 함께 `@ts-expect-error`)

## 14. 코드 리뷰 체크리스트

- 레이어 경계 위반이 없는가 (컴포넌트의 fetch/STOMP 직접 호출)
- 상태 3분류가 올바른가 (서버 상태의 스토어 복사 없음)
- 에러 처리가 `AppError`+서버 `code` 기준인가, 401/403 해석이 올바른가
- 라우트 가드(로그인·ADMIN)와 서버 4xx 처리가 모두 있는가
- 화면 전환이 서버 이벤트로만 일어나는가 (제어 버튼의 직접 전환 없음)
- `*View`가 훅 없이 props만 받는가, 다이얼로그 수명을 컨테이너가 소유하는가
- 재접속 복구가 스냅샷 프로토콜을 따르는가
- 뮤테이션 성공 시 쿼리 무효화가 있는가, in-flight 비활성화가 있는가
- 쿼리 키·이벤트 타입이 규칙(§4)과 계약에 맞는가

## 15. 적용 우선순위

1. 서버 권위 원칙 + 재접속 스냅샷 프로토콜
2. 레이어 경계 (전송 층 경유·직접 호출 금지)
3. 상태 3분류 경계와 `AppError`(서버 `code` 보존) 일관성
4. 라우트 가드 (로그인·ADMIN)
5. 화면 2단 구성·테스트 규칙

## 16. 코드 배치 규칙 (TS/React — KMP §16의 완화 적용판)

- 컴포넌트 내부 순서: ① 훅 호출(쿼리·스토어·useState) 상단 → ② 파생 값·핸들러 정의 중간 → ③ `useEffect` → ④ `return`(JSX) 하단.
- 훅은 조건문 안에서 호출하지 않는다 (React 규칙).
- 함수 내부에서는 변수 선언을 상단에 모으고, 실행(호출)을 하단에 모은다. 선언 블록과 호출 블록 사이는 개행한다.
- 조건 분기는 `if-else`를 기본으로 한다. 조기 반환은 렌더 가드(로딩/에러/빈 상태의 early return)에만 허용한다 — 이 경우 컴포넌트 상단에 모아 배치한다.
- 이벤트 핸들러는 `handle*` 네이밍(`handleStartClick`), props 콜백은 `on*`(`onStart`).
- 한 파일의 export는 1개 기본, 보조 컴포넌트·타입은 파일 하단에 배치한다.
