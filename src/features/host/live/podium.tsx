import { clsx } from "clsx";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/mock";

type Props = { first: Student; second: Student; third: Student };

const STEP = {
  1: { height: "h-[118px]", cls: "bg-podium-gold text-[#845f0f]" },
  2: { height: "h-[81px]", cls: "bg-podium-silver text-[#495160]" },
  3: { height: "h-[62px]", cls: "bg-podium-bronze text-[#804b28]" },
} as const;

function Step({ student, place }: { student: Student; place: 1 | 2 | 3 }) {
  return (
    <div className="flex flex-col items-center gap-[9px]">
      <StudentAvatar avatar={student.avatar} size={53} />
      <div
        className={clsx(
          "flex w-[118px] justify-center rounded-2xl pt-[9px] text-heading-md",
          STEP[place].height,
          STEP[place].cls,
        )}
      >
        {place}
      </div>
    </div>
  );
}

/** 1~3위 포디움 (2위 · 1위 · 3위 순으로 배치) */
export function Podium({ first, second, third }: Props) {
  return (
    <div className="flex items-end gap-4 pt-[22px] pb-4">
      <Step student={second} place={2} />
      <Step student={first} place={1} />
      <Step student={third} place={3} />
    </div>
  );
}
