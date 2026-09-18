/** 랜딩 상단 바와 본문이 함께 쓰는 규격 — 네비(클라이언트)와 본문(서버)이 같은 값을 보게 따로 둔다 */

/** 시안 폭 1440 안의 콘텐츠 폭 1200 (좌우 여백 120). 패딩 24를 더해 1248 이상에서 콘텐츠가 정확히 1200이 되게 한다 */
export const INNER = "mx-auto w-full max-w-[1248px] px-6";

/** 랜딩 전용 버튼 — r14. 시안 nav [12,22] · 히어로/CTA [16,28] (공용 Button size=xl(h48·r12)과 규격이 달라 따로 둔다) */
export const BUTTON = {
  base: "inline-flex shrink-0 items-center justify-center rounded-[14px] whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-mint",
  nav: "px-[22px] py-3 text-label-lg",
  hero: "px-7 py-4 text-heading-sm",
  mint: "bg-mint text-white hover:bg-mint-dark",
  outline: "border bg-card text-ink hover:bg-muted",
  white: "bg-card text-ink hover:bg-mint-tint",
  ink: "bg-ink text-white hover:bg-mint-ink",
} as const;
