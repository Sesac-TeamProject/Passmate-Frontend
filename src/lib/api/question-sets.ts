import type {
  AiGenerateRequest,
  PageResponse,
  QuestionRequest,
  QuestionResponse,
  QuestionSetCreateRequest,
  QuestionSetDetailResponse,
  QuestionSetListQuery,
  QuestionSetSummaryResponse,
  QuestionSetUpdateRequest,
} from "@/lib/types/dto";
import { request, requestMultipart } from "./client";

/** GET /question-sets?status&page&size — 오프셋 페이지(기본 정렬 createdAt desc) */
export function getQuestionSets(
  query: QuestionSetListQuery = {},
): Promise<PageResponse<QuestionSetSummaryResponse>> {
  return request<PageResponse<QuestionSetSummaryResponse>>("/question-sets", {
    query: { status: query.status, page: query.page, size: query.size },
  });
}

/** POST /question-sets — 빈 세트 생성. 응답은 **요약**(문항 없음) */
export function createQuestionSet(
  body: QuestionSetCreateRequest,
): Promise<QuestionSetSummaryResponse> {
  return request<QuestionSetSummaryResponse>("/question-sets", { method: "POST", body });
}

/** GET /question-sets/{setId} — `{set, questions}` 두 겹 */
export function getQuestionSet(setId: number): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}`);
}

/**
 * PUT /question-sets/{setId} — 제목·설명·문항 순서. 확정 전에만.
 * 문항 본문은 이 요청으로 못 보낸다(문항 API 4개를 쓴다).
 */
export function updateQuestionSet(
  setId: number,
  body: QuestionSetUpdateRequest,
): Promise<QuestionSetSummaryResponse> {
  return request<QuestionSetSummaryResponse>(`/question-sets/${setId}`, { method: "PUT", body });
}

/** POST /question-sets/{setId}/confirm — DRAFT → CONFIRMED. 문항이 없으면 409 QUESTION_SET_EMPTY */
export function confirmQuestionSet(setId: number): Promise<QuestionSetSummaryResponse> {
  return request<QuestionSetSummaryResponse>(`/question-sets/${setId}/confirm`, {
    method: "POST",
  });
}

/** POST /question-sets/{setId}/questions — 문항 직접 추가. 세트 끝에 붙는다 */
export function addQuestion(setId: number, body: QuestionRequest): Promise<QuestionResponse> {
  return request<QuestionResponse>(`/question-sets/${setId}/questions`, { method: "POST", body });
}

/** PUT /question-sets/{setId}/questions/{questionId} — 문항 수정(전체 교체) */
export function updateQuestion(
  setId: number,
  questionId: number,
  body: QuestionRequest,
): Promise<QuestionResponse> {
  return request<QuestionResponse>(`/question-sets/${setId}/questions/${questionId}`, {
    method: "PUT",
    body,
  });
}

/** DELETE /question-sets/{setId}/questions/{questionId} — 204. 남은 문항의 orderNo는 서버가 다시 매긴다 */
export function deleteQuestion(setId: number, questionId: number): Promise<void> {
  return request<void>(`/question-sets/${setId}/questions/${questionId}`, { method: "DELETE" });
}

/** POST /question-sets/{setId}/questions/{questionId}/regenerate — 문항 하나만 AI로 다시. 무료 횟수를 쓴다 */
export function regenerateQuestion(setId: number, questionId: number): Promise<QuestionResponse> {
  return request<QuestionResponse>(`/question-sets/${setId}/questions/${questionId}/regenerate`, {
    method: "POST",
  });
}

/**
 * POST /question-sets/{setId}/questions/generate — 조건으로 AI 문항을 세트에 추가.
 * 응답은 **새로 만들어진 문항 배열**이다(세트 상세가 아니다) — 붙인 뒤 상세를 다시 부른다.
 */
export function generateQuestions(
  setId: number,
  body: AiGenerateRequest,
): Promise<QuestionResponse[]> {
  return request<QuestionResponse[]>(`/question-sets/${setId}/questions/generate`, {
    method: "POST",
    body,
  });
}

/**
 * @draft POST /question-sets/{setId}/duplicate — 백엔드 미구현(실서버 404).
 * 목에서만 동작한다. 화면은 NotFound를 "준비 중"으로 안내한다.
 */
export function duplicateQuestionSet(setId: number): Promise<QuestionSetSummaryResponse> {
  return request<QuestionSetSummaryResponse>(`/question-sets/${setId}/duplicate`, {
    method: "POST",
  });
}

/**
 * @draft POST /question-sets/{setId}/questions/generate-from-file — 백엔드 미구현(실서버 404).
 * 자료 기반 출제는 당분간 `AiGenerateRequest.material`(텍스트 5000자)로 대체한다.
 */
export function generateFromFile(setId: number, file: File): Promise<QuestionResponse[]> {
  const form = new FormData();
  form.append("file", file);
  return requestMultipart<QuestionResponse[]>(
    `/question-sets/${setId}/questions/generate-from-file`,
    form,
  );
}
