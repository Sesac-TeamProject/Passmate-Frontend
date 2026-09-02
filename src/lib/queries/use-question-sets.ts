import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addQuestion,
  confirmQuestionSet,
  createQuestionSet,
  deleteQuestion,
  duplicateQuestionSet,
  generateFromFile,
  generateQuestions,
  getQuestionSet,
  getQuestionSets,
  regenerateQuestion,
  updateQuestion,
  updateQuestionSet,
} from "@/lib/api/question-sets";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  AiGenerateRequest,
  QuestionRequest,
  QuestionSetCreateRequest,
  QuestionSetListQuery,
  QuestionSetUpdateRequest,
} from "@/lib/types/dto";
import { qk } from "./keys";

/** GET /question-sets — 오프셋 페이지. 페이지를 넘겨도 목록이 깜빡이지 않게 이전 결과를 유지한다 */
export function useQuestionSets(query: QuestionSetListQuery = {}) {
  return useQuery({
    queryKey: qk.questionSets(query),
    queryFn: () => getQuestionSets(query),
    placeholderData: keepPreviousData,
  });
}

/** GET /question-sets/{id} — `{set, questions}` */
export function useQuestionSet(setId: number | null) {
  return useQuery({
    queryKey: qk.questionSet(setId ?? 0),
    queryFn: () => getQuestionSet(setId as number),
    enabled: setId !== null,
  });
}

/** POST /question-sets — 빈 세트 생성. 성공 시 목록을 갱신한다 */
export function useCreateQuestionSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: QuestionSetCreateRequest) => createQuestionSet(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.questionSetsRoot });
    },
  });
}

/** 세트 상세와 목록을 함께 갱신한다 — 문항이 바뀌면 요약의 문항 수·총 배점도 바뀐다 */
function useInvalidateSet() {
  const queryClient = useQueryClient();

  return (setId: number) => {
    queryClient.invalidateQueries({ queryKey: qk.questionSet(setId) });
    queryClient.invalidateQueries({ queryKey: qk.questionSetsRoot });
  };
}

/** PUT /question-sets/{setId} — 제목·설명·문항 순서 */
export function useUpdateQuestionSet() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: ({ setId, body }: { setId: number; body: QuestionSetUpdateRequest }) =>
      updateQuestionSet(setId, body),
    onSuccess: (_data, { setId }) => invalidate(setId),
  });
}

/** POST /question-sets/{setId}/questions — 문항 직접 추가 */
export function useAddQuestion() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: ({ setId, body }: { setId: number; body: QuestionRequest }) =>
      addQuestion(setId, body),
    onSuccess: (_data, { setId }) => invalidate(setId),
  });
}

/** PUT /question-sets/{setId}/questions/{questionId} — 문항 수정 */
export function useUpdateQuestion() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: ({
      setId,
      questionId,
      body,
    }: {
      setId: number;
      questionId: number;
      body: QuestionRequest;
    }) => updateQuestion(setId, questionId, body),
    onSuccess: (_data, { setId }) => invalidate(setId),
  });
}

/** DELETE /question-sets/{setId}/questions/{questionId} — 남은 문항 번호는 서버가 다시 매긴다 */
export function useDeleteQuestion() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: ({ setId, questionId }: { setId: number; questionId: number }) =>
      deleteQuestion(setId, questionId),
    onSuccess: (_data, { setId }) => invalidate(setId),
  });
}

/** POST …/questions/{questionId}/regenerate — 문항 하나만 AI로 다시 만든다(무료 횟수 소모) */
export function useRegenerateQuestion() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: ({ setId, questionId }: { setId: number; questionId: number }) =>
      regenerateQuestion(setId, questionId),
    onSuccess: (_data, { setId }) => invalidate(setId),
  });
}

/**
 * POST /question-sets/{setId}/questions/generate — 세트에 AI 문항을 붙인다.
 * setId를 훅 인자가 아니라 뮤테이션 변수로 받는다 — 에디터는 세트를 갓 만든 직후에도 호출한다.
 */
export function useGenerateQuestions() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: ({ setId, body }: { setId: number; body: AiGenerateRequest }) =>
      generateQuestions(setId, body),
    onSuccess: (_data, { setId }) => invalidate(setId),
  });
}

/** POST /question-sets/{setId}/confirm — DRAFT → CONFIRMED. 문항이 없으면 409 QUESTION_SET_EMPTY */
export function useConfirmQuestionSet() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: (setId: number) => confirmQuestionSet(setId),
    onSuccess: (_data, setId) => invalidate(setId),
  });
}

/** @draft POST /question-sets/{setId}/duplicate — 실서버 404(백엔드 미구현). 목에서만 동작 */
export function useDuplicateQuestionSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setId: number) => duplicateQuestionSet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.questionSetsRoot });
    },
  });
}

/** @draft POST …/questions/generate-from-file — 실서버 404. 자료 기반 출제는 `material` 텍스트로 대체 */
export function useGenerateFromFile() {
  const invalidate = useInvalidateSet();

  return useMutation({
    mutationFn: ({ setId, file }: { setId: number; file: File }) => generateFromFile(setId, file),
    onSuccess: (_data, { setId }) => invalidate(setId),
  });
}

/**
 * AI 생성·재생성 실패 문구 — HTTP 숫자가 아니라 서버 `code`로 분기한다(규칙 §10).
 * 429는 무료 횟수 소진, 502는 외부 호출 실패(무료 횟수는 깎이지 않는다)로 뜻이 다르다.
 */
export function toGenerateErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "생성에 실패했어요. 다시 요청해 주세요";

  switch (error.code) {
    case ERROR_CODES.AI_FREE_LIMIT_EXCEEDED:
      return "AI 생성 무료 횟수를 다 썼어요. 직접 문항을 추가해 주세요";
    case ERROR_CODES.AI_GENERATION_FAILED:
      return "생성에 실패했어요. 횟수는 깎이지 않았으니 다시 요청해 주세요";
    case ERROR_CODES.QUESTION_SET_ALREADY_CONFIRMED:
      return "확정한 세트는 고칠 수 없어요. 새 세트를 만들어 주세요";
    case ERROR_CODES.INSUFFICIENT_COINS:
      return "코인이 부족해요. 충전하거나 직접 작성해 주세요";
    default:
      return error.message;
  }
}
