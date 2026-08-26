import type { Tone } from "./components/tone";

/**
 * 관리자 화면(A-01~A-06)의 화면 확인용 더미 데이터.
 * 값은 피그마 시안(admin/A-01, node 167:1022)을 그대로 옮긴 것이다.
 * API 연동 시 이 파일을 통째로 걷어낸다.
 */

export type Kpi = {
  label: string;
  value: string;
  chip: string;
  tone: Tone;
};

export const DASHBOARD_KPIS: readonly Kpi[] = [
  { label: "총 사용자", value: "12,480", chip: "▲ 4.2%", tone: "mint" },
  { label: "오늘 개설된 방", value: "316", chip: "▲ 8.1%", tone: "mint" },
  { label: "진행 중 세션", value: "27", chip: "실시간", tone: "blue" },
  { label: "이번 달 결제액", value: "₩ 4,820,000", chip: "▲ 12.6%", tone: "mint" },
  { label: "미처리 신고", value: "8", chip: "확인 필요", tone: "amber" },
];

export type DailySession = { date: string; count: number };

/** 최근 14일 세션 수. 마지막 날만 강조색. */
export const DAILY_SESSIONS: readonly DailySession[] = [
  { date: "8/11", count: 118 },
  { date: "8/12", count: 142 },
  { date: "8/13", count: 131 },
  { date: "8/14", count: 168 },
  { date: "8/15", count: 186 },
  { date: "8/16", count: 172 },
  { date: "8/17", count: 205 },
  { date: "8/18", count: 231 },
  { date: "8/19", count: 214 },
  { date: "8/20", count: 258 },
  { date: "8/21", count: 276 },
  { date: "8/22", count: 268 },
  { date: "8/23", count: 305 },
  { date: "8/24", count: 338 },
];

/** 차트 y축 눈금. 위에서 아래 순서로 그린다. */
export const SESSION_AXIS = [360, 270, 180, 90, 0] as const;

export type Activity = { title: string; at: string; detail: string };

export const RECENT_ACTIVITY: readonly Activity[] = [
  { title: "방 개설", at: "2분 전", detail: "박세라 · Spring 면접 8문항" },
  { title: "신고 접수", at: "11분 전", detail: "부적절 닉네임 · M-03" },
  { title: "결제 완료", at: "25분 전", detail: "₩10,000 · 유료 방 #2841" },
  { title: "문제 검수", at: "1시간 전", detail: "AI 생성 12문항 승인" },
  { title: "제재 해제", at: "2시간 전", detail: "학생 계정 3건" },
];

export type Segment = { label: string; count: number; ratio: string };

export const USER_COMPOSITION = {
  total: "전체 12,480명",
  segments: [
    { label: "선생님", count: 2140, ratio: "17.1%" },
    { label: "학생", count: 10340, ratio: "82.9%" },
  ] satisfies Segment[],
};

export type Topic = { label: string; count: number };

export const POPULAR_TOPICS: readonly Topic[] = [
  { label: "Spring · JPA", count: 86 },
  { label: "자료구조", count: 64 },
  { label: "네트워크", count: 51 },
  { label: "정보처리기사", count: 38 },
  { label: "React", count: 29 },
];

export type SystemStatus = { name: string; metric: string; label: string; tone: Tone };

export const SYSTEM_STATUS: readonly SystemStatus[] = [
  { name: "WebSocket 세션 서버", metric: "지연 0.4s", label: "정상", tone: "mint" },
  { name: "LLM API", metric: "평균 8.2s", label: "정상", tone: "mint" },
  { name: "결제 PG", metric: "응답 3.1s", label: "지연", tone: "amber" },
  { name: "Redis 랭킹", metric: "메모리 61%", label: "정상", tone: "mint" },
  { name: "스토리지 (음성 힌트)", metric: "용량 92%", label: "점검 필요", tone: "red" },
];
