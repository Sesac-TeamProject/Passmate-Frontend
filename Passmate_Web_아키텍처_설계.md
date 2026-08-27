# Passmate Web 아키텍처 설계 — Next.js 실용 3층 구조

**작성**: 2026-08-26 · **상태**: 확정 (구현 착수 전 설계) · **작성 목적**: 팀장(홍희표)이 웹 담당(서승혁, 이한결)에게 전달하는 설계 기준. 리포(Passmate-Frontend) 반영은 웹 담당이 한다.
**담당 범위**: 이 문서는 **선생님 웹(Passmate-Frontend, 담당 서승혁, 이한결)만** 대상이다. 백엔드=전혜림, KMP 학생 앱=홍희표. 서버는 계약 문서를 통해서만 연동한다.
**관계 문서**: 코드 레벨 규범은 [Passmate_Web_코드_패턴_규칙.md](Passmate_Web_코드_패턴_규칙.md)(이하 "규칙 문서"). 계약(단일 진실)은 `specs/001-passmate-mvp/contracts/`(rest-api.md · websocket-events.md) — 구현이 계약과 다르면 계약을 먼저 갱신한다. 태스크는 `specs/001-passmate-mvp/tasks.md`의 `web/` 경로 항목.

## 0. 결정 요약

| 항목             | 결정                                                                | 근거                                                                                                       |
| ---------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 프레임워크       | Next.js 15 (App Router) + TypeScript 5 + Tailwind + shadcn/ui       | plan.md 확정 스택                                                                                          |
| 아키텍처         | **실용 3층**: `lib/api`(전송) → 상태(`queries`/`stores`) → `app` UI | React 관례에 맞춤. KMP처럼 UseCase 레이어를 두지 않되, 원칙(서버 권위·계약 1:1·에러 코드 보존)은 동일 미러 |
| 서버 상태        | TanStack Query                                                      | 조회·뮤테이션·캐시 무효화 일원화                                                                           |
| 실시간 세션 상태 | **Zustand 스토어 1개 + STOMP 이벤트 리듀서**                        | 고빈도 이벤트(타이머·제출현황·랭킹)에 Query 캐시 병합은 부적합. 재접속 스냅샷 복구와 자연 결합             |
| 인증 상태        | Zustand `auth-store` (access=메모리, refresh=localStorage)          | §6, ADR-3                                                                                                  |
| 렌더링           | **전 화면 클라이언트 컴포넌트 기본**, Next API Routes 미사용        | 인증 뒤 대시보드 성격 + 실시간 중심. 백엔드는 Spring 단일(§7)                                              |
| 패턴             | 단방향 데이터 흐름 + 화면 2단 구성(page=효과/`*View`=렌더)          | KMP의 MVI·Screen/ContentScreen 정신을 React 관례로 번역                                                    |

## 1. 3층 구조와 경계

```
┌────────────────────────────────────────────────────────┐
│ UI 층: app/(라우트·page) + components/                  │
│   · page = 데이터 연결·효과·네비게이션, *View = 순수 렌더 │
└───────────────┬────────────────────────────────────────┘
                │  훅·스토어 액션만 호출 (fetch/STOMP 직접 호출 금지)
┌───────────────▼────────────────────────────────────────┐
│ 상태 층: lib/queries/(TanStack Query 훅)                │
│         lib/stores/(auth-store · session-store)         │
└───────────────┬────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────┐
│ 전송 층: lib/api.ts(fetch 래퍼·401 refresh)             │
│         lib/stomp.ts(STOMP 클라이언트·재연결)            │
│         lib/types/(계약 1:1 DTO·이벤트 타입)             │
└────────────────────────────────────────────────────────┘
```

- 의존 방향은 아래로만: UI → 상태 → 전송. 역참조 금지
- **컴포넌트에서 `fetch`/STOMP 직접 호출 금지** — KMP의 "ViewModel에서 Ktor 직접 호출 금지"와 동일한 경계. 항상 `queries`/`stores`를 경유한다
- 전송 층은 **전송만** 한다: 요청·DTO 반환·`AppError` 변환까지. 화면용 가공은 상태 층(select·파생)에서

## 2. 디렉터리 구조

tasks.md의 web 경로를 그대로 기준으로 삼는다. 단일 파일(`api.ts` 등)로 시작하고, 300줄을 넘으면 같은 이름의 폴더로 분할한다(예: `api.ts` → `api/client.ts` + `api/rooms.ts` …).

