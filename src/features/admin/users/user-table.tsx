import { cn } from "@/lib/utils";
import { StatChip } from "../components/stat-chip";
import { TYPE } from "../components/typography";
import { ROLE_CHIP, type AdminUser } from "../mock";

/**
 * 시안(admin/A-02, table 노드 167:1310) 기준.
 * 사용자 열만 260px 고정, 나머지 6열은 남는 폭을 균등 분배.
 * 데이터 셀은 시안대로 가운데 정렬(items-center justify-center)한다.
 * 시안의 헤더 셀은 좌측이지만 그러면 열이 어긋나 보여 헤더도 가운데로 맞췄다.
 */
const NAME_COL = "flex w-[260px] shrink-0 justify-center px-3";
const FLEX_COL = "flex min-w-0 flex-1 justify-center px-2";

const HEADERS = ["역할", "가입일", "참여 세션", "명성", "상태", "관리"] as const;

const EMPTY = "—";

type Props = { users: readonly AdminUser[] };

/** 사용자 목록 표. 짝수 행에 옅은 배경을 깐다. */
export function UserTable({ users }: Props) {
  if (users.length === 0) {
    return (
      <p className={cn("w-full py-10 text-center text-[#6e6a85]", TYPE.labelMd)}>
        조건에 맞는 사용자가 없습니다.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[820px]">
        <div className="flex w-full items-center border-b border-[#e5e7eb] pt-2 pb-[9px]">
          <div className={NAME_COL}>
            <p className={cn("text-[#6e6a85]", TYPE.labelLg)}>사용자</p>
          </div>
          {HEADERS.map((h) => (
            <div key={h} className={FLEX_COL}>
              <p className={cn("text-[#6e6a85]", TYPE.labelLg)}>{h}</p>
            </div>
          ))}
        </div>

        {users.map((u, i) => (
          <div
            key={u.name}
            className={cn(
              "flex w-full items-center border-b border-[#e5e7eb] py-[11px]",
              i % 2 === 1 && "bg-[#f3f4f6]",
            )}
          >
            <div className={NAME_COL}>
              <p className={cn("truncate text-[#1b1733]", TYPE.labelLg)}>
                {u.name}
                {u.email ? <span className="ml-2">{u.email}</span> : null}
              </p>
            </div>
            <div className={FLEX_COL}>
              <StatChip tone={ROLE_CHIP[u.role].tone}>{ROLE_CHIP[u.role].label}</StatChip>
            </div>
            <div className={FLEX_COL}>
              <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{u.joinedAt ?? EMPTY}</p>
            </div>
            <div className={FLEX_COL}>
              <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{u.sessions}</p>
            </div>
            <div className={FLEX_COL}>
              <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{u.reputation ?? EMPTY}</p>
            </div>
            <div className={FLEX_COL}>
              <StatChip tone={u.status.tone}>{u.status.label}</StatChip>
            </div>
            <div className={FLEX_COL}>
              <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{u.actions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
