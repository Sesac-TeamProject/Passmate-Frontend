import type {
  BadgesResponse,
  ClaimGuestRecordRequest,
  GradeResponse,
  HostProfileResponse,
  MyPageResponse,
  NotificationSettingsDto,
  ReportRequest,
  UpdateProfileRequest,
} from "@/lib/types/dto";
import { request } from "./client";

/** PUT /users/me — 닉네임·기본 캐릭터 부분 수정 */
export function updateProfile(body: UpdateProfileRequest): Promise<void> {
  return request<void>("/users/me", { method: "PUT", body });
}

/** DELETE /users/me */
export function deleteMe(): Promise<void> {
  return request<void>("/users/me", { method: "DELETE" });
}

/** GET /users/me/rooms/joined — 요약+진행 중+참여 방 (FR-032·033) */
export function getMyPage(cursor?: string): Promise<MyPageResponse> {
  return request<MyPageResponse>("/users/me/rooms/joined", { query: { cursor } });
}

/** GET /users/me/grade */
export function getGrade(): Promise<GradeResponse> {
  return request<GradeResponse>("/users/me/grade");
}

/** GET /users/me/badges */
export function getBadges(): Promise<BadgesResponse> {
  return request<BadgesResponse>("/users/me/badges");
}

/** GET /users/me/notification-settings */
export function getNotificationSettings(): Promise<NotificationSettingsDto> {
  return request<NotificationSettingsDto>("/users/me/notification-settings");
}

/** PUT /users/me/notification-settings */
export function putNotificationSettings(body: NotificationSettingsDto): Promise<void> {
  return request<void>("/users/me/notification-settings", { method: "PUT", body });
}

/** GET /users/{userId}/profile — 호스트 공개 프로필 */
export function getHostProfile(userId: number): Promise<HostProfileResponse> {
  return request<HostProfileResponse>(`/users/${userId}/profile`);
}

/** POST /reports — 게스트 익명 신고 가능 */
export function postReport(body: ReportRequest): Promise<void> {
  return request<void>("/reports", { method: "POST", body });
}

/** POST /guest-records/claim — 가입 후 7일 내, 경과 시 410 RECORD_PURGED */
export function claimGuestRecord(participantId: number): Promise<void> {
  const body: ClaimGuestRecordRequest = { participantId };
  return request<void>("/guest-records/claim", { method: "POST", body });
}