```
web/src/
├── app/
│   ├── login/page.tsx                  # Google 로그인 진입
│   ├── auth/callback/page.tsx          # OAuth 콜백 → 토큰 수신
│   ├── dashboard/page.tsx              # 대시보드(등급 위젯 포함)
│   ├── dashboard/history/page.tsx      # 출제 이력·세트 복제
│   ├── dashboard/earnings/page.tsx     # 수익·정산 내역
│   ├── rooms/new/page.tsx              # 방 생성(유료 방 옵션)
│   ├── rooms/[pin]/host/page.tsx       # 호스트 화면 — 대기실→진행→결과 상태 머신(§5)
│   ├── question-sets/[id]/page.tsx     # AI 출제 폼·검토 에디터·잔여 무료 횟수
│   ├── sessions/[id]/stats/page.tsx    # 세션 통계(+내보내기)
│   ├── sessions/[id]/review/page.tsx   # 첨삭 화면
│   └── admin/{settlements,branded}/page.tsx  # 관리자(ADMIN 롤 가드)
├── components/                         # 공통·도메인 컴포넌트 (ptt-button, host-rating-badge, material-upload …)
└── lib/
    ├── api.ts                          # fetch 래퍼: baseURL·인증 헤더·401 refresh 1회·AppError 변환
    ├── stomp.ts                        # STOMP 클라이언트: 연결·구독·재연결(§5)
    ├── auth-store.ts                   # Zustand: 토큰·내 프로필
    ├── session-store.ts                # Zustand: 실시간 세션 상태 + 이벤트 리듀서(§5)
    ├── queries/                        # 기능별 TanStack Query 훅 (use-rooms.ts, use-question-sets.ts …)
    └── types/                          # 계약 1:1 타입 (dto.ts, events.ts, app-error.ts)
```

## 3. 데이터 흐름 (단방향)

```
[REST]   *View ─onClick 콜백→ page ─훅 호출→ useMutation/useQuery → api.ts → 서버
         서버 → api.ts(DTO | AppError) → Query 캐시 갱신/invalidate → 리렌더
[STOMP]  서버 이벤트 → stomp.ts → session-store 리듀서 → 구독 컴포넌트 리렌더
[단발 효과] mutation 콜백·이벤트 핸들러에서 직접 실행(토스트·router.push) — 스토어에 저장 금지
```

- 서버 권위 원칙: 점수·타이머 만료·정오 판정은 서버가 한다. 웹은 `endsAt`과의 차로 남은 시간을 **렌더만** 하고, 마감 처리는 `QUESTION_ENDED` 수신으로만 반영한다 (규칙 문서 §1)

## 4. 상태 관리 — 3분류 경계

| 분류             | 도구                    | 예                                                         | 판별 기준                                    |
| ---------------- | ----------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| 서버 상태        | TanStack Query          | 방 정보, 세트·문항, 통계, 정산 내역, AI 사용량             | 서버가 원본이고 재조회로 복원 가능           |
| 실시간 세션 상태 | Zustand `session-store` | 참가자 목록, 현재 문항, endsAt, 제출 현황, 랭킹, 힌트 이력 | STOMP 이벤트로 갱신되고 여러 컴포넌트가 구독 |
| 인증 상태        | Zustand `auth-store`    | access 토큰, 내 프로필·등급                                | 전역·전송 층이 참조                          |
| 로컬 UI 상태     | `useState`              | 폼 입력, 다이얼로그 열림, 선택 탭                          | 한 컴포넌트(트리) 안에서만 쓰임              |

- 쿼리 키는 배열 계층으로 통일: `['rooms', pin]`, `['question-sets', id]`, `['sessions', id, 'stats']`, `['me', 'ai-usage']`, `['me', 'settlements']`
- 뮤테이션 성공 시 관련 키를 `invalidateQueries`로 무효화한다 — 수동 `setQueryData`는 낙관적 갱신이 꼭 필요한 곳만

## 5. 실시간 세션 스토어 설계

`session-store`는 호스트 화면의 단일 진실이다. STOMP 이벤트마다 리듀서 함수 하나를 매핑한다(계약 websocket-events.md와 1:1).

```ts
// session-store 상태 (요지)
interface SessionState {
  phase: "WAITING" | "RUNNING" | "FINISHED";
  participants: Participant[];
  currentQuestionNo: number | null;
  endsAt: string | null; // 서버 시각 — 렌더 전용
  submissions: SubmissionStatus[]; // 제출 현황
  ranking: RankingEntry[];
  aiAnalysisEnabled: boolean; // 세션 시작 응답(FR-062)
}
```

| 이벤트                                    | 리듀서 동작                                             |
| ----------------------------------------- | ------------------------------------------------------- |
| `PARTICIPANT_JOINED` / `PARTICIPANT_LEFT` | participants 추가/제거                                  |
| `GAME_STARTED`                            | phase→RUNNING 초기화                                    |
| `QUESTION_STARTED`                        | currentQuestionNo·endsAt 교체, submissions 리셋         |
| `ANSWER_SUBMITTED`                        | submissions 갱신                                        |
| `QUESTION_ENDED`                          | 문항 마감·정답 공개 반영                                |
| `RANKING_UPDATED`                         | ranking 전체 교체 (병합 아님 — 서버가 준 스냅샷이 진실) |
| `GAME_FINISHED`                           | phase→FINISHED                                          |
| `VOICE_HINT`                              | 힌트 이력 추가                                          |

