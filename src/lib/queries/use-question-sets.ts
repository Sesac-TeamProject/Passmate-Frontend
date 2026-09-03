import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmQuestionSet,
  createQuestionSet,
  duplicateQuestionSet,
  generateFromFile,
  generateQuestionSet,
  getQuestionSet,
  getQuestionSets,
  updateQuestionSet,
} from "@/lib/api/question-sets";
import type {
  CreateQuestionSetRequest,
  GenerateQuestionSetRequest,
  QuestionSetStatusFilter,
  UpdateQuestionSetRequest,
} from "@/lib/types/dto";
import { qk } from "./keys";

/** GET /question-sets — status는 "CONFIRMED"만 확정으로 해석 */
export function useQuestionSets(status?: QuestionSetStatusFilter) {
  return useQuery({
    queryKey: qk.questionSets(status),
    queryFn: () => getQuestionSets(status),
  });
}

/** GET /question-sets/{id} */
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
    mutationFn: (body: CreateQuestionSetRequest) => createQuestionSet(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.questionSetsRoot });
    },
  });
}

/**
 * POST /question-sets/{setId}/questions/generate — 기존 세트에 AI 문항을 추가한다.
 * setId를 훅 인자가 아니라 뮤테이션 변수로 받는다 — 에디터는 세트를 갓 만든 직후에도 호출한다.
 */
export function useGenerateQuestionSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, body }: { setId: number; body: GenerateQuestionSetRequest }) =>
      generateQuestionSet(setId, body),
    onSuccess: (_data, { setId }) => {
      queryClient.invalidateQueries({ queryKey: qk.questionSetsRoot });
      queryClient.invalidateQueries({ queryKey: qk.questionSet(setId) });
    },
  });
}

/** PUT /question-sets/{setId} */
export function useUpdateQuestionSet(setId: number) {
  return useMutation({
    mutationFn: (body: UpdateQuestionSetRequest) => updateQuestionSet(setId, body),
  });
}

/** POST /question-sets/{id}/confirm. status가 바뀌므로 성공 시 문항 세트 목록을 갱신한다 */
export function useConfirmQuestionSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setId: number) => confirmQuestionSet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.questionSetsRoot });
    },
  });
}

/** POST /question-sets/{setId}/duplicate. 성공 시 문항 세트 목록을 갱신한다 */
export function useDuplicateQuestionSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setId: number) => duplicateQuestionSet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.questionSetsRoot });
    },
  });
}

/** POST /question-sets/{setId}/questions/generate-from-file — 강의자료 업로드 → 문항 생성 */
export function useGenerateFromFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, file }: { setId: number; file: File }) => generateFromFile(setId, file),
    onSuccess: (_data, { setId }) => {
      queryClient.invalidateQueries({ queryKey: qk.questionSet(setId) });
    },
  });
}
