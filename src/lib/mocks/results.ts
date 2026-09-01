import { AppError } from "@/lib/types/app-error";
import type {
  AnswerVerdict,
  EssayAnswerDto,
  EssayAnswersResponse,
  LearningReportResponse,
  QuestionType,
  ResultQuestionDto,
  RoomReportResponse,
  RoomReportStudent,
  SessionResultResponse,
} from "@/lib/types/dto";
import { DEMO_ROOM } from "./fixtures";

/**
 * 세션 리포트(results) 목 응답. features/host/mock.ts SESSION_REPORT(ReportQuestion·EssayAnswer)를
 * DTO 모양으로 옮긴다. "8월 4주차 Spring 스터디" 세션 — DEMO_ROOM과 같은 방의 종료 후 리포트로 취급한다.
 */

type ReportQuestionSource = {
  no: number;
  title: string;
  type: "multiple" | "essay" | "ox";
  accuracy?: number;
  aiCount?: number;
};

const REPORT_QUESTIONS: ReportQuestionSource[] = [
  { no: 1, title: "DI 컨테이너 개념", type: "multiple", accuracy: 100 },
  { no: 2, title: "@Transactional 전파", type: "multiple", accuracy: 67 },
  { no: 3, title: "JPA 영속성 컨텍스트", type: "essay", aiCount: 6 },
  { no: 4, title: "AOP 프록시 방식", type: "multiple", accuracy: 50 },
  { no: 5, title: "Bean 기본 스코프", type: "ox", accuracy: 83 },
  { no: 6, title: "N+1 문제", type: "essay", aiCount: 6 },
  { no: 7, title: "지연 로딩 기본 대상", type: "multiple", accuracy: 67 },
  { no: 8, title: "Security 필터 체인", type: "essay", aiCount: 6 },
];

const REPORT_STATS = { accuracy: 71, students: 6, questions: 8, aiAnalyses: 18 };
const REPORT_DATE_LABEL = "8/22 (금) 진행";

/** 문항 3(JPA 영속성 컨텍스트) 서술형 답안 — participantId는 PARTICIPANTS 순서(11=준영..16=도윤) */
const ESSAY_ANSWERS_Q3: EssayAnswerDto[] = [
  {
    answerId: 1,
    participantId: 11,
    nickname: "준영",
    content:
      "영속성 컨텍스트는 엔티티를 관리하는 공간으로, 1차 캐시를 통해 같은 트랜잭션 안에서 동일 엔티티 조회를 보장하고…",
    aiFeedback: {
      status: "DONE",
      coveredConcepts: ["1차 캐시", "동일성 보장"],
      missingConcepts: ["쓰기 지연", "변경 감지"],
      improvement: "flush 시점을 예시와 함께 보강",
      weaknesses: null,
      suggestedScore: null,
    },
  },
  {
    answerId: 2,
    participantId: 12,
    nickname: "혜림",
    content:
      "엔티티 매니저가 관리하는 영속 상태의 엔티티 집합입니다. 변경 감지로 update 쿼리가 자동 생성됩니다.",
    aiFeedback: {
      status: "DONE",
      coveredConcepts: ["변경 감지"],
      missingConcepts: ["1차 캐시", "동일성 보장"],
      improvement: "트랜잭션 범위와 함께 설명",
      weaknesses: null,
      suggestedScore: null,
    },
  },
  {
    answerId: 3,
    participantId: 13,
    nickname: "승혁",
    content:
      "JPA가 엔티티를 저장하는 환경입니다. persist 하면 영속 상태가 되고 commit 시점에 DB에 반영됩니다.",
    aiFeedback: {
      status: "DONE",
      coveredConcepts: ["영속 상태", "쓰기 지연"],
      missingConcepts: ["1차 캐시", "변경 감지"],
      improvement: "준영속·삭제 상태까지 생명주기로 정리",
      weaknesses: null,
      suggestedScore: null,
    },
  },
  {
    answerId: 4,
    participantId: 14,
    nickname: "희표",
    content: "엔티티를 캐싱해서 같은 id로 조회하면 DB에 다시 가지 않고 캐시에서 돌려줍니다.",
    aiFeedback: {
      status: "DONE",
      coveredConcepts: ["1차 캐시"],
      missingConcepts: ["동일성 보장", "변경 감지"],
      improvement: "캐시 범위가 트랜잭션 단위임을 명시",
      weaknesses: null,
      suggestedScore: null,
    },
  },
  {
    answerId: 5,
    participantId: 15,
    nickname: "민지",
    content:
      "영속성 컨텍스트는 트랜잭션 안에서 엔티티 변경을 추적해 flush 시점에 update 쿼리를 만들어 줍니다.",
    aiFeedback: {
      status: "DONE",
      coveredConcepts: ["변경 감지", "flush"],
      missingConcepts: ["1차 캐시", "동일성 보장"],
      improvement: "스냅샷 비교 원리를 한 줄 추가",
      weaknesses: null,
      suggestedScore: null,
    },
  },
  {
    answerId: 6,
    participantId: 16,
    nickname: "도윤",
    content: "엔티티 매니저 안에 있는 저장소로, 여기에 들어간 엔티티만 JPA가 관리합니다.",
    aiFeedback: {
      status: "DONE",
      coveredConcepts: ["관리 대상 범위"],
      missingConcepts: ["1차 캐시", "쓰기 지연", "변경 감지"],
      improvement: "영속성 컨텍스트가 주는 이점을 예시로 보강",
      weaknesses: null,
      suggestedScore: null,
    },
  },
];

