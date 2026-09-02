import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  AiGenerateRequest,
  PageResponse,
  QuestionRequest,
  QuestionResponse,
  QuestionSetDetailResponse,
  QuestionSetSummaryResponse,
  QuestionSetUpdateRequest,
} from "@/lib/types/dto";
import { QUESTION_SETS, SET_QUESTIONS } from "./fixtures";

/**
 * 문제 세트(question-sets) 목 응답 — 백엔드 `QuestionSetController` 계약 그대로.
 *
 * 서버와 같은 규칙 두 가지를 지킨다:
 * 1. 목록은 **오프셋 페이지**(`PageResponse`)다.
 * 2. **확정(CONFIRMED) 세트는 불변**이다 — 수정·문항 CRUD·생성이 409로 막힌다.
 */

const GENERATE_DELAY_MS = 1500;
const DEFAULT_PAGE_SIZE = 20;
/** 서버 정책 `passmate.policy.ai.free-generate-count` */
const FREE_GENERATE_COUNT = 5;

type MockSet = { set: QuestionSetSummaryResponse; questions: QuestionResponse[] };

/** 시연용 세트 4개 — 1번만 문항을 갖고 있다(나머지는 목록 카드용) */
let sets: MockSet[] = QUESTION_SETS.map((set) => ({
  set,
  questions: set.id === 1 ? SET_QUESTIONS.map((q) => ({ ...q })) : [],
}));

let nextSetId = 1000;
let nextQuestionId = 1000;
let generateCount = 0;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowServerTime(): string {
  return new Date().toISOString().slice(0, 19);
}

function find(id: string | number): MockSet {
  const numericId = Number(id);
  const found = sets.find((s) => s.set.id === numericId);
  if (!found) throw new AppError("NotFound", { code: ERROR_CODES.QUESTION_SET_NOT_FOUND });
  return found;
}

/** 확정 세트는 서버가 409로 막는다 — 목도 같이 막아야 화면 분기를 검증할 수 있다 */
function assertDraft(target: MockSet): void {
  if (target.set.status === "CONFIRMED")
    throw new AppError("Conflict", { code: ERROR_CODES.QUESTION_SET_ALREADY_CONFIRMED });
}

/** 문항이 바뀌면 요약의 집계값(문항 수·총 배점·예상 시간)도 서버처럼 다시 계산한다 */
function recount(target: MockSet): void {
  target.questions.forEach((q, i) => {
    q.orderNo = i + 1;
  });
  target.set = {
    ...target.set,
    questionCount: target.questions.length,
    totalPoints: target.questions.reduce((sum, q) => sum + q.points, 0),
    estimatedSeconds: target.questions.reduce((sum, q) => sum + q.timeLimitSec, 0),
    source: toContentSource(target.questions),
  };
}

function toContentSource(questions: QuestionResponse[]): QuestionSetSummaryResponse["source"] {
  if (questions.length === 0) return undefined;
  const hasAi = questions.some((q) => q.source === "AI");
  const hasManual = questions.some((q) => q.source === "MANUAL");
  if (hasAi && hasManual) return "MIXED";
  return hasAi ? "AI" : "MANUAL";
}

function toQuestion(body: QuestionRequest, source: QuestionResponse["source"]): QuestionResponse {
  return {
    id: nextQuestionId++,
    orderNo: 0, // recount가 다시 매긴다
    type: body.type,
    content: body.content,
    ...(body.choices ? { choices: body.choices } : {}),
    ...(body.answer ? { answer: body.answer } : {}),
    ...(body.explanation ? { explanation: body.explanation } : {}),
    ...(body.topic ? { topic: body.topic } : {}),
    ...(body.difficulty ? { difficulty: body.difficulty } : {}),
    timeLimitSec: body.timeLimitSec ?? 30,
    points: body.points ?? 100,
    source,
  };
}

