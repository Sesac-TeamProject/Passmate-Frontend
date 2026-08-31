import { AppError } from "@/lib/types/app-error";
import type {
  QuestionType,
  RankingEntry,
  ScreenLockRequest,
  SessionSnapshotResponse,
  StartSessionResponse,
  SubmissionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  VoiceHintEntry,
  VoiceHintsResponse,
} from "@/lib/types/dto";
import type { ServerEvent } from "@/lib/types/events";
import { DEMO_ROOM_ID, LIVE_QUESTIONS, PARTICIPANTS } from "./fixtures";

/**
 * 진행 세션(session) 목 상태 머신 — phase WAITING→RUNNING→FINISHED, 현재 문항 인덱스,
 * 제출 수, 화면 잠금 — 모듈 스코프에서 유지해 한 세션 동안 일관되게 보인다.
 */

type SessionPhase = "WAITING" | "RUNNING" | "FINISHED";

/** features/host/mock.ts QUESTION_RESULT — 2번 문항(@Transactional)의 제출 분포·정답률 */
const CURRENT_RESULT = {
  accuracyPercent: 67,
  distribution: [
    { label: "REQUIRED", count: 4 },
    { label: "REQUIRES_NEW", count: 1 },
    { label: "SUPPORTS", count: 1 },
    { label: "NESTED", count: 0 },
  ],
};

/** 채점용 정답 — SnapshotQuestion에는 절대 담지 않고 여기서만 쓴다 */
const CORRECT_ANSWERS: Record<number, string> = {
  2: "REQUIRED", // @Transactional 기본 전파 속성
  3: "X", // Bean 기본 스코프는 singleton이라 "prototype이다"는 거짓
};

let phase: SessionPhase = "WAITING";
let currentIndex = 0;
let currentStartedAt = Date.now();
let submittedCount = 0;
let locked = false;
let myTotalScore = 0;
let hints: VoiceHintEntry[] = [
  { hintId: 1, questionNo: 2, clipUrl: "/mock/hints/hint-1.mp3", durationMs: 5000 },
];
let nextHintId = 2;

/**
 * 목 세션 제어(mockStartSession 등)가 발행하는 실시간 이벤트 통로. `connectRoomStream`의 목 분기가
 * 이걸 구독해 onEvent로 넘긴다 — 목 모드에서도 "REST 호출 → 이벤트 → 스토어" 경로가 실제와 같다.
 */
export const mockSessionEvents = new EventTarget();

export function emitMockEvent(event: ServerEvent): void {
  mockSessionEvents.dispatchEvent(new CustomEvent<ServerEvent>("event", { detail: event }));
}

export function isMockSessionWaiting(): boolean {
  return phase === "WAITING";
}

function currentQuestion() {
  return LIVE_QUESTIONS[currentIndex] ?? LIVE_QUESTIONS[LIVE_QUESTIONS.length - 1];
}

function buildCurrentQuestion() {
  const q = currentQuestion();
  const timeLimitSec = q.timeLimitSec ?? 30;
  return {
    ...q,
    endsAt: new Date(currentStartedAt + timeLimitSec * 1000).toISOString(),
    isClosed: locked,
  };
}

/** QUESTION_STARTED 이벤트 data — SnapshotQuestion(선택형 필드)을 이벤트 계약(필수 필드)으로 채운다 */
function questionStartedData(): {
  questionId: number;
  questionNo: number;
  type: QuestionType;
  body: string;
  choices?: string[] | null;
  points: number;
  timeLimitSec: number;
  endsAt: string;
} {
  const q = buildCurrentQuestion();
  return {
    questionId: q.questionId,
    questionNo: q.questionNo,
    type: q.type ?? "ESSAY",
    body: q.body,
    choices: q.choices ?? null,
    points: q.points ?? 100,
    timeLimitSec: q.timeLimitSec ?? 30,
    endsAt: q.endsAt,
  };
}

/** SESSION_ENDED의 finalRanking — 참가자 픽스처를 점수 내림차순으로 흉내 낸다 */
function buildMockRanking(): RankingEntry[] {
  return PARTICIPANTS.map((p, i) => ({
    rank: i + 1,
    participantId: p.participantId,
    nickname: p.nickname,
    avatarId: p.avatarId,
    total: Math.max(800 - i * 120, 100),
  }));
}

/** GET /rooms/{roomId}/session — 재접속 스냅샷. 404 = 세션 미시작(WAITING) */
export function mockSnapshot(): SessionSnapshotResponse {
  if (phase === "WAITING") throw new AppError("NotFound");

  return {
    status: phase,
    ts: new Date().toISOString(),
    questionCount: LIVE_QUESTIONS.length,
    currentQuestion: phase === "RUNNING" ? buildCurrentQuestion() : null,
    myAnswers: [],
    totalScore: myTotalScore,
    rank: null,
    ranking: [],
    isLocked: locked,
  };
}

