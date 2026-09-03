import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  checkNickname,
  closeRoom,
  createRoom,
  getHostedRooms,
  getParticipants,
  getPublicRooms,
  getRoom,
  getRoomByPin,
  joinRoom,
  kickParticipant,
  leaveRoom,
  updateRoom,
} from "@/lib/api/rooms";
import { clearGuestToken, writeGuestRecord, writeGuestToken } from "@/lib/guest-token-storage";
import { readHostRoomId, writeHostRoomId } from "@/lib/host-room-cache";
import { writeMyParticipant } from "@/lib/my-participant";
import { AppError } from "@/lib/types/app-error";
import type {
  JoinRoomRequest,
  JoinRoomResponse,
  PublicRoomSearch,
  RoomCreateRequest,
  RoomUpdateRequest,
} from "@/lib/types/dto";
import { qk } from "./keys";

/**
 * 대기실 명단 폴링 주기.
 * 서버가 `PARTICIPANT_JOINED`·`PARTICIPANT_LEFT`를 **발행하지 않아서**(enum에만 있다) 실시간으로
 * 받을 방법이 없다 — 대기 중에만 주기 조회로 대신한다(`research.md` R-7, 백엔드 질문 B-1).
 * 백엔드가 발행을 넣으면 이 폴링을 끄면 된다.
 */
const PARTICIPANTS_POLL_MS = 3000;

/** GET /rooms/pin/{pin}. pin이 없으면 조회하지 않는다 — 없는 PIN·끝난 방 모두 404다 */
export function useRoomByPin(pin: string | null) {
  return useQuery({
    queryKey: qk.roomByPin(pin ?? ""),
    queryFn: () => getRoomByPin(pin as string),
    enabled: pin !== null,
  });
}

const NO_SUBSCRIBE = () => () => {};
const readCachedOnServer = () => null;

/**
 * 호스트 화면의 PIN → roomId.
 *
 * `GET /rooms/pin/{pin}`은 **끝난 방을 404로 답한다** — 세션을 끝내는 순간 최종 리포트 화면이
 * 방을 잃어버린다. 그래서 한 번 알아낸 값을 탭에 남겨 두고(`host-room-cache`) 조회가 실패하면
 * 그 값으로 이어 간다.
 *
 * sessionStorage는 서버 렌더에 없다 — 렌더 중 그냥 읽으면 하이드레이션이 어긋나므로
 * 서버 스냅샷을 null로 둔다(값은 한 번 쓰이고 바뀌지 않아 구독은 빈 함수로 충분하다).
 */
export function useHostRoomId(pin: string | null): {
  roomId: number | null;
  isPending: boolean;
  error: Error | null;
} {
  const room = useRoomByPin(pin);
  const cached = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => (pin ? readHostRoomId(pin) : null),
    readCachedOnServer,
  );

  if (pin && room.data) writeHostRoomId(pin, room.data.id);

  const roomId = room.data?.id ?? cached;
  return {
    roomId,
    // 캐시로 이미 방을 알고 있으면 조회를 기다리지 않는다
    isPending: roomId === null && room.isPending,
    error: roomId === null && room.isError ? room.error : null,
  };
}

