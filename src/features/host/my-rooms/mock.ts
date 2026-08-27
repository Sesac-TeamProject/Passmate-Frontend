// 내가 만든 방(W-09)·홈(W-01 v6) 공용 목업. 데이터 연동 시 lib/queries로 대체한다 — TODO(API)
import type { StatItem } from "@/components/common/stat-cards";

export type MyRoomStatus = "live" | "ended";

export type MyRoom = {
  code: string;
  title: string;
  status: MyRoomStatus;
  /** 참여 학생 수 (진행 중: 현재, 종료: 총) */
  students: number;
  questionCount: number;
  /** 6자리 PIN (진행 중인 방만) */
  pin?: string;
  /** 진행 중 — 시작 시각 라벨. 예: "20:00 시작" */
  startsLabel?: string;
  /** 종료 — 종료일 라벨. 예: "8/19 종료" */
  endedLabel?: string;
  /** 종료 — 평균 정답률(%) */
  averageScore?: number;
  /** 종료된 방의 리포트 세션 id (W-07) */
  reportId?: string;
};

export const MY_ROOMS: MyRoom[] = [
  {
    code: "482913",
    title: "Spring 실전 모의고사 4주차",
    status: "live",
    students: 24,
    questionCount: 8,
    pin: "482913",
    startsLabel: "20:00 시작",
  },
  {
    code: "NET001",
    title: "네트워크 한 번에 정리",
    status: "ended",
    students: 9,
    questionCount: 6,
    endedLabel: "8/19 종료",
    averageScore: 77,
    reportId: "1",
  },
  {
    code: "CS0002",
    title: "CS 기술면접 라운드 2",
    status: "ended",
    students: 21,
    questionCount: 10,
    endedLabel: "8/15 종료",
    averageScore: 68,
    reportId: "1",
  },
  {
    code: "JPA003",
    title: "JPA 복습 방",
    status: "ended",
    students: 18,
    questionCount: 6,
    endedLabel: "8/08 종료",
    averageScore: 64,
    reportId: "1",
  },
];

/** W-09 상단 통계 3장 */
export const MY_ROOMS_STATS: StatItem[] = [
  { id: "rooms", label: "방 운영 횟수", value: "24회", tile: { label: "R", tone: "mint" } },
  { id: "students", label: "총 학생 수", value: "312명", tile: { label: "U", tone: "blue" } },
  { id: "rating", label: "평균 평가", value: "4.6 / 5", tile: { label: "S", tone: "orange" } },
];

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

export const LEVEL_STATUS: LevelStatus = {
  level: 3,
  title: "검증된 운영자",
  achievedLabel: "2026-08-10 달성 · 하락 없음 (영구)",
  next: { level: 4, title: "인기 운영자", progress: 72 },
  perks: [
    { label: "유료 방 개설 (Lv.3)", earned: true },
    { label: "프로필 뱃지 표시", earned: true },
    { label: "방 목록 상단 노출 (Lv.4)", earned: false },
    { label: "브랜디드 퀴즈 제안 (Lv.5)", earned: false },
  ],
};

export type PromotionRule = {
  label: string;
  /** 현재 값 표기. 예: "24 / 40", "✓ 4.6" */
  value: string;
  met: boolean;
};

/** W-09 Lv.4 승급 조건 카드 */
export const PROMOTION: { targetLevel: number; rules: PromotionRule[]; note: string } = {
  targetLevel: 4,
  rules: [
    { label: "방 운영 횟수 40회 이상", value: "24 / 40", met: false },
    { label: "총 학생 400명 이상", value: "312 / 400", met: false },
    { label: "평균 별점 4.0 이상 (유지 조건)", value: "✓ 4.6", met: true },
    { label: "최근 30일 활동 4회 이상 (유지 조건)", value: "✓ 12회", met: true },
  ],
  note: "하락 규칙 — Lv.4·5는 최근 30일 활동(4회·5회) 또는 평균 별점 4.0이 유지 조건 아래로 내려가면 한 단계 하락. Lv.3까지는 한 번 달성하면 하락 없음.",
};
