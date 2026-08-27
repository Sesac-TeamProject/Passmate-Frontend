import type { AdminUserSummary } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

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

const ROLE_CHIP: Record<AdminUserSummary["role"], { label: string; tone: Tone }> = {
  TEACHER: { label: "선생님", tone: "brand" },
  STUDENT: { label: "학생", tone: "info" },
};

type Props = { users: AdminUserSummary[] };

/** 사용자 목록 표. 짝수 행에 옅은 배경을 깐다. */
export function UserTable({ users }: Props) {
  if (users.length === 0) {
    return (
      <p className="w-full py-10 text-center text-label-md text-muted-foreground">
        조건에 맞는 사용자가 없습니다.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[820px]">
        <div className="flex w-full items-center border-b border-border pt-2 pb-[9px]">
          <div className={NAME_COL}>
            <p className="text-label-lg text-muted-foreground">사용자</p>
          </div>
          {HEADERS.map((h) => (
            <div key={h} className={FLEX_COL}>
              <p className="text-label-lg text-muted-foreground">{h}</p>
            </div>
          ))}
        </div>

        {users.map((u, i) => {
          const status = statusChip(u);
          const role = ROLE_CHIP[u.role];

          return (
            <div
              key={u.id}
              className={cn(
                "flex w-full items-center border-b border-border py-[11px]",
                i % 2 === 1 && "bg-muted",
              )}
            >
              <div className={NAME_COL}>
                <p className="truncate text-label-lg text-foreground">
                  {displayName(u)}
                  {u.email ? <span className="ml-2">{u.email}</span> : null}
                </p>
              </div>
              <div className={FLEX_COL}>
                <StatChip tone={role.tone}>{role.label}</StatChip>
              </div>
              <div className={FLEX_COL}>
                <p className="text-label-md text-muted-foreground">{u.joinedAt ?? EMPTY}</p>
              </div>
              <div className={FLEX_COL}>
                <p className="text-label-md text-muted-foreground">{u.sessionCount}회</p>
              </div>
              <div className={FLEX_COL}>
                <p className="text-label-md text-muted-foreground">
                  {u.hostLevel === null ? EMPTY : `Lv.${u.hostLevel}`}
                </p>
              </div>
              <div className={FLEX_COL}>
                <StatChip tone={status.tone}>{status.label}</StatChip>
              </div>
              <div className={FLEX_COL}>
                <p className="text-label-md text-muted-foreground">{actionLabel(u)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function displayName(u: AdminUserSummary): string {
  if (u.status === "GUEST") return `(게스트) ${u.name}`;
  return u.name;
}

function statusChip(u: AdminUserSummary): { label: string; tone: Tone } {
  if (u.status === "GUEST") return { label: "게스트", tone: "muted" };
  if (u.status === "SANCTIONED")
    return { label: `제재 ${u.sanctionDaysLeft ?? 0}일`, tone: "danger" };
  if (u.status === "WARNED") return { label: `경고 ${u.warningCount}`, tone: "warning" };
  return { label: "정상", tone: "success" };
}

/** 행 우측 관리 문구. 제재·정지 액션은 계약 확정 후 버튼으로 바꾼다. */
function actionLabel(u: AdminUserSummary): string {
  if (u.status === "GUEST") return "기록 없음";
  if (u.status === "SANCTIONED") return "해제 · 상세";
  return "상세 · 정지";
}
