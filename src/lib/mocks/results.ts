import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  AnswerResultView,
  EssayAnalysisRequestResponse,
  EssayAnalysisView,
  LearningReportResponse,
  MyAnswerResponse,
  MySessionResultResponse,
  ParticipantResultResponse,
  ParticipantResultRow,
  QuestionResponse,
  HostReviewRequest,
  ReviewTargetAnswer,
  ReviewTargetListResponse,
  SessionResultsResponse,
  TeacherReviewResponse,
} from "@/lib/types/dto";
import { DEMO_ROOM, DEMO_ROOM_ID, PARTICIPANTS, SET_QUESTIONS } from "./fixtures";

/**
 * 세션 결과·리포트·첨삭·AI 분석 목 응답.
 * 문항은 `SET_QUESTIONS`(단일 출처)를 그대로 쓰고, 정답률·점수만 재현 가능한 고정값으로 만든다.
 */

/** 내 참가자 id — 픽스처의 "민지"(회원)로 고정한다 */
const MY_PARTICIPANT_ID = 15;

/** 문항별 정답률(%) — 서술형은 정답 개념이 없어 0으로 두고 AI 분석 건수로 말한다 */
const CORRECT_RATE: Record<number, number> = {
  1: 0,
  2: 67,
  3: 83,
  4: 50,
  5: 67,
  6: 0,
  7: 67,
  8: 0,
};

/** 서술형 문항의 AI 분석 건수 */
const AI_ANALYSIS_COUNT: Record<number, number> = { 1: 6, 6: 6, 8: 6 };

/** 내가 맞힌 문항(객관식·OX 중) */
const MY_CORRECT = new Set([2, 3, 5]);

const MY_ESSAY_ANSWER =
  "영속성 컨텍스트는 엔티티를 관리하는 공간으로, 1차 캐시를 통해 같은 트랜잭션 안에서 동일 엔티티 조회를 보장합니다.";

const DONE_ANALYSIS: EssayAnalysisView = {
  keyPoints: ["1차 캐시", "동일성 보장"],
  missingPoints: ["쓰기 지연", "변경 감지"],
  suggestions: ["flush 시점을 예시와 함께 보강"],
  summary: "핵심은 짚었지만 쓰기 지연·변경 감지까지 이어 설명하면 더 좋아요.",
  completedAt: "2026-09-02T03:10:00",
};

/** 서술형 답안 6명 — 문항 1(JPA 영속성 컨텍스트) 기준 */
const ESSAY_TEXTS: Record<number, string> = {
  11: "영속성 컨텍스트는 엔티티를 관리하는 공간으로, 1차 캐시를 통해 동일 엔티티 조회를 보장하고…",
  12: "엔티티 매니저가 관리하는 영속 상태의 엔티티 집합입니다. 변경 감지로 update 쿼리가 자동 생성됩니다.",
  13: "JPA가 엔티티를 저장하는 환경입니다. persist 하면 영속 상태가 되고 commit 시점에 DB에 반영됩니다.",
  14: "엔티티를 캐싱해서 같은 id로 조회하면 DB에 다시 가지 않고 캐시에서 돌려줍니다.",
  15: MY_ESSAY_ANSWER,
  16: "엔티티 매니저 안에 있는 저장소로, 여기에 들어간 엔티티만 JPA가 관리합니다.",
};

/** 참가자별 총점 — 랭킹과 결과가 같은 숫자를 말하도록 한곳에서 만든다 */
const TOTAL_SCORES: Record<number, number> = {
  11: 1240,
  12: 1100,
  15: 980,
  13: 870,
  14: 760,
  16: 640,
};

let rated = false;
/** 내 서술형 분석 상태 — 요청하면 PENDING, 3초 뒤 DONE으로 바뀐다 */
let myAnalysisStatus: MyAnswerResponse["analysisStatus"] = "NOT_REQUESTED";
let analysisRequestedAt = 0;
let remainingFreeAnalysis = 5;

const ANALYSIS_DELAY_MS = 3000;
const ANALYSIS_COIN_COST = 100;

function sessionQuestionId(q: QuestionResponse): number {
  return 1000 + q.id;
}

/** 요청 후 3초가 지났으면 완료로 넘긴다 — 화면 폴링이 상태가 바뀌는 걸 볼 수 있게 */
function currentAnalysisStatus(): MyAnswerResponse["analysisStatus"] {
  if (myAnalysisStatus === "PENDING" && Date.now() - analysisRequestedAt > ANALYSIS_DELAY_MS)
    myAnalysisStatus = "DONE";
  return myAnalysisStatus;
}

function myScoreFor(q: QuestionResponse): number {
  if (q.type === "ESSAY") return currentAnalysisStatus() === "DONE" ? q.points : 0;
  return MY_CORRECT.has(q.orderNo) ? q.points : 0;
}

