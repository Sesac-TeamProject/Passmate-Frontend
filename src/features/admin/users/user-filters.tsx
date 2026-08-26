import { cn } from "@/lib/utils";
import { TYPE } from "../components/typography";
import { USER_FILTERS, type UserFilter } from "../mock";

type Props = {
  value: UserFilter;
  onChange: (next: UserFilter) => void;
  /** 우측 정렬 기준 표기. 지금은 고정값. */
  sortLabel?: string;
};

/** 사용자 목록 상단 필터. 숫자는 서비스 전체 기준이라 표시 행 수와 다르다. */
export function UserFilters({ value, onChange, sortLabel = "최근 가입순" }: Props) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {USER_FILTERS.map((f) => {
        const active = f.key === value;
        return (
          <button
            key={f.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(f.key)}
            className={cn(
              "rounded-[8px] border px-[14px] py-2",
              TYPE.labelLg,
              active
                ? "border-[#17b884] bg-[#17b884] text-white"
                : "border-[#e5e7eb] bg-white text-[#1b1733] hover:border-[#17b884]",
              "focus-visible:ring-2 focus-visible:ring-[#17b884] focus-visible:ring-offset-1 focus-visible:outline-none",
            )}
          >
            {f.label} {f.count}
          </button>
        );
      })}
      <p className={cn("ml-1 text-[#6e6a85]", TYPE.labelMd)}>정렬 {sortLabel}</p>
    </div>
  );
}
