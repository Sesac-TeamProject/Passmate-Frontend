import type {
  CreateRoomRequest,
  CreateRoomResponse,
  HostedRoomsResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  ParticipantsResponse,
  PublicRoomPageResponse,
  PublicRoomsQuery,
  RoomInfoResponse,
} from "@/lib/types/dto";
import { request } from "./client";

/** GET /rooms/pin/{pin} — 404 잘못된 PIN, 410 종료된 방 */
export function getRoomByPin(pin: string): Promise<RoomInfoResponse> {
  return request<RoomInfoResponse>(`/rooms/pin/${pin}`);
}

/** POST /rooms — questionSetId는 CONFIRMED 세트만 */
export function createRoom(body: CreateRoomRequest): Promise<CreateRoomResponse> {
  return request<CreateRoomResponse>("/rooms", { method: "POST", body });
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
