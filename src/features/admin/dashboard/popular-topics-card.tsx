import { AdminCard, AdminCardHead } from "../components/admin-card";
import { POPULAR_TOPICS } from "../mock";

const MAX = Math.max(...POPULAR_TOPICS.map((t) => t.count));

/** 최근 7일 인기 출제 주제. 막대는 1위 대비 비율. */
export function PopularTopicsCard() {
  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="인기 출제 주제" hint="최근 7일" />
      <ul className="flex w-full flex-col gap-[11px]">
        {POPULAR_TOPICS.map((t) => (
          <li key={t.label} className="flex w-full flex-col gap-[5px]">
            <div className="flex items-center gap-2">
              <p className="text-[11.5px] leading-[1.25] font-medium text-[#1b1733]">{t.label}</p>
              <p className="ml-1 text-[11px] leading-[1.25] font-bold text-[#6e6a85]">
                {t.count}회
              </p>
            </div>
            <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-[4px] bg-[#f3f4f6]">
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
