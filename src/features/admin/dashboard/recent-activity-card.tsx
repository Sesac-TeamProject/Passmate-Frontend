import { formatRelativeTime } from "@/lib/format";
import type { AdminActivity, AdminActivityType } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";

const ACTIVITY_LABEL: Record<AdminActivityType, string> = {
  ROOM_CREATED: "방 개설",
  REPORT_RECEIVED: "신고 접수",
  PAYMENT_COMPLETED: "결제 완료",
  QUESTION_REVIEWED: "문제 검수",
  SANCTION_LIFTED: "제재 해제",
};

type Props = {
  activities: AdminActivity[];
  /** 상대 시각의 기준 시각(ms). 데이터를 받은 시각을 넘긴다 — 렌더 중 Date.now()를 부르지 않기 위해. */
  nowMs: number;
};

/** 우측 최근 활동 타임라인. */
export function RecentActivityCard({ activities, nowMs }: Props) {
  return (
    <AdminCard className="w-[330px] shrink-0">
      <AdminCardHead title="최근 활동" />
      {activities.length === 0 ? (
        <p className="w-full py-6 text-center text-label-md text-muted-foreground">
          최근 활동이 없습니다.
        </p>
      ) : (
        <ul className="flex w-full flex-1 flex-col justify-between">
          {activities.map((a, i) => (
            <li
              key={`${a.type}-${a.occurredAt}`}
              className={cn(
                "flex flex-col gap-[3px]",
                i === 0 ? "pb-[10px]" : "border-t border-border py-[10px]",
              )}
            >
              <div className="flex items-center gap-2">
                <p className="text-label-lg text-foreground">{ACTIVITY_LABEL[a.type]}</p>
                <p className="text-label-md text-muted-foreground">
                  {formatRelativeTime(a.occurredAt, nowMs)}
                </p>
              </div>
              <p className="text-label-md text-muted-foreground">{a.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
