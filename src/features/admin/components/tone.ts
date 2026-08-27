/**
 * 상태 칩의 의미 색. 값은 globals.css의 시맨틱 토큰만 쓴다 (hex 금지, 규칙 문서 §11).
 * Tailwind가 스캔할 수 있도록 반드시 리터럴 문자열로 유지할 것.
 */
export type Tone = "success" | "info" | "warning" | "danger" | "brand" | "muted";

export const TONE_CHIP: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
  /** 회색 배경 + 민트 글자. 날짜 칩, 선생님 역할 칩 */
  brand: "bg-muted text-primary-strong",
  /** 회색 배경 + 회색 글자. 게스트처럼 상태 없음을 나타낼 때 */
  muted: "bg-muted text-muted-foreground",
};
