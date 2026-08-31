import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cloneQuestionSet,
  confirmQuestionSet,
  generateQuestionSet,
  getAiUsage,
  getQuestionSet,
  getQuestionSets,
  updateQuestionSet,
  uploadMaterial,
} from "@/lib/api/question-sets";
import type {
  GenerateQuestionSetRequest,
  QuestionSetStatusFilter,
  UpdateQuestionSetRequest,
} from "@/lib/types/dto";
import { qk } from "./keys";

/** 상태 무관하게 문항 세트 목록 캐시 전체(모든 status 변형)를 무효화한다 */
const QUESTION_SETS_LIST_KEY = ["question-sets"] as const;

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

/** POST /question-sets/generate. 성공 시 문항 세트 목록과 AI 사용량을 갱신한다 */
export function useGenerateQuestionSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: GenerateQuestionSetRequest) => generateQuestionSet(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_SETS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: qk.aiUsage });
    },
  });
}

/** PATCH /question-sets/{id} */
export function useUpdateQuestionSet(setId: number) {
  return useMutation({
    mutationFn: (body: UpdateQuestionSetRequest) => updateQuestionSet(setId, body),
  });
}

/** POST /question-sets/{id}/confirm */
export function useConfirmQuestionSet() {
  return useMutation({
    mutationFn: (setId: number) => confirmQuestionSet(setId),
  });
}

/** POST /question-sets/{id}/clone. 성공 시 문항 세트 목록을 갱신한다 */
export function useCloneQuestionSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setId: number) => cloneQuestionSet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_SETS_LIST_KEY });
    },
  });
}

/** GET /me/ai-usage */
export function useAiUsage() {
  return useQuery({
    queryKey: qk.aiUsage,
    queryFn: () => getAiUsage(),
  });
}

/** POST /materials — 자료 업로드(멀티파트 "file") */
export function useUploadMaterial() {
  return useMutation({
    mutationFn: (file: File) => uploadMaterial(file),
  });
}
