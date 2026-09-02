import type {
  HostedRoomsResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  ParticipantsResponse,
  PublicRoomPageResponse,
  PublicRoomsQuery,
  RoomCreateRequest,
  RoomInfoResponse,
  RoomResponse,
  RoomUpdateRequest,
} from "@/lib/types/dto";
import { request } from "./client";

/** GET /rooms/pin/{pin} — 404 잘못된 PIN, 410 종료된 방 */
export function getRoomByPin(pin: string): Promise<RoomInfoResponse> {
  return request<RoomInfoResponse>(`/rooms/pin/${pin}`);
}

/** POST /rooms — questionSetId는 CONFIRMED 세트만. 응답에 PIN·roomId가 들어 있다 */
export function createRoom(body: RoomCreateRequest): Promise<RoomResponse> {
  return request<RoomResponse>("/rooms", { method: "POST", body });
}

/** GET /rooms/{roomId} — 호스트용 방 상세(PIN·연결된 세트·잠금 상태). 인증 필요 */
export function getRoom(roomId: number): Promise<RoomResponse> {
  return request<RoomResponse>(`/rooms/${roomId}`);
}

/** PUT /rooms/{roomId} — WAITING일 때만. 세트 연결·정원·공개 여부를 고친다 */
export function updateRoom(roomId: number, body: RoomUpdateRequest): Promise<RoomResponse> {
  return request<RoomResponse>(`/rooms/${roomId}`, { method: "PUT", body });
}

/** POST /rooms/{roomId}/close — WAITING이면 CANCELED, RUNNING이면 ENDED */
export function closeRoom(roomId: number): Promise<RoomResponse> {
  return request<RoomResponse>(`/rooms/${roomId}/close`, { method: "POST" });
}

/** GET /users/me/rooms/hosted */
export function getHostedRooms(cursor?: string): Promise<HostedRoomsResponse> {
  return request<HostedRoomsResponse>("/users/me/rooms/hosted", { query: { cursor } });
}

/** GET /rooms/public?sort&type&q&cursor — q 공백이면 생략 */
export function getPublicRooms(query: PublicRoomsQuery): Promise<PublicRoomPageResponse> {
  return request<PublicRoomPageResponse>("/rooms/public", {
    query: {
      sort: query.sort,
      type: query.type,
      q: query.q?.trim() || undefined,
      cursor: query.cursor,
    },
  });
}

/** POST /rooms/{roomId}/participants — 닉네임 1~12자, avatarId 없으면 서버 랜덤 */
export function joinRoom(roomId: number, body: JoinRoomRequest): Promise<JoinRoomResponse> {
  return request<JoinRoomResponse>(`/rooms/${roomId}/participants`, { method: "POST", body });
}

/** GET /rooms/{roomId}/participants — 초기 로딩·재접속 복구용 */
export function getParticipants(roomId: number): Promise<ParticipantsResponse> {
  return request<ParticipantsResponse>(`/rooms/${roomId}/participants`);
}

/** DELETE /rooms/{roomId}/participants/me */
export function leaveRoom(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/participants/me`, { method: "DELETE" });
}
