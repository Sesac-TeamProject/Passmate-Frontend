import type {
  EssayAnswersResponse,
  HostReviewRequest,
  LearningReportResponse,
  RoomReportResponse,
  SessionResultResponse,
} from "@/lib/types/dto";
import { downloadFile, request } from "./client";

/** GET /rooms/{roomId}/results/me */
export function getMyResult(roomId: number): Promise<SessionResultResponse> {
  return request<SessionResultResponse>(`/rooms/${roomId}/results/me`);
}

/** GET /rooms/{roomId}/reports/me */
export function getMyReport(roomId: number): Promise<LearningReportResponse> {
  return request<LearningReportResponse>(`/rooms/${roomId}/reports/me`);
}

/** GET /rooms/{roomId}/results (호스트) */
export function getRoomReport(roomId: number): Promise<RoomReportResponse> {
  return request<RoomReportResponse>(`/rooms/${roomId}/results`);
}

/** GET /rooms/{roomId}/answers — 첨삭 대상 답안 목록. questionId로 문항 필터 */
export function getEssayAnswers(
  roomId: number,
  questionId?: number,
): Promise<EssayAnswersResponse> {
  return request<EssayAnswersResponse>(`/rooms/${roomId}/answers`, { query: { questionId } });
}

/** GET /rooms/{roomId}/reports/export — 세션 전체 통계·학생별 리포트 CSV 내려받기 (FR-063) */
export function exportRoomReport(roomId: number): Promise<void> {
  return downloadFile(`/rooms/${roomId}/reports/export`, `passmate-report-${roomId}.csv`);
}

/** PUT /rooms/{roomId}/answers/{answerId}/review — 코멘트·점수 보정 upsert (FR-034) */
export function putHostReview(
  roomId: number,
  answerId: number,
  body: HostReviewRequest,
): Promise<void> {
  return request<void>(`/rooms/${roomId}/answers/${answerId}/review`, { method: "PUT", body });
}