function toAnswerResultView(q: QuestionResponse): AnswerResultView {
  const isEssay = q.type === "ESSAY";
  const status = isEssay && q.orderNo === 1 ? currentAnalysisStatus() : "NOT_REQUESTED";
  const score = myScoreFor(q);

  return {
    sessionQuestionId: sessionQuestionId(q),
    questionId: q.id,
    orderNo: q.orderNo,
    type: q.type,
    content: q.content,
    points: q.points,
    ...(q.answer ? { answer: q.answer } : {}),
    ...(q.explanation ? { explanation: q.explanation } : {}),
    submitted: isEssay ? MY_ESSAY_ANSWER : (q.choices?.[MY_CORRECT.has(q.orderNo) ? 0 : 1] ?? "O"),
    ...(isEssay ? {} : { isCorrect: MY_CORRECT.has(q.orderNo) }),
    score,
    finalScore: score,
    analysisStatus: status,
    ...(status === "DONE" ? { analysis: DONE_ANALYSIS } : {}),
  };
}

/** GET /rooms/{roomId}/results/me — 게스트도 부를 수 있다 */
export function mockMyResult(): MySessionResultResponse {
  return {
    roomId: DEMO_ROOM_ID,
    roomTitle: DEMO_ROOM.title,
    status: "ENDED",
    endedAt: "2026-09-02T03:00:00",
    participantId: MY_PARTICIPANT_ID,
    nickname: "민지",
    avatarId: "fox",
    guest: false,
    rank: 3,
    totalScore: TOTAL_SCORES[MY_PARTICIPANT_ID],
    correctCount: MY_CORRECT.size,
    submitCount: SET_QUESTIONS.length,
    questionCount: SET_QUESTIONS.length,
    questions: SET_QUESTIONS.map(toAnswerResultView),
    rating: {
      available: !rated,
      ...(rated ? { blockedReason: "ALREADY_RATED" as const } : {}),
      alreadyRated: rated,
      deadline: "2026-09-03T03:00:00",
    },
  };
}

/** GET …/questions/{questionId}/answers/me — 내 답안 한 건 */
export function mockMyAnswer(questionId: string): MyAnswerResponse {
  const q = SET_QUESTIONS.find((item) => item.id === Number(questionId));
  if (!q) throw new AppError("NotFound", { code: ERROR_CODES.QUESTION_NOT_FOUND });

  const view = toAnswerResultView(q);
  return {
    roomId: DEMO_ROOM_ID,
    sessionQuestionId: view.sessionQuestionId,
    questionId: view.questionId,
    orderNo: view.orderNo,
    type: view.type,
    content: view.content,
    points: view.points,
    submitted: view.submitted ?? "",
    ...(view.isCorrect === undefined ? {} : { isCorrect: view.isCorrect }),
    score: view.score,
    finalScore: view.finalScore,
    submittedAt: "2026-09-02T02:40:00",
    ...(view.answer ? { answer: view.answer } : {}),
    ...(view.explanation ? { explanation: view.explanation } : {}),
    analysisStatus: view.analysisStatus,
    ...(view.analysis ? { analysis: view.analysis } : {}),
    remainingFreeAnalysis,
    analysisCoinCost: ANALYSIS_COIN_COST,
  };
}

/**
 * POST …/answers/me/analysis — 202. 무료 횟수를 다 쓰면 402를 던진다(코인 잔액도 없다고 본다).
 * 요청 3초 뒤 DONE으로 바뀌어 화면 폴링이 상태 변화를 볼 수 있다.
 */
export function mockRequestAnalysis(): EssayAnalysisRequestResponse {
  if (remainingFreeAnalysis <= 0)
    throw new AppError("PaymentRequired", { code: ERROR_CODES.INSUFFICIENT_COINS });

  remainingFreeAnalysis -= 1;
  myAnalysisStatus = "PENDING";
  analysisRequestedAt = Date.now();

  return {
    analysisStatus: "PENDING",
    chargedCoins: 0,
    remainingFreeAnalysis,
    analysisCoinCost: ANALYSIS_COIN_COST,
  };
}

/** GET /rooms/{roomId}/reports/me — 세션 종료 시 만들어진 학습 리포트 */
export function mockMyReport(): LearningReportResponse {
  return {
    roomId: DEMO_ROOM_ID,
    roomTitle: DEMO_ROOM.title,
    participantId: MY_PARTICIPANT_ID,
    nickname: "민지",
    totalQuestions: SET_QUESTIONS.length,
    correctCount: MY_CORRECT.size,
    accuracy: 71,
    totalScore: TOTAL_SCORES[MY_PARTICIPANT_ID],
    finalRank: 3,
    weakTopics: ["JPA 영속성", "트랜잭션", "인덱스"],
    improvementPoints: [
      "JPA 영속성 · 트랜잭션 주제를 다시 살펴보세요.",
      "정답률이 71% 입니다. 틀린 문항의 해설부터 확인해 보세요.",
    ],
    generatedAt: "2026-09-02T03:00:05",
  };
}

