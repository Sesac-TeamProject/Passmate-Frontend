import {
  AVATAR_KEYS,
  AVATAR_LABEL,
  StudentAvatar,
  type AvatarKey,
} from "@/components/common/student-avatar";
import { cn } from "@/lib/utils";

type Props = {
  value: AvatarKey;
  onChange: (next: AvatarKey) => void;
  /** 아바타 렌더 크기(px). 홈 40 · 게스트 입장 36 */
  size?: number;
  /** row: 시안대로 한 줄 12개(gap 18, 폭 673 — 부모보다 넓어도 가운데 정렬로 넘침 허용) · grid: 6×2 */
  layout?: "row" | "grid";
  disabled?: boolean;
  className?: string;
};

/**
 * 내 캐릭터 고르기 — 12종 아바타. 홈은 시안대로 한 줄(row), 게스트 입장 카드(380px)는 6×2(grid).
 * 선택은 감싸는 버튼의 mint 링 + 2px 흰 간격.
 */
export function AvatarPicker({
  value,
  onChange,
  size = 40,
  layout = "grid",
  disabled,
  className,
}: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="내 캐릭터"
      className={cn(
        layout === "row" ? "flex w-max gap-[18px]" : "grid grid-cols-6 gap-x-4 gap-y-2",
        className,
      )}
    >
      {AVATAR_KEYS.map((key) => {
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={AVATAR_LABEL[key]}
            disabled={disabled}
            onClick={() => onChange(key)}
            className={cn(
              "w-fit rounded-full bg-card p-0.5 transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-mint-dark disabled:opacity-50",
              selected && "ring-2 ring-mint",
            )}
          >
            <StudentAvatar avatar={key} size={size} />
          </button>
        );
      })}
    </div>
  );
}
