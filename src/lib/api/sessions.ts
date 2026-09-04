import type {
  AnswerResponse,
  AnswerSubmitRequest,
  QuestionResultResponse,
  RankingEntry,
  ScreenLockRequest,
  ScreenLockResponse,
  SessionSnapshotResponse,
  SubmissionStatusPayload,
  VoiceHintEntry,
  VoiceHintsResponse,
} from "@/lib/types/dto";
import { request, requestMultipart } from "./client";

/**
 * GET /rooms/{roomId}/session — 재접속 스냅샷.
 * **WAITING이어도 200이다**(404 분기 없음). 게스트 토큰으로도 부를 수 있다.
 */
export function getSessionSnapshot(roomId: number): Promise<SessionSnapshotResponse> {
  return request<SessionSnapshotResponse>(`/rooms/${roomId}/session`);
}

/**
 * POST /rooms/{roomId}/session/start — **204, 본문 없음.**
 * 확정 세트가 연결돼 있지 않으면 409 `QUESTION_SET_REQUIRED`.
 * 시작 직후 `SESSION_STARTED`와 1번 문항의 `QUESTION_STARTED`가 이어서 온다.
 */
export function startSession(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/session/start`, { method: "POST" });
}

/**
 * POST /rooms/{roomId}/session/next — 열린 문항을 마감하고 다음 문항을 연다(204).
 * 마지막 문항 뒤에 부르면 409 `SESSION_ALREADY_FINISHED` — 호스트는 세션 종료를 눌러야 한다.
 */
export function nextQuestion(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/session/next`, { method: "POST" });
}

/** POST /rooms/{roomId}/session/current/end — 현재 문항만 마감(204) */
export function endCurrentQuestion(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/session/current/end`, { method: "POST" });
}

/** POST /rooms/{roomId}/session/end — 세션 종료(204). 최종 랭킹이 `SESSION_ENDED`로 온다 */
export function endSession(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/session/end`, { method: "POST" });
}

/** PUT /rooms/{roomId}/session/lock — 잠금 상태를 응답으로 돌려준다 */
export function lockScreen(roomId: number, locked: boolean): Promise<ScreenLockResponse> {
  const body: ScreenLockRequest = { locked };
  return request<ScreenLockResponse>(`/rooms/${roomId}/session/lock`, { method: "PUT", body });
}

/**
 * GET /rooms/{roomId}/session/current/submissions (호스트).
 * 집계만 온다 — **참가자별 제출 여부는 없다**.
 */
export function getSubmissions(roomId: number): Promise<SubmissionStatusPayload> {
  return request<SubmissionStatusPayload>(`/rooms/${roomId}/session/current/submissions`);
}

/** GET /rooms/{roomId}/session/ranking — 지금 순위 전체 */
export function getRanking(roomId: number): Promise<RankingEntry[]> {
  return request<RankingEntry[]>(`/rooms/${roomId}/session/ranking`);
}

/** GET /rooms/{roomId}/session/questions/{questionId}/result — **마감된 문항만**(정답·해설·분포·랭킹) */
export function getQuestionResult(
  roomId: number,
  questionId: number,
): Promise<QuestionResultResponse> {
  return request<QuestionResultResponse>(`/rooms/${roomId}/session/questions/${questionId}/result`);
}

/**
 * POST /rooms/{roomId}/session/questions/{questionId}/answers.
 *
 * `questionId`는 **세트 문항 id**다(`sessionQuestionId`가 아니다).
 * 보내는 값은 MCQ면 보기 **원문**, OX면 "O"|"X", 서술형이면 본문이다.
 * 이미 냈으면 409 `ALREADY_SUBMITTED`, 화면이 잠겼으면 409 `SCREEN_LOCKED`.
 */
export function submitAnswer(
  roomId: number,
  questionId: number,
  submitted: string,
): Promise<AnswerResponse> {
  const body: AnswerSubmitRequest = { submitted };
  return request<AnswerResponse>(`/rooms/${roomId}/session/questions/${questionId}/answers`, {
    method: "POST",
    body,
  });
}

/** GET /rooms/{roomId}/session/hints — 이 방에 붙은 음성 힌트 목록 */
export function getVoiceHints(roomId: number): Promise<VoiceHintsResponse> {
  return request<VoiceHintsResponse>(`/rooms/${roomId}/session/hints`);
}

/**
 * POST /rooms/{roomId}/session/hints — 클립 업로드(multipart). 지금 문항에 붙는다.
 *
 * 서버 시그니처를 그대로 따른다(`VoiceHintController.publish`) — 어기면 조용히 틀린다:
 * 파트 이름은 **`file`**(`@RequestPart("file")`)이고, `durationMs`는 폼이 아니라
 * **쿼리**다(`@RequestParam`). 201로 만들어진 힌트를 돌려준다.
 */
export function uploadVoiceHint(
  roomId: number,
  clip: Blob,
  durationMs: number,
  fileName = "hint.webm",
): Promise<VoiceHintEntry> {
  const form = new FormData();
  form.append("file", clip, fileName);
  return requestMultipart<VoiceHintEntry>(`/rooms/${roomId}/session/hints`, form, { durationMs });
}
