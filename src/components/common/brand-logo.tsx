import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * 시안 `symbol/passmate` — 꽉 찬 P(Pass) 안쪽에 아래를 막아 채운 M(Mate)을 눕혀 넣은 형태.
 * 두 도형의 좌표는 시안 path를 그대로 옮겼고, 100×100 박스 안에서
 * 브랜드 보드 규칙(심볼 높이 = 한 변의 62%, 가운데 정렬)에 맞춰 배치한다.
 */
const GLYPH_P =
  "M3 0l17 0c4.64129 0 9.09248 1.84374 12.37437 5.12563 3.28189 3.28189 5.12563 7.73308 5.12563 12.37437 0 4.64129-1.84375 9.09248-5.12563 12.37437-3.28189 3.28189-7.73308 5.12563-12.37437 5.12563l-7 0 0 10c0 0.79565-0.31607 1.55871-0.87868 2.12132-0.56261 0.56261-1.32567 0.87868-2.12132 0.87868l-7 0c-0.79565 0-1.55871-0.31607-2.12132-0.87868-0.56261-0.56261-0.87868-1.32567-0.87868-2.12132l0-42c0-0.79565 0.31607-1.55871 0.87868-2.12132 0.56261-0.56261 1.32567-0.87868 2.12132-0.87868z";
/** P 안으로 파고드는 M — 마크 배경과 같은 색이라 "파인 자리"로 보인다 */
const GLYPH_M = "M0 0l13.77 0-9.18 6.8 9.18 6.8-13.77 0 0-13.6z";

/** 시안 배치값 (100×100 기준) — 심볼 높이 62%, 모서리 반경은 한 변의 22.4% */
const GLYPH_SCALE = 62 / 48;

type Tone = "mint" | "tint";

/** 클래스는 Tailwind가 소스에서 문자열 그대로 찾아야 해서 조립하지 않고 통째로 적는다 */
const TONE: Record<Tone, { box: string; glyph: string; notch: string }> = {
  /** 민트 바탕 + 흰 심볼 — 랜딩·로그인·게스트 입장 */
  mint: { box: "fill-mint", glyph: "fill-white", notch: "fill-mint stroke-mint" },
  /** 옅은 민트 바탕 + 진한 심볼 — 사이드바·상단바처럼 작게 놓이는 자리 */
  tint: {
    box: "fill-mint-tint",
    glyph: "fill-mint-dark",
    notch: "fill-mint-tint stroke-mint-tint",
  },
};

/** 로고 심볼 마크 단독. 워드마크까지 필요하면 BrandLogo를 쓴다. */
export function BrandMark({
  size = 32,
  tone = "mint",
  className,
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const { box, glyph, notch } = TONE[tone];

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      style={{ width: size, height: size }}
      className={cn("shrink-0", className)}
    >
      <rect width="100" height="100" rx="22.4" className={box} />
      <path d={GLYPH_P} className={glyph} transform={`translate(25.78 19) scale(${GLYPH_SCALE})`} />
      <path
        d={GLYPH_M}
        className={notch}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(42.63 33.41) scale(${GLYPH_SCALE})`}
      />
    </svg>
  );
}

type Props = {
  href?: string;
  /** sm: 32px 옅은 민트 마크(헤더·사이드바) · lg: 40px 민트 마크(랜딩·로그인·게스트 입장 카드) */
  size?: "sm" | "lg";
  className?: string;
};

/** 로고 심볼 + 패스메이트 워드마크. */
export function BrandLogo({ href = "/", size = "sm", className }: Props) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={size === "sm" ? 32 : 40} tone={size === "sm" ? "tint" : "mint"} />
      <span className="text-heading-md text-ink">패스메이트</span>
    </Link>
  );
}