function buildParticipantRows(): ParticipantResultRow[] {
  return PARTICIPANTS.map((p) => ({
    rank: 0,
    participantId: p.id,
    nickname: p.nickname,
    avatarId: p.avatarId,
    totalScore: TOTAL_SCORES[p.id] ?? 500,
    correctCount: Math.round(((TOTAL_SCORES[p.id] ?? 500) / 1240) * 7),
    submitCount: SET_QUESTIONS.length,
  }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

/** GET /rooms/{roomId}/results (호스트) */
export function mockSessionResults(): SessionResultsResponse {
  const participants = buildParticipantRows();

  return {
    roomId: DEMO_ROOM_ID,
    title: DEMO_ROOM.title,
    status: "ENDED",
    startedAt: "2026-09-02T02:00:00",
    endedAt: "2026-09-02T03:00:00",
    summary: {
      participantCount: participants.length,
      questionCount: SET_QUESTIONS.length,
      avgCorrectRate: 71,
      avgScore: 932,
      aiAnalysisCount: 18,
    },
    questions: SET_QUESTIONS.map((q) => ({
      sessionQuestionId: sessionQuestionId(q),
      questionId: q.id,
      orderNo: q.orderNo,
      type: q.type,
      content: q.content,
      points: q.points,
      submitCount: participants.length,
      correctCount: Math.round((participants.length * (CORRECT_RATE[q.orderNo] ?? 0)) / 100),
      correctRate: CORRECT_RATE[q.orderNo] ?? 0,
      aiAnalysisCount: AI_ANALYSIS_COUNT[q.orderNo] ?? 0,
    })),
    participants,
  };
}

/** GET /rooms/{roomId}/results/participants/{participantId} (호스트) */
export function mockParticipantResult(participantId: string): ParticipantResultResponse {
  const id = Number(participantId);
  const row = buildParticipantRows().find((p) => p.participantId === id);
  if (!row) throw new AppError("NotFound", { code: ERROR_CODES.PARTICIPANT_NOT_FOUND });

  return {
    roomId: DEMO_ROOM_ID,
    participantId: row.participantId,
    nickname: row.nickname,
    avatarId: row.avatarId,
    rank: row.rank,
    totalScore: row.totalScore,
    correctCount: row.correctCount,
    submitCount: row.submitCount,
    questionCount: SET_QUESTIONS.length,
    questions: SET_QUESTIONS.map(toAnswerResultView),
  };
}

function toReviewTarget(
  q: QuestionResponse,
  participantId: number,
  index: number,
): ReviewTargetAnswer {
  const reviewed = index < 3;
  return {
    answerId: index + 1,
    sessionQuestionId: sessionQuestionId(q),
    questionId: q.id,
    orderNo: q.orderNo,
    type: q.type,
    questionContent: q.content,
    points: q.points,
    ...(q.answer ? { modelAnswer: q.answer } : {}),
    participantId,
    nickname: PARTICIPANTS.find((p) => p.id === participantId)?.nickname ?? "",
    avatarId: PARTICIPANTS.find((p) => p.id === participantId)?.avatarId ?? "cat",
    submitted: ESSAY_TEXTS[participantId] ?? "",
    score: q.points,
    finalScore: q.points,
    submittedAt: "2026-09-02T02:40:00",
    analysisStatus: "DONE",
    analysis: DONE_ANALYSIS,
    reviewed,
    ...(reviewed
      ? {
          teacherReview: {
            comment: "핵심은 잘 짚었어요. 쓰기 지연까지 이어서 설명해 보세요",
            reviewedAt: "2026-09-02T03:20:00",
          },
        }
      : {}),
  };
}

/** GET /rooms/{roomId}/answers — 첨삭 대상 목록(서술형만) */
export function mockReviewTargets(url: URL): ReviewTargetListResponse {
  const questionId = url.searchParams.get("questionId");
  const target =
    SET_QUESTIONS.find((q) => q.type === "ESSAY" && (!questionId || q.id === Number(questionId))) ??
    SET_QUESTIONS[0];

  const answers = PARTICIPANTS.map((p, i) => toReviewTarget(target, p.id, i));
  return {
    roomId: DEMO_ROOM_ID,
    totalCount: answers.length,
    reviewedCount: answers.filter((a) => a.reviewed).length,
    answers,
  };
}

/** @draft PUT /rooms/{roomId}/answers/{answerId}/review — 백엔드 미구현. 목에서만 성공한다 */
export function mockPostReview(answerId: number, body: HostReviewRequest): TeacherReviewResponse {
  return {
    answerId,
    participantId: 1,
    // 보정을 넣으면 그 값이 최종 점수가 된다. 지우면 채점기 점수로 돌아간다
    finalScore: body.adjustedScore ?? 70,
    review: {
      comment: body.comment,
      improvement: body.improvement,
      adjustedScore: body.adjustedScore,
      reviewedAt: new Date().toISOString().slice(0, 19),
    },
  };
}

/** @draft POST /rooms/{roomId}/ratings — 백엔드 미구현. 세션당 1회만 받는다 */
export function mockSubmitRating(): undefined {
  if (rated) throw new AppError("Conflict", { code: ERROR_CODES.ALREADY_RATED });
  rated = true;
  return undefined;
}

/** 테스트 전용 — 결과 목의 모듈 상태를 되돌린다 */
export function __resetResultsForTests(): void {
  rated = false;
  myAnalysisStatus = "NOT_REQUESTED";
  analysisRequestedAt = 0;
  remainingFreeAnalysis = 5;
}
