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
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  NotificationSettingsDto,
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
 * POST /guest-records/claim — 가입 직후 게스트 기록을 계정으로 옮긴다.
 *
 * 성공하면 보관하던 표를 지운다. **다시 시도해도 소용없는 실패에서도 지운다** —
 * 기한이 지나 파기됐거나(`GUEST_RECORD_EXPIRED`) 이미 다른 계정에 붙은(`GUEST_RECORD_ALREADY_CLAIMED`)
 * 표는 영원히 성공하지 않는데, 남겨 두면 결과 화면을 열 때마다 7일 내내 같은 요청을 다시 낸다.
 * 그 밖의 실패(네트워크·5xx)는 표를 남겨 다음 기회에 다시 시도한다.
 */
const TERMINAL_CLAIM_CODES: readonly string[] = [
  ERROR_CODES.GUEST_RECORD_EXPIRED,
  ERROR_CODES.GUEST_RECORD_ALREADY_CLAIMED,
];

export function useClaimGuestRecord() {
  return useMutation({
    mutationFn: async ({ guestToken, roomId }: { guestToken: string; roomId: number }) => {
      try {
        await claimGuestRecord(guestToken);
      } catch (error) {
        if (AppError.isAppError(error) && TERMINAL_CLAIM_CODES.includes(error.code ?? "")) {
          clearGuestRecord(roomId);
        }
        throw error;
      }
      clearGuestRecord(roomId);
    },
  });
}
