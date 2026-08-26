import { AdminCard, AdminCardHead } from "../components/admin-card";
import { DAILY_SESSIONS, SESSION_AXIS } from "../mock";

const MAX = SESSION_AXIS[0];

/** 최근 14일 일별 세션 수 막대 차트. 마지막 날만 강조하고 값을 표기한다. */
export function DailySessionsCard() {
  const last = DAILY_SESSIONS[DAILY_SESSIONS.length - 1];

  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="일별 세션 수" hint="최근 14일" />
      <figure className="flex w-full gap-3">
        <figcaption className="sr-only">
          최근 14일 일별 세션 수. 최고 {last.date} {last.count}건.
        </figcaption>
        <div
          aria-hidden
          className="flex h-[150px] w-[28px] shrink-0 flex-col justify-between text-right text-[9.5px] leading-none text-[#6e6a85]"
        >
          {SESSION_AXIS.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-[150px]">
            <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
              {SESSION_AXIS.map((v) => (
                <div key={v} className="h-px w-full bg-[#f3f4f6]" />
              ))}
            </div>
            <ul className="relative flex h-full items-end gap-[4px]">
              {DAILY_SESSIONS.map((d, i) => {
                const isLast = i === DAILY_SESSIONS.length - 1;
                return (
                  <li
                    key={d.date}
                    title={d.date + " · " + d.count + "건"}
                    style={{ height: (d.count / MAX) * 100 + "%" }}
                    className={
                      "relative min-w-0 flex-1 rounded-t-[4px] " +
                      (isLast ? "bg-[#17b884]" : "bg-[#d6f3e6]")
                    }
                  >
                    {isLast ? (
                      <span className="absolute -top-[18px] right-0 text-[12px] leading-none font-bold text-[#0e8a63]">
                        {d.count}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            aria-hidden
            className="mt-[6px] flex justify-between text-[9.5px] leading-none text-[#6e6a85]"
          >
            <span>{DAILY_SESSIONS[0].date}</span>
            <span>{last.date}</span>
          </div>
        </div>
      </figure>
    </AdminCard>
  );
}
