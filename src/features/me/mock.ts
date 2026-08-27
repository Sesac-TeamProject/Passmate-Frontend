// 데이터 연동 전 화면 확인용 목업 (회원 계정·마이페이지).
// 계정은 하나다 — 같은 사람이 방을 개설(host)하기도, 참여(client)하기도 한다.
import type { SidebarUser } from "@/components/layout/role-sidebar";

/** 로그인한 회원. 선생님·회원 레이아웃의 사이드바 프로필이 모두 이 계정을 쓴다. */
export const ACCOUNT: SidebarUser = {
  name: "김민지",
  initial: "민",
  roleLabel: "회원",
  tone: "blue",
};

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
