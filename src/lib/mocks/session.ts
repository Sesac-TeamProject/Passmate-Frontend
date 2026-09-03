import { toAvatarKey } from "@/lib/types/dto";
import type {
  AnswerResponse,
  AnswerSubmitRequest,
  QuestionEndedPayload,
  QuestionResponse,
  QuestionResultResponse,
  QuestionStartedPayload,
  RankingEntry,
  ScreenLockRequest,
  ScreenLockResponse,
  SessionSnapshotResponse,
  SubmissionStatusPayload,
  VoiceHintEntry,
  VoiceHintsResponse,
} from "@/lib/types/dto";
import type { ServerEvent } from "@/lib/types/events";
import { DEMO_ROOM_ID, PARTICIPANTS, SET_QUESTIONS } from "./fixtures";

/**
 * 진행 세션(session) 목 상태 머신 — 상태·현재 문항·제출 수·화면 잠금을 모듈 스코프에서 유지해
 * 한 세션 동안 일관되게 보인다.
 *
 * 실제 서버와 같은 순서를 지킨다: REST 제어는 **204**로 끝나고, 화면을 움직이는 것은 뒤이어
 * 발행되는 **이벤트**다. 봉투도 서버와 같은 `{type, roomId, occurredAt, payload}` 형식이다.
 */

type MockStatus = "WAITING" | "RUNNING" | "ENDED";

/**
 * 문항 정답 — 픽스처(`SET_QUESTIONS.answer`)에서 파생한다. 목 안에서 정답 출처는 하나여야
 * 채점·분포·결과가 서로 어긋나지 않는다. 서술형은 자동 채점하지 않으므로 뺀다.
 */
const CORRECT_ANSWERS: Record<number, string> = Object.fromEntries(
  SET_QUESTIONS.filter((q) => q.type !== "ESSAY" && q.answer).map((q) => [
    q.id,
    q.answer as string,
  ]),
);

let status: MockStatus = "WAITING";
let currentIndex = 0;
let currentStartedAt = Date.now();
let submitCount = 0;
let locked = false;
let mySubmitted = false;
let hints: VoiceHintEntry[] = [
  {
    hintId: 1,
    sessionQuestionId: 2,
    questionId: 2,
    orderNo: 2,
    audioUrl: "/mock/hints/hint-1.mp3",
    durationMs: 5000,
    publishedAt: "2026-09-03T02:00:00",
  },
];
let nextHintId = 2;
let nextAnswerId = 1;

/**
 * 목 세션 제어가 발행하는 실시간 이벤트 통로. `connectRoomStream`의 목 분기가 이걸 구독해
 * onEvent로 넘긴다 — 목 모드에서도 "REST 호출 → 이벤트 → 스토어" 경로가 실제와 같다.
 */
export const mockSessionEvents = new EventTarget();

export function emitMockEvent(event: ServerEvent): void {
  mockSessionEvents.dispatchEvent(new CustomEvent<ServerEvent>("event", { detail: event }));
}

export function isMockSessionWaiting(): boolean {
  return status === "WAITING";
}

/** 서버와 같은 형식(UTC naive)의 지금 시각 */
function nowServerTime(): string {
  return new Date().toISOString().slice(0, 19);
}

function toServerTime(ms: number): string {
  return new Date(ms).toISOString().slice(0, 19);
}

function emit(type: ServerEvent["type"], payload?: unknown): void {
  emitMockEvent({
    type,
    roomId: DEMO_ROOM_ID,
    occurredAt: nowServerTime(),
    payload,
  } as ServerEvent);
}

function currentQuestion(): QuestionResponse {
  return SET_QUESTIONS[currentIndex] ?? SET_QUESTIONS[SET_QUESTIONS.length - 1];
}

/** 세션 문항 id — 서버는 세트 문항을 복사해 따로 id를 매긴다. 목은 1000+로 흉내 낸다 */
function sessionQuestionId(q: QuestionResponse): number {
  return 1000 + q.id;
}

/** QUESTION_STARTED 페이로드 = 스냅샷의 현재 문항. **정답은 절대 담지 않는다** */
function buildCurrentQuestion(): QuestionStartedPayload {
  const q = currentQuestion();
  return {
    sessionQuestionId: sessionQuestionId(q),
    questionId: q.id,
    orderNo: q.orderNo,
    totalCount: SET_QUESTIONS.length,
    type: q.type,
    content: q.content,
    ...(q.choices ? { choices: q.choices } : {}),
    points: q.points,
    timeLimitSec: q.timeLimitSec,
    endsAt: toServerTime(currentStartedAt + q.timeLimitSec * 1000),
  };
}

