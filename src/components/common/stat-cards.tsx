import { InitialTile, type TileTone } from "@/components/common/initial-tile";

export type StatItem = {
  id: string;
  label: string;
  value: string;
  tile: { label: string; tone: TileTone };
};

type Props = { stats: StatItem[] };

/**
 * 통계 카드 행 (디자인 W-09·W-10·옛 W-01 공통).
 * PC(md 이상) — 44px 이니셜 타일 + label-lg 라벨 + heading-lg 값, r20 카드 3열 그리드. 폰 폭에서 그대로 쓰면
 * 한 칸이 ~110px로 좁아져 라벨이 한 글자씩 세로로 쪼개지고 금액이 잘린다.
 * 폰(max-md) — 앱 M-T4 정산 카드처럼 첫 항목(수익)만 민트 카드로 크게 보여주고, 나머지 항목은 그 아래
 * 한 줄 요약으로 묶는다. 값은 하나도 빼지 않고 다 보여준다 — 자리만 접힌다.
 */
export function StatCards({ stats }: Props) {
  const [primary, ...secondary] = stats;

  return (
    <>
      <section className="grid grid-cols-3 gap-4 max-md:hidden">
        {stats.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3.5 rounded-[20px] border bg-card px-5 py-[18px]"
          >
            <InitialTile label={s.tile.label} tone={s.tile.tone} />
            <div className="flex flex-col gap-0.5">
              <span className="text-label-lg text-muted-foreground">{s.label}</span>
              <span className="text-heading-lg text-ink">{s.value}</span>
            </div>
          </div>
        ))}
      </section>

      {primary != null && (
        <section className="hidden flex-col gap-1 rounded-[20px] bg-mint-bg px-[18px] py-4 max-md:flex">
          <span className="text-label-md text-mint-ink">{primary.label}</span>
          <span className="text-display-sm text-mint-ink">{primary.value}</span>
          {secondary.length > 0 && (
            <span className="text-label-md text-mint-ink-secondary">
              {secondary.map((s) => `${s.label} ${s.value}`).join(" · ")}
            </span>
          )}
        </section>
      )}
    </>
  );
}
