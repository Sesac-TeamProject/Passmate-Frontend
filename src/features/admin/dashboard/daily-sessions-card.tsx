import { formatShortDate } from "@/lib/format";
import type { DailySessionCount } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";

/**
 * 시안(admin/A-01, plot 노드 167:1095) 기준.
 * 0선 y=312, 360선 y=18 → 그래프 높이 294. 축 라벨 44px, 막대 시작 48px, 간격 9px.
 *
 * 시안은 1440 고정 프레임이라 막대 x좌표가 하드코딩돼 있는데(마지막 막대가 753에서 끝남),
 * 그대로 두면 더 넓은 화면에서 오른쪽이 빈다. 간격만 9px로 고정하고 막대는 남는 폭을
 * 나눠 갖게 해서, 1440에서는 시안과 같은 42px가 되고 그보다 넓으면 막대가 넓어진다.
 */
const AXIS_W = 44;
const BAR_X0 = 48;
const BAR_GAP = 9;
const BASELINE = 312;
const TOP_LINE = 18;
const PLOT_H = BASELINE - TOP_LINE;
const X_LABEL_TOP = 317;
const TICK_COUNT = 5;
const TICK_ROUND = 10;

type Props = { sessions: DailySessionCount[] };

/** 최근 14일 일별 세션 수 막대 차트. 마지막 날만 강조하고 값을 표기한다. */
export function DailySessionsCard({ sessions }: Props) {
  const first = sessions[0];
  const last = sessions[sessions.length - 1];
  const ticks = axisTicks(sessions);
  const max = ticks[0];

  if (!first || !last) {
    return (
      <AdminCard className="min-w-0 flex-1">
        <AdminCardHead title="일별 세션 수" hint="최근 14일" />
        <p className="w-full py-10 text-center text-label-md text-muted-foreground">
          집계된 세션이 없습니다.
        </p>
      </AdminCard>
    );
  }

  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="일별 세션 수" hint="최근 14일" />
      <figure className="w-full overflow-x-auto">
        <figcaption className="sr-only">
          최근 14일 일별 세션 수. 최근 {formatShortDate(last.date)} {last.count}건.
        </figcaption>
        <div className="relative h-[336px] min-w-[560px]">
          {ticks.map((tick, i) => {
            const y = TOP_LINE + (i * PLOT_H) / (ticks.length - 1);

            return (
              <div key={tick}>
                <div
                  aria-hidden
                  className="absolute right-0 h-px bg-muted"
                  style={{ left: AXIS_W, top: y }}
                />
                <span
                  aria-hidden
                  className="absolute text-label-md text-muted-foreground"
                  style={{ left: 6, top: y - 10 }}
                >
                  {tick}
                </span>
              </div>
            );
          })}

          <div
            className="absolute right-0 flex items-end"
            style={{ left: BAR_X0, top: TOP_LINE, height: PLOT_H, gap: BAR_GAP }}
          >
            {sessions.map((d, i) => {
              const isLast = i === sessions.length - 1;

              return (
                <div
                  key={d.date}
                  title={`${formatShortDate(d.date)} · ${d.count}건`}
                  style={{ height: `${(d.count / max) * 100}%` }}
                  className={cn(
                    "relative min-w-0 flex-1 rounded-t-[4px]",
                    isLast ? "bg-primary" : "bg-primary-soft",
                  )}
                >
                  {isLast ? (
                    <span className="absolute -top-[24px] left-1/2 -translate-x-1/2 text-label-lg whitespace-nowrap text-primary-strong">
                      {d.count}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div
            aria-hidden
            className="absolute right-0 flex justify-between text-label-md text-muted-foreground"
            style={{ left: BAR_X0, top: X_LABEL_TOP }}
          >
            <span>{formatShortDate(first.date)}</span>
            <span>{formatShortDate(last.date)}</span>
          </div>
        </div>
      </figure>
    </AdminCard>
  );
}

/** 최댓값을 10 단위로 올림해 눈금 5개를 만든다. 위에서 아래 순서. 예: 338 → [360, 270, 180, 90, 0] */
function axisTicks(sessions: DailySessionCount[]): number[] {
  const maxCount = Math.max(0, ...sessions.map((s) => s.count));
  const step = Math.max(
    TICK_ROUND,
    Math.ceil(maxCount / (TICK_COUNT - 1) / TICK_ROUND) * TICK_ROUND,
  );

  return Array.from({ length: TICK_COUNT }, (_, i) => step * (TICK_COUNT - 1 - i));
}
