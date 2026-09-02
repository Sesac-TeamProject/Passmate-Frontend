import type { PublicRoomSearch, QuestionSetListQuery } from "@/lib/types/dto";

/**
 * 쿼리 키 상수 (규칙 문서 §쿼리 키는 배열 계층). 모든 훅 파일이 여기서만 키를 가져온다.
 */
export const qk = {
  me: ["me"] as const,
  joinedRooms: (page: number) => ["me", "joined", page] as const,
  /** 누적 학습 리포트 */
  cumulativeReport: ["me", "report"] as const,
  grade: ["me", "grade"] as const,
  badges: ["me", "badges"] as const,
  notifications: ["me", "notifications"] as const,
  coins: ["me", "coins"] as const,
  coinTransactions: ["me", "coins", "transactions"] as const,
  earnings: ["me", "earnings"] as const,
  settlementAccount: ["me", "settlement-account"] as const,
  hostedRooms: ["rooms", "hosted"] as const,
  /**
   * GET /rooms/{roomId} — 호스트 화면이 PIN 대신 roomId로 방을 다시 읽을 때.
   * `["rooms", roomId]`가 아니라 "detail"을 끼운다 — 그 형태는 participants·session 키의 prefix라
   * 방 하나를 무효화할 때 명단·세션 캐시까지 함께 날아간다.
   */
  room: (roomId: number) => ["rooms", "detail", roomId] as const,
  publicRooms: (q: PublicRoomSearch) => ["rooms", "public", q] as const,
  /** 페이지를 이어 붙이는 목록(/rooms) — 단건 조회와 캐시를 섞지 않으려고 키를 나눈다 */
  publicRoomsInfinite: (q: Omit<PublicRoomSearch, "page">) =>
    ["rooms", "public", "infinite", q] as const,
  roomByPin: (pin: string) => ["rooms", "pin", pin] as const,
  participants: (roomId: number) => ["rooms", roomId, "participants"] as const,
  /** 입장 전 닉네임 중복 확인 — 닉네임까지 키에 넣어 같은 값을 다시 묻지 않는다 */
  nicknameCheck: (roomId: number, nickname: string) =>
    ["rooms", roomId, "nickname-check", nickname] as const,
  /**
   * 세션 스냅샷은 쿼리로 읽지 않는다(스토어가 소유 — use-session-connection). 이 키는 세션 제어 뮤테이션이
   * ["rooms", id, "session", …] 하위(submissions·hints)를 prefix로 한꺼번에 무효화하는 데만 쓰인다.
   */
  snapshot: (roomId: number) => ["rooms", roomId, "session"] as const,
  submissions: (roomId: number) => ["rooms", roomId, "session", "submissions"] as const,
  ranking: (roomId: number) => ["rooms", roomId, "session", "ranking"] as const,
  /** 마감된 문항의 정답·해설·분포 */
  questionResult: (roomId: number, questionId: number) =>
    ["rooms", roomId, "session", "questions", questionId, "result"] as const,
  /** @draft 음성 힌트 — 백엔드 미구현 */
  hints: (roomId: number) => ["rooms", roomId, "session", "hints"] as const,
  /** status·page 무관 전체 무효화용 prefix — 문항이 바뀌면 어느 페이지의 요약도 낡는다 */
  questionSetsRoot: ["question-sets"] as const,
  questionSets: (query: QuestionSetListQuery) =>
    [
      "question-sets",
      "list",
      query.status ?? "ALL",
      query.page ?? 0,
      query.size ?? "default",
    ] as const,
  questionSet: (setId: number) => ["question-sets", setId] as const,
  myResult: (roomId: number) => ["rooms", roomId, "results", "me"] as const,
  myReport: (roomId: number) => ["rooms", roomId, "reports", "me"] as const,
  sessionResults: (roomId: number) => ["rooms", roomId, "results"] as const,
  participantResult: (roomId: number, participantId: number) =>
    ["rooms", roomId, "results", "participants", participantId] as const,
  /** 내 답안 + AI 분석. 분석이 PENDING인 동안 이 키를 폴링한다 */
  myAnswer: (roomId: number, questionId: number) =>
    ["rooms", roomId, "questions", questionId, "answers", "me"] as const,
  /** 첨삭 대상 목록 — 문항·학생 필터까지 키에 넣는다 */
  reviewTargets: (roomId: number, filter: { questionId?: number; participantId?: number }) =>
    [
      "rooms",
      roomId,
      "answers",
      filter.questionId ?? "ALL",
      filter.participantId ?? "ALL",
    ] as const,
  hostProfile: (userId: number) => ["users", userId, "profile"] as const,
};
