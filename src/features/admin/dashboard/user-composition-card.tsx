import Image from "next/image";
import { AdminCard, AdminCardHead } from "../components/admin-card";
import { USER_COMPOSITION } from "../mock";

const DOT = ["/admin/legend-teacher.svg", "/admin/legend-student.svg"];
const FILL = ["bg-[#17b884]", "bg-[#d6f3e6]"];
const ROUND = ["rounded-l-[8px]", "rounded-r-[8px]"];

/** 선생님·학생 비율 누적 막대 + 범례. */
export function UserCompositionCard() {
  const { total, segments } = USER_COMPOSITION;

  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="사용자 구성" hint={total} />
      <div className="flex w-full gap-[2px]" role="img" aria-label={"사용자 구성. " + total}>
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{ flexGrow: s.count }}
            className={"h-[34px] min-w-px " + FILL[i] + " " + ROUND[i]}
          />
        ))}
      </div>
      {segments.map((s, i) => (
        <div key={s.label} className="flex w-full items-center gap-[9px]">
          <Image src={DOT[i]} alt="" width={9} height={9} className="size-[9px] shrink-0" />
          <p className="text-[12px] leading-[1.25] font-medium text-[#1b1733]">{s.label}</p>
          <p className="ml-1 text-[12px] leading-[1.25] font-bold text-[#1b1733]">
            {s.count.toLocaleString("ko-KR")}
          </p>
          <p className="text-[11px] leading-[1.25] text-[#6e6a85]">{s.ratio}</p>
        </div>
      ))}
    </AdminCard>
  );
}
