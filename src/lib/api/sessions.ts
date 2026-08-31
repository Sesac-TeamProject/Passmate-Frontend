import type {
  ScreenLockRequest,
  SessionSnapshotResponse,
  StartSessionResponse,
  SubmissionsResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  VoiceHintEntry,
  VoiceHintsResponse,
} from "@/lib/types/dto";
import { request, requestMultipart } from "./client";

/** GET /rooms/{roomId}/session — 재접속 스냅샷 (404=세션 미시작(WAITING)은 호출자가 처리) */
export function getSessionSnapshot(roomId: number): Promise<SessionSnapshotResponse> {
  return request<SessionSnapshotResponse>(`/rooms/${roomId}/session`);
}

/** POST /rooms/{roomId}/session/start — false면 이 세션 서술형 AI 분석 SKIPPED(FR-062) */
export function startSession(roomId: number): Promise<StartSessionResponse> {
  return request<StartSessionResponse>(`/rooms/${roomId}/session/start`, { method: "POST" });
}

/** POST /rooms/{roomId}/session/next */
export function nextQuestion(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/session/next`, { method: "POST" });
}

/** POST /rooms/{roomId}/session/current/end */
export function endCurrentQuestion(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/session/current/end`, { method: "POST" });
}

/** POST /rooms/{roomId}/session/end */
export function endSession(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/session/end`, { method: "POST" });
}

/** PUT /rooms/{roomId}/session/lock {locked} */
export function lockScreen(roomId: number, locked: boolean): Promise<void> {
  const body: ScreenLockRequest = { locked };
  return request<void>(`/rooms/${roomId}/session/lock`, { method: "PUT", body });
}

/** GET /rooms/{roomId}/session/current/submissions (호스트) */
export function getSubmissions(roomId: number): Promise<SubmissionsResponse> {
  return request<SubmissionsResponse>(`/rooms/${roomId}/session/current/submissions`);
}

/** POST /rooms/{roomId}/session/questions/{questionId}/answers */
export function submitAnswer(
  roomId: number,
  questionId: number,
  content: string,
): Promise<SubmitAnswerResponse> {
  const body: SubmitAnswerRequest = { content };
  return request<SubmitAnswerResponse>(`/rooms/${roomId}/session/questions/${questionId}/answers`, {
    method: "POST",
    body,
  });
}

/** GET /rooms/{roomId}/session/hints — 다시 듣기·재접속 복구 */
export function getVoiceHints(roomId: number): Promise<VoiceHintsResponse> {
  return request<VoiceHintsResponse>(`/rooms/${roomId}/session/hints`);
}

/** POST /rooms/{roomId}/session/hints — PTT 음성 힌트 업로드(멀티파트) */
export function uploadVoiceHint(
  roomId: number,
  clip: Blob,
  durationMs: number,
  fileName = "hint.webm",
): Promise<VoiceHintEntry> {
  const form = new FormData();
  form.append("audio", clip, fileName);
  form.append("durationMs", String(durationMs));
  return requestMultipart<VoiceHintEntry>(`/rooms/${roomId}/session/hints`, form);
}
