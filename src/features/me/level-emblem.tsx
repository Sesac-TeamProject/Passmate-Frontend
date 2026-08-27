import { useId } from "react";

import { cn } from "@/lib/utils";

export type EmblemLevel = 1 | 2 | 3 | 4 | 5;

/** level은 1~5 밖 값이 와도 가장 가까운 레벨로 잘라 그린다 */
type Props = { level?: number; size?: number; className?: string };

/**
 * 레벨별 색 (디자인 시스템 v3 "v5 뱃지 — 레벨 엠블럼 5종", 2026-08-27 육각 광택 리디자인).
 * 그라데이션 stop은 엠블럼 전용 값이라 전역 토큰으로 올리지 않고 여기 둔다. 토큰이 있는 색은 var()로 참조.
 */
const PALETTE: Record<EmblemLevel, { top: string; bottom: string; rim: string }> = {
  1: { top: "#7ed9b0", bottom: "#3ec48a", rim: "var(--mint-tint)" },
  2: { top: "#4fcf97", bottom: "var(--mint)", rim: "var(--mint-line)" },
  3: { top: "#2ebf8c", bottom: "var(--mint-dark)", rim: "#9fe0c4" },
  4: { top: "var(--mint)", bottom: "var(--mint-deep)", rim: "#6fd3a6" },
  5: { top: "var(--mint-dark)", bottom: "#063d2c", rim: "var(--gold)" },
};

/** 꼭짓점이 위로 향한 육각형. 64 박스 기준(outer) / 50 박스를 (7,7)에 놓은 안쪽 베벨(inner) */
const HEX_OUTER = "32,1 63,16.5 63,47.5 32,63 1,47.5 1,16.5";
const HEX_INNER = "32,7 57,19.5 57,44.5 32,57 7,44.5 7,19.5";

/**
 * 명성 레벨 엠블럼 (디자인 LevelEmblem) — 육각형 + 위→아래 민트 그라데이션 + 림 2px + 안쪽 베벨 + 광택.
 * Lv.5만 골드 림·골드 왕관. 사이즈 14(칩) / 48~64(웹 카드) / 72(상세)는 viewBox 스케일로 처리.
 */
export function LevelEmblem({ level = 3, size = 48, className }: Props) {
  const id = useId();
  const outerId = `${id}-outer`;
  const innerId = `${id}-inner`;
  const lv = Math.min(5, Math.max(1, Math.round(level))) as EmblemLevel;
  const { top, bottom, rim } = PALETTE[lv];

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={outerId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={innerId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bottom} stopOpacity="0.15" />
          <stop offset="1" stopColor={bottom} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <polygon points={HEX_OUTER} fill={`url(#${outerId})`} stroke={rim} strokeWidth="2" />
      <polygon
        points={HEX_INNER}
        fill={`url(#${innerId})`}
        stroke="#fff"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      <ellipse cx="32" cy="16" rx="20" ry="9" fill="#fff" fillOpacity="0.22" />
      <LevelIcon level={lv} />
    </svg>
  );
}

function LevelIcon({ level }: { level: EmblemLevel }) {
  switch (level) {
    case 1:
      // 새싹 — 줄기 + 잎 2장
      return (
        <g fill="#fff">
          <rect x="30" y="34" width="4" height="16" rx="2" />
          <ellipse cx="30.1" cy="26" rx="8" ry="5" transform="rotate(-40 30.1 26)" />
          <ellipse cx="37.7" cy="36.3" rx="8" ry="5" transform="rotate(40 37.7 36.3)" />
        </g>
      );
    case 2:
      // 새싹 + 봉오리
      return (
        <g fill="#fff">
          <rect x="30" y="30" width="4" height="20" rx="2" />
          <ellipse cx="28.9" cy="21.8" rx="8" ry="5" transform="rotate(-45 28.9 21.8)" />
          <ellipse cx="39.8" cy="33.1" rx="8" ry="5" transform="rotate(45 39.8 33.1)" />
          <ellipse cx="32" cy="17" rx="5" ry="8" />
        </g>
      );
    case 3:
      // 방패(위 r6 · 아래 r14) + 체크
      return (
        <g>
          <path
            d="M24 16h16a6 6 0 0 1 6 6v12a14 14 0 0 1-14 14 14 14 0 0 1-14-14V22a6 6 0 0 1 6-6z"
            fill="#fff"
          />
          <path
            d="M24 33l6 6 11-13"
            fill="none"
            stroke="var(--mint-deep)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case 4:
      // TODO(디자인): 시안 Lv.4 엠블럼에 아이콘이 없다(미완). 확정 전까지 별을 임시로 둔다.
      return (
        <polygon
          points="32,17 36.4,26.4 46.7,27.6 39.1,34.6 41.2,44.8 32,39.7 22.8,44.8 24.9,34.6 17.3,27.6 27.6,26.4"
          fill="#fff"
        />
      );
    case 5:
      // 골드 왕관 — 밑단 + 뾰족 3개 (시안의 보석 3개는 밑단과 같은 골드라 생략)
      return (
        <g fill="var(--gold)">
          <rect x="16" y="36" width="32" height="10" rx="2" />
          <polygon points="21,22 26,36 16,36" />
          <polygon points="32,16 37,36 27,36" />
          <polygon points="43,22 48,36 38,36" />
        </g>
      );
  }
}
