import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRoom,
  getHostedRooms,
  getParticipants,
  getPublicRooms,
  getRoomByPin,
  joinRoom,
  leaveRoom,
} from "@/lib/api/rooms";
import { clearGuestToken, writeGuestToken } from "@/lib/guest-token-storage";
import { AppError } from "@/lib/types/app-error";
import type { CreateRoomRequest, JoinRoomRequest, PublicRoomsQuery } from "@/lib/types/dto";
import { qk } from "./keys";

/** GET /rooms/pin/{pin}. pin이 없으면 조회하지 않는다 — 404/410은 화면이 error.kind로 분기한다 */
export function useRoomByPin(pin: string | null) {
  return useQuery({
    queryKey: qk.roomByPin(pin ?? ""),
    queryFn: () => getRoomByPin(pin as string),
    enabled: pin !== null,
  });
}

/** GET /users/me/rooms/hosted */
export function useHostedRooms() {
  return useQuery({
    queryKey: qk.hostedRooms,
    queryFn: () => getHostedRooms(),
  });
}

/** GET /rooms/public. 필터를 바꿔도 이전 결과를 유지해 목록이 깜빡이지 않게 한다 */
export function usePublicRooms(query: PublicRoomsQuery) {
  return useQuery({
    queryKey: qk.publicRooms(query),
    queryFn: () => getPublicRooms(query),
    placeholderData: keepPreviousData,
  });
}

/** GET /rooms/{roomId}/participants — 초기 로딩·재접속 복구용 */
export function useParticipants(roomId: number | null) {
  return useQuery({
    queryKey: qk.participants(roomId ?? 0),
    queryFn: () => getParticipants(roomId as number),
    enabled: roomId !== null,
  });
}

/** POST /rooms. 성공 시 내가 개설한 방 목록을 갱신한다 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRoomRequest) => createRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.hostedRooms });
    },
  });
}

/** POST /rooms/{roomId}/participants. 게스트 토큰을 저장하고 참가자 목록을 갱신한다 */
export function useJoinRoom(roomId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: JoinRoomRequest) => {
      if (roomId === null) throw new AppError("NotFound");
      const res = await joinRoom(roomId, body);
      // roomId는 여기서 이미 number로 좁혀져 있다 — onSuccess에 그대로 실어 보내 재검사를 없앤다.
      return { res, roomId };
    },
    onSuccess: ({ res, roomId }) => {
      if (res.participantToken) writeGuestToken(res.participantToken);
      queryClient.invalidateQueries({ queryKey: qk.participants(roomId) });
    },
  });
}

/** DELETE /rooms/{roomId}/participants/me. 게스트 토큰을 지우고 참가자 목록을 갱신한다 */
export function useLeaveRoom(roomId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (roomId === null) throw new AppError("NotFound");
      await leaveRoom(roomId);
      // roomId는 여기서 이미 number로 좁혀져 있다 — onSuccess에 그대로 실어 보내 재검사를 없앤다.
      return roomId;
    },
    onSuccess: (roomId) => {
      clearGuestToken();
      queryClient.invalidateQueries({ queryKey: qk.participants(roomId) });
    },
  });
}
