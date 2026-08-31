import type { Achievement } from "@/features/me/types";
import { cn } from "@/lib/utils";

type Props = { badge: Achievement };

/** 56px 업적 뱃지 (디자인 AchievementBadge, r16 · 테두리 2px mint-line). 잠긴 뱃지는 opacity 0.3. */
export function AchievementBadge({ badge }: Props) {
  return (
    <span
      title={badge.title}
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-mint-line bg-mint-bg",
        badge.locked && "opacity-30",
      )}
    >
      <BadgeGlyph badge={badge} />
    </span>
  );
}

function BadgeGlyph({ badge }: Props) {
  switch (badge.kind) {
    case "flag":
      return (
        <svg aria-hidden width="56" height="56" viewBox="0 0 56 56" fill="var(--mint-dark)">
          <rect x="17" y="12" width="4" height="32" rx="2" />
          <path d="M21 13h22l-4 7 4 7H21z" />
        </svg>
      );
    case "number":
    case "won":
      return (
        <span className="text-heading-lg text-mint-dark">
          {badge.kind === "won" ? "₩" : badge.label}
        </span>
      );
    case "paws":
      return (
        <svg aria-hidden width="56" height="56" viewBox="0 0 56 56" fill="var(--mint-soft)">
          <circle cx="20" cy="20" r="6" />
          <circle cx="37" cy="20" r="6" />
          <rect x="11" y="28" width="18" height="14" rx="7" />
          <rect x="28" y="28" width="18" height="14" rx="7" />
        </svg>
      );
    case "drop":
      return (
        <svg aria-hidden width="56" height="56" viewBox="0 0 56 56" fill="var(--mint-soft)">
          <polygon points="28,8 36,24 20,24" />
          <ellipse cx="28" cy="29" rx="12" ry="15" />
        </svg>
      );
    case "ring":
      return (
        <span className="relative flex size-14 items-center justify-center">
          <svg aria-hidden width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0">
            <circle cx="28" cy="28" r="17" fill="none" stroke="var(--mint-line)" strokeWidth="5" />
            <circle
              cx="28"
              cy="28"
              r="17"
              fill="none"
              stroke="var(--mint-dark)"
              strokeWidth="5"
              strokeDasharray="96.1 10.7"
              strokeDashoffset="-5.3"
              transform="rotate(-90 28 28)"
            />
          </svg>
          <span className="relative text-label-lg text-mint-dark">{badge.label}</span>
        </span>
      );
    case "empty":
      return null;
  }
}
