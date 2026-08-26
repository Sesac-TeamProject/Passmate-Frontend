import { cn } from "@/lib/utils";
import { AdminCard, AdminCardHead } from "../components/admin-card";
import { TYPE } from "../components/typography";
import { POPULAR_TOPICS } from "../mock";

const MAX = Math.max(...POPULAR_TOPICS.map((t) => t.count));

/** 최근 7일 인기 출제 주제. 막대는 1위 대비 비율이고 트랙은 카드 전체 폭을 쓴다. */
export function PopularTopicsCard() {
  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="인기 출제 주제" hint="최근 7일" />
      <ul className="flex w-full flex-col gap-[11px]">
        {POPULAR_TOPICS.map((t) => (
          <li key={t.label} className="flex w-full flex-col gap-[5px]">
            <div className="flex items-center gap-2">
              <p className={cn("text-[#1b1733]", TYPE.labelLg)}>{t.label}</p>
              <p className={cn("ml-1 text-[#6e6a85]", TYPE.labelLg)}>{t.count}회</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-[4px] bg-[#f3f4f6]">
              <div
                style={{ width: (t.count / MAX) * 100 + "%" }}
                className="h-2 rounded-[4px] bg-[#17b884]"
              />
            </div>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
