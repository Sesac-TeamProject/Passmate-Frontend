/**
 * 관리자 시안의 타입 토큰. 피그마 컴포넌트 설명에 정의된 값을 그대로 옮겼다.
 * 자간은 모두 -2%, 본문 폰트는 Pretendard Variable(globals.css의 --font-sans).
 */
export const TYPE = {
  /** display-sm — KPI 숫자. 28px */
  displaySm: "text-[28px] leading-[1.2] font-bold tracking-[-0.56px]",
  /** heading-md — 화면 제목. 20px */
  headingMd: "text-[20px] leading-[1.2] font-bold tracking-[-0.4px]",
  /** heading-sm — 16px */
  headingSm: "text-[16px] leading-[1.2] font-semibold tracking-[-0.32px]",
  /** label-lg — 카드 제목·표 본문·칩. 14px */
  labelLg: "text-[14px] leading-[1.4] font-medium tracking-[-0.28px]",
  /** label-md — 보조 문구. 12px */
  labelMd: "text-[12px] leading-[1.4] font-normal tracking-[-0.24px]",
} as const;
