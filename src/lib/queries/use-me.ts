import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import {
  claimGuestRecord,
  deleteMe,
  getBadges,
  getGrade,
  getHostProfile,
  getMyPage,
  getNotificationSettings,
  postReport,
  putNotificationSettings,
  updateProfile,
} from "@/lib/api/me";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { NotificationSettingsDto, ReportRequest, UpdateProfileRequest } from "@/lib/types/dto";
import { qk } from "./keys";

const ME_STALE_TIME_MS = 60_000;

/** GET /users/me. auth-store에 이미 있는 프로필을 초기값으로 써서 첫 렌더 깜빡임을 없앤다 */
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: getMe,
    initialData: () => useAuthStore.getState().profile ?? undefined,
    staleTime: ME_STALE_TIME_MS,
  });
}

/** GET /users/me/rooms/joined — 요약+진행 중+참여 방 (FR-032·033) */
export function useMyPage() {
  return useQuery({
    queryKey: qk.myPage,
    queryFn: () => getMyPage(),
  });
}

/** GET /users/me/grade */
export function useGrade() {
  return useQuery({
    queryKey: qk.grade,
    queryFn: () => getGrade(),
  });
}

/** GET /users/me/badges */
export function useBadges() {
  return useQuery({
    queryKey: qk.badges,
    queryFn: () => getBadges(),
  });
}

/** GET /users/me/notification-settings */
export function useNotificationSettings() {
  return useQuery({
    queryKey: qk.notifications,
    queryFn: () => getNotificationSettings(),
  });
}

/** PUT /users/me/notification-settings. 낙관적으로 반영하고 실패 시 이전 값으로 되돌린다 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (next: NotificationSettingsDto) => putNotificationSettings(next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: qk.notifications });
      const previous = queryClient.getQueryData<NotificationSettingsDto>(qk.notifications);
      queryClient.setQueryData(qk.notifications, next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) queryClient.setQueryData(qk.notifications, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications });
    },
  });
}

/** PUT /users/me — 닉네임·기본 캐릭터 부분 수정. 성공 시 auth-store 프로필에 합치고 내 프로필을 갱신한다 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => updateProfile(body),
    onSuccess: (_data, variables) => {
      useAuthStore.getState().setProfile({
        nickname: variables.nickname ?? undefined,
        avatarId: variables.avatarId,
      });
      queryClient.invalidateQueries({ queryKey: qk.me });
    },
  });
}

/** DELETE /users/me */
export function useDeleteMe() {
  return useMutation({
    mutationFn: () => deleteMe(),
  });
}

/** GET /users/{userId}/profile — 호스트 공개 프로필 */
export function useHostProfile(userId: number | null) {
  return useQuery({
    queryKey: qk.hostProfile(userId ?? 0),
    queryFn: () => getHostProfile(userId as number),
    enabled: userId !== null,
  });
}

/** POST /reports — 게스트도 익명으로 신고 가능 */
export function useReport() {
  return useMutation({
    mutationFn: (body: ReportRequest) => postReport(body),
  });
}

/** POST /guest-records/claim — 가입 후 7일 내, 경과 시 410 RECORD_PURGED */
export function useClaimGuestRecord() {
  return useMutation({
    mutationFn: (participantId: number) => claimGuestRecord(participantId),
  });
}
