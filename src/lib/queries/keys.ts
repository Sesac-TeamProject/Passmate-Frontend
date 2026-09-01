import type { PublicRoomsQuery, QuestionSetStatusFilter } from "@/lib/types/dto";

/**
 * 쿼리 키 상수 (규칙 문서 §쿼리 키는 배열 계층). 모든 훅 파일이 여기서만 키를 가져온다.
 */
export const qk = {
  me: ["me"] as const,
  myPage: ["me", "joined"] as const,
  grade: ["me", "grade"] as const,
  badges: ["me", "badges"] as const,
  notifications: ["me", "notifications"] as const,
  coins: ["me", "coins"] as const,
  coinTransactions: ["me", "coins", "transactions"] as const,
  earnings: ["me", "earnings"] as const,
  settlementAccount: ["me", "settlement-account"] as const,
  hostedRooms: ["rooms", "hosted"] as const,
  publicRooms: (q: PublicRoomsQuery) => ["rooms", "public", q] as const,
  /** 커서 페이지를 이어 붙이는 목록(/rooms) — 단건 조회와 캐시를 섞지 않으려고 키를 나눈다 */
  publicRoomsInfinite: (q: PublicRoomsQuery) => ["rooms", "public", "infinite", q] as const,
  roomByPin: (pin: string) => ["rooms", "pin", pin] as const,
  participants: (roomId: number) => ["rooms", roomId, "participants"] as const,
  /**
   * 세션 스냅샷은 쿼리로 읽지 않는다(스토어가 소유 — use-session-connection). 이 키는 세션 제어 뮤테이션이
   * ["rooms", id, "session", …] 하위(submissions·hints)를 prefix로 한꺼번에 무효화하는 데만 쓰인다.
   */
  snapshot: (roomId: number) => ["rooms", roomId, "session"] as const,
  submissions: (roomId: number) => ["rooms", roomId, "session", "submissions"] as const,
  hints: (roomId: number) => ["rooms", roomId, "session", "hints"] as const,
  /** status 무관 전체 무효화용 prefix — generate·clone·confirm처럼 모든 status 캐시를 갱신해야 할 때 쓴다 */
  questionSetsRoot: ["question-sets"] as const,
  questionSets: (status?: QuestionSetStatusFilter) => ["question-sets", status ?? "ALL"] as const,
  questionSet: (setId: number) => ["question-sets", setId] as const,
  myResult: (roomId: number) => ["rooms", roomId, "results", "me"] as const,
  myReport: (roomId: number) => ["rooms", roomId, "reports", "me"] as const,
  roomReport: (roomId: number) => ["rooms", roomId, "results"] as const,
  essayAnswers: (roomId: number, questionId: number) =>
    ["rooms", roomId, "questions", questionId, "answers"] as const,
  hostProfile: (userId: number) => ["users", userId, "profile"] as const,
};
