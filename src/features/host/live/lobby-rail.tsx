import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";
import { cn } from "@/lib/utils";

/** 접힘 레일에 쌓는 아바타 최대 개수. 넘치면 "+N"으로 접는다 (시안 9개 + "+3") */
const MINI_LIMIT = 9;

/**
 * W-04 참여자 레일 (펼침 300px) — 입장한 순서대로 쌓고 마지막에 들어온 학생만 강조한다.
 * 참가자는 스토어에 입장 순서대로 append되므로 배열 끝이 최신이다.
 */
export function LobbyRail({ students }: { students: Student[] }) {
  const newestId = students.at(-1)?.id;

  return (
    <div className="flex h-full flex-col">
      <div className="px-[26px] pt-7 pb-[18px]">
        <p className="text-body-md text-muted-foreground">지금 {students.length}명이</p>
        <p className="text-heading-md">기다리고 있어요</p>
      </div>

      <ul className="flex flex-1 flex-col gap-2 border-t px-3.5 pt-4">
        {students.map((s) => {
          const isNewest = s.id === newestId;
          return (
            <li
              key={s.id}
              className={cn(
                "flex h-[42px] shrink-0 items-center gap-3.5 rounded-2xl px-3.5",
                isNewest && "bg-mint-bg",
              )}
            >
              <StudentAvatar
                avatar={s.avatar}
                size={32}
                className={cn(isNewest && "ring-2 ring-mint ring-offset-2 ring-offset-mint-bg")}
              />
              <span className="min-w-0 flex-1 truncate text-heading-md">{s.name}</span>
              {isNewest ? (
                <span className="shrink-0 rounded-full bg-mint px-3 py-1 text-label-md font-bold text-white">
                  방금
                </span>
              ) : (
                <span className="shrink-0 text-body-md text-muted-foreground">입장</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* TODO(API): 내보내기는 계약이 없다 — DESIGN_GAPS D-6(호스트용 방 상세·강퇴)에 묶여 있다 */}
      <p className="px-[26px] pt-4 pb-8 text-body-md text-muted-foreground">
        이름을 누르면 내보낼 수 있어요
      </p>
    </div>
  );
}

/** W-04 참여자 레일 (접힘 72px) — 인원 수 + 최신순 아바타 스택. 시안은 최신 입장자만 링으로 강조한다 */
export function LobbyRailMini({ students }: { students: Student[] }) {
  const newestFirst = [...students].reverse();
  const shown = newestFirst.slice(0, MINI_LIMIT);
  const overflow = students.length - shown.length;

  return (
    <div className="flex h-full flex-col items-center pt-8">
      <p className="text-heading-lg text-mint">{students.length}</p>
      <p className="text-label-md text-muted-foreground">입장</p>
      <div className="mt-5 h-px w-10 bg-border" />

      <ul className="mt-4 flex flex-col items-center gap-5">
        {shown.map((s, i) => (
          <li key={s.id}>
            <StudentAvatar
              avatar={s.avatar}
              size={36}
              className={cn(i === 0 && "ring-2 ring-mint ring-offset-2 ring-offset-surface-subtle")}
            />
          </li>
        ))}
      </ul>

      {overflow > 0 && (
        <p className="mt-4 text-label-md font-bold text-muted-foreground">+{overflow}</p>
      )}
    </div>
  );
}
