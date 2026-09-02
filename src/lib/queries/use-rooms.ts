import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  closeRoom,
  createRoom,
  getHostedRooms,
  getParticipants,
  getPublicRooms,
  getRoom,
  getRoomByPin,
  joinRoom,
  leaveRoom,
  updateRoom,
} from "@/lib/api/rooms";
import { clearGuestToken, writeGuestToken } from "@/lib/guest-token-storage";
import { writeMyParticipant } from "@/lib/my-participant";
import { AppError } from "@/lib/types/app-error";
import type {
  JoinRoomRequest,
  PublicRoomsQuery,
  RoomCreateRequest,
  RoomUpdateRequest,
} from "@/lib/types/dto";
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

/**
 * GET /rooms/public — "더 보기"로 커서를 이어 붙이는 공개 방 목록(P-Web).
 * 홈 캐러셀은 첫 페이지만 쓰므로 usePublicRooms를 그대로 둔다.
 */
export function useInfinitePublicRooms(query: Omit<PublicRoomsQuery, "cursor">) {
  return useInfiniteQuery({
    queryKey: qk.publicRoomsInfinite(query),
    queryFn: ({ pageParam }) => getPublicRooms({ ...query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    // hasNext가 없으면 nextCursor 유무로 판단한다 — 목·서버 어느 쪽이 빠뜨려도 멈춘다
    getNextPageParam: (last) =>
      last.hasNext === false ? undefined : (last.nextCursor ?? undefined),
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

/** GET /rooms/{roomId} — 호스트용 방 상세 */
export function useRoom(roomId: number | null) {
  return useQuery({
    queryKey: qk.room(roomId ?? 0),
    queryFn: () => getRoom(roomId as number),
    enabled: roomId !== null,
  });
}

/** POST /rooms. 성공 시 내가 개설한 방 목록을 갱신한다 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RoomCreateRequest) => createRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.hostedRooms });
    },
  });
}

/** PUT /rooms/{roomId} — WAITING일 때만. 로비에서 세트를 연결할 때 쓴다 */
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: number; body: RoomUpdateRequest }) =>
      updateRoom(roomId, body),
    onSuccess: (_data, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: qk.room(roomId) });
      queryClient.invalidateQueries({ queryKey: qk.hostedRooms });
    },
  });
}

/** POST /rooms/{roomId}/close — 대기 중이면 취소, 진행 중이면 종료 */
export function useCloseRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => closeRoom(roomId),
    onSuccess: (_data, roomId) => {
      queryClient.invalidateQueries({ queryKey: qk.room(roomId) });
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
      // 대기실이 "OO 님"으로 부르려면 방금 쓴 닉네임을 남겨야 한다 — 참여 응답에는 없다
      writeMyParticipant({ participantId: res.participantId, nickname: body.nickname });
      // roomId는 여기서 이미 number로 좁혀져 있다 — onSuccess에 그대로 실어 보내 재검사를 없앤다.
      return { res, roomId };
    },
    onSuccess: ({ res, roomId }) => {
      if (res.participantToken) writeGuestToken(res.participantToken);
      queryClient.invalidateQueries({ queryKey: qk.participants(roomId) });
    },
  });
}

/**
 * PIN 입장 한 번에 처리(/join·홈 PIN 카드 공용): PIN → 방 조회 → 유료면 결제 필요(방 정보만 반환, 화면이 로그인·결제로 안내),
 * 무료면 바로 참가자로 등록하고 게스트 토큰을 저장한다.
 */
export function useJoinByPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pin, body }: { pin: string; body: JoinRoomRequest }) => {
      const room = await getRoomByPin(pin);
      if (room.isPaid) return { kind: "paid" as const, room };
      const res = await joinRoom(room.roomId, body);
      if (res.participantToken) writeGuestToken(res.participantToken);
      writeMyParticipant({ participantId: res.participantId, nickname: body.nickname });
      return { kind: "joined" as const, room, res };
    },
    onSuccess: (data) => {
      if (data.kind === "joined") {
        queryClient.invalidateQueries({ queryKey: qk.participants(data.room.roomId) });
      }
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