/**
 * 보기별 제출 수 — 정답 보기에 다수표를 몰아준다.
 * Math.random을 쓰지 않는 고정 비율(정답이 나머지를 가져감)이라 매번 같은 화면이 나온다.
 * 키는 서버와 같게 **보기 원문**이다. 서술형은 빈 객체.
 */
function buildDistribution(q: QuestionResponse): Record<string, number> {
  if (!q.choices || q.choices.length === 0) return {};

  const correctAnswer = CORRECT_ANSWERS[q.id];
  const correctIndex = correctAnswer ? q.choices.indexOf(correctAnswer) : -1;
  const otherWeights = q.choices.length <= 2 ? [0.35] : [0.25, 0.2, 0.15];

  const counts = new Array<number>(q.choices.length).fill(0);
  let othersTotal = 0;
  let otherRank = 0;

  q.choices.forEach((_, i) => {
    if (i === correctIndex) return;
    counts[i] = Math.floor(submitCount * (otherWeights[otherRank] ?? 0));
    othersTotal += counts[i];
    otherRank += 1;
  });
  counts[correctIndex >= 0 ? correctIndex : 0] += submitCount - othersTotal;

  return Object.fromEntries(q.choices.map((choice, i) => [choice, counts[i]]));
}

function correctCountFor(q: QuestionResponse): number {
  const answer = CORRECT_ANSWERS[q.id];
  return answer ? (buildDistribution(q)[answer] ?? 0) : 0;
}

function correctRateFor(q: QuestionResponse): number {
  if (submitCount === 0) return 0;
  return Math.round((correctCountFor(q) / submitCount) * 1000) / 10;
}

/** 참가자 픽스처를 점수 내림차순으로 흉내 낸 순위 */
function buildMockRanking(): RankingEntry[] {
  return PARTICIPANTS.map((p, i) => ({
    rank: i + 1,
    participantId: p.id,
    nickname: p.nickname,
    avatarId: toAvatarKey(p.avatarId),
    totalScore: Math.max(800 - i * 120, 100),
  }));
}

function buildSubmissionStatus(): SubmissionStatusPayload {
  const q = currentQuestion();
  return {
    sessionQuestionId: sessionQuestionId(q),
    submitCount,
    participantCount: PARTICIPANTS.length,
    correctCount: correctCountFor(q),
    correctRate: correctRateFor(q),
    distribution: buildDistribution(q),
  };
}

function buildQuestionEnded(): QuestionEndedPayload {
  const q = currentQuestion();
  return {
    sessionQuestionId: sessionQuestionId(q),
    questionId: q.id,
    orderNo: q.orderNo,
    ...(q.answer ? { answer: q.answer } : {}),
    ...(q.explanation ? { explanation: q.explanation } : {}),
    submitCount,
    correctCount: correctCountFor(q),
    correctRate: correctRateFor(q),
    distribution: buildDistribution(q),
  };
}

/** GET /rooms/{roomId}/session — **WAITING이어도 200**이고 서버 시각(ts)이 없다 */
export function mockSnapshot(): SessionSnapshotResponse {
  return {
    roomId: DEMO_ROOM_ID,
    status,
    currentQuestionNo: status === "RUNNING" ? currentQuestion().orderNo : 0,
    totalCount: SET_QUESTIONS.length,
    screenLocked: locked,
    ...(status === "RUNNING" ? { currentQuestion: buildCurrentQuestion() } : {}),
    submitted: mySubmitted,
    ranking: status === "WAITING" ? [] : buildMockRanking(),
  };
}

/** POST /rooms/{roomId}/session/start — 204. 곧바로 SESSION_STARTED + 1번 QUESTION_STARTED */
export function mockStartSession(): undefined {
  status = "RUNNING";
  currentIndex = 0;
  currentStartedAt = Date.now();
  submitCount = 0;
  mySubmitted = false;
  locked = false;

  emit("SESSION_STARTED");
  emit("QUESTION_STARTED", buildCurrentQuestion());
  return undefined;
}

/**
 * POST /rooms/{roomId}/session/next — 204.
 * 서버처럼 **열린 문항을 먼저 마감**하고(QUESTION_ENDED → RANKING_UPDATED) 다음 문항을 연다.
 */
export function mockNext(): undefined {
  emit("QUESTION_ENDED", buildQuestionEnded());
  emit("RANKING_UPDATED", buildMockRanking());

  currentIndex = Math.min(currentIndex + 1, SET_QUESTIONS.length - 1);
  currentStartedAt = Date.now();
  submitCount = 0;
  mySubmitted = false;
  locked = false;

  emit("QUESTION_STARTED", buildCurrentQuestion());
  return undefined;
}

