import type {
  EssayAnswersResponse,
  HostReviewRequest,
  LearningReportResponse,
  RoomReportResponse,
  SessionResultResponse,
} from "@/lib/types/dto";
import { request } from "./client";

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

/** @draft — 계약 없음. ../docs/tasks.md T070 경로. 계약 도착 시 수정 */
export function getEssayAnswers(roomId: number, questionId: number): Promise<EssayAnswersResponse> {
  return request<EssayAnswersResponse>(`/rooms/${roomId}/questions/${questionId}/answers`);
}

/** @draft — 계약 없음. ../docs/tasks.md T070 경로. 계약 도착 시 수정 (FR-034) */
export function postHostReview(answerId: number, body: HostReviewRequest): Promise<void> {
  return request<void>(`/answers/${answerId}/review`, { method: "POST", body });
}
