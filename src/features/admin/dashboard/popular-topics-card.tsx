import type { PopularTopic } from "@/lib/types/dto";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";

type Props = { topics: PopularTopic[] };

/** 최근 7일 인기 출제 주제. 막대는 1위 대비 비율이고 트랙은 카드 전체 폭을 쓴다. */
export function PopularTopicsCard({ topics }: Props) {
  const max = Math.max(1, ...topics.map((t) => t.count));

  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="인기 출제 주제" hint="최근 7일" />
      {topics.length === 0 ? (
        <p className="w-full py-6 text-center text-label-md text-muted-foreground">
          집계된 주제가 없습니다.
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-[11px]">
          {topics.map((t) => (
            <li key={t.label} className="flex w-full flex-col gap-[5px]">
              <div className="flex items-center gap-2">
                <p className="text-label-lg text-foreground">{t.label}</p>
                <p className="ml-1 text-label-lg text-muted-foreground">{t.count}회</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-[4px] bg-muted">
                <div
                  style={{ width: `${(t.count / max) * 100}%` }}
                  className="h-2 rounded-[4px] bg-primary"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