/** features/host/mock.ts QUESTION_RESULT.ranking — s6(도윤)은 원본에 없어 6등으로 채운다 */
const RANKING: RoomReportStudent[] = [
  {
    participantId: 11,
    nickname: "준영",
    rank: 1,
    totalScore: 1240,
    correctCount: 7,
    isGuest: true,
  },
  {
    participantId: 12,
    nickname: "혜림",
    rank: 2,
    totalScore: 1100,
    correctCount: 6,
    isGuest: true,
  },
  { participantId: 15, nickname: "민지", rank: 3, totalScore: 980, correctCount: 6, isGuest: true },
  { participantId: 13, nickname: "승혁", rank: 4, totalScore: 870, correctCount: 5, isGuest: true },
  { participantId: 14, nickname: "희표", rank: 5, totalScore: 760, correctCount: 5, isGuest: true },
  { participantId: 16, nickname: "도윤", rank: 6, totalScore: 640, correctCount: 4, isGuest: true },
];

let rated = false;

function toQuestionType(type: "multiple" | "essay" | "ox"): QuestionType {
  if (type === "multiple") return "MULTIPLE_CHOICE";
  if (type === "ox") return "OX";
  return "ESSAY";
}

function buildResultQuestion(q: ReportQuestionSource): ResultQuestionDto {
  const type = toQuestionType(q.type);

  if (q.type === "essay") {
    const mine = ESSAY_ANSWERS_Q3[0];
    return {
      questionId: q.no,
      questionNo: q.no,
      title: q.title,
      type,
      verdict: "AI_ANALYZED",
      myAnswer: mine.content,
      correctAnswer: null,
      explanation: null,
      earnedScore: 0,
      aiFeedback: mine.aiFeedback,
      hostReview: null,
    };
  }

  const verdict: AnswerVerdict = (q.accuracy ?? 0) >= 50 ? "CORRECT" : "WRONG";
  // 문항 상세(P-Web)가 "내가 고른 답 vs 정답"을 나란히 보여줘서 목도 두 값을 채운다.
  // 보기 원문이 목에 없어 번호로 대신한다 — 계약이 오면 실제 보기 텍스트가 들어온다.
  const correctChoice = "1번";
  const myChoice = verdict === "CORRECT" ? correctChoice : "2번";

  return {
    questionId: q.no,
    questionNo: q.no,
    title: q.title,
    type,
    verdict,
    myAnswer: myChoice,
    correctAnswer: correctChoice,
    explanation: null,
    // accuracy(정답률 %)를 점수로 쓰면 "획득 67점"처럼 읽혀 사실과 다르다
    earnedScore: verdict === "CORRECT" ? 1 : 0,
    aiFeedback: null,
    hostReview: null,
  };
}

/** GET /rooms/{roomId}/results/me — 참여자 개인 결과 */
export function mockMyResult(): SessionResultResponse {
  return {
    roomTitle: DEMO_ROOM.title,
    rank: 3,
    totalScore: 990,
    correctCount: 5,
    questionCount: REPORT_STATS.questions,
    canRate: !rated,
    isGuest: false,
    questions: REPORT_QUESTIONS.map(buildResultQuestion),
  };
}

/** GET /rooms/{roomId}/reports/me — AI 학습 리포트 */
export function mockMyReport(): LearningReportResponse {
  return {
    accuracyPercent: REPORT_STATS.accuracy,
    weakTopics: ["JPA 영속성", "트랜잭션", "인덱스"],
    improvementPoints: [
      "flush 시점을 예시와 함께 보강",
      "트랜잭션 범위와 함께 설명",
      "준영속·삭제 상태까지 생명주기로 정리",
    ],
  };
}

/** GET /rooms/{roomId}/results (호스트) */
export function mockRoomReport(): RoomReportResponse {
  return {
    roomTitle: DEMO_ROOM.title,
    pin: DEMO_ROOM.pin,
    status: "FINISHED",
    dateLabel: REPORT_DATE_LABEL,
    summary: {
      avgAccuracyPercent: REPORT_STATS.accuracy,
      studentCount: REPORT_STATS.students,
      questionCount: REPORT_STATS.questions,
      aiAnalysisCount: REPORT_STATS.aiAnalyses,
      avgScore: null,
      topScore: RANKING[0]?.totalScore ?? null,
    },
    questions: REPORT_QUESTIONS.map((q) => ({
      questionId: q.no,
      questionNo: q.no,
      title: q.title,
      type: toQuestionType(q.type),
      accuracyPercent: q.accuracy ?? null,
      aiFeedbackCount: q.aiCount ?? null,
    })),
    students: RANKING,
  };
}

/** @draft GET /rooms/{roomId}/questions/{questionId}/answers — 서술형 답안 목록(W-07 분석 패널) */
export function mockEssayAnswers(): EssayAnswersResponse {
  return { answers: ESSAY_ANSWERS_Q3 };
}

/** @draft POST /answers/{answerId}/review */
export function mockPostReview(): undefined {
  return undefined;
}

/** POST /rooms/{roomId}/ratings — 세션당 1회. 409 ALREADY_RATED */
export function mockSubmitRating(): undefined {
  if (rated) throw new AppError("Conflict", { code: "ALREADY_RATED" });
  rated = true;
  return undefined;
}
