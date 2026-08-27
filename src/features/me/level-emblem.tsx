import { cn } from "@/lib/utils";

type Props = { size?: number; className?: string };

/** 명성 레벨 엠블럼 (디자인 LevelEmblem) — 민트 원 + 진한 민트 방패에 체크 */
export function LevelEmblem({ size = 48, className }: Props) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
    >
      <circle cx="32" cy="32" r="32" fill="#c4eedb" />
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="#6fd3a6" strokeWidth="3" />
      <path
        d="M24 16h16a6 6 0 0 1 6 6v12a14 14 0 0 1-14 14 14 14 0 0 1-14-14V22a6 6 0 0 1 6-6z"
        fill="#0e8a63"
      />
      <path
        d="M25 32.5l5.5 5.5L40 27"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