**재접속 프로토콜** (KMP §2-1-2와 동일): 연결 유실 → `stomp.ts`가 재연결·재구독 → `GET /rooms/{pin}/session/snapshot` 조회 → 스토어를 스냅샷으로 통째 교체 → 스냅샷 ts 이전에 도착한 이벤트는 폐기. 이 로직은 `stomp.ts`+`session-store`가 담당하고 컴포넌트에는 두지 않는다.

**호스트 화면 상태 머신**: `rooms/[pin]/host`는 KMP(학생)와 달리 라우트 전환 없이 **한 페이지에서 `phase`로 대기실→진행→결과를 전환**한다(tasks.md 구성과 일치). 전환 트리거는 서버 이벤트뿐이며, 제어 버튼(시작/다음/종료)은 REST 호출만 하고 화면 전환을 직접 하지 않는다.

## 6. 인증 설계

- 플로우: `/login` → 백엔드 `GET /auth/oauth/google`(리다이렉트) → `/auth/callback`에서 JWT 쌍 수신 → `auth-store` 저장 → 원래 가려던 경로(`next` 파라미터)로 이동
- 보관: **access=메모리(auth-store), refresh=localStorage**. 새로고침 시 refresh로 재발급해 복원한다 (트레이드오프는 ADR-3)
- `api.ts` 공통 처리: 401 수신 → refresh 1회 → 원 요청 재시도, 재실패 시 로그아웃·`/login?next=` 이동. **403은 권한 거부로만 해석**(토큰 만료로 오인 금지 — 백엔드는 만료를 401로 준다)
- 라우트 가드: `/login`·`/auth/callback` 외 전 화면 로그인 필수(선생님 웹은 게스트 없음). `/admin/*`은 프로필 `role=ADMIN` 확인 — 단, 클라이언트 가드는 UX용이고 최종 권위는 서버 403이다

## 7. 렌더링 방침

- 전 화면 `'use client'` 기본. 서버 컴포넌트는 정적 셸(layout)에만 허용
- Next API Routes·서버 액션 미사용 — 백엔드는 Spring 하나이고, 웹은 그 클라이언트다
- 파일 다운로드(통계·리포트 내보내기 FR-063)는 인증 헤더를 실어 blob 수신 후 저장한다 — `api.ts`에 `downloadFile` 헬퍼 하나로 통일

## 8. 테스트 전략

| 대상                                     | 도구                                               | 우선순위                      |
| ---------------------------------------- | -------------------------------------------------- | ----------------------------- |
| session-store 리듀서·재접속 스냅샷 교체  | Vitest (순수 함수라 목 불필요)                     | 1 — 실시간 정합이 핵심 리스크 |
| api.ts 401 refresh·AppError 매핑         | Vitest + fetch 목                                  | 2                             |
| 핵심 플로우 E2E (방 생성→출제→진행→통계) | Playwright (`tests/e2e/core-flow.spec.ts`, SC-007) | 3 — tasks T111                |

## 9. 적용 순서 (tasks.md 연계)

1. `lib/types`(계약 1:1 타입) + `api.ts` + `auth-store` + 로그인·콜백 — **T019**
2. `stomp.ts` + `lib/types/events.ts` — **T020**
3. `session-store` + 호스트 화면 상태 머신 — T036·T048에서 함께
4. 화면 증분: 스토리 순서대로 (대시보드·출제 T030~T031 → 호스트 T036·T048 → 통계·첨삭 → 수익·관리자)

## 10. 결정 기록 (ADR 요약)

| #   | 결정                               | 대안                         | 이유                                                                                                                            |
| --- | ---------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 실용 3층 (UseCase 레이어 없음)     | KMP 클린아키텍처 미러        | React 생태계 관례(훅·쿼리)와 충돌 회피. 원칙(서버 권위·계약 1:1·에러 코드 보존)은 규칙 문서로 동일 강제                         |
| 2   | 실시간=Zustand 리듀서              | TanStack Query 캐시 병합     | 고빈도 이벤트에 캐시 병합은 부적합. 스냅샷 통째 교체와 자연 결합                                                                |
| 3   | access=메모리·refresh=localStorage | httpOnly 쿠키                | 쿠키는 백엔드 발급 방식 변경 필요(현 계약은 토큰 응답). MVP는 localStorage 실용 선택 — XSS 리스크는 인지하고 확장 단계에 재검토 |
| 4   | 호스트 화면=단일 페이지 상태 머신  | 대기실/진행/결과 라우트 분리 | tasks.md 구성과 일치. 진행 중 라우트 전환은 STOMP 구독·타이머 수명 관리만 복잡하게 함                                           |
| 5   | Next API Routes 미사용             | BFF 패턴                     | 백엔드 단일(Spring)·팀 3인 — 중간 서버는 계약 이중화만 낳음                                                                     |
