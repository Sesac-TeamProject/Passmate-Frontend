import type { CursorPage, HostLevel, RoomState } from "./common";

/** POST /rooms — questionSetId는 CONFIRMED 세트만 */
export type CreateRoomRequest = {
  title: string;
  questionSetId?: number | null;
  topic?: string | null;
  maxParticipants?: number | null;
  /** ISO-8601 */
  scheduledAt?: string | null;
  isPaid?: boolean;
  /** 코인(1 C = ₩1) */
  entryFee?: number | null;
  isListed?: boolean;
};
export type CreateRoomResponse = { roomId?: number; pin?: string; qrUrl?: string | null };

/** GET /users/me/rooms/hosted 항목 */
export type HostedRoomDto = {
  roomId?: number;
  pin?: string;
  title?: string;
  status?: RoomState | null;
  participantCount?: number | null;
  scheduledAt?: string | null;
  endedAtLabel?: string | null;
  avgAccuracyPercent?: number | null;
};
export type HostedRoomsResponse = CursorPage<HostedRoomDto>;

/** POST /rooms/{roomId}/participants — 닉네임 1~12자, avatarId 없으면 서버 랜덤 */
export type JoinRoomRequest = { nickname: string; avatarId?: number | null };
/** participantToken은 게스트에게만 발급 */
export type JoinRoomResponse = {
  participantId: number;
  participantToken?: string | null;
  avatarId?: number | null;
};

export type ParticipantEntry = {
  participantId: number;
  nickname: string;
  avatarId?: number | null;
  isGuest?: boolean;
  isConnected?: boolean;
};
/** GET /rooms/{roomId}/participants — 초기 로딩·재접속 복구용 */
export type ParticipantsResponse = { participants?: ParticipantEntry[] };

export type RoomInfoHost = {
  userId?: number | null;
  nickname: string;
  level?: HostLevel | null;
  avgStars?: number | null;
  ratingCount?: number | null;
};
/** GET /rooms/pin/{pin} — 404 잘못된 PIN, 410 종료된 방 */
export type RoomInfoResponse = {
  roomId: number;
  pin: string;
  title: string;
  topic?: string | null;
  status?: RoomState | null;
  questionCount?: number | null;
  /** @draft 계약에 없다 — 방에 붙은 문제 세트. DESIGN_GAPS D-6(호스트용 방 상세)로 요청 중이며
   *  W-02b 문항별 시간 설정이 방 코드에서 세트를 찾는 데 쓴다 */
  questionSetId?: number | null;
  estimatedMinutes?: number | null;
  scheduledAt?: string | null;
  participantCount?: number | null;
  maxParticipants?: number | null;
  isPaid?: boolean;
  entryFee?: number | null;
  host?: RoomInfoHost | null;
};

/** GET /rooms/public 항목 */
export type PublicRoomDto = {
  roomId?: number;
  pin?: string;
  title?: string;
  topic?: string | null;
  hostId?: number | null;
  hostName?: string;
  hostLevel?: HostLevel | null;
  hostRating?: number | null;
  status?: RoomState | null;
  participantCount?: number | null;
  maxParticipants?: number | null;
  isPaid?: boolean;
  entryFee?: number | null;
  scheduledAt?: string | null;
};
export type PublicRoomPageResponse = CursorPage<PublicRoomDto>;
export type PublicRoomSort = "popular" | "upcoming";
export type PublicRoomType = "all" | "free" | "paid";
export type PublicRoomsQuery = {
  sort: PublicRoomSort;
  type: PublicRoomType;
  q?: string;
  cursor?: string;
};