/** GET /question-sets?status&page&size */
export function mockQuestionSets(url: URL): PageResponse<QuestionSetSummaryResponse> {
  const status = url.searchParams.get("status");
  const page = Number(url.searchParams.get("page") ?? 0);
  const size = Number(url.searchParams.get("size") ?? DEFAULT_PAGE_SIZE);

  const all = status ? sets.filter((s) => s.set.status === status) : sets;
  const content = all.slice(page * size, page * size + size).map((s) => s.set);

  return {
    content,
    page,
    size,
    totalElements: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / size)),
    hasNext: (page + 1) * size < all.length,
  };
}

/** POST /question-sets — 빈 세트. 응답은 요약(문항 없음) */
export function mockCreateQuestionSet(body: unknown): QuestionSetSummaryResponse {
  const title =
    typeof body === "object" && body !== null && "title" in body && typeof body.title === "string"
      ? body.title
      : "새 세트";
  const set: QuestionSetSummaryResponse = {
    id: nextSetId++,
    title,
    status: "DRAFT",
    questionCount: 0,
    totalPoints: 0,
    usageCount: 0,
    createdAt: nowServerTime(),
  };
  sets = [{ set, questions: [] }, ...sets];
  return set;
}

/** GET /question-sets/{setId} — `{set, questions}` */
export function mockQuestionSetDetail(id: string): QuestionSetDetailResponse {
  const target = find(id);
  return { set: target.set, questions: target.questions };
}

/** PUT /question-sets/{setId} — 제목·설명·문항 순서. 확정 전에만 */
export function mockUpdateQuestionSet(
  id: string,
  body: QuestionSetUpdateRequest,
): QuestionSetSummaryResponse {
  const target = find(id);
  assertDraft(target);

  target.set = {
    ...target.set,
    title: body.title,
    ...(body.description !== undefined ? { description: body.description } : {}),
  };

  if (body.questionOrder) {
    const byId = new Map(target.questions.map((q) => [q.id, q]));
    const reordered = body.questionOrder
      .map((qid) => byId.get(qid))
      .filter((q): q is QuestionResponse => q !== undefined);
    // 목록에 빠진 문항이 있으면 뒤에 그대로 붙인다 — 서버도 순서만 바꾸고 문항을 지우지 않는다
    const rest = target.questions.filter((q) => !body.questionOrder?.includes(q.id));
    target.questions = [...reordered, ...rest];
  }

  recount(target);
  return target.set;
}

/** POST /question-sets/{setId}/confirm — 문항이 없으면 409 */
export function mockConfirmQuestionSet(id: string): QuestionSetSummaryResponse {
  const target = find(id);
  assertDraft(target);
  if (target.questions.length === 0)
    throw new AppError("Conflict", { code: ERROR_CODES.QUESTION_SET_EMPTY });

  target.set = { ...target.set, status: "CONFIRMED", confirmedAt: nowServerTime() };
  return target.set;
}

/** POST /question-sets/{setId}/questions — 문항 추가(끝에 붙는다) */
export function mockAddQuestion(id: string, body: QuestionRequest): QuestionResponse {
  const target = find(id);
  assertDraft(target);

  const question = toQuestion(body, "MANUAL");
  target.questions = [...target.questions, question];
  recount(target);
  return question;
}

/** PUT /question-sets/{setId}/questions/{questionId} — 전체 교체 */
export function mockUpdateQuestion(
  id: string,
  questionId: string,
  body: QuestionRequest,
): QuestionResponse {
  const target = find(id);
  assertDraft(target);

  const index = target.questions.findIndex((q) => q.id === Number(questionId));
  if (index < 0) throw new AppError("NotFound", { code: ERROR_CODES.QUESTION_NOT_FOUND });

  const current = target.questions[index];
  const updated = { ...toQuestion(body, current.source), id: current.id };
  target.questions = target.questions.map((q, i) => (i === index ? updated : q));
  recount(target);
  return updated;
}

