// 데이터 연동 전 화면 확인용 목업 (학생·회원).
import type { SidebarUser } from "@/components/layout/role-sidebar";

export const MEMBER: SidebarUser = { name: "민지", initial: "민", roleLabel: "회원", tone: "blue" };

export type AttendedSession = {
  id: string;
  rank: number;
  title: string;
  dateLabel: string;
  questionCount: number;
  score: number;
};

export type LearningRecord = {
  stats: { sessions: number; accuracy: number; averageRank: number };
  weakTopics: string[];
  sessions: AttendedSession[];
};

export const LEARNING_RECORD: LearningRecord = {
  stats: { sessions: 3, accuracy: 71, averageRank: 3.3 },
  weakTopics: ["JPA 영속성", "트랜잭션"],
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

/** 풀이 화면(P-Web) 진행 중 힌트 — 진행 문항은 teacher/mock의 LIVE_QUESTION을 공유 */
export const VOICE_HINT = { positionSec: 3, durationSec: 5 };
