import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endCurrentQuestion,
  endSession,
  getSubmissions,
  getVoiceHints,
  lockScreen,
  nextQuestion,
  startSession,
  submitAnswer,
  uploadVoiceHint,
} from "@/lib/api/sessions";
import { qk } from "./keys";

/** POST /rooms/{roomId}/session/start. 성공 시 세션 스냅샷을 갱신한다 */
export function useStartSession(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startSession(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.snapshot(roomId) });
    },
  });
}

/** POST /rooms/{roomId}/session/next. 성공 시 세션 스냅샷을 갱신한다 */
export function useNextQuestion(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => nextQuestion(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.snapshot(roomId) });
    },
  });
}

/** POST /rooms/{roomId}/session/current/end. 성공 시 세션 스냅샷을 갱신한다 */
export function useEndCurrentQuestion(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => endCurrentQuestion(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.snapshot(roomId) });
    },
  });
}

/** POST /rooms/{roomId}/session/end. 성공 시 세션 스냅샷을 갱신한다 */
export function useEndSession(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => endSession(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.snapshot(roomId) });
    },
  });
}

/** PUT /rooms/{roomId}/session/lock {locked}. 성공 시 세션 스냅샷을 갱신한다 */
export function useLockScreen(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locked: boolean) => lockScreen(roomId, locked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.snapshot(roomId) });
    },
  });
}

/**
 * GET /rooms/{roomId}/session/current/submissions (호스트).
 * SUBMISSION_UPDATED 수신 시 갱신은 Task 6의 실시간 연결 훅이 invalidate로 담당한다.
 */
/**
 * ANSWER_SUBMITTED 이벤트는 제출 "수"만 실어 오고 보기별 분포·학생별 제출 여부는 없다.
 * 진행 화면(W-05)이 그 둘을 실시간으로 보여 줘야 해서 폴링 간격을 받는다 — 결과 화면은 한 번만 읽는다.
 */
export function useSubmissions(roomId: number | null, enabled: boolean, refetchMs?: number) {
  return useQuery({
    queryKey: qk.submissions(roomId ?? 0),
    queryFn: () => getSubmissions(roomId as number),
    enabled: roomId !== null && enabled,
    refetchInterval: refetchMs,
  });
}

/** POST /rooms/{roomId}/session/questions/{questionId}/answers */
export function useSubmitAnswer(roomId: number) {
  return useMutation({
    mutationFn: ({ questionId, content }: { questionId: number; content: string }) =>
      submitAnswer(roomId, questionId, content),
  });
}

/** GET /rooms/{roomId}/session/hints — 다시 듣기·재접속 복구 */
export function useVoiceHints(roomId: number | null) {
  return useQuery({
    queryKey: qk.hints(roomId ?? 0),
    queryFn: () => getVoiceHints(roomId as number),
    enabled: roomId !== null,
  });
}

/** POST /rooms/{roomId}/session/hints — PTT 음성 힌트 업로드(멀티파트). 성공 시 힌트 목록을 갱신한다 */
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