/** POST /rooms/{roomId}/session/start — false면 이 세션 서술형 AI 분석 SKIPPED */
export function mockStartSession(): StartSessionResponse {
  phase = "RUNNING";
  currentIndex = 0;
  currentStartedAt = Date.now();
  submittedCount = 0;
  locked = false;
  myTotalScore = 0;
  emitMockEvent({
    type: "SESSION_STARTED",
    ts: new Date().toISOString(),
    data: { sessionId: DEMO_ROOM_ID, questionCount: LIVE_QUESTIONS.length },
  });
  emitMockEvent({
    type: "QUESTION_STARTED",
    ts: new Date().toISOString(),
    data: questionStartedData(),
  });
  return { aiAnalysisEnabled: true };
}

/** POST /rooms/{roomId}/session/next */
export function mockNext(): undefined {
  currentIndex = Math.min(currentIndex + 1, LIVE_QUESTIONS.length - 1);
  currentStartedAt = Date.now();
  submittedCount = 0;
  locked = false;
  emitMockEvent({
    type: "QUESTION_STARTED",
    ts: new Date().toISOString(),
    data: questionStartedData(),
  });
  return undefined;
}

/** POST /rooms/{roomId}/session/current/end */
export function mockEndCurrent(): undefined {
  locked = true;
  const q = currentQuestion();
  const correctCount = Math.round(submittedCount * (CURRENT_RESULT.accuracyPercent / 100));
  emitMockEvent({
    type: "QUESTION_ENDED",
    ts: new Date().toISOString(),
    data: {
      questionNo: q.questionNo,
      answerReveal: { answer: CORRECT_ANSWERS[q.questionId] ?? null, explanation: null },
      correctCount,
    },
  });
  return undefined;
}

/** POST /rooms/{roomId}/session/end */
export function mockEndSession(): undefined {
  phase = "FINISHED";
  emitMockEvent({
    type: "SESSION_ENDED",
    ts: new Date().toISOString(),
    data: { sessionId: DEMO_ROOM_ID, finalRanking: buildMockRanking() },
  });
  return undefined;
}

/** PUT /rooms/{roomId}/session/lock */
export function mockLock(body: ScreenLockRequest): undefined {
  locked = body.locked;
  emitMockEvent({ type: "SCREEN_LOCKED", ts: new Date().toISOString(), data: { locked } });
  return undefined;
}

/** GET /rooms/{roomId}/session/current/submissions (호스트) */
export function mockSubmissions(): SubmissionsResponse {
  const q = currentQuestion();

  return {
    questionNo: q.questionNo,
    submittedCount,
    totalCount: PARTICIPANTS.length,
    accuracyPercent: CURRENT_RESULT.accuracyPercent,
    choices: CURRENT_RESULT.distribution,
    participants: PARTICIPANTS.map((p) => ({
      participantId: p.participantId,
      nickname: p.nickname,
      avatarId: p.avatarId,
      submitted: true,
    })),
  };
}

/** POST /rooms/{roomId}/session/questions/{questionId}/answers */
export function mockSubmitAnswer(body: SubmitAnswerRequest): SubmitAnswerResponse {
  const q = currentQuestion();
  const isEssay = q.type === "ESSAY";
  const expected = CORRECT_ANSWERS[q.questionId];
  const correct = isEssay ? null : expected !== undefined ? body.content === expected : false;
  const baseScore = q.points ?? 100;
  const earnedScore = correct ? Math.round(baseScore * 1.25) : 0;

  submittedCount += 1;
  myTotalScore += earnedScore;

  return {
    correct,
    baseScore,
    speedBonus: 0,
    earnedScore,
    totalScore: myTotalScore,
    rank: null,
    rankDelta: null,
    isProvisional: isEssay,
  };
}

/** GET /rooms/{roomId}/session/hints — 다시 듣기·재접속 복구 */
export function mockHints(): VoiceHintsResponse {
  return { hints };
}

/**
 * POST /rooms/{roomId}/session/hints — PTT 음성 힌트 업로드(멀티파트). 라우트 스윕이 실제 FormData가
 * 아닌 `{}`로도 호출하므로 `instanceof` 가드 없이 `form.get(...)`을 부르면 raw TypeError가 났다.
 */
export function mockUploadHint(form: FormData): VoiceHintEntry {
  const raw = form instanceof FormData ? form.get("durationMs") : null;
  const durationMs = typeof raw === "string" && raw !== "" ? Number(raw) : 5000;
  const hintId = nextHintId++;
  const entry = {
    hintId,
    questionNo: currentQuestion().questionNo,
    clipUrl: `/mock/hints/hint-${hintId}.mp3`,
    durationMs,
  };
  hints = [...hints, entry];
  emitMockEvent({ type: "HINT_PUBLISHED", ts: new Date().toISOString(), data: entry });
  return entry;
}

/** 테스트 전용 — 모듈 스코프 세션 상태를 초기값(WAITING·1번 문항·미제출·잠금 해제)으로 되돌린다. */
export function __resetSessionForTests(): void {
  phase = "WAITING";
  currentIndex = 0;
  currentStartedAt = Date.now();
  submittedCount = 0;
  locked = false;
  myTotalScore = 0;
}
