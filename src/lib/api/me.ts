import type {
  BadgesResponse,
  GuestClaimRequest,
  GuestClaimResponse,
  GradeResponse,
  HostProfileResponse,
  CumulativeReportResponse,
  JoinedRoomsResponse,
  MyProfileResponse,
  NotificationSettingsDto,
  NotificationSettingsUpdate,
  ReportRequest,
  ReportResponse,
  UserProfileUpdateRequest,
} from "@/lib/types/dto";
import { request } from "./client";

/** PUT /users/me — 닉네임(필수)·프로필 이미지·기본 캐릭터. 응답은 갱신된 프로필 전체 */
export function updateProfile(body: UserProfileUpdateRequest): Promise<MyProfileResponse> {
  return request<MyProfileResponse>("/users/me", { method: "PUT", body });
}

/** DELETE /users/me */
export function deleteMe(): Promise<void> {
  return request<void>("/users/me", { method: "DELETE" });
}

/** GET /users/me/rooms/joined?page&size — 요약 + 참여한 방 오프셋 페이지 */
export function getJoinedRooms(page = 0, size?: number): Promise<JoinedRoomsResponse> {
  return request<JoinedRoomsResponse>("/users/me/rooms/joined", { query: { page, size } });
}

/** GET /users/me/report — 누적 학습 리포트(추이·취약 주제) */
export function getCumulativeReport(): Promise<CumulativeReportResponse> {
  return request<CumulativeReportResponse>("/users/me/report");
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

/** PUT /users/me/notification-settings — 바꿀 것만 보내면 바뀐 전체 설정을 돌려준다 */
export function putNotificationSettings(
  body: NotificationSettingsUpdate,
): Promise<NotificationSettingsDto> {
  return request<NotificationSettingsDto>("/users/me/notification-settings", {
    method: "PUT",
    body,
  });
}

/** GET /users/{userId}/profile — 호스트 공개 프로필 */
export function getHostProfile(userId: number): Promise<HostProfileResponse> {
  return request<HostProfileResponse>(`/users/${userId}/profile`);
}

/** POST /reports — 게스트도 낼 수 있다. 종류(`type`)와 자유 서술(`reason`)을 따로 받는다 */
export function postReport(body: ReportRequest): Promise<ReportResponse> {
  return request<ReportResponse>("/reports", { method: "POST", body });
}

/**
 * POST /guest-records/claim — 가입 후 7일 안에 게스트 기록을 계정으로 옮긴다.
 * 키는 입장 때 받은 `guestToken`이다. 옮겨진 기록 한 건을 돌려준다.
 */
export function claimGuestRecord(guestToken: string): Promise<GuestClaimResponse> {
  const body: GuestClaimRequest = { guestToken };
  return request<GuestClaimResponse>("/guest-records/claim", { method: "POST", body });
}