/** DELETE /question-sets/{setId}/questions/{questionId} — 204. 남은 문항 orderNo 재부여 */
export function mockDeleteQuestion(id: string, questionId: string): undefined {
  const target = find(id);
  assertDraft(target);

  const numericId = Number(questionId);
  if (!target.questions.some((q) => q.id === numericId))
    throw new AppError("NotFound", { code: ERROR_CODES.QUESTION_NOT_FOUND });

  target.questions = target.questions.filter((q) => q.id !== numericId);
  recount(target);
  return undefined;
}

/** POST …/questions/{questionId}/regenerate — 무료 횟수를 쓴다 */
export function mockRegenerateQuestion(id: string, questionId: string): QuestionResponse {
  const target = find(id);
  assertDraft(target);
  assertFreeQuota();

  const index = target.questions.findIndex((q) => q.id === Number(questionId));
  if (index < 0) throw new AppError("NotFound", { code: ERROR_CODES.QUESTION_NOT_FOUND });

  const current = target.questions[index];
  const regenerated: QuestionResponse = {
    ...current,
    content: `${current.content} (다시 만든 문항)`,
    source: "AI",
  };
  target.questions = target.questions.map((q, i) => (i === index ? regenerated : q));
  recount(target);
  return regenerated;
}

/** 무료 5회를 넘기면 서버처럼 429를 던진다 — 화면의 소진 안내를 목에서도 볼 수 있게 */
function assertFreeQuota(): void {
  if (generateCount >= FREE_GENERATE_COUNT)
    throw new AppError("RateLimited", { code: ERROR_CODES.AI_FREE_LIMIT_EXCEEDED, status: 429 });
  generateCount += 1;
}

/**
 * POST /question-sets/{setId}/questions/generate — 응답은 **새로 만든 문항 배열**이다.
 * 생성에 시간이 걸리는 것까지 흉내 낸다(화면의 "생성 중…"을 볼 수 있게).
 */
export async function mockGenerate(
  id: string,
  body: AiGenerateRequest,
): Promise<QuestionResponse[]> {
  const target = find(id);
  assertDraft(target);
  assertFreeQuota();

  await delay(GENERATE_DELAY_MS);

  const total = Object.values(body.counts).reduce((sum, n) => sum + (n ?? 0), 0);
  const created = SET_QUESTIONS.slice(0, Math.max(1, Math.min(total, SET_QUESTIONS.length))).map(
    (sample) => ({
      ...sample,
      id: nextQuestionId++,
      topic: body.topic,
      difficulty: body.difficulty ?? "NORMAL",
      timeLimitSec: body.timeLimitSec ?? sample.timeLimitSec,
      points: body.points ?? sample.points,
      source: "AI" as const,
    }),
  );

  target.questions = [...target.questions, ...created];
  recount(target);
  return created;
}

/**
 * @draft POST /question-sets/{setId}/duplicate — 백엔드 미구현(실서버 404).
 * 목에서만 동작한다.
 */
export function mockDuplicateQuestionSet(id: string): QuestionSetSummaryResponse {
  const source = find(id);
  const set: QuestionSetSummaryResponse = {
    ...source.set,
    id: nextSetId++,
    title: `${source.set.title} (복제)`,
    status: "DRAFT",
    usageCount: 0,
    lastUsedAt: undefined,
    confirmedAt: undefined,
    createdAt: nowServerTime(),
  };
  sets = [
    { set, questions: source.questions.map((q) => ({ ...q, id: nextQuestionId++ })) },
    ...sets,
  ];
  return set;
}

/**
 * @draft POST …/questions/generate-from-file — 백엔드 미구현(실서버 404).
 * 라우트 스윕이 실제 FormData가 아닌 `{}`로도 호출하므로 `instanceof` 가드를 둔다.
 */
export async function mockGenerateFromFile(
  id: string,
  form: FormData,
): Promise<QuestionResponse[]> {
  const file = form instanceof FormData ? (form.get("file") as File | null) : null;
  return mockGenerate(id, { topic: file?.name ?? "업로드 자료", counts: { MCQ: 3 } });
}
