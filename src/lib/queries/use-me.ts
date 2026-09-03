import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import {
  claimGuestRecord,
  deleteMe,
  getBadges,
  getGrade,
  getHostProfile,
  getCumulativeReport,
  getJoinedRooms,
  getNotificationSettings,
  postReport,
  putNotificationSettings,
  updateProfile,
} from "@/lib/api/me";
import { clearGuestRecord } from "@/lib/guest-token-storage";
import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  NotificationSettingsDto,
  NotificationSettingsUpdate,
  ReportRequest,
  UserProfileUpdateRequest,
} from "@/lib/types/dto";
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

/**
 * GET /users/me/rooms/joined — 요약 + 참여한 방 페이지.
 * 페이지를 넘겨도 목록이 깜빡이지 않게 이전 결과를 유지한다.
 */
export function useJoinedRooms(page = 0) {
  return useQuery({
    queryKey: qk.joinedRooms(page),
    queryFn: () => getJoinedRooms(page),
    placeholderData: keepPreviousData,
  });
}

/** GET /users/me/report — 누적 학습 리포트(추이 그래프·취약 주제) */
export function useCumulativeReport() {
  return useQuery({
    queryKey: qk.cumulativeReport,
    queryFn: () => getCumulativeReport(),
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
    mutationFn: (next: NotificationSettingsUpdate) => putNotificationSettings(next),
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

/**
 * PUT /users/me — 닉네임(필수)·프로필 이미지·기본 캐릭터.
 * 서버가 갱신된 프로필 **전체**를 돌려주므로 응답을 그대로 auth-store와 캐시에 넣는다
 * (요청 필드만 합치던 방식은 서버가 계산하는 지표·코인을 놓친다).
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UserProfileUpdateRequest) => updateProfile(body),
    onSuccess: (profile) => {
      useAuthStore.getState().setProfile(profile);
      queryClient.setQueryData(qk.me, profile);
      // exact — ["me"]는 코인·수익·정산 계좌·등급 키의 prefix라 그냥 무효화하면 전부 다시 불린다.
      queryClient.invalidateQueries({ queryKey: qk.me, exact: true });
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

/**
 * @draft POST /guest-records/claim — **백엔드 미구현**(실서버 404).
 * 성공하면 보관하던 표를 지운다. 아직 없는 API라 실패는 조용히 삼키고 표를 그대로 둔다 —
 * 서버가 생기면 다음 로그인에서 다시 시도된다.
 */
export function useClaimGuestRecord() {
  return useMutation({
    mutationFn: async ({ guestToken, roomId }: { guestToken: string; roomId: number }) => {
      await claimGuestRecord(guestToken);
      clearGuestRecord(roomId);
    },
  });
}
