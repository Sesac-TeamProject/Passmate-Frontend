import { cn } from "@/lib/utils";

export type RoomType = "free" | "paid";

type Props = {
  value: RoomType;
  onChange: (value: RoomType) => void;
  /** 유료 방 개설 조건(명성 Lv.3↑) 미충족이면 유료 탭을 잠근다 */
  paidLocked?: boolean;
};

const TABS: { value: RoomType; label: string }[] = [
  { value: "free", label: "무료" },
  { value: "paid", label: "유료 · 참가비 받기" },
];

/** W-02 v2 방 유형 세그먼트 탭 (무료 / 유료 · 참가비 받기) */
export function RoomTypeTabs({ value, onChange, paidLocked = false }: Props) {
  return (
    <div role="tablist" aria-label="방 유형" className="flex w-full gap-1 rounded-2xl bg-muted p-1">
      {TABS.map((t) => {
        const active = t.value === value;
        const locked = t.value === "paid" && paidLocked;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={locked || undefined}
            disabled={locked}
            onClick={() => onChange(t.value)}
            className={cn(
              "flex h-[46px] flex-1 items-center justify-center rounded-xl text-label-lg transition-colors",
              active ? "bg-card text-mint-dark" : "text-muted-foreground hover:text-ink",
              locked && "cursor-not-allowed text-ink-disabled hover:text-ink-disabled",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
