// W-09 내가 만든 방 뷰 타입. API 응답 → 이 타입 변환은 ./adapt.ts가 맡는다.

export type MyRoomStatus = "live" | "ended";

export type MyRoom = {
  code: string;
  title: string;
  status: MyRoomStatus;
  /** 참여 학생 수 (진행 중: 현재, 종료: 총) */
  students: number;
  /** 계약에 방별 문항 수가 없다 — 값이 있을 때만 카드에 칩으로 보여준다 */
  questionCount?: number;
  /** 6자리 PIN (진행 중인 방만) */
  pin?: string;
  /** 진행 중 — 시작 시각 라벨. 예: "20:00 시작" */
  startsLabel?: string;
  /** 종료 — 종료일 라벨. 예: "8/19 종료" */
  endedLabel?: string;
  /** 종료 — 평균 정답률(%) */
  averageScore?: number;
  /** 종료된 방의 리포트 방 id (W-07) */
  reportId?: string;
};

export type LevelPerk = { label: string; earned: boolean };

/** W-09 현재 레벨 카드 */
export type LevelStatus = {
  level: number;
  title: string;
  /** 예: "2026-08-10 달성 · 하락 없음 (영구)" */
  achievedLabel: string;
  next: { level: number; title: string; progress: number };
  perks: LevelPerk[];
};

export type PromotionRule = {
  label: string;
  /** 현재 값 표기. 예: "24 / 40", "✓ 4.6" */
  value: string;
  met: boolean;
  /** 충족 값 색 — 기본 positive. 시안(voPdY)은 마지막 행 "✓ 12회"만 mint-dark */
  tone?: "positive" | "mint";
};

/** W-09 다음 레벨 승급 조건 카드 */
export type Promotion = { targetLevel: number; rules: PromotionRule[]; note: string };

/** 레벨(1~5) → 칭호 (계약 dto/common.ts HostLevel 주석과 동일) */
export const LEVEL_TITLE: Record<number, string> = {
  1: "새싹",
  2: "성장",
  3: "검증된 운영자",
  4: "인기 운영자",
  5: "마스터",
};
