import { cn } from "@/lib/utils";
import { AdminCard, AdminCardHead } from "../components/admin-card";
import { TYPE } from "../components/typography";
import { RECENT_ACTIVITY } from "../mock";

/** 우측 최근 활동 타임라인. */
export function RecentActivityCard() {
  return (
    <AdminCard className="w-[330px] shrink-0">
      <AdminCardHead title="최근 활동" />
      <ul className="flex w-full flex-1 flex-col justify-between">
        {RECENT_ACTIVITY.map((a, i) => (
          <li
            key={a.title + a.at}
            className={cn(
              "flex flex-col gap-[3px]",
              i === 0 ? "pb-[10px]" : "border-t border-[#e5e7eb] py-[10px]",
            )}
          >
            <div className="flex items-center gap-2">
              <p className={cn("text-[#1b1733]", TYPE.labelLg)}>{a.title}</p>
              <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{a.at}</p>
            </div>
            <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{a.detail}</p>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
