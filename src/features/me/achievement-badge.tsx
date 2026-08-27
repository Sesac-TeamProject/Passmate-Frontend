import type { Achievement } from "@/features/me/mock";

type Props = { badge: Achievement };

/** 40px 업적 뱃지 (디자인 AchievementBadge). 종류별 아이콘은 인라인 SVG. */
export function AchievementBadge({ badge }: Props) {
  return (
    <span
      title={badge.title}
      className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-[#bfebd8] bg-mint-bg"
    >
      <BadgeGlyph badge={badge} />
    </span>
  );
}

function BadgeGlyph({ badge }: Props) {
  switch (badge.kind) {
    case "flag":
      return (
        <svg aria-hidden width="40" height="40" viewBox="0 0 40 40">
          <rect x="11" y="6" width="4" height="28" rx="2" fill="#0e8a63" />
          <polygon points="15,7 31,7 27,13 31,19 15,19" fill="#0e8a63" />
        </svg>
      );
    case "number":
      return <span className="text-heading-lg text-mint-dark">{badge.label}</span>;
    case "paws":
      return (
        <svg aria-hidden width="40" height="40" viewBox="0 0 40 40" fill="#5ccfa0">
          <circle cx="14" cy="14" r="5" />
          <circle cx="26" cy="14" r="5" />
          <rect x="7" y="22" width="14" height="11" rx="5.5" />
          <rect x="19" y="22" width="14" height="11" rx="5.5" />
        </svg>
      );
    case "ring":
      return (
        <span className="relative flex size-10 items-center justify-center">
          <svg aria-hidden width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0">
            <circle cx="20" cy="20" r="15" fill="none" stroke="#bfebd8" strokeWidth="4" />
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="#0e8a63"
              strokeWidth="4"
              strokeDasharray="84.8 9.4"
              strokeDashoffset="-4.7"
              transform="rotate(-90 20 20)"
            />
          </svg>
          <span className="relative text-label-lg text-mint-dark">{badge.label}</span>
        </span>
      );
    case "empty":
      return null;
  }
}
