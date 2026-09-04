import { clsx } from "clsx";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";

/**
 * 시안의 스탠드는 솔리드가 아니라 옅은 틴트 배경 + 상단 6px 컬러 바다.
 * 순위 숫자 색은 시안이 틴트 위 전용 값을 쓰지만(#6a4a05 등) 기존 podium-*-foreground와
 * 거의 같은 톤이라 토큰을 늘리지 않고 재사용한다.
 */
const STEP = {
  1: {
    height: "h-[158px]",
    stand: "bg-podium-gold-bg text-podium-gold-foreground",
    bar: "bg-podium-gold",
    ring: "ring-podium-gold",
    avatar: 76,
  },
  2: {
    height: "h-[118px]",
    stand: "bg-podium-silver-bg text-podium-silver-foreground",
    bar: "bg-podium-silver",
    ring: "ring-podium-silver",
    avatar: 64,
  },
  3: {
    height: "h-24",
    stand: "bg-podium-bronze-bg text-podium-bronze-foreground",
    bar: "bg-podium-bronze",
    ring: "ring-podium-bronze",
    avatar: 64,
  },
} as const;

export type PodiumEntry = {
  student: Student;
  score: number;
  /** 맞힌 문항 수. 계약에 없으면 null — 점수만 보여 준다 */
  correctCount: number | null;
};

type Props = {
  /** 1위부터 순서대로, 최대 3명. 없는 자리는 비운다 */
  entries: PodiumEntry[];
  questionTotal: number;
};

function Step({
  entry,
  place,
  questionTotal,
}: {
  entry: PodiumEntry;
  place: 1 | 2 | 3;
  questionTotal: number;
}) {
  const step = STEP[place];

  return (
    <div className="flex w-[168px] flex-col items-center">
      <StudentAvatar
        avatar={entry.student.avatar}
        size={step.avatar}
        className={clsx("ring-[3px] ring-offset-2 ring-offset-card", step.ring)}
      />
      <div className="mt-6 w-full">
        <div
          className={clsx(
            "flex w-full flex-col items-center overflow-hidden rounded-t-[18px]",
            step.height,
            step.stand,
          )}
        >
          <span aria-hidden className={clsx("h-1.5 w-full", step.bar)} />
          <span className="mt-auto pb-5 text-display-lg">{place}</span>
        </div>
      </div>
      <span className="mt-5 truncate text-heading-lg">{entry.student.name}</span>
      <span className="mt-1.5 text-body-md text-muted-foreground">
        {entry.score}점
        {entry.correctCount !== null && `  ·  정답 ${entry.correctCount} / ${questionTotal}`}
      </span>
    </div>
  );
}

/**
 * 1~3위 포디움 (2위 · 1위 · 3위 순으로 배치, 스탠드는 공통 바닥선에 맞춘다).
 * 참가자가 1~2명이면 그 자리만 세운다 — 없는 순위를 지어내지 않는다.
 */
export function Podium({ entries, questionTotal }: Props) {
  const [first, second, third] = entries;
  return (
    <div className="flex items-end justify-center gap-6">
      {second && <Step entry={second} place={2} questionTotal={questionTotal} />}
      {first && <Step entry={first} place={1} questionTotal={questionTotal} />}
      {third && <Step entry={third} place={3} questionTotal={questionTotal} />}
    </div>
  );
}
