import type {
  ContentSource,
  Difficulty,
  QuestionSetStatus,
  QuestionSource,
  QuestionType,
} from "./common";

/**
 * 문제 세트·문항 — 백엔드 `question/dto/*.kt` 1:1
 * (`contracts/rest-api.md` §2-4, `data-model.md` §2-2).
 *
 * 세트는 확정(CONFIRMED)되면 **불변**이다. 확정 뒤 수정·문항 CRUD·생성은 409
 * `QUESTION_SET_ALREADY_CONFIRMED`로 막힌다.
 */

/** 목록·세트 선택에서 쓰는 요약. 문항은 들어 있지 않다 */
export type QuestionSetSummaryResponse = {
  id: number;
  title: string;
  description?: string;
  status: QuestionSetStatus;
  /** 문항 출처가 섞이면 MIXED */
  source?: ContentSource;
  questionCount: number;
  totalPoints: number;
  /** 문항 제한시간 합(초). 화면에서 분으로 환산해 "예상 N분"을 만든다 */
  estimatedSeconds?: number;
  /** 이 세트로 연 방 수 */
  usageCount: number;
  lastUsedAt?: string;
  confirmedAt?: string;
  createdAt?: string;
};

/**
 * 문항 한 건.
 * `answer`는 **세트 편집 화면에서만** 내려온다 — 세션 진행 중 이벤트에는 절대 포함되지 않는다.
 */
export type QuestionResponse = {
  id: number;
  /** 1부터. 순서 변경은 `QuestionSetUpdateRequest.questionOrder`로 한다 */
  orderNo: number;
  type: QuestionType;
  content: string;
  /** MCQ는 2개 이상 */
  choices?: string[];
  /** MCQ는 보기 **원문** 중 하나 · OX는 "O"|"X" · ESSAY는 모범답안 */
  answer?: string;
  explanation?: string;
  topic?: string;
  difficulty?: Difficulty;
  timeLimitSec: number;
  points: number;
  source: QuestionSource;
};

/** GET /question-sets/{setId} — 세트와 문항이 **두 겹**으로 온다 */
export type QuestionSetDetailResponse = {
  set: QuestionSetSummaryResponse;
  questions: QuestionResponse[];
};

/** POST /question-sets — 빈 세트를 만들고 문항은 뒤에 채운다 */
export type QuestionSetCreateRequest = { title: string; description?: string };

/**
 * PUT /question-sets/{setId} — 확정 전에만.
 * **문항 본문은 여기로 못 보낸다** — 문항은 개별 API(POST/PUT/DELETE)로 다룬다(R-12).
 */
export type QuestionSetUpdateRequest = {
  title: string;
  description?: string;
  /** 순서를 바꿀 때 원하는 순서대로 문항 id를 **전부** 보낸다. 비우면 순서 유지 */
  questionOrder?: number[];
};

/** POST/PUT /question-sets/{setId}/questions[/{questionId}] */
export type QuestionRequest = {
  type: QuestionType;
  content: string;
  choices?: string[];
  answer?: string;
  explanation?: string;
  topic?: string;
  difficulty?: Difficulty;
  /** 5~600. 생략하면 서버 기본 30 */
  timeLimitSec?: number;
  /** 1~1000. 생략하면 서버 기본 100 */
  points?: number;
};

/**
 * POST /question-sets/{setId}/questions/generate — 생성된 문항은 세트 **끝에** 붙는다.
 * 무료 5회(누적)를 넘기면 429 `AI_FREE_LIMIT_EXCEEDED`, 외부 호출이 실패하면 502
 * `AI_GENERATION_FAILED`(무료 횟수는 깎이지 않는다).
 */
export type AiGenerateRequest = {
  /** ≤100자 */
  topic: string;
  /** 유형별 개수 맵. 합계 1~20 — 예: `{ MCQ: 5, ESSAY: 3 }` */
  counts: Partial<Record<QuestionType, number>>;
  /** 생략하면 NORMAL */
  difficulty?: Difficulty;
  /** 강의자료 본문 ≤5000자. 넣으면 이 범위 안에서 출제한다 */
  material?: string;
  timeLimitSec?: number;
  points?: number;
};

/** GET /question-sets 쿼리 — 오프셋 페이지 */
export type QuestionSetListQuery = {
  status?: QuestionSetStatus;
  page?: number;
  size?: number;
};

/** 목록 필터에서 쓰는 상태값. `QuestionSetStatus`와 같다 */
export type QuestionSetStatusFilter = QuestionSetStatus;
