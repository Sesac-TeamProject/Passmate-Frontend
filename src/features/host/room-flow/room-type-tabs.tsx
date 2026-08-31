import { cn } from "@/lib/utils";

export type RoomType = "free" | "paid";

type Props = {
  value: RoomType;
  onChange: (value: RoomType) => void;
  /** 유료 방 개설 조건(명성 Lv.3↑) 미충족이면 유료 탭을 잠근다 */
  paidLocked?: boolean;
  /** md: W-02 v2 카드(r16 · h46) · sm: 새 방 만들기 모달(r12 · py10 · 활성 테두리) */
  size?: "md" | "sm";
  /** 유료 탭 문구 덮어쓰기. 예: "유료 (Lv.3부터)" */
  paidLabel?: string;
};

const TABS: { value: RoomType; label: string }[] = [
  { value: "free", label: "무료" },
  { value: "paid", label: "유료 · 참가비 받기" },
];

/** 방 유형 세그먼트 탭 (무료 / 유료) — W-02 v2 카드 · W-01 v6 새 방 모달 공용 */
export function RoomTypeTabs({
  value,
  onChange,
  paidLocked = false,
  size = "md",
  paidLabel,
}: Props) {
  return (
    <div
      role="group"
      aria-label="방 유형"
      className={cn("flex w-full gap-1 bg-muted p-1", size === "md" ? "rounded-2xl" : "rounded-xl")}
    >
      {TABS.map((t) => {
        const active = t.value === value;
        const locked = t.value === "paid" && paidLocked;
        const label = t.value === "paid" && paidLabel ? paidLabel : t.label;
        return (
          <button
            key={t.value}
            type="button"
            aria-pressed={active}
            aria-disabled={locked || undefined}
            disabled={locked}
            onClick={() => onChange(t.value)}
            className={cn(
              "flex flex-1 items-center justify-center text-label-lg transition-colors",
              size === "md" ? "h-[46px] rounded-xl" : "rounded-[10px] border py-2.5",
              active
                ? "bg-card text-mint-dark"
                : "border-transparent text-muted-foreground hover:text-ink",
              size === "md" && "border-0",
              locked && "cursor-not-allowed text-ink-disabled hover:text-ink-disabled",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
