// 데이터 연동 전 화면 확인용 목업. API 클라이언트가 들어오면 이 파일의 타입만 남기고 교체한다.
import type { TileTone } from "@/components/common/initial-tile";

export type Teacher = { name: string; initial: string };

export type DashboardStat = {
  id: "rooms" | "sessions" | "students";
  label: string;
  value: string;
  tile: { label: string; tone: TileTone };
};

export type QuestionSet = {
  id: string;
  title: string;
  /** "객관식 5 · 서술형 3 · 8문항" 형태의 요약 */
  summary: string;
  questionCount: number;
  tile: { label: string; tone: TileTone };
};

export type PastSession = {
  id: string;
  /** "8/22" */
  date: string;
  title: string;
  participants: number;
  averageScore: number;
};

export const TEACHER: Teacher = { name: "이한결", initial: "한" };

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: "rooms", label: "개설한 방", value: "12개", tile: { label: "P", tone: "mint" } },
  { id: "sessions", label: "진행한 세션", value: "8회", tile: { label: "S", tone: "blue" } },
  { id: "students", label: "누적 학생", value: "64명", tile: { label: "U", tone: "orange" } },
];

export const QUESTION_SETS: QuestionSet[] = [
  {
    id: "qs-1",
    title: "Spring 기술면접",
    summary: "객관식 5 · 서술형 3 · 8문항",
    questionCount: 8,
    tile: { label: "Sp", tone: "mint" },
  },
  {
    id: "qs-2",
    title: "JPA 심화",
    summary: "객관식 8 · OX 2 · 10문항",
    questionCount: 10,
    tile: { label: "J", tone: "blue" },
  },
  {
    id: "qs-3",
    title: "CS 기초 다지기",
    summary: "객관식 10 · 10문항",
    questionCount: 10,
    tile: { label: "CS", tone: "orange" },
  },
];

export const PAST_SESSIONS: PastSession[] = [
  { id: "1", date: "8/22", title: "8월 4주차 Spring 스터디", participants: 6, averageScore: 72 },
  { id: "2", date: "8/20", title: "CS 모의면접 3회차", participants: 5, averageScore: 68 },
];
