import type { AdminDashboardResponse, AdminUserFilter, AdminUsersResponse } from "@/lib/types/dto";
import { request } from "./client";

/** GET /admin/dashboard — A-01 전체 지표 */
export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return request<AdminDashboardResponse>("/admin/dashboard");
}

/** GET /admin/users?filter= — A-02 사용자 목록 */
export function getAdminUsers(filter: AdminUserFilter): Promise<AdminUsersResponse> {
  return request<AdminUsersResponse>("/admin/users", { query: { filter } });
}
