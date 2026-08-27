// 데이터 연동 전 화면 확인용 목업 (회원 계정·마이페이지 C-02 v2).
// 계정은 하나다 — 같은 사람이 방을 개설(host)하기도, 참여(client)하기도 한다.
import type { AvatarKey } from "@/components/common/student-avatar";
import type { SidebarUser } from "@/components/layout/role-sidebar";

/** 로그인한 회원. 선생님·회원 레이아웃의 사이드바 프로필이 모두 이 계정을 쓴다. */
export const ACCOUNT: SidebarUser = {
  name: "이한결",
  initial: "한",
  roleLabel: "회원",
  tone: "peach",
};

/** 프로필 카드 — 명성(레벨)은 방 운영 실적으로 오른다 */
export type Profile = {
  name: string;
  email: string;
  joinedLabel: string;
  avatar: AvatarKey;
  level: number;
  levelTitle: string;
  /** 현재 레벨로 열리는 권한. 예: "유료 방 개설 가능" */
  levelPerk: string;
  /** 다음 레벨까지 남은 실적 */
  nextLevel: { level: number; roomsLeft: number; studentsLeft: number };
  /** 다음 레벨까지 진행률(%) */
  progress: number;
};

export const PROFILE: Profile = {
  name: "김민지",
  email: "minji@passmate.app",
  joinedLabel: "2026-08 가입",
  avatar: "fox",
  level: 3,
  levelTitle: "검증된 운영자",
  levelPerk: "유료 방 개설 가능",
  nextLevel: { level: 4, roomsLeft: 16, studentsLeft: 88 },
  progress: 60,
};

export type AchievementBadgeKind = "flag" | "number" | "paws" | "ring" | "drop" | "won" | "empty";

export type Achievement = {
  id: string;
  kind: AchievementBadgeKind;
  /** number·ring 뱃지에 찍히는 숫자 */
  label?: string;
  title: string;
  /** 아직 획득하지 못한 뱃지 — opacity 0.3으로 그린다 */
  locked?: boolean;
};

/** 개설한 방(host) 실적 */
export type HostRecord = {
  stats: { rooms: number; rating: number; students: number };
  badges: { earned: number; total: number; locked: number; items: Achievement[] };
  openRooms: number;
  /** 이번 달 정산 예정 금액(원) */
  settlementThisMonth: number;
};

export const HOST_RECORD: HostRecord = {
  stats: { rooms: 24, rating: 4.5, students: 312 },
  badges: {
    earned: 5,
    total: 8,
    locked: 3,
    items: [
      { id: "first-room", kind: "flag", title: "첫 방 개설" },
      { id: "rooms-10", kind: "number", label: "10", title: "방 10회 운영" },
      { id: "students-100", kind: "paws", title: "학생 100명" },
      // TODO(디자인): 시안 뱃지 시트에서 "평가 4.5+"·"AI 세트 50개"는 아이콘이 비어 있다
      { id: "rating-4.5", kind: "empty", title: "평가 4.5+", locked: true },
      { id: "reviews-50", kind: "ring", label: "50", title: "평가 50개 받기" },
      { id: "streak-30", kind: "drop", title: "30일 연속 활동", locked: true },
      { id: "paid-first", kind: "won", title: "유료 방 첫 개설" },
      { id: "ai-sets-50", kind: "empty", title: "AI 세트 50개", locked: true },
    ],
  },
  openRooms: 2,
  settlementThisMonth: 64000,
};

export type AttendedSession = {
  id: string;
  rank: number;
  title: string;
  dateLabel: string;
  questionCount: number;
  score: number;
};

/** 참여한 방(client) 학습 기록 */
export type LearningRecord = {
  stats: { sessions: number; accuracy: number; averageRank: number };
  weakTopics: string[];
  sessions: AttendedSession[];
};

export const LEARNING_RECORD: LearningRecord = {
  stats: { sessions: 3, accuracy: 71, averageRank: 3.3 },
  weakTopics: ["JPA 영속성", "트랜잭션", "인덱스"],
  sessions: [
    {
      id: "1",
      rank: 3,
      title: "8월 4주차 Spring 스터디",
      dateLabel: "8/22 (금)",
      questionCount: 8,
      score: 990,
    },
    {
      id: "2",
      rank: 2,
      title: "CS 모의면접 3회차",
      dateLabel: "8/20 (수)",
      questionCount: 10,
      score: 1120,
    },
    {
      id: "3",
      rank: 5,
      title: "JPA 복습 세션",
      dateLabel: "8/17 (일)",
      questionCount: 6,
      score: 640,
    },
  ],
};
