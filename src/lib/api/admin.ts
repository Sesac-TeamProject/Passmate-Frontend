import type {
  AdminAdCampaignsResponse,
  AdminBrandedQuizzesResponse,
  AdminDashboardResponse,
  AdminPaymentsResponse,
  AdminReportsResponse,
  AdminReviewQueueResponse,
  AdminRoomsResponse,
  AdminSanctionsResponse,
  AdminSettlementsResponse,
  AdminUserFilter,
  AdminUsersResponse,
} from "@/lib/types/dto";
import { request } from "./client";

/** GET /admin/ad-campaigns — A-06 광고 KPI + 캠페인 목록 */
export function getAdminAdCampaigns(): Promise<AdminAdCampaignsResponse> {
  return request<AdminAdCampaignsResponse>("/admin/ad-campaigns");
}

/** GET /admin/branded-quizzes — A-06 기업 브랜디드 퀴즈 */
export function getAdminBrandedQuizzes(): Promise<AdminBrandedQuizzesResponse> {
  return request<AdminBrandedQuizzesResponse>("/admin/branded-quizzes");
}

/** GET /admin/payments — A-05 결제 KPI + 유료 방 결제 내역 */
export function getAdminPayments(): Promise<AdminPaymentsResponse> {
  return request<AdminPaymentsResponse>("/admin/payments");
}

/** GET /admin/settlements/pending — A-05 정산 대기 선생님 */
export function getAdminSettlements(): Promise<AdminSettlementsResponse> {
  return request<AdminSettlementsResponse>("/admin/settlements/pending");
}

const SANCTION_HISTORY_DAYS = 30;

/** GET /admin/reports — A-04 신고 KPI + 신고 목록 */
export function getAdminReports(): Promise<AdminReportsResponse> {
  return request<AdminReportsResponse>("/admin/reports");
}

/** GET /admin/sanctions?days=30 — A-04 최근 30일 제재 이력 */
export function getAdminSanctions(): Promise<AdminSanctionsResponse> {
  return request<AdminSanctionsResponse>("/admin/sanctions", {
    query: { days: SANCTION_HISTORY_DAYS },
  });
}

/** GET /admin/rooms — A-03 방 목록 (진행 중·대기·오늘 종료) */
export function getAdminRooms(): Promise<AdminRoomsResponse> {
  return request<AdminRoomsResponse>("/admin/rooms");
}

/** GET /admin/questions/review-queue — A-03 문제 검수 큐 */
export function getAdminReviewQueue(): Promise<AdminReviewQueueResponse> {
  return request<AdminReviewQueueResponse>("/admin/questions/review-queue");
}

/** GET /admin/dashboard — A-01 전체 지표 */
export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return request<AdminDashboardResponse>("/admin/dashboard");
}

/** GET /admin/users?filter= — A-02 사용자 목록 */
export function getAdminUsers(filter: AdminUserFilter): Promise<AdminUsersResponse> {
  return request<AdminUsersResponse>("/admin/users", { query: { filter } });
}
