import type {
  HostedRoomsResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  NicknameCheckResponse,
  PageResponse,
  ParticipantResponse,
  PublicRoomResponse,
  PublicRoomSearch,
  RoomCreateRequest,
  RoomQuestionTimesRequest,
  RoomQuestionTimesResponse,
  RoomResponse,
  RoomSummaryResponse,
  RoomUpdateRequest,
} from "@/lib/types/dto";
import { request } from "./client";

/**
 * GET /rooms/pin/{pin} — 인증 불필요. 없는 PIN·끝난 방 모두 404 `ROOM_NOT_FOUND`다
 * (410 분기는 없다 — 백엔드 질문 B-4).
 */
export function getRoomByPin(pin: string): Promise<RoomSummaryResponse> {
  return request<RoomSummaryResponse>(`/rooms/pin/${pin}`);
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

/**
 * GET /rooms/{roomId}/question-times — 세트 문항 + 이 방에서 덮어쓴 제한시간·자동 넘김. 호스트만.
 * 세트를 아직 연결하지 않았으면 409 `QUESTION_SET_REQUIRED`.
 */
export function getRoomQuestionTimes(roomId: number): Promise<RoomQuestionTimesResponse> {
  return request<RoomQuestionTimesResponse>(`/rooms/${roomId}/question-times`);
}

/**
 * PUT /rooms/{roomId}/question-times — **전체 교체**, WAITING일 때만(409 `CONFLICT`).
 * 확정 세트는 그대로 두고 이 방에서만 덮어쓴다 — 세트 문항 수정(409)이 아니라 이쪽을 부른다.
 */
export function updateRoomQuestionTimes(
  roomId: number,
  body: RoomQuestionTimesRequest,
): Promise<RoomQuestionTimesResponse> {
  return request<RoomQuestionTimesResponse>(`/rooms/${roomId}/question-times`, {
    method: "PUT",
    body,
  });
}

/** POST /rooms/{roomId}/close — WAITING이면 CANCELED, RUNNING이면 ENDED */
export function closeRoom(roomId: number): Promise<RoomResponse> {
  return request<RoomResponse>(`/rooms/${roomId}/close`, { method: "POST" });
}

/** GET /users/me/rooms/hosted — **페이지 없음**. 명성 요약 + 진행 중·종료 방 목록 */
export function getHostedRooms(): Promise<HostedRoomsResponse> {
  return request<HostedRoomsResponse>("/users/me/rooms/hosted");
}

/**
 * GET /rooms/public — 인증 불필요. enum은 **대문자**, 페이지는 오프셋이다.
 * `q`가 공백뿐이면 생략한다(서버가 빈 검색어를 필터로 오해하지 않게).
 */
export function getPublicRooms(
  search: PublicRoomSearch,
): Promise<PageResponse<PublicRoomResponse>> {
  return request<PageResponse<PublicRoomResponse>>("/rooms/public", {
    query: {
      q: search.q?.trim() || undefined,
      type: search.type,
      today: search.today ? true : undefined,
      status: search.status,
      sort: search.sort,
      page: search.page,
      size: search.size,
    },
  });
}

/**
 * POST /rooms/{roomId}/participants — 인증 선택.
 * **무인증으로 부르면** 게스트 `accessToken`(이후 Bearer)과 `guestToken`(기록 이관용)을 준다.
 */
export function joinRoom(roomId: number, body: JoinRoomRequest): Promise<JoinRoomResponse> {
  return request<JoinRoomResponse>(`/rooms/${roomId}/participants`, { method: "POST", body });
}

/**
 * POST /rooms/{roomId}/participants/me/rejoin — 이미 들어갔던 방에 PIN 없이 돌아간다.
 * 나갔던 참가자 행이 되살아나고(점수·답안 유지), 게스트는 토큰을 새로 받는다.
 * 강퇴자는 403 `ACCESS_DENIED`, 끝난 방은 410 `ROOM_ENDED`, 기록이 없으면 404.
 */
export function rejoinRoom(roomId: number): Promise<JoinRoomResponse> {
  return request<JoinRoomResponse>(`/rooms/${roomId}/participants/me/rejoin`, { method: "POST" });
}

/** GET /rooms/{roomId}/participants — **배열 그대로** 온다(래퍼 없음) */
export function getParticipants(roomId: number): Promise<ParticipantResponse[]> {
  return request<ParticipantResponse[]>(`/rooms/${roomId}/participants`);
}

/** GET /rooms/{roomId}/participants/nickname-check?nickname= — 인증 불필요. 입장 전에 미리 본다 */
export function checkNickname(roomId: number, nickname: string): Promise<NicknameCheckResponse> {
  return request<NicknameCheckResponse>(`/rooms/${roomId}/participants/nickname-check`, {
    query: { nickname },
  });
}

/** DELETE /rooms/{roomId}/participants/me — 내가 나간다 */
export function leaveRoom(roomId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/participants/me`, { method: "DELETE" });
}

/** DELETE /rooms/{roomId}/participants/{participantId} — 호스트가 내보낸다(강퇴) */
export function kickParticipant(roomId: number, participantId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/participants/${participantId}`, { method: "DELETE" });
}
