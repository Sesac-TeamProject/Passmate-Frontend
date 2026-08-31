import { AppError } from "@/lib/types/app-error";
import type {
  ScreenLockRequest,
  SessionSnapshotResponse,
  StartSessionResponse,
  SubmissionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  VoiceHintEntry,
  VoiceHintsResponse,
} from "@/lib/types/dto";
import { LIVE_QUESTIONS, PARTICIPANTS } from "./fixtures";

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
  return { aiAnalysisEnabled: true };
}

/** POST /rooms/{roomId}/session/next */
export function mockNext(): undefined {
  currentIndex = Math.min(currentIndex + 1, LIVE_QUESTIONS.length - 1);
  currentStartedAt = Date.now();
  submittedCount = 0;
  locked = false;
  return undefined;
}

/** POST /rooms/{roomId}/session/current/end */
export function mockEndCurrent(): undefined {
  locked = true;
  return undefined;
}

/** POST /rooms/{roomId}/session/end */
export function mockEndSession(): undefined {
  phase = "FINISHED";
  return undefined;
}

/** PUT /rooms/{roomId}/session/lock */
export function mockLock(body: ScreenLockRequest): undefined {
  locked = body.locked;
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

/** POST /rooms/{roomId}/session/hints — PTT 음성 힌트 업로드(멀티파트) */
export function mockUploadHint(): undefined {
  hints = [
    ...hints,
    {
      hintId: nextHintId++,
      questionNo: currentQuestion().questionNo,
      clipUrl: `/mock/hints/hint-${nextHintId}.mp3`,
      durationMs: 5000,
    },
  ];
  return undefined;
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
