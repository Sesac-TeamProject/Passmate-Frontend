import { cn } from "@/lib/utils";
import { StatChip } from "../components/stat-chip";
import { TYPE } from "../components/typography";
import { ROLE_CHIP, type AdminUser } from "../mock";

const COLS = [
  { key: "user", label: "사용자", width: "w-[260px]" },
  { key: "role", label: "역할", width: "w-[90px]" },
  { key: "joined", label: "가입일", width: "w-[100px]" },
  { key: "sessions", label: "참여 세션", width: "w-[90px]" },
  { key: "reputation", label: "명성", width: "w-[90px]" },
  { key: "status", label: "상태", width: "w-[100px]" },
  { key: "actions", label: "관리", width: "flex-1 min-w-[90px]" },
] as const;

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
      <div className="min-w-[860px]">
        <div className="flex w-full items-center border-b border-[#e5e7eb] pt-2 pb-[9px]">
          {COLS.map((c) => (
            <p key={c.key} className={cn(c.width, "text-[#6e6a85]", TYPE.labelLg)}>
              {c.label}
            </p>
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
            <div className={cn(COLS[0].width, "pr-3")}>
              <p className={cn("truncate text-[#1b1733]", TYPE.labelLg)}>
                {u.name}
                {u.email ? <span className="ml-2">{u.email}</span> : null}
              </p>
            </div>
            <div className={COLS[1].width}>
              <StatChip tone={ROLE_CHIP[u.role].tone}>{ROLE_CHIP[u.role].label}</StatChip>
            </div>
            <p className={cn(COLS[2].width, "text-[#6e6a85]", TYPE.labelMd)}>
              {u.joinedAt ?? EMPTY}
            </p>
            <p className={cn(COLS[3].width, "text-[#6e6a85]", TYPE.labelMd)}>{u.sessions}</p>
            <p className={cn(COLS[4].width, "text-[#6e6a85]", TYPE.labelMd)}>
              {u.reputation ?? EMPTY}
            </p>
            <div className={COLS[5].width}>
              <StatChip tone={u.status.tone}>{u.status.label}</StatChip>
            </div>
            <p className={cn(COLS[6].width, "text-[#6e6a85]", TYPE.labelMd)}>{u.actions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
