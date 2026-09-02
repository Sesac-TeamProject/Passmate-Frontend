import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endCurrentQuestion,
  endSession,
  getQuestionResult,
  getRanking,
  getSubmissions,
  getVoiceHints,
  lockScreen,
  nextQuestion,
  startSession,
  submitAnswer,
  uploadVoiceHint,
} from "@/lib/api/sessions";
import { useSessionStore } from "@/lib/stores/session-store";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { qk } from "./keys";

/**
 * 세션 제어는 전부 **204**다 — 화면 전환은 응답이 아니라 뒤따라오는 STOMP 이벤트가 만든다.
 * 그래서 성공 시 스냅샷을 강제로 다시 읽지 않는다(이벤트가 오지 않는 목 모드는 목이 대신 발행한다).
 */

/** POST /rooms/{roomId}/session/start */
export function useStartSession(roomId: number) {
  return useMutation({ mutationFn: () => startSession(roomId) });
}

/** POST /rooms/{roomId}/session/next — 마지막 문항 뒤면 409 SESSION_ALREADY_FINISHED */
export function useNextQuestion(roomId: number) {
  return useMutation({ mutationFn: () => nextQuestion(roomId) });
}

/** POST /rooms/{roomId}/session/current/end */
export function useEndCurrentQuestion(roomId: number) {
  return useMutation({ mutationFn: () => endCurrentQuestion(roomId) });
}

/** POST /rooms/{roomId}/session/end */
export function useEndSession(roomId: number) {
  return useMutation({ mutationFn: () => endSession(roomId) });
}

/**
 * PUT /rooms/{roomId}/session/lock — 응답이 잠금 상태를 돌려주므로 스토어에 바로 반영한다.
 * `SCREEN_LOCKED` 이벤트도 뒤따라 오지만, 누른 사람 화면이 먼저 바뀌는 편이 자연스럽다.
 */
export function useLockScreen(roomId: number) {
  return useMutation({
    mutationFn: (locked: boolean) => lockScreen(roomId, locked),
    onSuccess: (res) => {
      useSessionStore.setState({ screenLocked: res.screenLocked });
    },
  });
}

/**
 * GET /rooms/{roomId}/session/current/submissions (호스트).
 * 집계는 `SUBMISSION_UPDATED` 이벤트로도 오지만, 호스트가 늦게 들어온 경우를 위해 한 번은 읽는다.
 * 참가자별 제출 여부는 서버에 없다 — 집계(제출 수·정답률·보기 분포)만 온다.
 */
export function useSubmissions(roomId: number | null, enabled: boolean, refetchMs?: number) {
  return useQuery({
    queryKey: qk.submissions(roomId ?? 0),
    queryFn: () => getSubmissions(roomId as number),
    enabled: roomId !== null && enabled,
    refetchInterval: refetchMs,
  });
}

/** GET /rooms/{roomId}/session/ranking — 이벤트를 놓쳤을 때 지금 순위를 다시 읽는다 */
export function useRanking(roomId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: qk.ranking(roomId ?? 0),
    queryFn: () => getRanking(roomId as number),
    enabled: roomId !== null && enabled,
  });
}

/** GET …/session/questions/{questionId}/result — **마감된 문항만**. 정답·해설·보기 분포가 온다 */
export function useQuestionResult(roomId: number | null, questionId: number | null) {
  return useQuery({
    queryKey: qk.questionResult(roomId ?? 0, questionId ?? 0),
    queryFn: () => getQuestionResult(roomId as number, questionId as number),
    enabled: roomId !== null && questionId !== null,
  });
}

/**
 * POST …/questions/{questionId}/answers.
 * 성공하면 스토어에 "냈다"를 표시한다 — 서버는 내 제출을 이벤트로 되돌려주지 않는다.
 */
export function useSubmitAnswer(roomId: number) {
  return useMutation({
    mutationFn: ({ questionId, submitted }: { questionId: number; submitted: string }) =>
      submitAnswer(roomId, questionId, submitted),
    onSuccess: () => {
      useSessionStore.getState().markSubmitted();
    },
  });
}

/** 세션 제어 실패 문구 — 서버 `code`로 분기한다(규칙 §10) */
export function toSessionControlMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "요청을 처리하지 못했어요. 다시 시도해 주세요";

  switch (error.code) {
    case ERROR_CODES.QUESTION_SET_REQUIRED:
      return "확정한 문제 세트를 먼저 연결해 주세요";
    case ERROR_CODES.SESSION_ALREADY_FINISHED:
      return "모든 문항이 끝났어요. 세션 종료를 눌러 주세요";
    case ERROR_CODES.SESSION_NOT_RUNNING:
      return "진행 중인 세션이 아니에요";
    case ERROR_CODES.NOT_ROOM_HOST:
      return "방을 연 선생님만 진행할 수 있어요";
    default:
      return error.message;
  }
}

/** 답안 제출 실패 문구 — 학생 화면용 */
export function toSubmitAnswerMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "답을 내지 못했어요. 다시 시도해 주세요";

  switch (error.code) {
    case ERROR_CODES.ALREADY_SUBMITTED:
      return "이미 답을 냈어요";
    case ERROR_CODES.SCREEN_LOCKED:
      return "선생님이 화면을 잠갔어요. 잠시만 기다려 주세요";
    case ERROR_CODES.QUESTION_NOT_RUNNING:
      return "지금은 답을 낼 수 없는 문항이에요";
    case ERROR_CODES.SESSION_NOT_RUNNING:
      return "세션이 진행 중이 아니에요";
    default:
      return error.kind === "Unauthorized"
        ? "입장 정보가 만료됐어요. 다시 입장해 주세요"
        : error.message;
  }
}

/** @draft GET /rooms/{roomId}/session/hints — 백엔드 미구현(실서버 404). 목 전용 */
export function useVoiceHints(roomId: number | null) {
  return useQuery({
    queryKey: qk.hints(roomId ?? 0),
    queryFn: () => getVoiceHints(roomId as number),
    enabled: roomId !== null,
  });
}

/** @draft POST /rooms/{roomId}/session/hints — 백엔드 미구현(실서버 404). 목 전용 */
export function useUploadVoiceHint(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clip, durationMs }: { clip: Blob; durationMs: number }) =>
      uploadVoiceHint(roomId, clip, durationMs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.hints(roomId) });
    },
  });
}
