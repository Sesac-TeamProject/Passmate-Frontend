import type {
  EssayAnalysisRequestResponse,
  HostReviewRequest,
  LearningReportResponse,
  MyAnswerResponse,
  MySessionResultResponse,
  ParticipantResultResponse,
  ReviewTargetListResponse,
  SessionResultsResponse,
} from "@/lib/types/dto";
import { downloadFile, request } from "./client";

/** GET /rooms/{roomId}/results/me — 게스트 토큰으로도 부를 수 있다 */
export function getMyResult(roomId: number): Promise<MySessionResultResponse> {
  return request<MySessionResultResponse>(`/rooms/${roomId}/results/me`);
}

/** GET /rooms/{roomId}/reports/me — 세션 종료 시 서버가 만들어 둔 학습 리포트 */
export function getMyReport(roomId: number): Promise<LearningReportResponse> {
  return request<LearningReportResponse>(`/rooms/${roomId}/reports/me`);
}

/** GET /rooms/{roomId}/results (호스트) — 요약·문항별·학생별 통계 */
export function getSessionResults(roomId: number): Promise<SessionResultsResponse> {
  return request<SessionResultsResponse>(`/rooms/${roomId}/results`);
}

/** GET /rooms/{roomId}/results/participants/{participantId} (호스트) — 학생 한 명의 문항별 상세 */
export function getParticipantResult(
  roomId: number,
  participantId: number,
): Promise<ParticipantResultResponse> {
  return request<ParticipantResultResponse>(
    `/rooms/${roomId}/results/participants/${participantId}`,
  );
}

/**
 * GET …/session/questions/{questionId}/answers/me — 내 답안과 AI 분석·첨삭.
 * `analysisStatus`가 `PENDING`인 동안 화면이 이 응답을 폴링한다(완료 이벤트가 없다).
 */
export function getMyAnswer(roomId: number, questionId: number): Promise<MyAnswerResponse> {
  return request<MyAnswerResponse>(`/rooms/${roomId}/session/questions/${questionId}/answers/me`);
}

/**
 * POST …/session/questions/{questionId}/answers/me/analysis — **회원이 직접 요청한다**(202).
 * 월 무료 5회, 초과분은 코인. 게스트는 403 `GUEST_NOT_ALLOWED`, 코인 부족은 402.
 */
export function requestEssayAnalysis(
  roomId: number,
  questionId: number,
): Promise<EssayAnalysisRequestResponse> {
  return request<EssayAnalysisRequestResponse>(
    `/rooms/${roomId}/session/questions/${questionId}/answers/me/analysis`,
    { method: "POST" },
  );
}

/** GET /rooms/{roomId}/answers?questionId&participantId (호스트) — 첨삭 대상 목록 */
export function getReviewTargets(
  roomId: number,
  filter: { questionId?: number; participantId?: number } = {},
): Promise<ReviewTargetListResponse> {
  return request<ReviewTargetListResponse>(`/rooms/${roomId}/answers`, {
    query: { questionId: filter.questionId, participantId: filter.participantId },
  });
}

/**
 * GET /rooms/{roomId}/reports/export — 첨부 파일로 내려받는다 (호스트).
 * 형식은 **서버가 CSV만 받는다** — PDF를 넘기면 400 `INVALID_INPUT`으로 이유를 돌려준다.
 */
export function exportRoomReport(roomId: number, format = "CSV"): Promise<void> {
  const lower = format.toLowerCase();
  return downloadFile(
    `/rooms/${roomId}/reports/export?format=${lower}`,
    `passmate-report-${roomId}.${lower}`,
  );
}

/**
 * @draft PUT /rooms/{roomId}/answers/{answerId}/review — **백엔드 미구현**(실서버 404).
 * 조회(`getReviewTargets`)만 있고 저장은 아직 없다. 화면은 NotFound를 "준비 중"으로 안내한다.
 */
export function putHostReview(
  roomId: number,
  answerId: number,
  body: HostReviewRequest,
): Promise<void> {
  return request<void>(`/rooms/${roomId}/answers/${answerId}/review`, { method: "PUT", body });
}
