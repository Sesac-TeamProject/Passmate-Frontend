/**
 * 관리자 화면(A-01~A-06) 디자인의 상태 색상.
 * 디자인이 토큰 없이 raw hex로 그려져 있어 여기 한 곳에만 모아 둔다.
 * Tailwind가 스캔할 수 있도록 반드시 리터럴 문자열로 유지할 것.
 */
export type Tone = "mint" | "blue" | "amber" | "red" | "neutral" | "muted";

export const TONE_CHIP: Record<Tone, string> = {
  mint: "bg-[#e4f5ee] text-[#12805a]",
  blue: "bg-[#e7eefd] text-[#2455c4]",
  amber: "bg-[#fdf2dc] text-[#b4780a]",
  red: "bg-[#fbeaeb] text-[#c43a43]",
  /** 회색 배경 + 민트 글자. 날짜 칩, 선생님 역할 칩 */
  neutral: "bg-[#f3f4f6] text-[#0e8a63]",
  /** 회색 배경 + 회색 글자. 게스트처럼 상태 없음을 나타낼 때 */
  muted: "bg-[#f3f4f6] text-[#6e6a85]",
};
