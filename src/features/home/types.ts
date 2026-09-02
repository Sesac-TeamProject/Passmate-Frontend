// 홈(W-01 v6) 뷰 타입. 데이터는 lib/queries → adapt.ts를 거쳐 이 모양으로 들어온다.

export type RoomFeeType = "free" | "paid";

/** 인기 방 카드 (홈 캐러셀 · /rooms 공개 목록 공용) */
export type PopularRoom = {
  code: string;
  /** 주제 칩. 예: "백엔드" */
  topic: string;
  type: RoomFeeType;
  title: string;
  /** 선생님 이름 */
  host: string;
  /** 선생님 공개 프로필로 보낼 id. 계약이 안 주면 null이라 이름이 링크가 되지 않는다 */
  hostId: number | null;
  /**
   * 선생님 명성 레벨. **서버가 아직 계산하지 않는다** — 없으면 카드가 "Lv.N"을 그리지 않는다
   * (1로 채우면 "새싹 등급"이라는 없는 사실을 만든다).
   */
  level: number | null;
  /** 현재 참여 중인 인원 */
  participants: number;
};

/** 캐러셀 한 페이지에 보이는 카드 수 */
export const POPULAR_PAGE_SIZE = 3;