/** POST /rooms/{roomId}/session/current/end — 204. 마감 + 순위 갱신 */
export function mockEndCurrent(): undefined {
  emit("QUESTION_ENDED", buildQuestionEnded());
  emit("RANKING_UPDATED", buildMockRanking());
  return undefined;
}

/** POST /rooms/{roomId}/session/end — 204. 최종 랭킹이 이벤트로 온다 */
export function mockEndSession(): undefined {
  status = "ENDED";
  emit("SESSION_ENDED", buildMockRanking());
  return undefined;
}

/** PUT /rooms/{roomId}/session/lock — 잠금 상태를 응답으로 준다 */
export function mockLock(body: ScreenLockRequest): ScreenLockResponse {
  locked = body.locked;
  emit("SCREEN_LOCKED", { locked });
  return { roomId: DEMO_ROOM_ID, screenLocked: locked };
}

/** GET /rooms/{roomId}/session/current/submissions (호스트) — 집계만 준다 */
export function mockSubmissions(): SubmissionStatusPayload {
  return buildSubmissionStatus();
}

/** GET /rooms/{roomId}/session/ranking */
export function mockRanking(): RankingEntry[] {
  return buildMockRanking();
}

/** GET …/session/questions/{questionId}/result — 마감된 문항의 정답·해설·분포·랭킹 */
export function mockQuestionResult(): QuestionResultResponse {
  return { ...buildQuestionEnded(), ranking: buildMockRanking() };
}

/**
 * POST …/questions/{questionId}/answers.
 * 서버처럼 제출마다 호스트 토픽으로 `SUBMISSION_UPDATED`를 흘려보낸다.
 */
export function mockSubmitAnswer(body: AnswerSubmitRequest): AnswerResponse {
  const q = currentQuestion();
  const expected = CORRECT_ANSWERS[q.id];
  const isCorrect = q.type === "ESSAY" ? undefined : body.submitted === expected;
  const baseScore = isCorrect ? q.points : 0;
  // 남은 시간 비율 × 배점 × 0.5 — 목은 절반쯤 남은 상태로 고정한다
  const speedBonus = isCorrect ? Math.round(q.points * 0.5 * 0.5) : 0;

  submitCount += 1;
  mySubmitted = true;
  emit("SUBMISSION_UPDATED", buildSubmissionStatus());

  return {
    answerId: nextAnswerId++,
    sessionQuestionId: sessionQuestionId(q),
    ...(isCorrect === undefined ? {} : { isCorrect }),
    baseScore,
    speedBonus,
    score: baseScore + speedBonus,
    submittedAt: nowServerTime(),
  };
}

/** GET /rooms/{roomId}/session/hints */
export function mockHints(): VoiceHintsResponse {
  return { roomId: DEMO_ROOM_ID, totalCount: hints.length, hints };
}

/**
 * POST /rooms/{roomId}/session/hints — 클립 업로드.
 * 라우트 스윕이 실제 FormData가 아닌 `{}`로도 호출하므로 `instanceof` 가드를 둔다.
 */
export function mockUploadHint(form: FormData): VoiceHintEntry {
  const raw = form instanceof FormData ? form.get("durationMs") : null;
  const durationMs = typeof raw === "string" && raw !== "" ? Number(raw) : 5000;
  const hintId = nextHintId++;
  const question = currentQuestion();
  const entry: VoiceHintEntry = {
    hintId,
    // 목의 세트 문항은 id 하나뿐이라 세션 문항 id도 같은 값을 쓴다
    sessionQuestionId: question.id,
    questionId: question.id,
    orderNo: question.orderNo,
    audioUrl: `/mock/hints/hint-${hintId}.mp3`,
    durationMs,
    publishedAt: nowServerTime(),
  };
  hints = [...hints, entry];
  return entry;
}

/** 테스트 전용 — 모듈 스코프 세션 상태를 초기값으로 되돌린다 */
export function __resetSessionForTests(): void {
  status = "WAITING";
  currentIndex = 0;
  currentStartedAt = Date.now();
  submitCount = 0;
  locked = false;
  mySubmitted = false;
  hints = [
    {
      hintId: 1,
      sessionQuestionId: 2,
      questionId: 2,
      orderNo: 2,
      audioUrl: "/mock/hints/hint-1.mp3",
      durationMs: 5000,
      publishedAt: "2026-09-03T02:00:00",
    },
  ];
  nextHintId = 2;
  nextAnswerId = 1;
}
