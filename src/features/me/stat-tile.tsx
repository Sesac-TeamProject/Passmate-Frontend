type Props = { label: string; value: string };

/** 마이페이지 카드 안의 통계 타일 (연회색 바탕, label-md + heading-md) */
export function StatTile({ label, value }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-xl bg-muted px-3.5 py-3">
      <span className="text-label-md text-muted-foreground">{label}</span>
      <span className="text-heading-md text-ink">{value}</span>
    </div>
  );
}
