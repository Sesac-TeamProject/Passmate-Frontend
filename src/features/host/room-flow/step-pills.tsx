import { cn } from "@/lib/utils";
import { ROOM_FLOW_STEPS, type RoomFlowStep } from "./steps";

type Props = { current: RoomFlowStep };

/** 상단바 우측 "1 방 정보 · 2 문제 준비 · 3 대기실" 알약 스텝 표시 */
export function StepPills({ current }: Props) {
  return (
    <ol className="flex items-center gap-2">
      {ROOM_FLOW_STEPS.map((s) => {
        const active = s.step === current;
        return (
          <li
            key={s.step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-full py-1.5 pr-3.5 pl-2.5 text-label-lg",
              active ? "bg-mint-tint text-mint-dark" : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full bg-card text-label-lg",
                active ? "text-mint-dark" : "text-muted-foreground",
              )}
            >
              {s.step}
            </span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}
