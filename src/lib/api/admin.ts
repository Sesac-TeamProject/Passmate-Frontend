import type {
  AdminDashboardResponse,
  AdminReviewQueueResponse,
  AdminRoomsResponse,
  AdminUserFilter,
  AdminUsersResponse,
} from "@/lib/types/dto";
import { request } from "./client";

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
