// 호스트 화면(W-01~W-07)이 렌더에 쓰는 뷰 타입. DTO가 아니라 화면 모양 그대로의 타입이며,
// API 응답 → 이 타입 변환은 각 폴더의 adapt.ts가 맡는다.
import type { TileTone } from "@/components/common/initial-tile";
import type { StatItem } from "@/components/common/stat-cards";
import type { AvatarKey } from "@/components/common/student-avatar";

/** @deprecated 공용 StatItem을 쓴다 (components/common/stat-cards) */
export type DashboardStat = StatItem;

export type QuestionType = "multiple" | "essay" | "ox";

export type QuestionSet = {
  id: string;
  title: string;
  /** "객관식 5 · 서술형 3 · 8문항" 형태의 요약 */
  summary: string;
  questionCount: number;
  tile: { label: string; tone: TileTone };
  /** 유형별 문항 수 (W-08 상세 칩) */
  composition: { type: QuestionType; count: number }[];
  totalPoints: number;
  /** 예상 소요(분) */
  minutes: number;
  /** 사용 이력. 없으면 미사용 */
  usage?: { count: number; lastUsed: string };
  /** 문항 미리보기 (앞 몇 개) */
  preview: string[];
  /** 확정 여부. false면 카드에 DRAFT 배지를 보여준다 */
  isConfirmed?: boolean;
};

export type PastSession = {
  id: string;
  /** "8/22" */
  date: string;
  title: string;
  participants: number;
  averageScore: number;
};

export type Student = { id: string; name: string; avatar: AvatarKey };

export type LiveRoom = {
  code: string;
  /** 6자리 참여 PIN */
  pin: string;
  title: string;
  students: Student[];
};

export type ChoiceKey = "A" | "B" | "C" | "D";

/** 학생 화면에서 재생 중인 음성 힌트 (P-Web) */
export type VoiceHint = { positionSec: number; durationSec: number };

export type Choice = { key: ChoiceKey; text: string };

/** 진행 중인 문항 (W-05) */
export type LiveQuestion = {
  index: number;
  total: number;
  type: QuestionType;
  prompt: string;
  choices: Choice[];
  /** 배점. 서버 문항의 points 그대로 */
  points: number;
  /** 제한 시간(초) */
  seconds: number;
  /** 남은 시간(초) — 서버 시각(endsAt − ts) 기준으로 렌더 시점에 계산한 값 */
  remaining: number;
  submitted: number;
};

/** 문항 결과 (W-06) */
export type QuestionResult = {
  /** 문항 유형. 서술형은 정답·정답률·응답 분포 자리를 모범답안으로 바꾼다 */
  type: QuestionType;
  /** 정답 보기 키. 서술형처럼 보기 정답이 없으면 null */
  correct: ChoiceKey | null;
  /** 서술형 모범답안(마감 이벤트 `answer`). 서버가 안 주면 null */
  modelAnswer: string | null;
  /** 해설·채점 기준(마감 이벤트 `explanation`). 서버가 안 주면 null */
  explanation: string | null;
  distribution: { key: ChoiceKey; text: string; count: number }[];
  /** 정답률(%) */
  accuracy: number;
  /** 지난 문항 대비 정답률 변동(%p). 0이면 변동 문구를 감춘다 */
  accuracyDelta: number;
  ranking: { rank: number; studentId: string; score: number; change: number }[];
};

/** 세션 리포트 (W-07) */
export type ReportQuestion = {
  id: string;
  index: number;
  title: string;
  type: QuestionType;
  /** 객관식·OX 정답률(%) */
  accuracy?: number;
  /** 서술형 AI 분석 건수 */
  aiCount?: number;
  /** @draft 이 문항을 틀린 학생 수 — 표 "오답" 열 */
  wrongCount?: number;
  /** @draft 문항 전문 — 우측 상세 패널 머리글 (표 제목은 줄임말) */
  prompt?: string;
};

/** @draft 많이 틀린 학생 한 줄 — 미제출이면 correctCount가 null (시안 784:8963) */
export type Struggler = {
  id: string;
  name: string;
  correctCount: number | null;
  questionCount: number;
};

/** @draft 문항 하나의 채점 분포·AI 총평 — W-07 우측 상세 패널 (시안 784:8983) */
export type QuestionInsight = {
  gradingBreakdown: { label: string; count: number }[];
  strengths: string | null;
  commonMisses: string | null;
  nextRoomSuggestion: string | null;
  hostComment: string | null;
};

export type AnswerFinding = { tone: "good" | "lack" | "tip"; text: string };

export type EssayAnswer = {
  /** 서버 답안 id — 첨삭 저장(PUT …/answers/{answerId}/review)이 이 값을 쓴다 */
  answerId: number;
  studentId: string;
  nickname: string;
  /** 문항 번호 — "Q2"로 그린다 */
  questionNo: number;
  questionContent: string;
  /** 모범답안(첨삭 기준). 호스트에게는 항상 온다 */
  modelAnswer: string | null;
  text: string;
  findings: AnswerFinding[];
  /** 문항 배점 */
  points: number;
  /** 보정이 반영된 최종 점수 */
  finalScore: number;
  /** 이미 남긴 첨삭. 없으면 빈 문자열 */
  comment: string;
  improvement: string;
  /** 보정 점수. 안 건드렸으면 null */
  adjustedScore: number | null;
  reviewed: boolean;
};
export type SessionReport = {
  id: string;
  title: string;
  dateLabel: string;
  stats: {
    accuracy: number;
    students: number;
    questions: number;
    aiAnalyses: number;
    /** @draft W-07 KPI 6칸 — 없으면 "—" */
    submittedCount: number | null;
    completionPercent: number | null;
    avgElapsedSeconds: number | null;
    essayGradedCount: number | null;
    essayTotalCount: number | null;
  };
  questions: ReportQuestion[];
  strugglers: Struggler[];
};

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  seconds: number;
};

/** 방 설정 (W-02 v2) — 유료 방 옵션·정산 미리보기·명성 조건 */
export type RoomSetup = {
  /** 참가비 기본값(원, 1인당) */
  defaultFee: number;
  /** 선생님 정산 비율 (0~1). 비율은 확정 전 예시 (§13.5) */
  hostShare: number;
  /** 유료 방 개설에 필요한 최소 명성 레벨 */
  paidMinLevel: number;
  /** 현재 로그인한 선생님의 명성 */
  reputation: { level: number; title: string };
};
