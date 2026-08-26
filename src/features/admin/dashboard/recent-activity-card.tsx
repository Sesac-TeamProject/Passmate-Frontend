import { AdminCard, AdminCardHead } from "../components/admin-card";
import { RECENT_ACTIVITY } from "../mock";

/** 우측 최근 활동 타임라인. */
export function RecentActivityCard() {
  return (
    <AdminCard className="w-full shrink-0 xl:w-[330px]">
      <AdminCardHead title="최근 활동" />
      <ul className="w-full">
        {RECENT_ACTIVITY.map((a, i) => (
          <li
            key={a.title + a.at}
            className={
              "flex flex-col gap-[3px] " +
              (i === 0 ? "pb-[10px]" : "border-t border-[#e5e7eb] py-[10px]")
            }
          >
            <div className="flex items-center gap-2">
              <p className="text-[12px] leading-[1.25] font-bold text-[#1b1733]">{a.title}</p>
              <p className="text-[10px] leading-[1.2] text-[#6e6a85]">{a.at}</p>
            </div>
            <p className="text-[11px] leading-[1.35] text-[#6e6a85]">{a.detail}</p>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
