import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { AdminUserFilter } from "@/lib/types/dto";
import { cn } from "@/lib/utils";

const FILTERS: readonly { key: AdminUserFilter; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "TEACHER", label: "선생님" },
  { key: "STUDENT", label: "학생" },
  { key: "SANCTIONED", label: "제재 중" },
];

const DEFAULT_SORT_LABEL = "최근 가입순";

type Props = {
  value: AdminUserFilter;
  /** 필터별 서비스 전체 수. 표시 행 수와 다르다. */
  counts: Record<AdminUserFilter, number>;
  onChange: (next: AdminUserFilter) => void;
  /** 우측 정렬 기준 표기. 정렬 옵션은 아직 계약에 없어 고정값. */
  sortLabel?: string;
};

/** 사용자 목록 상단 필터 pill. */
export function UserFilters({ value, counts, onChange, sortLabel = DEFAULT_SORT_LABEL }: Props) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {FILTERS.map((f) => {
        const isActive = f.key === value;

        return (
          <Button
            key={f.key}
            type="button"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            onClick={() => onChange(f.key)}
            className={cn(
              "h-auto rounded-[8px] px-[14px] py-2 text-label-lg",
              isActive ? "border-primary hover:bg-primary" : "hover:border-primary hover:bg-card",
            )}
          >
            {f.label} {formatNumber(counts[f.key])}
          </Button>
        );
      })}
      <p className="ml-1 text-label-md text-muted-foreground">정렬 {sortLabel}</p>
    </div>
  );
}