/** GET /rooms/{roomId} — 호스트용 방 상세 */
export function useRoom(roomId: number | null) {
  return useQuery({
    queryKey: qk.room(roomId ?? 0),
    queryFn: () => getRoom(roomId as number),
    enabled: roomId !== null,
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
export function usePublicRooms(search: PublicRoomSearch) {
  return useQuery({
    queryKey: qk.publicRooms(search),
    queryFn: () => getPublicRooms(search),
    placeholderData: keepPreviousData,
  });
}

/**
 * GET /rooms/public — "더 보기"로 페이지를 이어 붙이는 공개 방 목록(P-Web).
 * 커서가 아니라 **오프셋 페이지**라 다음 페이지는 `page + 1`이고, 끝은 `hasNext`가 알려준다.
 * 홈 캐러셀은 첫 페이지만 쓰므로 usePublicRooms를 그대로 둔다.
 */
export function useInfinitePublicRooms(search: Omit<PublicRoomSearch, "page">) {
  return useInfiniteQuery({
    queryKey: qk.publicRoomsInfinite(search),
    queryFn: ({ pageParam }) => getPublicRooms({ ...search, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

/**
 * GET /rooms/{roomId}/participants.
 * `poll`은 **대기 중일 때만** 켠다 — 진행 중에는 서버 이벤트가 화면을 움직인다.
 * 창이 뒤에 있으면 폴링을 멈춘다(기본값): 프로젝터를 켜 둔 채 다른 일을 해도 요청이 쌓이지 않는다.
 */
export function useParticipants(roomId: number | null, options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.participants(roomId ?? 0),
    queryFn: () => getParticipants(roomId as number),
    enabled: roomId !== null,
    refetchInterval: options.poll ? PARTICIPANTS_POLL_MS : false,
  });
}

/**
 * GET …/participants/nickname-check — 입장 전에 미리 본다.
 * 닉네임이 비어 있으면 부르지 않고, 글자마다 보내지 않도록 호출부가 debounce한 값을 넘긴다.
 */
export function useNicknameCheck(roomId: number | null, nickname: string) {
  const trimmed = nickname.trim();

  return useQuery({
    queryKey: qk.nicknameCheck(roomId ?? 0, trimmed),
    queryFn: () => checkNickname(roomId as number, trimmed),
    enabled: roomId !== null && trimmed !== "",
    // 같은 닉네임을 다시 물을 이유가 없다 — 결과는 입장 순간 서버가 다시 확인한다
    staleTime: 10_000,
    retry: false,
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

/**
 * 입장 응답의 토큰 둘을 **각자 자리에** 넣는다(R-6).
 * `accessToken`은 지금 요청에 붙일 Bearer, `guestToken`은 나중에 기록을 옮길 표다.
 * 회원으로 입장하면 둘 다 오지 않는다(이미 회원 토큰이 있다).
 */
function storeJoinResult(roomId: number, res: JoinRoomResponse, nickname: string): void {
  // 대기실이 "OO 님"으로 부르려면 내가 누구인지 남겨야 한다
  writeMyParticipant({ participantId: res.participant.id, nickname });

  if (res.accessToken) writeGuestToken(res.accessToken);
  if (res.guestToken) {
    writeGuestRecord({
      guestToken: res.guestToken,
      roomId,
      participantId: res.participant.id,
    });
  }
}

/** POST /rooms/{roomId}/participants. 게스트 토큰 2종을 저장하고 참가자 목록을 갱신한다 */
export function useJoinRoom(roomId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: JoinRoomRequest) => {
      if (roomId === null) throw new AppError("NotFound");
      const res = await joinRoom(roomId, body);
      storeJoinResult(roomId, res, body.nickname);
      // roomId는 여기서 이미 number로 좁혀져 있다 — onSuccess에 그대로 실어 보내 재검사를 없앤다.
      return { res, roomId };
    },
    onSuccess: ({ roomId }) => {
      queryClient.invalidateQueries({ queryKey: qk.participants(roomId) });
    },
  });
}

/**
 * PIN 입장 한 번에 처리(/join·홈 PIN 카드 공용): PIN → 방 조회 → 게스트가 못 들어가는 방이면
 * 방 정보만 돌려주고(화면이 로그인·결제로 안내), 아니면 바로 참가자로 등록한다.
 */
export function useJoinByPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pin, body }: { pin: string; body: JoinRoomRequest }) => {
      const room = await getRoomByPin(pin);
      if (!room.guestAllowed) return { kind: "paid" as const, room };

      const res = await joinRoom(room.id, body);
      storeJoinResult(room.id, res, body.nickname);
      return { kind: "joined" as const, room, res };
    },
    onSuccess: (data) => {
      if (data.kind === "joined") {
        queryClient.invalidateQueries({ queryKey: qk.participants(data.room.id) });
      }
    },
  });
}

/** DELETE /rooms/{roomId}/participants/me. 게스트 Bearer를 지우고 참가자 목록을 갱신한다 */
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
      // 이관용 기록(guestRecord)은 남긴다 — 나간 뒤에도 7일 안에 가입하면 옮길 수 있다
      clearGuestToken();
      queryClient.invalidateQueries({ queryKey: qk.participants(roomId) });
    },
  });
}

/** DELETE /rooms/{roomId}/participants/{participantId} — 호스트가 내보낸다 */
export function useKickParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, participantId }: { roomId: number; participantId: number }) =>
      kickParticipant(roomId, participantId),
    onSuccess: (_data, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: qk.participants(roomId) });
    },
  });
}
