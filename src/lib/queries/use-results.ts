import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEssayAnswers,
  getMyReport,
  getMyResult,
  getRoomReport,
  putHostReview,
} from "@/lib/api/results";
import type { HostReviewRequest } from "@/lib/types/dto";
import { qk } from "./keys";

/** GET /rooms/{roomId}/results/me */
export function useMyResult(roomId: number | null) {
  return useQuery({
    queryKey: qk.myResult(roomId ?? 0),
    queryFn: () => getMyResult(roomId as number),
    enabled: roomId !== null,
  });
}

/** GET /rooms/{roomId}/reports/me */
export function useMyReport(roomId: number | null) {
  return useQuery({
    queryKey: qk.myReport(roomId ?? 0),
    queryFn: () => getMyReport(roomId as number),
    enabled: roomId !== null,
  });
}

/** GET /rooms/{roomId}/results (호스트) */
export function useRoomReport(roomId: number | null) {
  return useQuery({
    queryKey: qk.sessionResults(roomId ?? 0),
    queryFn: () => getRoomReport(roomId as number),
    enabled: roomId !== null,
  });
}

/** GET /rooms/{roomId}/answers — questionId로 문항을 좁힌다 */
export function useEssayAnswers(roomId: number | null, questionId: number | null) {
  return useQuery({
    queryKey: qk.essayAnswers(roomId ?? 0, questionId ?? 0),
    queryFn: () => getEssayAnswers(roomId as number, questionId ?? undefined),
    enabled: roomId !== null && questionId !== null,
  });
}

/** PUT /rooms/{roomId}/answers/{answerId}/review. 성공 시 답안 목록과 방 리포트를 갱신한다 */
export function usePostHostReview(roomId: number, questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, body }: { answerId: number; body: HostReviewRequest }) =>
      putHostReview(roomId, answerId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.essayAnswers(roomId, questionId) });
      queryClient.invalidateQueries({ queryKey: qk.sessionResults(roomId) });
    },
  });
}
