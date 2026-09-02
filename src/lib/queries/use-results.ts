import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyAnswer,
  getMyReport,
  getMyResult,
  getParticipantResult,
  getReviewTargets,
  getSessionResults,
  putHostReview,
  requestEssayAnalysis,
} from "@/lib/api/results";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type { HostReviewRequest } from "@/lib/types/dto";
import { qk } from "./keys";

/** 분석이 끝났는지 다시 묻는 간격 — 완료를 알려주는 이벤트가 없어 폴링뿐이다 */
const ANALYSIS_POLL_MS = 2000;

/** GET /rooms/{roomId}/results/me — 게스트도 부를 수 있다 */
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

/** GET /rooms/{roomId}/results (호스트) — 요약·문항별·학생별 통계 */
export function useSessionResults(roomId: number | null) {
  return useQuery({
    queryKey: qk.sessionResults(roomId ?? 0),
    queryFn: () => getSessionResults(roomId as number),
    enabled: roomId !== null,
  });
}

/** GET /rooms/{roomId}/results/participants/{participantId} (호스트) */
export function useParticipantResult(roomId: number | null, participantId: number | null) {
  return useQuery({
    queryKey: qk.participantResult(roomId ?? 0, participantId ?? 0),
    queryFn: () => getParticipantResult(roomId as number, participantId as number),
    enabled: roomId !== null && participantId !== null,
  });
}

/**
 * GET …/answers/me — 내 답안과 AI 분석.
 * `PENDING`인 동안만 2초마다 다시 묻는다 — 분석 완료를 알려주는 이벤트가 서버에 없다.
 */
export function useMyAnswer(roomId: number | null, questionId: number | null) {
  return useQuery({
    queryKey: qk.myAnswer(roomId ?? 0, questionId ?? 0),
    queryFn: () => getMyAnswer(roomId as number, questionId as number),
    enabled: roomId !== null && questionId !== null,
    refetchInterval: (query) =>
      query.state.data?.analysisStatus === "PENDING" ? ANALYSIS_POLL_MS : false,
  });
}

/**
 * POST …/answers/me/analysis — 202로 접수만 된다.
 * 성공하면 `PENDING`으로 바뀌며 위 폴링이 결과를 기다린다.
 */
export function useRequestEssayAnalysis(roomId: number, questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestEssayAnalysis(roomId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.myAnswer(roomId, questionId) });
      // 코인이 깎였을 수 있다 — 잔액은 내 프로필에 들어 있다
      queryClient.invalidateQueries({ queryKey: qk.me, exact: true });
    },
  });
}

/** 서술형 분석 요청 실패 문구 — 서버 `code`로 분기한다 */
export function toAnalysisErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "분석을 요청하지 못했어요. 다시 시도해 주세요";

  switch (error.code) {
    case ERROR_CODES.GUEST_NOT_ALLOWED:
      return "AI 분석은 회원만 받을 수 있어요. 로그인 후 다시 시도해 주세요";
    case ERROR_CODES.INSUFFICIENT_COINS:
      return "무료 횟수를 다 썼고 코인이 모자라요. 충전한 뒤 다시 시도해 주세요";
    case ERROR_CODES.AI_ANALYSIS_FAILED:
      return "분석에 실패했어요. 차감된 코인은 돌려드렸어요 — 다시 요청할 수 있어요";
    default:
      return error.message;
  }
}

/** GET /rooms/{roomId}/answers — 첨삭 대상 목록. 문항·학생으로 좁힌다 */
export function useReviewTargets(
  roomId: number | null,
  filter: { questionId?: number; participantId?: number } = {},
) {
  return useQuery({
    queryKey: qk.reviewTargets(roomId ?? 0, filter),
    queryFn: () => getReviewTargets(roomId as number, filter),
    enabled: roomId !== null,
  });
}

/**
 * @draft PUT /rooms/{roomId}/answers/{answerId}/review — **백엔드 미구현**(실서버 404).
 * 목에서만 동작한다. 화면은 NotFound를 "준비 중"으로 안내한다.
 */
export function usePostHostReview(roomId: number, questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, body }: { answerId: number; body: HostReviewRequest }) =>
      putHostReview(roomId, answerId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.reviewTargets(roomId, { questionId }) });
      queryClient.invalidateQueries({ queryKey: qk.sessionResults(roomId) });
    },
  });
}
