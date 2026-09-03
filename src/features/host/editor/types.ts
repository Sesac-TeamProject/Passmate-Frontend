import type { QuestionType } from "@/features/host/types";

/**
 * W-03 에디터가 다루는 문항. 서버 `QuestionResponse`를 화면 말로 옮긴 것이다.
 *
 * `id`는 **서버 문항 id**다 — 수정·삭제·재생성이 전부 이 id로 나가므로 문자열로 바꾸지 않는다
 * (예전 뷰 타입은 `id: string`이라 API를 부를 수 없었다).
 */
export type EditorQuestion = {
  id: number;
  /** 1부터. 순서 바꾸기는 이 값이 아니라 id 배열(`questionOrder`)로 보낸다 */
  orderNo: number;
  type: QuestionType;
  prompt: string;
  choices: string[];
  /** MCQ는 보기 원문 · OX는 "O"|"X" · 서술형은 모범답안 */
  answer: string;
  explanation: string;
  points: number;
  seconds: number;
  /** AI가 만든 문항만 재생성할 수 있다 */
  isAiGenerated: boolean;
};

/** 문항 추가·수정 폼의 입력값. 숫자도 입력 중에는 문자열이라 폼 전용 타입을 따로 둔다 */
export type QuestionFormValues = {
  type: QuestionType;
  prompt: string;
  /** MCQ에서만 쓴다. 빈 줄은 저장할 때 버린다 */
  choices: string[];
  answer: string;
  explanation: string;
  points: number;
  seconds: number;
};

/** 서버 기본값과 같게 둔다 (`QuestionRequest.DEFAULT_*`) */
export const DEFAULT_QUESTION_POINTS = 100;
export const DEFAULT_QUESTION_SECONDS = 30;

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  type: "multiple",
  prompt: "",
  choices: ["", ""],
  answer: "",
  explanation: "",
  points: DEFAULT_QUESTION_POINTS,
  seconds: DEFAULT_QUESTION_SECONDS,
};
