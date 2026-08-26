import { cn } from "@/lib/utils";
import { AdminCard, AdminCardHead } from "../components/admin-card";
import { TYPE } from "../components/typography";
import { DAILY_SESSIONS, SESSION_AXIS } from "../mock";

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
const MAX = SESSION_AXIS[0];

/** 최근 14일 일별 세션 수 막대 차트. 마지막 날만 강조하고 값을 표기한다. */
export function DailySessionsCard() {
  const last = DAILY_SESSIONS[DAILY_SESSIONS.length - 1];

  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="일별 세션 수" hint="최근 14일" />
      <figure className="w-full overflow-x-auto">
        <figcaption className="sr-only">
          최근 14일 일별 세션 수. 최고 {last.date} {last.count}건.
        </figcaption>
        <div className="relative h-[336px] min-w-[560px]">
          {SESSION_AXIS.map((v, i) => {
            const y = TOP_LINE + (i * PLOT_H) / (SESSION_AXIS.length - 1);
            return (
              <div key={v}>
                <div
                  aria-hidden
                  className="absolute right-0 h-px bg-[#f3f4f6]"
                  style={{ left: AXIS_W, top: y }}
                />
                <span
                  aria-hidden
                  className={cn("absolute text-[#6e6a85]", TYPE.labelMd)}
                  style={{ left: 6, top: y - 10 }}
                >
                  {v}
                </span>
              </div>
            );
          })}

          <div
            className="absolute right-0 flex items-end"
            style={{ left: BAR_X0, top: TOP_LINE, height: PLOT_H, gap: BAR_GAP }}
          >
            {DAILY_SESSIONS.map((d, i) => {
              const isLast = i === DAILY_SESSIONS.length - 1;
              return (
                <div
                  key={d.date}
                  title={d.date + " · " + d.count + "건"}
                  style={{ height: (d.count / MAX) * 100 + "%" }}
                  className={cn(
                    "relative min-w-0 flex-1 rounded-t-[4px]",
                    isLast ? "bg-[#17b884]" : "bg-[#d6f3e6]",
                  )}
                >
                  {isLast ? (
                    <span
                      className={cn(
                        "absolute -top-[24px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[#0e8a63]",
                        TYPE.labelLg,
                      )}
                    >
                      {d.count}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div
            aria-hidden
            className={cn("absolute right-0 flex justify-between text-[#6e6a85]", TYPE.labelMd)}
            style={{ left: BAR_X0, top: 317 }}
          >
            <span>{DAILY_SESSIONS[0].date}</span>
            <span>{last.date}</span>
          </div>
        </div>
      </figure>
    </AdminCard>
  );
}
